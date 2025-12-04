import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from multiple possible locations to work on Linux/Windows and dev/prod
const envPaths = [
  process.cwd() + '/.env',
  process.cwd() + '/.env.linux',
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '../.env.linux'),
  path.resolve(__dirname, '.env'),
];
for (const p of envPaths) {
  try { dotenv.config({ path: p, override: false }); } catch { /* ignore */ }
}
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import { createPool, Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import crypto from 'crypto';
import fs from 'fs/promises';

const app = express();
// Hide Express signature header
app.disable('x-powered-by');
// Hide server software/version info by overriding the "Server" header
app.use((_: express.Request, res: express.Response, next: express.NextFunction) => {
  res.setHeader('Server', 'Energo');
  next();
});
const PORT = Number(process.env.PORT || 4000);
const HOST = process.env.HOST || '0.0.0.0';
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://0.0.0.0:5173';
const SESSION_SECRET = process.env.SESSION_SECRET || 'insecure-dev-secret';
const DEFAULT_COST_PER_KWH = 861.88; // COP (updated default)

const pool: Pool = createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ener-go',
  port: Number(process.env.DB_PORT || 3306),
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
 
// Normalize session charset and collation to avoid utf8mb4_0900_ai_ci vs utf8mb4_general_ci mix
const __origGetConnection = (pool as any).getConnection.bind(pool);
(pool as any).getConnection = async () => {
  const conn = await __origGetConnection();
  try {
    await conn.query("SET NAMES utf8mb4 COLLATE utf8mb4_general_ci");
    await conn.query("SET collation_connection = 'utf8mb4_general_ci'");
  } catch (_e) { /* ignore */ }
  return conn;
};

// Apply SP migrations from SQL files at startup to fix collation issues inside routines
async function execSqlFile(conn: any, filePath: string) {
  try {
    const sql = await fs.readFile(filePath, 'utf8');
    const cleaned = sql
      .replace(/\r/g, '')
      .replace(/^\s*DELIMITER\s+\$\$\s*$/gmi, '')
      .replace(/^\s*DELIMITER\s*;\s*$/gmi, '');
    const chunks = cleaned.split('$$').map(s => s.trim()).filter(Boolean);
    for (let chunk of chunks) {
      chunk = chunk.replace(/^\s*--.*$/gmi, '').trim();
      if (!chunk) continue;
      try {
        await conn.query(chunk);
      } catch (e: any) {
        const msg = String(e?.sqlMessage || e?.message || '');
        if (/DROP\s+PROCEDURE/i.test(chunk) && /does not exist/i.test(msg)) {
          continue;
        }
        throw e;
      }
    }
  } catch (e) {
    throw e;
  }
}

async function applySpMigrations() {
  try {
    const conn = await pool.getConnection();
    try {
      // Ensure connection collation
      await conn.query("SET NAMES utf8mb4 COLLATE utf8mb4_general_ci");
      await conn.query("SET collation_connection = 'utf8mb4_general_ci'");

      // Apply base SPs then collation-safe fixes
      const base = path.resolve(__dirname, '../db/migrations/20251204_stored_procedures.sql');
      const fix = path.resolve(__dirname, '../db/migrations/20251204_stored_procedures_collation_fix.sql');
      await execSqlFile(conn, base);
      await execSqlFile(conn, fix);

      console.log('Stored procedures ensured with collation fix');
    } finally {
      conn.release();
    }
  } catch (e: any) {
    console.error('Failed to apply stored procedure migrations', e?.message || e);
  }
}

// Stored procedure helpers (MariaDB 10.x compatible)
// Builds placeholders and unwraps the first resultset of CALL responses.
function procPlaceholdersTyped(params: any[]): string {
  if (!params || params.length === 0) return '';
  return params
    .map((v) => (typeof v === 'string'
      ? "CONVERT(? USING utf8mb4) COLLATE utf8mb4_general_ci"
      : "?"))
    .join(',');
}
async function callAll<T = any>(conn: any, proc: string, params: any[] = []): Promise<T[]> {
  const sql = `CALL ${proc}(${procPlaceholdersTyped(params)})`;
  const [rows]: any = await conn.query(sql, params);
  const firstSet: any = Array.isArray(rows) ? rows[0] : rows;
  return Array.isArray(firstSet) ? (firstSet as T[]) : [];
}
async function callFirst<T = any>(conn: any, proc: string, params: any[] = []): Promise<T | null> {
  const all = await callAll<T>(conn, proc, params);
  return all.length ? all[0] : null;
}

// Collation-safe raw fallback for login when SP collation mismatches
async function selectLoginByUsernameRaw(conn: any, username: string) {
  const [rows]: any = await conn.query(
    'SELECT u.id, u.password_hash, r.name AS role_name, s.name AS status_name ' +
    'FROM users u ' +
    'LEFT JOIN roles r ON r.id = u.role_id ' +
    'LEFT JOIN statuses s ON s.id = u.status_id ' +
    'WHERE u.username = CONVERT(? USING utf8mb4) COLLATE utf8mb4_general_ci ' +
    'LIMIT 1',
    [username]
  );
  const row = Array.isArray(rows) && rows.length ? rows[0] : null;
  return row;
}

 // Collation-safe raw fallback for duplicate check in register when SP collation mismatches
 async function findUserIdByUsernameOrEmailRaw(conn: any, username: string, email: string) {
   const [rows]: any = await conn.query(
     'SELECT id FROM users ' +
     'WHERE username = CONVERT(? USING utf8mb4) COLLATE utf8mb4_general_ci ' +
     '   OR email    = CONVERT(? USING utf8mb4) COLLATE utf8mb4_general_ci ' +
     'LIMIT 1',
     [username, email]
   );
   return Array.isArray(rows) && rows.length ? rows[0] : null;
 }
 
 // Collation-safe raw fallback for energy card by card_number
 async function findEnergyCardByNumberRaw(conn: any, cardNumber: string) {
   const [rows]: any = await conn.query(
     'SELECT id, user_id, card_number, name, current_balance, current_kwh, last_recharge, released, released_by_user_id, released_at ' +
     'FROM energy_cards ' +
     'WHERE card_number = CONVERT(? USING utf8mb4) COLLATE utf8mb4_general_ci ' +
     'LIMIT 1',
     [cardNumber]
   );
   return Array.isArray(rows) && rows.length ? rows[0] : null;
 }
// Test DB connection on startup and log a clear status (non-fatal in dev)
async function testDbConnection() {
  try {
    const conn = await pool.getConnection();
    try {
      await conn.query('CALL sp_ping()');
      console.log(
        `Database connection OK to ${process.env.DB_HOST || 'localhost'}:${Number(process.env.DB_PORT || 3306)} as ${process.env.DB_USER || 'root'} db ${process.env.DB_NAME || 'ener-go'}`
      );
    } finally {
      conn.release();
    }
  } catch (e: any) {
    console.error('Database connection FAILED', {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || 'root',
      database: process.env.DB_NAME || 'ener-go',
      error: e?.message,
    });
  }
}
void testDbConnection();
void applySpMigrations();

// Security headers: baseline CSP and anti-clickjacking for all responses (incl. CORS preflight)
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Anti-clickjacking: block all framing
  res.setHeader('X-Frame-Options', 'DENY');

  // Strict baseline CSP for API responses and any accidental HTML
  // Blocks script/style execution and resource loads; allows no embedding
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'none'; base-uri 'none'; frame-ancestors 'none'; object-src 'none'; form-action 'none'"
  );
  next();
});

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json({
  // capture raw body for better error logging when JSON parse fails
  verify: (req: any, _res: any, buf: Buffer) => {
    try {
      req.rawBody = buf.toString();
    } catch {
      req.rawBody = undefined;
    }
  },
}));
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    }, // SameSite mitigates CSRF; secure only in production
  })
);

// Block access to hidden and sensitive files (e.g., .hg, .git, .env)
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  let p = req.path || '';
  try { p = decodeURIComponent(p); } catch { /* ignore malformed encodings */ }
  // Allow /.well-known for ACME challenges explicitly
  if (p.startsWith('/.well-known/')) return next();
  // Block any hidden path segment such as /.hg, /.git, /.env, /.svn, etc.
  if (/(?:^|\/)\.[^/]/.test(p)) {
    // Return 404 to avoid confirming existence during reconnaissance
    return res.status(404).end();
  }
  next();
});
function clientIp(req: express.Request): string {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '';
}

async function logSecurity(event_type: string, username: string | null, ip: string, details: any) {
  try {
    const conn = await pool.getConnection();
    try {
      const payload = typeof details === 'string' ? details : JSON.stringify(details);
      await conn.query('CALL sp_security_logs_insert(?, ?, ?, ?)', [event_type, username, ip, payload]);
    } finally {
      conn.release();
    }
  } catch (e) {
    console.error('Failed to log security event', e);
  }
}

/**
 * Password policy validation:
 * - Min length: 12
 * - At least 3 of: lowercase, uppercase, digit, symbol
 * - No spaces
 * - Must not contain username or email local part
 * Returns null when OK, or a Spanish error message when not.
 */
function passwordPolicyIssues(password: string, username: string, email: string): string | null {
  const issues: string[] = [];
  const pw = String(password ?? '');
  const uname = String(username ?? '').toLowerCase();
  const emailLocal = String(email ?? '').toLowerCase().split('@')[0] || '';

  if (pw.length < 12) {
    issues.push('Debe tener al menos 12 caracteres');
  }
  const hasLower = /[a-z]/.test(pw);
  const hasUpper = /[A-Z]/.test(pw);
  const hasDigit = /[0-9]/.test(pw);
  const hasSymbol = /[^A-Za-z0-9]/.test(pw);
  const classes = [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length;
  if (classes < 3) {
    issues.push('Debe incluir al menos 3 de: mayúsculas, minúsculas, dígitos, símbolos');
  }
  if (/\s/.test(pw)) {
    issues.push('No debe contener espacios');
  }
  const lowerPw = pw.toLowerCase();
  if (uname && lowerPw.includes(uname)) {
    issues.push('No debe contener el nombre de usuario');
  }
  if (emailLocal && lowerPw.includes(emailLocal)) {
    issues.push('No debe contener parte del correo');
  }
  if (issues.length) {
    return `Contraseña insegura: ${issues.join('. ')}.`;
  }
  return null;
}
 
async function getCostPerKwh(conn?: any): Promise<number> {
  // Fetch from settings via stored procedure; fall back to DEFAULT_COST_PER_KWH
  try {
    if (conn) {
      const row = await callFirst<any>(conn, 'sp_settings_get', ['cost_per_kwh']);
      if (row && row.value != null) {
        const v = parseFloat(String(row.value));
        if (!isNaN(v) && v > 0) return v;
      }
    } else {
      const tempConn = await pool.getConnection();
      try {
        const row = await callFirst<any>(tempConn, 'sp_settings_get', ['cost_per_kwh']);
        if (row && row.value != null) {
          const v = parseFloat(String(row.value));
          if (!isNaN(v) && v > 0) return v;
        }
      } finally {
        tempConn.release();
      }
    }
  } catch (e) {
    console.warn('Could not read cost_per_kwh from settings, using default', e);
  }
  return DEFAULT_COST_PER_KWH;
}
 
app.get('/api/health', (_req: express.Request, res: express.Response) => {
  res.json({ status: 'ok' });
});

app.post('/api/register', async (req: express.Request, res: express.Response) => {
  const { username, password, email, card_number, employee_code } = req.body as {
    username?: string; password?: string; email?: string; card_number?: string; employee_code?: string;
  };

  // Normalize inputs: trim strings and treat empty strings as null
  const card = (typeof card_number === 'string' && card_number.trim() !== '') ? card_number.trim() : null;
  const empCode = (typeof employee_code === 'string' && employee_code.trim() !== '') ? employee_code.trim() : null;

  // Require username, password, email and either a card or a non-empty employee code
  if (!username || !password || !email || (!card && !empCode)) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Enforce strong password policy
  const pwdError = passwordPolicyIssues(password, username, email);
  if (pwdError) {
    await logSecurity('register_weak_password', username, clientIp(req), { error: pwdError });
    return res.status(400).json({ error: pwdError });
  }

  const ip = clientIp(req);
  const conn = await pool.getConnection();
  try {
    // Use a transaction because we will potentially lock employee_codes and insert user + card
    await conn.beginTransaction();

    // check duplicates (proc) with collation-safe fallback
    let dup: any = null;
    try {
      dup = await callFirst<any>(conn, 'sp_users_find_by_username_or_email', [username, email]);
    } catch (e: any) {
      if (e?.code === 'ER_CANT_AGGREGATE_2COLLATIONS' || String(e?.sqlMessage || e?.message || '').includes('Illegal mix of collations')) {
        dup = await findUserIdByUsernameOrEmailRaw(conn, username, email);
      } else {
        throw e;
      }
    }
    if (dup) {
      await conn.rollback();
      await logSecurity('register_duplicate', username, ip, { username, email });
      return res.status(400).json({ error: 'Username or email already exists' });
    }

     // If a card number was provided, only block when it's already assigned to a user.
     if (card) {
       let cr: any = null;
       try {
         cr = await callFirst<any>(conn, 'sp_energy_cards_find_by_card_number', [card]);
       } catch (e: any) {
         if (e?.code === 'ER_CANT_AGGREGATE_2COLLATIONS' || String(e?.sqlMessage || e?.message || '').includes('Illegal mix of collations')) {
           cr = await findEnergyCardByNumberRaw(conn, card);
         } else {
           throw e;
         }
       }
       if (cr && cr.user_id != null) {
         await conn.rollback();
         await logSecurity('register_duplicate_card', username, ip, { card_number: card });
         return res.status(400).json({ error: 'Medidor ya enlazado, por favor contacte a soporte' });
       }
       // If user_id is NULL (released), allow registration to proceed and we will claim it after creating the user.
     }

    // Determine role_id: default to 'user', or use employee_code to set admin/audit
    let role_id: number | null = null;
    let employeeCodeId: number | null = null;
    if (empCode) {
      // Lock and read employee code via stored procedure
      const codeRow = await callFirst<any>(conn, 'sp_employee_codes_get_for_update', [empCode]);
      if (!codeRow) {
        await conn.rollback();
        await logSecurity('register_bad_code', username, ip, { employee_code: empCode });
        return res.status(400).json({ error: 'Invalid employee code' });
      }
      if (Number(codeRow.used) === 1) {
        await conn.rollback();
        await logSecurity('register_code_used', username, ip, { employee_code: empCode });
        return res.status(400).json({ error: 'Employee code already used' });
      }
      role_id = Number(codeRow.role_id);
      employeeCodeId = Number(codeRow.id);
    } else {
      // fetch default 'user' role id
      const roleRow = await callFirst<any>(conn, 'sp_roles_get_id_by_name', ['user']);
      if (!roleRow) {
        await conn.rollback();
        console.error('Missing default role "user" in roles table');
        return res.status(500).json({ error: 'Server misconfiguration' });
      }
      role_id = Number(roleRow.id);
    }

    // Resolve default status 'Activo'
    const st = await callFirst<any>(conn, 'sp_statuses_get_id_by_name', ['Activo']);
    if (!st) {
      await conn.rollback();
      console.error('Missing default status "Activo" in statuses table');
      return res.status(500).json({ error: 'Server misconfiguration' });
    }
    const status_id = Number(st.id);

    const password_hash = await bcrypt.hash(password, 10);
    const userIns = await callAll<any>(conn, 'sp_users_insert', [username, password_hash, email, role_id, status_id]);
    const user_id = Number((userIns[0] || {}).inserted_id);
 
     // Link or create energy card if a non-empty normalized `card` was provided
     if (card) {
       try {
         let er: any = null;
         try {
           er = await callFirst<any>(conn, 'sp_energy_cards_find_by_card_number', [card]);
         } catch (e: any) {
           if (e?.code === 'ER_CANT_AGGREGATE_2COLLATIONS' || String(e?.sqlMessage || e?.message || '').includes('Illegal mix of collations')) {
             er = await findEnergyCardByNumberRaw(conn, card);
           } else {
             throw e;
           }
         }
         if (er) {
           if (er.user_id == null) {
             await conn.query('CALL sp_energy_cards_claim_released_by_id(?, ?, ?)', [Number(er.id), user_id, null]);
           } else {
             await conn.rollback();
             await logSecurity('register_duplicate_card', username, ip, { card_number: card });
             return res.status(400).json({ error: 'Medidor ya enlazado, por favor contacte a soporte' });
           }
         } else {
           await conn.query('CALL sp_energy_cards_insert(?, ?, ?)', [user_id, card, null]);
         }
       } catch (e: any) {
         if (e && (e.code === 'ER_DUP_ENTRY' || e.errno === 1062)) {
           await conn.rollback();
           await logSecurity('register_duplicate_card', username, ip, { card_number: card, error: e?.message });
           return res.status(400).json({ error: 'Medidor ya enlazado, por favor contacte a soporte' });
         }
         throw e;
       }
     }
  
    // Mark employee code as used (if applicable) and record usage in mapping table
    if (empCode && employeeCodeId != null) {
      // Record the usage by inserting into employee_code_usages (this references users and employee_codes)
      const usageRes = await callAll<any>(conn, 'sp_employee_code_usages_insert', [employeeCodeId, user_id]);
      const usageId = Number((usageRes[0] || {}).inserted_id);

      // Update the employee_codes row to mark it used, set used_at, and link to the usage record
      await conn.query('CALL sp_employee_codes_mark_used(?, ?)', [employeeCodeId, usageId]);
    }

    await conn.commit();
    await logSecurity('register_success', username, ip, { user_id, card_number: card, role_id });
    res.json({ message: 'Registration successful' });
  } catch (e: any) {
    try {
      await conn.rollback();
    } catch { /* ignore rollback errors */ }
    console.error(e);
    await logSecurity('register_error', username ?? null, ip, { error: e?.message });
    res.status(500).json({ error: 'Registration failed' });
  } finally {
    conn.release();
  }
});

app.post('/api/login', async (req: express.Request, res: express.Response) => {
  const { username, password } = req.body as { username?: string; password?: string };
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  const ip = clientIp(req);
  const conn = await pool.getConnection();
  try {
    let user: any = null;
    try {
      user = await callFirst<any>(conn, 'sp_users_select_login_by_username', [username]);
    } catch (e: any) {
      if (e?.code === 'ER_CANT_AGGREGATE_2COLLATIONS' || String(e?.sqlMessage || e?.message || '').includes('Illegal mix of collations')) {
        user = await selectLoginByUsernameRaw(conn, username);
      } else {
        throw e;
      }
    }
    if (!user) {
      await logSecurity('login_failed', username, ip, { reason: 'user_not_found' });
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      await logSecurity('login_failed', username, ip, { reason: 'bad_password' });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Enforce status rules
    const statusName = (user.status_name || '').toString();
    const roleName = (user.role_name || '').toString();

    // Paused accounts: require email confirmation (mock flow)
    if (statusName === 'Pausa') {
      await logSecurity('login_blocked_pause', username, ip, { status: statusName });
      return res.status(403).json({
        error: 'Cuenta en pausa. Debe confirmar la restauración desde su correo.',
        code: 'PAUSE_VERIFICATION_REQUIRED',
        username
      });
    }

    // Deshabilitado: look like non-existent account for all roles
    if (statusName === 'Deshabilitado') {
      await logSecurity('login_blocked_disabled', username, ip, { status: statusName, role: roleName });
      return res.status(401).json({ error: 'cuenta no existe, si esto puede ser un error contéctese con soporte' });
    }

    // Suspendido: explicit blocked message
    if (statusName === 'Suspendido') {
      await logSecurity('login_blocked_suspended', username, ip, { status: statusName });
      return res.status(403).json({ error: 'cuenta bloqueada, por favor contacte a soporte' });
    }

    (req.session as any).userId = user.id;
    (req.session as any).username = username;
    (req.session as any).role = user.role_name || null;
    (req.session as any).status = statusName || null;
    await conn.query('CALL sp_users_update_last_login(?)', [user.id]);
    await logSecurity('login_success', username, ip, { role: user.role_name, status: statusName });
    res.json({ message: 'Login successful' });
  } catch (e: any) {
    console.error(e);
    await logSecurity('login_error', username, ip, { error: e?.message });
    res.status(500).json({ error: 'Login failed' });
  } finally {
    conn.release();
  }
});

// Mock endpoint to verify and restore a paused account (no auth, lab only)
app.post('/api/mock/pausa/verify', async (req: express.Request, res: express.Response) => {
  const { username } = req.body as { username?: string };
  const uname = (username ?? '').toString().trim();
  if (!uname) return res.status(400).json({ error: 'Usuario requerido' });

  const ip = clientIp(req);
  const conn = await pool.getConnection();
  try {
    // Ensure the account exists and is currently in 'Pausa'
    let u: any = null;
    try {
      u = await callFirst<any>(conn, 'sp_users_select_login_by_username', [uname]);
    } catch (e: any) {
      if (e?.code === 'ER_CANT_AGGREGATE_2COLLATIONS' || String(e?.sqlMessage || e?.message || '').includes('Illegal mix of collations')) {
        u = await selectLoginByUsernameRaw(conn, uname);
      } else {
        throw e;
      }
    }
    if (!u) {
      await logSecurity('pause_verify_user_not_found', uname, ip, {});
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    const currentStatus = (u.status_name ?? '').toString();
    if (currentStatus !== 'Pausa') {
      return res.status(400).json({ error: 'La cuenta no está en pausa' });
    }

    await conn.query('CALL sp_users_update_status_by_name(?, ?)', [Number(u.id), 'Activo']);
    await logSecurity('pause_restored_mock', uname, ip, { user_id: Number(u.id) });
    return res.json({ message: 'Cuenta reactivada' });
  } catch (e: any) {
    console.error(e);
    await logSecurity('pause_restore_error_mock', uname, ip, { error: e?.message });
    return res.status(500).json({ error: 'No se pudo reactivar la cuenta' });
  } finally {
    conn.release();
  }
});

async function getUserRoleAndStatus(userId: number): Promise<{ role: string | null; status: string | null } | null> {
  const conn = await pool.getConnection();
  try {
    const r = await callFirst<any>(conn, 'sp_users_select_role_status_by_id', [userId]);
    if (!r) return null;
    return { role: (r.role_name ?? null), status: (r.status_name ?? null) };
  } finally {
    conn.release();
  }
}

function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const userId = (req.session as any)?.userId as number | undefined;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // Also enforce user status on each request in case it changed after login
  getUserRoleAndStatus(userId)
    .then((info) => {
      const status = info?.status || null;
      if (status === 'Deshabilitado' || status === 'Suspendido') {
        return res.status(403).json({ error: `Cuenta ${status}. Contacte al administrador.` });
      }
      return next();
    })
    .catch((_e) => {
      return res.status(500).json({ error: 'Auth check failed' });
    });
}

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const userId = (req.session as any)?.userId as number | undefined;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  getUserRoleAndStatus(userId)
    .then((info) => {
      if (!info || info.role !== 'admin') {
        return res.status(403).json({ error: 'Admin only' });
      }
      next();
    })
    .catch((_e) => res.status(500).json({ error: 'Authorization check failed' }));
}
// Authorization helper: audit role only
function requireAudit(req: express.Request, res: express.Response, next: express.NextFunction) {
  const userId = (req.session as any)?.userId as number | undefined;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  getUserRoleAndStatus(userId)
    .then((info) => {
      if (!info || info.role !== 'audit') {
        return res.status(403).json({ error: 'Audit only' });
      }
      next();
    })
    .catch((_e) => res.status(500).json({ error: 'Authorization check failed' }));
}

// Audit: list admins
app.get('/api/audit/admins', requireAuth, requireAudit, async (_req: express.Request, res: express.Response) => {
  const conn = await pool.getConnection();
  try {
    const rows = await callAll<any>(conn, 'sp_audit_list_admins', []);
    res.json({ users: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to list admins' });
  } finally {
    conn.release();
  }
});

// Audit: list employees (admin + audit)
app.get('/api/audit/employees', requireAuth, requireAudit, async (_req: express.Request, res: express.Response) => {
  const conn = await pool.getConnection();
  try {
    const rows = await callAll<any>(conn, 'sp_audit_list_employees', []);
    res.json({ users: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to list employees' });
  } finally {
    conn.release();
  }
});

// Audit: update employee status (admin + audit)
app.patch('/api/audit/users/:id/status', requireAuth, requireAudit, async (req: express.Request, res: express.Response) => {
  const id = Number(req.params.id);
  const { status } = req.body as { status?: string };
  if (!id || !status) return res.status(400).json({ error: 'Invalid request' });
  const conn = await pool.getConnection();
  try {
    // Ensure target user is admin or audit
    const info = await callFirst<any>(conn, 'sp_users_select_role_status_by_id', [id]);
    if (!info) return res.status(404).json({ error: 'User not found' });
    const targetRole = (info.role_name ?? null) as string | null;
    if (targetRole !== 'admin' && targetRole !== 'audit') return res.status(403).json({ error: 'Can only modify admin/audit users' });

    // validate allowed statuses (admins: only Activo/Deshabilitado)
    const allowed = targetRole === 'admin'
      ? ['Activo', 'Deshabilitado']
      : ['Activo', 'Pausa', 'Deshabilitado', 'Suspendido'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    await conn.query('CALL sp_users_update_status_by_name(?, ?)', [id, status]);
    res.json({ message: 'Status updated' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update status' });
  } finally {
    conn.release();
  }
});

// Audit: get admin details (basic + profile)
app.get('/api/audit/admins/:id', requireAuth, requireAudit, async (req: express.Request, res: express.Response) => {
  const id = Number(req.params.id);
  if (!id || !Number.isFinite(id)) return res.status(400).json({ error: 'Invalid user id' });
  const conn = await pool.getConnection();
  try {
    const info = await callFirst<any>(conn, 'sp_users_select_role_status_by_id', [id]);
    if (!info) return res.status(404).json({ error: 'User not found' });
    const role = (info.role_name ?? null) as string | null;
    if (role !== 'admin') return res.status(403).json({ error: 'Only admin users allowed' });

    const [urows]: any = await conn.query(
      'SELECT u.id, u.username, u.email, u.created_at, u.last_login, r.name AS role, s.name AS status ' +
      'FROM users u ' +
      'LEFT JOIN roles r ON u.role_id = r.id ' +
      'LEFT JOIN statuses s ON u.status_id = s.id ' +
      'WHERE u.id = ? LIMIT 1',
      [id]
    );
    const row = Array.isArray(urows) && urows.length ? urows[0] : null;
    if (!row) return res.status(404).json({ error: 'User not found' });

    const user = {
      id: Number(row.id),
      username: String(row.username),
      email: String(row.email),
      created_at: row.created_at,
      last_login: row.last_login,
      role: row.role ?? null,
      status: row.status ?? null,
    };
    const profile = await callFirst<any>(conn, 'sp_user_profiles_get_by_user', [id]);
    return res.json({ user, profile });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to load admin' });
  } finally {
    conn.release();
  }
});

// Audit: update admin personal data (perfil)
app.put('/api/audit/admins/:id/profile', requireAuth, requireAudit, async (req: express.Request, res: express.Response) => {
  const id = Number(req.params.id);
  if (!id || !Number.isFinite(id)) return res.status(400).json({ error: 'Invalid user id' });

  const {
    primer_nombre,
    segundo_nombre,
    primer_apellido,
    segundo_apellido,
    tipo_identificacion,
    numero_identificacion,
    direccion,
    telefono,
  } = req.body as {
    primer_nombre?: string;
    segundo_nombre?: string | null;
    primer_apellido?: string;
    segundo_apellido?: string | null;
    tipo_identificacion?: string;
    numero_identificacion?: string;
    direccion?: string | null;
    telefono?: string | null;
  };

  const pn = (primer_nombre ?? '').toString().trim();
  const pa = (primer_apellido ?? '').toString().trim();
  const tipo = (tipo_identificacion ?? '').toString().trim();
  const num = (numero_identificacion ?? '').toString().trim();

  if (!pn || !pa || !tipo || !num) {
    return res.status(400).json({ error: 'Campos obligatorios: primer_nombre, primer_apellido, tipo_identificacion, numero_identificacion' });
  }

  const sn = (segundo_nombre ?? '').toString().trim() || null;
  const sa = (segundo_apellido ?? '').toString().trim() || null;
  const dir = (direccion ?? '').toString().trim() || null;
  const tel = (telefono ?? '').toString().trim() || null;

  const conn = await pool.getConnection();
  try {
    // Ensure target is admin
    const info = await callFirst<any>(conn, 'sp_users_select_role_status_by_id', [id]);
    if (!info) return res.status(404).json({ error: 'User not found' });
    const role = (info.role_name ?? null) as string | null;
    if (role !== 'admin') return res.status(403).json({ error: 'Solo se permiten administradores' });

    await conn.beginTransaction();
    await conn.query('CALL sp_user_profiles_upsert(?, ?, ?, ?, ?, ?, ?, ?, ?)', [id, pn, sn, pa, sa, tipo, num, dir, tel]);
    await conn.commit();

    const u = await callFirst<any>(conn, 'sp_users_get_basic_by_id', [id]);
    await logSecurity('audit_profile_update', String(u?.username ?? null), clientIp(req), { by_audit: (req.session as any)?.username ?? null, user_id: id });
    return res.json({ message: 'Perfil actualizado' });
  } catch (e: any) {
    try { await conn.rollback(); } catch {}
    if (e && (e.code === 'ER_DUP_ENTRY' || e.errno === 1062)) {
      const msg = String((e as any).sqlMessage || e.message || '');
      if (msg.includes('uniq_phone') || msg.toLowerCase().includes('telefono')) {
        return res.status(400).json({ error: 'El teléfono ya está en uso por otra cuenta' });
      }
      if (msg.includes('uniq_documento') || msg.toLowerCase().includes('tipo_identificacion') || msg.toLowerCase().includes('numero_identificacion')) {
        return res.status(400).json({ error: 'El documento ya está en uso por otra cuenta' });
      }
      return res.status(400).json({ error: 'Datos de perfil ya están en uso por otra cuenta' });
    }
    console.error(e);
    return res.status(500).json({ error: 'No se pudo actualizar el perfil' });
  } finally {
    conn.release();
  }
});

// Audit: sales metrics over time (independent of current cost setting)
app.get('/api/audit/metrics', requireAuth, requireAudit, async (req: express.Request, res: express.Response) => {
  const days = Math.max(1, Math.min(365, Number((req.query.days as string) ?? 30) || 30));
  const conn = await pool.getConnection();
  try {
    const totalsRow = await callFirst<any>(conn, 'sp_audit_metrics_totals', []);
    const totals = totalsRow || { pins: 0, total_amount: 0, total_kwh: 0 };

    const seriesRows = await callAll<any>(conn, 'sp_audit_metrics_series', [days]);

    res.json({
      totals: {
        codes_sold: Number(totals.pins) || 0,
        amount_cop: Number(totals.total_amount) || 0,
        kwh: Number(totals.total_kwh) || 0,
      },
      by_day: (seriesRows as any[]).map((r) => ({
        day: r.day instanceof Date ? (r.day as Date).toISOString().slice(0, 10) : String(r.day),
        codes_sold: Number(r.pins) || 0,
        amount_cop: Number(r.amount) || 0,
        kwh: Number(r.kwh) || 0,
      })),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load metrics' });
  } finally {
    conn.release();
  }
});

// Audit: list employee codes
app.get('/api/audit/employee-codes', requireAuth, requireAudit, async (_req: express.Request, res: express.Response) => {
  const conn = await pool.getConnection();
  try {
    const rows = await callAll<any>(conn, 'sp_employee_codes_list', []);
    res.json({ codes: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to list employee codes' });
  } finally {
    conn.release();
  }
});

// Audit: generate new employee code (for admin/audit roles)
app.post('/api/audit/employee-codes', requireAuth, requireAudit, async (req: express.Request, res: express.Response) => {
  const { role } = req.body as { role?: string };
  const ip = clientIp(req);
  const roleName = (role || '').toString().toLowerCase();
  if (roleName !== 'admin' && roleName !== 'audit') {
    return res.status(400).json({ error: 'Role must be "admin" or "audit"' });
  }
  const conn = await pool.getConnection();
  try {
    // Resolve role_id
    const roleRow = await callFirst<any>(conn, 'sp_roles_get_id_by_name', [roleName]);
    if (!roleRow) return res.status(400).json({ error: 'Role not found' });
    const roleId = Number(roleRow.id);

    let code = '';
    let attempts = 0;
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const prefix = roleName === 'admin' ? 'ADMIN' : 'AUDIT';
    while (attempts < 5) {
      const rand = Array.from({ length: 8 })
        .map(() => alphabet.charAt(Math.floor(Math.random() * alphabet.length)))
        .join('');
      code = `${prefix}-${rand}`;
      try {
        const ins = await callAll<any>(conn, 'sp_employee_codes_insert', [code, roleId]);
        const id = Number((ins[0] || {}).inserted_id);
        await logSecurity('employee_code_generated', (req.session as any)?.username ?? null, ip, { code, role: roleName });
        return res.json({ id, code, role: roleName });
      } catch (e: any) {
        if (e && (e.code === 'ER_DUP_ENTRY' || e.errno === 1062)) {
          attempts++;
          continue;
        }
        throw e;
      }
    }
    return res.status(500).json({ error: 'Failed to generate unique code' });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'Failed to generate code' });
  } finally {
    conn.release();
  }
});

app.get('/api/dashboard', requireAuth, async (req: express.Request, res: express.Response) => {
  const userId = (req.session as any).userId as number;
  const username = (req.session as any).username as string;
  const conn = await pool.getConnection();
  try {
    // Fetch role/status first so we can tailor the dashboard by role
    const info = (await callFirst<any>(conn, 'sp_users_info_by_id', [userId])) || { username, role_name: null, status_name: null };
    const role = (info.role_name ?? null) as string | null;

    let cards: any[] = [];
    let card: any = null;
    let pins: any[] = [];
    let logs: any[] = [];

    if (role === 'admin') {
      // Admin: show global "Últimos movimientos" (all users), hide logs and card/cards
      const pinRows = await callAll<any>(conn, 'sp_recharge_pins_latest', [100]);
      pins = pinRows as any[];
      // logs remain empty; card/cards remain null/empty
    } else if (role === 'audit') {
      // Audit: show global security logs for all users, hide card/cards and recharge history
      const logRows = await callAll<any>(conn, 'sp_security_logs_latest', [200]);
      logs = logRows as any[];
    } else {
      // Regular user: own cards, own history, and hide logs
      const cardRows = await callAll<any>(conn, 'sp_energy_cards_list_by_user', [userId]);
      cards = cardRows as any[];
      card = (cards as any[])[0] || null;

      const pinRows = await callAll<any>(conn, 'sp_recharge_pins_list_by_user', [userId]);
      pins = pinRows as any[];

      // Hide logs for non-audit roles
      logs = [];
    }

    const costPerKwh = await getCostPerKwh(conn);
    res.json({
      current_user: { username: info.username, role: info.role_name, status: info.status_name },
      card,
      cards,
      recharge_history: pins,
      security_logs: logs,
      cost_per_kwh: costPerKwh
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load dashboard' });
  } finally {
    conn.release();
  }
});

/**
 * STS-style 20-digit token generation bound to a specific meter.
 * - 19-digit body derived from HMAC-SHA256(card_number-keyed payload) + 1 Luhn check digit
 * - Payload encodes token type, amount (in cents), STS epoch days, and a nonce
 * - Meter binding via per-meter key derived from STS_MASTER_KEY and card_number
 */
const STS_BASE_DATE = new Date(Date.UTC(1993, 0, 1)); // 1993-01-01

function daysSinceStsEpoch(d: Date): number {
  const ms = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - STS_BASE_DATE.getTime();
  return Math.max(0, Math.floor(ms / 86400000));
}

function luhnCheckDigit(bodyDigits: string): string {
  // bodyDigits length should be 19
  let sum = 0;
  for (let i = bodyDigits.length - 1, alt = 0; i >= 0; i--, alt ^= 1) {
    let n = bodyDigits.charCodeAt(i) - 48; // '0' -> 48
    if (alt === 1) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
  }
  const check = (10 - (sum % 10)) % 10;
  return String(check);
}

function deriveMeterKey(cardNumber: string): Buffer {
  const master = process.env.STS_MASTER_KEY || process.env.SESSION_SECRET || 'insecure-dev-sts-key';
  return crypto.createHmac('sha256', master).update(String(cardNumber)).digest().subarray(0, 16); // AES-128 equivalent key material
}

function generateSts20Token(cardNumber: string, amountCOP: number, _kwh: number): string {
  const key = deriveMeterKey(cardNumber);
  const tokenType = 0x01; // credit token
  const amountCents = Math.max(0, Math.round(Number(amountCOP) * 100)); // COP cents
  const days = daysSinceStsEpoch(new Date());
  const nonce = crypto.randomBytes(2).readUInt16BE(0);

  // Payload: [1 byte type][4 bytes amount][2 bytes days][2 bytes nonce] = 9 bytes
  const payload = Buffer.alloc(9);
  payload.writeUInt8(tokenType, 0);
  payload.writeUInt32BE(amountCents >>> 0, 1);
  payload.writeUInt16BE(days & 0xffff, 5);
  payload.writeUInt16BE(nonce, 7);

  // HMAC with per-meter key binds token to the meter
  const mac = crypto.createHmac('sha256', key).update(payload).digest(); // 32 bytes

  // 19-digit body from MAC truncation (mod 10^19), + Luhn check to reach 20 digits total
  const first16 = mac.subarray(0, 16); // 128 bits
  const big = BigInt('0x' + first16.toString('hex'));
  const body = (big % (10n ** 19n)).toString().padStart(19, '0');
  const check = luhnCheckDigit(body);
  return body + check; // 20 digits
}

app.post('/api/recharge', requireAuth, async (req: express.Request, res: express.Response) => {
  const userId = (req.session as any).userId as number;
  const username = (req.session as any).username as string;
  const ip = clientIp(req);
  const { amount, kwh, card_number } = req.body as { amount?: number; kwh?: number; card_number?: string };
  if ((amount == null || isNaN(Number(amount))) && (kwh == null || isNaN(Number(kwh)))) {
    return res.status(400).json({ error: 'Provide either amount (COP) or kwh' });
  }
  const selectedCardNumber = (typeof card_number === 'string' && card_number.trim() !== '') ? card_number.trim() : null;

  const conn = await pool.getConnection();
  try {
    // Check status; block when in Pausa/Deshabilitado/Suspendido for recharges
    const statusInfo = await callFirst<any>(conn, 'sp_users_select_role_status_by_id', [userId]);
    const statusName = (statusInfo?.status_name ?? undefined) as string | undefined;
    if (statusName === 'Pausa' || statusName === 'Deshabilitado' || statusName === 'Suspendido') {
      return res.status(403).json({ error: `No puede recargar mientras la cuenta está en "${statusName}".` });
    }

    const costPerKwh = await getCostPerKwh(conn);
    let amountCOP: number;
    let kwhVal: number;
    if (amount != null && !isNaN(Number(amount))) {
      amountCOP = Math.max(0, Number(amount));
      kwhVal = +(amountCOP / costPerKwh).toFixed(2);
    } else {
      kwhVal = Math.max(0, Number(kwh));
      amountCOP = +(kwhVal * costPerKwh).toFixed(2);
    }

    await conn.beginTransaction();

    let card: any;
    if (selectedCardNumber) {
      const r = await callFirst<any>(conn, 'sp_energy_cards_select_by_user_and_card_for_update', [userId, selectedCardNumber]);
      if (!r) {
        await conn.rollback();
        return res.status(400).json({ error: 'No energy card for user with that card_number' });
      }
      card = r as any;
    } else {
      const cardRows = await callAll<any>(conn, 'sp_energy_cards_select_one_by_user_for_update', [userId]);
      if ((cardRows as any[]).length === 0) {
        await conn.rollback();
        return res.status(400).json({ error: 'No energy card for user' });
      }
      if ((cardRows as any[]).length > 1) {
        await conn.rollback();
        return res.status(400).json({ error: 'Multiple energy cards found. Specify card_number.' });
      }
      card = (cardRows as any[])[0] as any;
    }

    const newBalance = +(Number(card.current_balance) + amountCOP).toFixed(2);
    const newKwh = +(Number(card.current_kwh) + kwhVal).toFixed(2);
    await conn.query('CALL sp_energy_cards_update_balance(?, ?, ?, ?)', [userId, card.card_number, newBalance, newKwh]);
    const pin = generateSts20Token(card.card_number, amountCOP, kwhVal);
    await conn.query('CALL sp_recharge_pins_insert(?, ?, ?, ?, ?)', [userId, card.card_number, pin, amountCOP, kwhVal]);
    await conn.commit();
    await logSecurity('recharge', username, ip, { amount: amountCOP, kwh: kwhVal, pin, card_number: card.card_number });
    res.json({
      pin_code: pin,
      card_number: card.card_number,
      current_balance: newBalance,
      current_kwh: newKwh
    });
  } catch (e: any) {
    try { await conn.rollback(); } catch {}
    console.error(e);
    await logSecurity('recharge_error', username, ip, { error: e?.message });
    res.status(500).json({ error: 'Recharge failed' });
  } finally {
    conn.release();
  }
});

// Session logout
app.post('/api/logout', requireAuth, async (req: express.Request, res: express.Response) => {
  const username = (req.session as any)?.username ?? null;
  const ip = clientIp(req);
  (req.session as any).destroy(async () => {
    await logSecurity('logout', username, ip, {});
    res.json({ message: 'Logged out' });
  });
});

// Admin: list users
app.get('/api/admin/users', requireAuth, requireAdmin, async (_req: express.Request, res: express.Response) => {
  const conn = await pool.getConnection();
  try {
    const rows = await callAll<any>(conn, 'sp_admin_list_users', []);
    res.json({ users: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to list users' });
  } finally {
    conn.release();
  }
});

// Admin: update user email
app.patch('/api/admin/users/:id/email', requireAuth, requireAdmin, async (req: express.Request, res: express.Response) => {
  const id = Number(req.params.id);
  const { email } = req.body as { email?: string };
  if (!id || !email) return res.status(400).json({ error: 'Invalid request' });
  const adminUsername = (req.session as any)?.username ?? null;
  const ip = clientIp(req);
  const conn = await pool.getConnection();
  try {
    // Block modifications to audit users
    const info = await callFirst<any>(conn, 'sp_users_select_role_status_by_id', [id]);
    if (!info) return res.status(404).json({ error: 'User not found' });
    const targetRole = (info.role_name ?? null) as string | null;
    if (targetRole === 'audit') return res.status(403).json({ error: 'Cannot modify audit users' });

    // ensure not taken
    const exists = await callFirst<any>(conn, 'sp_users_email_exists_other', [email, id]);
    if (exists) return res.status(400).json({ error: 'Email already in use' });
    await conn.query('CALL sp_users_update_email(?, ?)', [id, email]);

    // log under the target user's username
    const u = await callFirst<any>(conn, 'sp_users_get_basic_by_id', [id]);
    if (u && u.username) {
      await logSecurity('admin_update_email', String(u.username), ip, { admin: adminUsername, new_email: email });
    }

    res.json({ message: 'Email updated' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update email' });
  } finally {
    conn.release();
  }
});

// Admin: update user status
app.patch('/api/admin/users/:id/status', requireAuth, requireAdmin, async (req: express.Request, res: express.Response) => {
  const id = Number(req.params.id);
  const { status } = req.body as { status?: string };
  if (!id || !status) return res.status(400).json({ error: 'Invalid request' });
  const conn = await pool.getConnection();
  try {
    // Block modifications to audit users
    const info = await callFirst<any>(conn, 'sp_users_select_role_status_by_id', [id]);
    if (!info) return res.status(404).json({ error: 'User not found' });
    const targetRole = (info.role_name ?? null) as string | null;
    if (targetRole === 'audit') return res.status(403).json({ error: 'Cannot modify audit users' });

    // validate allowed statuses (admins: only Activo/Deshabilitado)
    const allowed = targetRole === 'admin'
      ? ['Activo', 'Deshabilitado']
      : ['Activo', 'Pausa', 'Deshabilitado', 'Suspendido'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    await conn.query('CALL sp_users_update_status_by_name(?, ?)', [id, status]);
    res.json({ message: 'Status updated' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update status' });
  } finally {
    conn.release();
  }
});

// Admin: mock send reset password link
app.post('/api/admin/users/:id/send-reset', requireAuth, requireAdmin, async (req: express.Request, res: express.Response) => {
// Admin: transfer a meter (card_number) to a different user
app.post('/api/admin/meters/transfer', requireAuth, requireAdmin, async (req: express.Request, res: express.Response) => {
  const adminUsername = (req.session as any)?.username ?? null;
  const ip = clientIp(req);
  const { card_number, to_user_id } = req.body as { card_number?: string; to_user_id?: number };
  const card = (typeof card_number === 'string' && card_number.trim() !== '') ? card_number.trim() : null;
  const toUserId = Number(to_user_id);

  if (!card || !toUserId || !Number.isFinite(toUserId) || toUserId <= 0) {
    return res.status(400).json({ error: 'card_number y to_user_id son obligatorios' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Ensure destination user exists
    const urows = await callFirst<any>(conn, 'sp_users_exists_by_id', [toUserId]);
    if (!urows) {
      await conn.rollback();
      return res.status(404).json({ error: 'Usuario destino no existe' });
    }

    // Lock meter row
    const current = await callFirst<any>(conn, 'sp_energy_cards_lock_by_card', [card]);
    if (!current) {
      await conn.rollback();
      return res.status(404).json({ error: 'Medidor no existe' });
    }
    const fromUserId = current.user_id == null ? null : Number(current.user_id);

    if (fromUserId === toUserId) {
      await conn.rollback();
      return res.status(400).json({ error: 'El medidor ya pertenece al usuario destino' });
    }

    // Transfer ownership and clear release flags
    await conn.query('CALL sp_energy_cards_transfer_owner(?, ?)', [Number(current.id), toUserId]);

    await conn.commit();
    await logSecurity('admin_meter_transfer', adminUsername, ip, { card_number: card, from_user_id: fromUserId, to_user_id: toUserId });
    return res.json({ message: 'Medidor transferido' });
  } catch (e: any) {
    try { await conn.rollback(); } catch {}
    console.error(e);
    return res.status(500).json({ error: 'No se pudo transferir el medidor' });
  } finally {
    conn.release();
  }
});
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid user id' });
  const conn = await pool.getConnection();
  try {
    // Block actions on audit users
    const info = await callFirst<any>(conn, 'sp_users_select_role_status_by_id', [id]);
    const u = await callFirst<any>(conn, 'sp_users_get_basic_by_id', [id]);
    if (!info || !u) return res.status(404).json({ error: 'User not found' });
    if ((info.role_name as string | null) === 'audit') return res.status(403).json({ error: 'Cannot modify audit users' });

    // Generate secure token and persist its hash with expiration
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    await conn.query(
      'INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?, ?, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 60 MINUTE))',
      [id, tokenHash]
    );

    const resetLink = `${CLIENT_ORIGIN}/reset-password?token=${rawToken}`;
    const ip = clientIp(req);
    await logSecurity('password_reset_link', String(u.username), ip, { user_id: id, email: u.email, reset_link: resetLink });
    res.json({ message: 'Password reset link generated', link: resetLink });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to send reset link' });
  } finally {
    conn.release();
  }
});

/**
 * Admin: get single user details (basic + profile + meters)
 * GET /api/admin/users/:id
 */
app.get('/api/admin/users/:id', requireAuth, requireAdmin, async (req: express.Request, res: express.Response) => {
  const id = Number(req.params.id);
  if (!id || !Number.isFinite(id)) return res.status(400).json({ error: 'Invalid user id' });
  const conn = await pool.getConnection();
  try {
    const [urows]: any = await conn.query(
      'SELECT u.id, u.username, u.email, u.created_at, u.last_login, r.name AS role, s.name AS status ' +
      'FROM users u ' +
      'LEFT JOIN roles r ON u.role_id = r.id ' +
      'LEFT JOIN statuses s ON u.status_id = s.id ' +
      'WHERE u.id = ? LIMIT 1',
      [id]
    );
    const row = Array.isArray(urows) && urows.length ? urows[0] : null;
    if (!row) return res.status(404).json({ error: 'User not found' });

    const user = {
      id: Number(row.id),
      username: String(row.username),
      email: String(row.email),
      created_at: row.created_at,
      last_login: row.last_login,
      role: row.role ?? null,
      status: row.status ?? null,
    };

    const profile = await callFirst<any>(conn, 'sp_user_profiles_get_by_user', [id]);
    const meters = await callAll<any>(conn, 'sp_energy_cards_list_by_user', [id]);

    return res.json({ user, profile, meters });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to load user' });
  } finally {
    conn.release();
  }
});

/**
 * Admin: important activity logs for a user
 * GET /api/admin/users/:id/logs
 */
app.get('/api/admin/users/:id/logs', requireAuth, requireAdmin, async (req: express.Request, res: express.Response) => {
  const id = Number(req.params.id);
  if (!id || !Number.isFinite(id)) return res.status(400).json({ error: 'Invalid user id' });
  const conn = await pool.getConnection();
  try {
    const u = await callFirst<any>(conn, 'sp_users_get_basic_by_id', [id]);
    if (!u) return res.status(404).json({ error: 'User not found' });
    const username = String(u.username);

    const important = [
      'login_success',
      'recharge',
      'meter_added',
      'meter_released',
      'profile_update',
      'profile_document_changed',
      'password_change_success',
      'password_reset_link',
      'admin_update_email',
      'admin_suspend',
      'admin_meter_transfer',
      'meter_claimed',
      'meter_renamed',
      'pause_restored_mock',
    ];
    const placeholders = important.map(() => '?').join(',');
    const params: any[] = [username, ...important];
    const [rows]: any = await conn.query(
      `SELECT id, event_type, event_time, ip_address, details
       FROM security_logs
       WHERE username = ? AND event_type IN (${placeholders})
       ORDER BY event_time DESC
       LIMIT 200`,
      params
    );
    return res.json({ logs: Array.isArray(rows) ? rows : [] });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to load logs' });
  } finally {
    conn.release();
  }
});

/**
 * Admin: link a meter (serial/card_number) to a specific user
 * POST /api/admin/users/:id/meters/link
 * Body: { card_number: string, name?: string }
 */
app.post('/api/admin/users/:id/meters/link', requireAuth, requireAdmin, async (req: express.Request, res: express.Response) => {
  const targetUserId = Number(req.params.id);
  const adminUsername = (req.session as any)?.username ?? null;
  const ip = clientIp(req);
  const { card_number, name } = req.body as { card_number?: string; name?: string };
  const card = (typeof card_number === 'string' && card_number.trim() !== '') ? card_number.trim().toUpperCase() : null;
  const meterName = (typeof name === 'string' && name.trim() !== '') ? name.trim().slice(0, 100) : null;

  if (!targetUserId || !Number.isFinite(targetUserId) || !card) {
    return res.status(400).json({ error: 'user id y card_number son obligatorios' });
  }

  const conn = await pool.getConnection();
  try {
    const targetU = await callFirst<any>(conn, 'sp_users_get_basic_by_id', [targetUserId]);
    if (!targetU) return res.status(404).json({ error: 'User not found' });
    const targetName = String(targetU.username);
    await conn.beginTransaction();

    let found: any = null;
    try {
      found = await callFirst<any>(conn, 'sp_energy_cards_find_by_card_number', [card]);
    } catch (e: any) {
      if (e?.code === 'ER_CANT_AGGREGATE_2COLLATIONS' || String(e?.sqlMessage || e?.message || '').includes('Illegal mix of collations')) {
        found = await findEnergyCardByNumberRaw(conn, card);
      } else {
        throw e;
      }
    }
    if (found) {
      const currentUserId = found.user_id == null ? null : Number(found.user_id);
      if (currentUserId == null) {
        // Claim released meter
        await conn.query('CALL sp_energy_cards_claim_released_by_id(?, ?, ?)', [Number(found.id), targetUserId, meterName]);
        await conn.commit();
        await logSecurity('meter_added', targetName, ip, { card_number: card, new_user_id: targetUserId, by_admin: adminUsername });
        return res.json({ message: 'Medidor vinculado' });
      }
      if (currentUserId === targetUserId) {
        await conn.commit();
        return res.json({ message: 'El medidor ya está vinculado a este usuario' });
      }
      // Transfer ownership
      await conn.query('CALL sp_energy_cards_transfer_owner(?, ?)', [Number(found.id), targetUserId]);
      await conn.commit();
      await logSecurity('admin_meter_transfer', targetName, ip, { card_number: card, from_user_id: currentUserId, to_user_id: targetUserId, by_admin: adminUsername });
      return res.json({ message: 'Medidor transferido' });
    } else {
      // Create a new meter
      await conn.query('CALL sp_energy_cards_insert(?, ?, ?)', [targetUserId, card, meterName]);
      await conn.commit();
      await logSecurity('meter_added', targetName, ip, { card_number: card, new_user_id: targetUserId, by_admin: adminUsername });
      return res.json({ message: 'Medidor vinculado' });
    }
  } catch (e: any) {
    try { await conn.rollback(); } catch {}
    console.error(e);
    return res.status(500).json({ error: 'No se pudo vincular el medidor' });
  } finally {
    conn.release();
  }
});

/**
 * Admin: unlink (release) a meter from a specific user without deleting it
 * DELETE /api/admin/users/:id/meters/:card_number
 */
app.delete('/api/admin/users/:id/meters/:card_number', requireAuth, requireAdmin, async (req: express.Request, res: express.Response) => {
  const targetUserId = Number(req.params.id);
  const adminUserId = (req.session as any)?.userId as number | undefined;
  const adminUsername = (req.session as any)?.username ?? null;
  const ip = clientIp(req);
  const card = (req.params.card_number ?? '').toString().trim();
  if (!targetUserId || !Number.isFinite(targetUserId) || !card) {
    return res.status(400).json({ error: 'Parámetros inválidos' });
  }

  const conn = await pool.getConnection();
  try {
    const u = await callFirst<any>(conn, 'sp_users_get_basic_by_id', [targetUserId]);
    if (!u) return res.status(404).json({ error: 'User not found' });
    const targetName = String(u.username);
    const resUpd = await callAll<any>(conn, 'sp_energy_cards_release_by_user_and_card', [targetUserId, card, adminUserId ?? targetUserId]);
    const affected = Number((resUpd[0] || {}).affected_rows ?? 0);
    if (affected === 0) {
      return res.status(404).json({ error: 'Medidor no encontrado para este usuario' });
    }
    await logSecurity('meter_released', targetName, ip, { card_number: card, user_id: targetUserId, by_admin: adminUsername });
    return res.json({ message: 'Medidor desvinculado' });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: 'No se pudo desvincular el medidor' });
  } finally {
    conn.release();
  }
});

/**
 * Admin: suspend a user with reason (records in blocked table and updates status)
 * POST /api/admin/users/:id/suspend
 * Body: { reason: string }
 */
app.post('/api/admin/users/:id/suspend', requireAuth, requireAdmin, async (req: express.Request, res: express.Response) => {
  const targetUserId = Number(req.params.id);
  const adminUserId = (req.session as any)?.userId as number | undefined;
  const adminUsername = (req.session as any)?.username ?? null;
  const ip = clientIp(req);
  const { reason } = req.body as { reason?: string };
  const rsn = (reason ?? '').toString().trim();

  if (!targetUserId || !Number.isFinite(targetUserId) || !rsn) {
    return res.status(400).json({ error: 'Debe enviar una razón válida' });
  }

  const conn = await pool.getConnection();
  try {
    // Block modifications to audit users
    const info = await callFirst<any>(conn, 'sp_users_select_role_status_by_id', [targetUserId]);
    if (!info) return res.status(404).json({ error: 'User not found' });
    const targetRole = (info.role_name ?? null) as string | null;
    if (targetRole === 'audit') return res.status(403).json({ error: 'Cannot modify audit users' });
    const u = await callFirst<any>(conn, 'sp_users_get_basic_by_id', [targetUserId]);
    if (!u) return res.status(404).json({ error: 'User not found' });
    const targetName = String(u.username);

    await conn.beginTransaction();
    await conn.query('INSERT INTO blocked (user_id, reason, admin_user_id) VALUES (?, ?, ?)', [targetUserId, rsn, adminUserId ?? null]);
    await conn.query('CALL sp_users_update_status_by_name(?, ?)', [targetUserId, 'Suspendido']);
    await conn.commit();

    await logSecurity('admin_suspend', targetName, ip, { user_id: targetUserId, reason: rsn, by_admin: adminUsername });
    return res.json({ message: 'Cuenta suspendida' });
  } catch (e: any) {
    try { await conn.rollback(); } catch {}
    console.error(e);
    return res.status(500).json({ error: 'No se pudo suspender la cuenta' });
  } finally {
    conn.release();
  }
});

/**
 * Admin: update global cost per kWh
 *
 * Request body: { price: number }  (price in COP, e.g. 861.88)
 * Only accessible to authenticated admin users (requireAuth + requireAdmin).
 *
 * Behavior:
 *  - Validate price
 *  - Begin a DB transaction
 *  - Upsert the 'cost_per_kwh' value into the settings table
 *  - Insert a row into kwh_price_history linking to the admin user that made the change
 *  - Commit and log the change via logSecurity
 *  - Return the new price in the response
 */
app.post('/api/admin/kwh-price', requireAuth, requireAdmin, async (req: express.Request, res: express.Response) => {
  const userId = (req.session as any).userId as number;
  const username = (req.session as any).username as string | null;
  const ip = clientIp(req);
  const { price } = req.body as { price?: number };
  if (price == null || isNaN(Number(price)) || Number(price) <= 0) {
    return res.status(400).json({ error: 'Invalid price' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Read old cost using existing helper (uses the provided connection)
    const oldCost = await getCostPerKwh(conn);

    const newPrice = Number(price);

    // Upsert into settings table (key is unique)
    await conn.query('CALL sp_settings_upsert_cost_per_kwh(?)', [String(newPrice)]);

    // Insert into history table
    await conn.query('CALL sp_kwh_price_history_insert(?, ?)', [userId, newPrice]);

    await conn.commit();

    // Log security event
    await logSecurity('kwh_price_update', username ?? null, ip, { old: oldCost, new: newPrice });

    res.json({ message: 'Price updated', cost_per_kwh: newPrice });
  } catch (e: any) {
    try { await conn.rollback(); } catch {}
    console.error(e);
    await logSecurity('kwh_price_update_error', (req.session as any)?.username ?? null, ip, { error: e?.message });
    res.status(500).json({ error: 'Failed to update price' });
  } finally {
    conn.release();
  }
});

/**
 * Password reset endpoints (no auth)
 * - GET /api/password/reset/validate?token=... -> { username, email }
 * - POST /api/password/reset/complete { token, new_password } -> { message }
 */
app.get('/api/password/reset/validate', async (req: express.Request, res: express.Response) => {
  const token = (req.query.token ?? '').toString().trim();
  if (!token) return res.status(400).json({ error: 'Token requerido' });

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const conn = await pool.getConnection();
  try {
    const [rows]: any = await conn.query(
      'SELECT pr.id, pr.user_id, pr.expires_at, pr.used_at, u.username, u.email ' +
      'FROM password_resets pr ' +
      'JOIN users u ON u.id = pr.user_id ' +
      'WHERE pr.token_hash = ? ' +
      'ORDER BY pr.id DESC LIMIT 1',
      [tokenHash]
    );

    const row = Array.isArray(rows) && rows.length ? rows[0] : null;
    if (!row) return res.status(400).json({ error: 'Token inválido' });
    if (row.used_at != null) return res.status(400).json({ error: 'Token ya utilizado' });
    const exp = new Date(row.expires_at).getTime();
    if (!isFinite(exp) || exp <= Date.now()) return res.status(400).json({ error: 'Token expirado' });

    return res.json({ username: String(row.username), email: String(row.email) });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: 'Fallo al validar token' });
  } finally {
    conn.release();
  }
});

app.post('/api/password/reset/complete', async (req: express.Request, res: express.Response) => {
  const { token, new_password } = req.body as { token?: string; new_password?: string };
  const rawToken = (token ?? '').toString().trim();
  const newPassword = (new_password ?? '').toString();
  if (!rawToken || !newPassword) {
    return res.status(400).json({ error: 'Token y nueva contraseña son requeridos' });
  }

  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows]: any = await conn.query(
      'SELECT pr.id, pr.user_id, pr.expires_at, pr.used_at, u.username, u.email ' +
      'FROM password_resets pr ' +
      'JOIN users u ON u.id = pr.user_id ' +
      'WHERE pr.token_hash = ? ' +
      'ORDER BY pr.id DESC LIMIT 1 FOR UPDATE',
      [tokenHash]
    );

    const row = Array.isArray(rows) && rows.length ? rows[0] : null;
    if (!row) {
      await conn.rollback();
      return res.status(400).json({ error: 'Token inválido' });
    }
    if (row.used_at != null) {
      await conn.rollback();
      return res.status(400).json({ error: 'Token ya utilizado' });
    }
    const exp = new Date(row.expires_at).getTime();
    if (!isFinite(exp) || exp <= Date.now()) {
      await conn.rollback();
      return res.status(400).json({ error: 'Token expirado' });
    }

    const uname = String(row.username);
    const email = String(row.email);
    const policyError = passwordPolicyIssues(newPassword, uname, email);
    if (policyError) {
      await conn.rollback();
      return res.status(400).json({ error: policyError });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await conn.query('CALL sp_users_update_password(?, ?)', [Number(row.user_id), hash]);
    await conn.query('UPDATE password_resets SET used_at = CURRENT_TIMESTAMP WHERE id = ?', [Number(row.id)]);
    await conn.commit();

    await logSecurity('password_change_success', uname, clientIp(req), { via: 'reset_token' });
    return res.json({ message: 'Contraseña actualizada' });
  } catch (e: any) {
    try { await conn.rollback(); } catch {}
    console.error(e);
    return res.status(500).json({ error: 'No se pudo actualizar la contraseña' });
  } finally {
    conn.release();
  }
});

/**
 * Self-service profile endpoints
 * - GET /api/me/profile          -> devuelve username, email y perfil (si existe)
 * - PUT /api/me/profile          -> crea/actualiza perfil (nombres, apellidos, documento, dirección, teléfono)
 * - POST /api/me/password-change -> cambia contraseña validando política y contraseña actual
 * - POST /api/me/status          -> auto-actualiza estado a "Pausa" o "Deshabilitado"
 */

app.get('/api/me/profile', requireAuth, async (req: express.Request, res: express.Response) => {
  const userId = (req.session as any).userId as number;
  const conn = await pool.getConnection();
  try {
    const u = await callFirst<any>(conn, 'sp_users_get_basic_by_id', [userId]);
    if (!u) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    const profile = await callFirst<any>(conn, 'sp_user_profiles_get_by_user', [userId]);

    // DB flag: whether personal data was fully filled at least once
    const [flagRows]: any = await conn.query('SELECT personal_data_filled FROM user_flags WHERE user_id = ? LIMIT 1', [userId]);
    const personal_data_filled = Array.isArray(flagRows) && flagRows.length ? Number(flagRows[0].personal_data_filled) === 1 : false;

    res.json({ username: String(u.username), email: String(u.email), profile, personal_data_filled });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'No se pudo cargar el perfil' });
  } finally {
    conn.release();
  }
});

app.put('/api/me/profile', requireAuth, async (req: express.Request, res: express.Response) => {
  const userId = (req.session as any).userId as number;
  const {
    primer_nombre,
    segundo_nombre,
    primer_apellido,
    segundo_apellido,
    tipo_identificacion,
    numero_identificacion,
    direccion,
    telefono,
  } = req.body as {
    primer_nombre?: string;
    segundo_nombre?: string | null;
    primer_apellido?: string;
    segundo_apellido?: string | null;
    tipo_identificacion?: string;
    numero_identificacion?: string;
    direccion?: string | null;
    telefono?: string | null;
  };

  const pn = (primer_nombre ?? '').toString().trim();
  const pa = (primer_apellido ?? '').toString().trim();
  const tipo = (tipo_identificacion ?? '').toString().trim();
  const num = (numero_identificacion ?? '').toString().trim();

  if (!pn || !pa || !tipo || !num) {
    return res.status(400).json({ error: 'Campos obligatorios: primer_nombre, primer_apellido, tipo_identificacion, numero_identificacion' });
  }

  const sn = (segundo_nombre ?? '').toString().trim() || null;
  const sa = (segundo_apellido ?? '').toString().trim() || null;
  const dir = (direccion ?? '').toString().trim() || null;
  const tel = (telefono ?? '').toString().trim() || null;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Current stored profile (if any)
    const current = await callFirst<any>(conn, 'sp_user_profiles_get_by_user', [userId]);
    const curTipo = String(current?.tipo_identificacion ?? '');
    const curNum = String(current?.numero_identificacion ?? '');

    const docChanged = Boolean(
      current &&
      (curTipo !== tipo || curNum !== num)
    );

    if (docChanged) {
      // Passport number change requires support
      if (curTipo === 'Pasaporte' && tipo === 'Pasaporte' && curNum !== num) {
        await conn.rollback();
        return res.status(400).json({ error: 'Para cambios de número de pasaporte, contacte a soporte' });
      }

      // Enforce one-time change per user
      const [existsRows]: any = await conn.query('SELECT id FROM user_document_changes WHERE user_id = ? LIMIT 1', [userId]);
      const used = Array.isArray(existsRows) && existsRows.length > 0;
      if (used) {
        await conn.rollback();
        return res.status(400).json({ error: 'Ya usó su única oportunidad de cambio de documento' });
      }

      await conn.query(
        'INSERT INTO user_document_changes (user_id, old_tipo, old_numero, new_tipo, new_numero) VALUES (?, ?, ?, ?, ?)',
        [userId, curTipo, curNum, tipo, num]
      );
    }

    await conn.query('CALL sp_user_profiles_upsert(?, ?, ?, ?, ?, ?, ?, ?, ?)', [userId, pn, sn, pa, sa, tipo, num, dir, tel]);

    // If address and phone are provided, mark the DB flag as filled (idempotent; keeps first filled_at)
    const filledNow = !!(dir && tel);
    if (filledNow) {
      await conn.query(
        'INSERT INTO user_flags (user_id, personal_data_filled, filled_at) VALUES (?, 1, CURRENT_TIMESTAMP) ' +
        'ON DUPLICATE KEY UPDATE personal_data_filled = 1, filled_at = IF(filled_at IS NULL, VALUES(filled_at), filled_at)',
        [userId]
      );
    }

    await conn.commit();

    await logSecurity(docChanged ? 'profile_document_changed' : 'profile_update', (req.session as any)?.username ?? null, clientIp(req), { user_id: userId });
    res.json({ message: 'Perfil actualizado' });
  } catch (e: any) {
    try { await conn.rollback(); } catch {}
    if (e && (e.code === 'ER_DUP_ENTRY' || e.errno === 1062)) {
      const msg = String((e as any).sqlMessage || e.message || '');
      if (msg.includes('user_document_changes') || msg.includes('uniq_user_document_changes_user')) {
        return res.status(400).json({ error: 'Ya usó su única oportunidad de cambio de documento' });
      }
      if (msg.includes('uniq_phone') || msg.toLowerCase().includes('telefono')) {
        return res.status(400).json({ error: 'El teléfono ya está en uso por otra cuenta' });
      }
      if (msg.includes('uniq_documento') || msg.toLowerCase().includes('tipo_identificacion') || msg.toLowerCase().includes('numero_identificacion')) {
        return res.status(400).json({ error: 'El documento ya está en uso por otra cuenta' });
      }
      return res.status(400).json({ error: 'Datos de perfil ya están en uso por otra cuenta' });
    }
    console.error(e);
    res.status(500).json({ error: 'No se pudo actualizar el perfil' });
  } finally {
    conn.release();
  }
});

app.post('/api/me/password-change', requireAuth, async (req: express.Request, res: express.Response) => {
  const userId = (req.session as any).userId as number;
  const { current_password, new_password } = req.body as { current_password?: string; new_password?: string };
  if (!current_password || !new_password) {
    return res.status(400).json({ error: 'Debe enviar la contraseña actual y la nueva contraseña' });
  }
  const ip = clientIp(req);
  const conn = await pool.getConnection();
  try {
    const u = await callFirst<any>(conn, 'sp_users_get_password_hash', [userId]);
    if (!u) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    const ok = await bcrypt.compare(current_password, u.password_hash);
    if (!ok) {
      await logSecurity('password_change_failed', (req.session as any)?.username ?? null, ip, { reason: 'bad_current' });
      return res.status(400).json({ error: 'Contraseña actual incorrecta' });
    }
    const pwdError = passwordPolicyIssues(new_password, String(u.username), String(u.email));
    if (pwdError) {
      await logSecurity('password_change_failed', (req.session as any)?.username ?? null, ip, { reason: 'policy', error: pwdError });
      return res.status(400).json({ error: pwdError });
    }
    const hash = await bcrypt.hash(new_password, 10);
    await conn.query('CALL sp_users_update_password(?, ?)', [userId, hash]);
    await logSecurity('password_change_success', (req.session as any)?.username ?? null, ip, {});
    res.json({ message: 'Contraseña actualizada' });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'No se pudo cambiar la contraseña' });
  } finally {
    conn.release();
  }
});

app.post('/api/me/status', requireAuth, async (req: express.Request, res: express.Response) => {
  const userId = (req.session as any).userId as number;
  const { status } = req.body as { status?: string };
  const desired = (status ?? '').toString();
  if (!['Pausa', 'Deshabilitado'].includes(desired)) {
    return res.status(400).json({ error: 'Estado inválido. Use "Pausa" o "Deshabilitado".' });
  }
  const conn = await pool.getConnection();
  try {
    const srow = await callFirst<any>(conn, 'sp_statuses_get_id_by_name', [desired]);
    if (!srow) {
      return res.status(400).json({ error: 'Estado no disponible' });
    }
    await conn.query('CALL sp_users_update_status_by_name(?, ?)', [userId, desired]);
    await logSecurity('self_status_update', (req.session as any)?.username ?? null, clientIp(req), { status: desired });
    if (desired === 'Deshabilitado') {
      (req.session as any).destroy(() => {
        res.json({ message: 'Cuenta deshabilitada y sesión cerrada' });
      });
    } else {
      res.json({ message: 'Cuenta pausada' });
    }
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'No se pudo actualizar el estado' });
  } finally {
    conn.release();
  }
});

/**
 * User meters management (list/add)
 */
app.get('/api/me/meters', requireAuth, async (req: express.Request, res: express.Response) => {
  const userId = (req.session as any).userId as number;
  const conn = await pool.getConnection();
  try {
    const rows = await callAll<any>(conn, 'sp_energy_cards_list_by_user', [userId]);
    res.json({ meters: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'No se pudo listar medidores' });
  } finally {
    conn.release();
  }
});

app.post('/api/me/meters', requireAuth, async (req: express.Request, res: express.Response) => {
  const userId = (req.session as any).userId as number;
  const username = (req.session as any).username as string | null;
  const ip = clientIp(req);
  const { card_number, name } = req.body as { card_number?: string; name?: string };
  const meterName = (typeof name === 'string' && name.trim() !== '') ? name.trim().slice(0, 100) : null;
  const card = (typeof card_number === 'string' && card_number.trim() !== '') ? card_number.trim() : null;
  if (!card) {
    return res.status(400).json({ error: 'Debe enviar un número de medidor' });
  }
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // If the meter exists and is released (user_id IS NULL), claim it.
    let foundRow: any = null;
    try {
      foundRow = await callFirst<any>(conn, 'sp_energy_cards_find_by_card_number', [card]);
    } catch (e: any) {
      if (e?.code === 'ER_CANT_AGGREGATE_2COLLATIONS' || String(e?.sqlMessage || e?.message || '').includes('Illegal mix of collations')) {
        foundRow = await findEnergyCardByNumberRaw(conn, card);
      } else {
        throw e;
      }
    }

    if (foundRow) {
      const r = foundRow as any;
      if (r.user_id == null) {
        // Claim released meter by linking to this user and clearing release flags
        await conn.query('CALL sp_energy_cards_claim_released_by_id(?, ?, ?)', [Number(r.id), userId, meterName]);
        await logSecurity('meter_claimed', username, ip, { card_number: card, new_user_id: userId });
      } else {
        await conn.rollback();
        return res.status(400).json({ error: 'Card number already exists' });
      }
    } else {
      // Create a new meter record
      await conn.query('CALL sp_energy_cards_insert(?, ?, ?)', [userId, card, meterName]);
      await logSecurity('meter_added', username, ip, { card_number: card, user_id: userId });
    }

    const rows = await callAll<any>(conn, 'sp_energy_cards_get_by_user_and_card', [userId, card]);

    await conn.commit();

    const meter = (rows as any[])[0] || { card_number: card, current_balance: 0, current_kwh: 0, last_recharge: null };
    return res.json({ meter });
  } catch (e: any) {
    try { await conn.rollback(); } catch {}
    console.error(e);
    return res.status(500).json({ error: 'No se pudo agregar el medidor' });
  } finally {
    conn.release();
  }
});

// Release/unlink a meter from the current user without deleting it,
// so it can be linked to a different account later.
app.delete('/api/me/meters/:card_number', requireAuth, async (req: express.Request, res: express.Response) => {
  const userId = (req.session as any).userId as number;
  const username = (req.session as any).username as string | null;
  const ip = clientIp(req);
  const card = (req.params.card_number ?? '').toString().trim();
  if (!card) {
    return res.status(400).json({ error: 'Debe enviar un número de medidor' });
  }

  const conn = await pool.getConnection();
  try {
    const resUpd = await callAll<any>(conn, 'sp_energy_cards_release_by_user_and_card', [userId, card, userId]);
    const affected = Number((resUpd[0] || {}).affected_rows ?? 0);
    if (affected === 0) {
      return res.status(404).json({ error: 'Medidor no encontrado' });
    }

    await logSecurity('meter_released', username, ip, { card_number: card, user_id: userId });
    return res.json({ message: 'Medidor liberado' });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: 'No se pudo liberar el medidor' });
  } finally {
    conn.release();
  }
});

/**
 * JSON parse error handler - body-parser throws a SyntaxError before route handlers when JSON is invalid.
 * This middleware catches that and returns a clearer response while logging the raw body to help debugging.
 */
/**
 * Update meter name (self-service)
 * PATCH /api/me/meters/:card_number
 * Body: { name?: string | null }   // null or empty string clears the name
 */
app.patch('/api/me/meters/:card_number', requireAuth, async (req: express.Request, res: express.Response) => {
  const userId = (req.session as any).userId as number;
  const username = (req.session as any)?.username ?? null;
  const ip = clientIp(req);
  const card = (req.params.card_number ?? '').toString().trim();
  if (!card) return res.status(400).json({ error: 'Debe enviar un número de medidor' });

  let name: string | null = null;
  const raw = req.body as { name?: string | null };
  if (raw && typeof raw.name === 'string') {
    const trimmed = raw.name.trim();
    name = trimmed ? trimmed.slice(0, 100) : null;
  } else if (raw && raw.name === null) {
    name = null;
  }

  const conn = await pool.getConnection();
  try {
    const upd = await callAll<any>(conn, 'sp_energy_cards_update_name_by_user_and_card', [userId, card, name]);
    const affected = Number((upd[0] || {}).affected_rows ?? 0);
    if (affected === 0) {
      return res.status(404).json({ error: 'Medidor no encontrado' });
    }

    const out = await callFirst<any>(conn, 'sp_energy_cards_get_by_user_and_card', [userId, card]);

    await logSecurity('meter_renamed', username, ip, { card_number: card, name });
    return res.json({ meter: out });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: 'No se pudo actualizar el nombre del medidor' });
  } finally {
    conn.release();
  }
});

app.use(async (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err && err instanceof SyntaxError && 'body' in err) {
    const raw = (req as any).rawBody;
    console.error('JSON parse error:', { message: err.message, rawBody: raw });
    try {
      await logSecurity('parse_error', (req.session as any)?.username ?? null, clientIp(req), {
        error: err.message,
        rawBody: raw,
        url: req.url,
        headers: req.headers,
      });
    } catch (e) {
      console.error('Failed to log parse error', e);
    }
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }
  next(err);
});

app.listen(PORT, HOST, () => {
  console.log(`Energo backend listening on http://${HOST}:${PORT}`);
});