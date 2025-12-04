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
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test DB connection on startup and log a clear status (non-fatal in dev)
async function testDbConnection() {
  try {
    const conn = await pool.getConnection();
    try {
      await conn.query('SELECT 1');
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
      await conn.execute(
        'INSERT INTO security_logs (event_type, username, ip_address, details) VALUES (?, ?, ?, ?)',
        [event_type, username, ip, typeof details === 'string' ? details : JSON.stringify(details)]
      );
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
  // Try to read cost_per_kwh from settings table; fall back to DEFAULT_COST_PER_KWH
  try {
    if (conn) {
      const [rows] = await conn.execute(
        "SELECT value FROM settings WHERE `key` = 'cost_per_kwh' LIMIT 1"
      );
      if (Array.isArray(rows) && (rows as any[]).length > 0) {
        const v = parseFloat((rows as any)[0].value);
        if (!isNaN(v) && v > 0) return v;
      }
    } else {
      const tempConn = await pool.getConnection();
      try {
        const [rows] = await tempConn.execute(
          "SELECT value FROM settings WHERE `key` = 'cost_per_kwh' LIMIT 1"
        );
        if (Array.isArray(rows) && (rows as any).length > 0) {
          const v = parseFloat((rows as any)[0].value);
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

    // check duplicates
    const [userRows] = await conn.execute<RowDataPacket[]>(
      'SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1',
      [username, email]
    );
    if (userRows.length > 0) {
      await conn.rollback();
      await logSecurity('register_duplicate', username, ip, { username, email });
      return res.status(400).json({ error: 'Username or email already exists' });
    }

     // If a card number was provided, only block when it's already assigned to a user.
     if (card) {
       const [cardRows] = await conn.execute<RowDataPacket[]>(
         'SELECT id, user_id FROM energy_cards WHERE card_number = ? LIMIT 1',
         [card]
       );
       if ((cardRows as any[]).length > 0) {
         const cr = (cardRows as any[])[0] as any;
         if (cr.user_id != null) {
           await conn.rollback();
           await logSecurity('register_duplicate_card', username, ip, { card_number: card });
           return res.status(400).json({ error: 'Medidor ya enlazado, por favor contacte a soporte' });
         }
         // If user_id is NULL (released), allow registration to proceed and we will claim it after creating the user.
       }
     }

    // Determine role_id: default to 'user', or use employee_code to set admin/audit
    let role_id: number | null = null;
    let employeeCodeId: number | null = null;
    if (empCode) {
      // Lock the employee_codes row so two requests can't use the same code concurrently
      const [codeRows] = await conn.execute<RowDataPacket[]>(
        'SELECT id, role_id, used FROM employee_codes WHERE code = ? LIMIT 1 FOR UPDATE',
        [empCode]
      );
      if ((codeRows as any[]).length === 0) {
        await conn.rollback();
        await logSecurity('register_bad_code', username, ip, { employee_code: empCode });
        return res.status(400).json({ error: 'Invalid employee code' });
      }
      const codeRow = (codeRows as any[])[0];
      if (Number(codeRow.used) === 1) {
        await conn.rollback();
        await logSecurity('register_code_used', username, ip, { employee_code: empCode });
        return res.status(400).json({ error: 'Employee code already used' });
      }
      role_id = Number(codeRow.role_id);
      employeeCodeId = Number(codeRow.id);
    } else {
      // fetch default 'user' role id
      const [roleRows] = await conn.execute<RowDataPacket[]>(
        "SELECT id FROM roles WHERE name = 'user' LIMIT 1"
      );
      if ((roleRows as any[]).length === 0) {
        await conn.rollback();
        console.error('Missing default role "user" in roles table');
        return res.status(500).json({ error: 'Server misconfiguration' });
      }
      role_id = Number((roleRows as any[])[0].id);
    }

    // Resolve default status 'Activo'
    const [statusRows] = await conn.execute<RowDataPacket[]>(
      "SELECT id FROM statuses WHERE name = 'Activo' LIMIT 1"
    );
    if ((statusRows as any[]).length === 0) {
      await conn.rollback();
      console.error('Missing default status "Activo" in statuses table');
      return res.status(500).json({ error: 'Server misconfiguration' });
    }
    const status_id = Number((statusRows as any[])[0].id);

    const password_hash = await bcrypt.hash(password, 10);
    const [userResult] = await conn.execute<ResultSetHeader>(
      'INSERT INTO users (username, password_hash, email, role_id, status_id) VALUES (?, ?, ?, ?, ?)',
      [username, password_hash, email, role_id, status_id]
    );
    const user_id = (userResult as ResultSetHeader).insertId;
 
     // Link or create energy card if a non-empty normalized `card` was provided
     if (card) {
       try {
         // Try to claim a released meter if it already exists with no owner
         const [existing] = await conn.execute<RowDataPacket[]>(
           'SELECT id, user_id FROM energy_cards WHERE card_number = ? LIMIT 1',
           [card]
         );
         if ((existing as any[]).length > 0) {
           const er = (existing as any[])[0] as any;
           if (er.user_id == null) {
             await conn.execute(
               'UPDATE energy_cards SET user_id = ?, released = 0, released_by_user_id = NULL, released_at = NULL WHERE id = ?',
               [user_id, Number(er.id)]
             );
           } else {
             // Safety: should be prevented by earlier check
             await conn.rollback();
             await logSecurity('register_duplicate_card', username, ip, { card_number: card });
             return res.status(400).json({ error: 'Medidor ya enlazado, por favor contacte a soporte' });
           }
         } else {
           // Create a brand new meter
           await conn.execute(
             'INSERT INTO energy_cards (user_id, card_number, current_balance, current_kwh) VALUES (?, ?, 0, 0)',
             [user_id, card]
           );
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
      const [usageResult] = await conn.execute<ResultSetHeader>(
        'INSERT INTO employee_code_usages (employee_code_id, user_id) VALUES (?, ?)',
        [employeeCodeId, user_id]
      );
      const usageId = (usageResult as ResultSetHeader).insertId;
 
      // Update the employee_codes row to mark it used, set used_at, and link to the usage record
      await conn.execute(
        'UPDATE employee_codes SET used = 1, used_at = CURRENT_TIMESTAMP, employee_usage_id = ? WHERE id = ?',
        [usageId, employeeCodeId]
      );
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
    const [rows] = await conn.execute<RowDataPacket[]>(
      `SELECT u.id, u.password_hash, r.name AS role_name, s.name AS status_name
       FROM users u
       LEFT JOIN roles r ON r.id = u.role_id
       LEFT JOIN statuses s ON s.id = u.status_id
       WHERE u.username = ?
       LIMIT 1`,
      [username]
    );
    if (rows.length === 0) {
      await logSecurity('login_failed', username, ip, { reason: 'user_not_found' });
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = rows[0] as any;
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
    await conn.execute('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);
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
    const [rows] = await conn.execute<RowDataPacket[]>(
      `SELECT u.id, s.name AS status_name
       FROM users u
       LEFT JOIN statuses s ON s.id = u.status_id
       WHERE u.username = ?
       LIMIT 1`,
      [uname]
    );
    if ((rows as any[]).length === 0) {
      await logSecurity('pause_verify_user_not_found', uname, ip, {});
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    const u = (rows as any[])[0] as any;
    const currentStatus = (u.status_name ?? '').toString();
    if (currentStatus !== 'Pausa') {
      return res.status(400).json({ error: 'La cuenta no está en pausa' });
    }

    // Resolve 'Activo' status id
    const [srows] = await conn.execute<RowDataPacket[]>(
      'SELECT id FROM statuses WHERE name = ? LIMIT 1',
      ['Activo']
    );
    if ((srows as any[]).length === 0) {
      return res.status(500).json({ error: 'Misconfiguración del servidor (status Activo faltante)' });
    }
    const activeId = Number((srows as any[])[0].id);

    await conn.execute('UPDATE users SET status_id = ? WHERE id = ?', [activeId, Number(u.id)]);
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
    const [rows] = await conn.execute<RowDataPacket[]>(
      `SELECT r.name AS role_name, s.name AS status_name
       FROM users u
       LEFT JOIN roles r ON r.id = u.role_id
       LEFT JOIN statuses s ON s.id = u.status_id
       WHERE u.id = ?
       LIMIT 1`,
      [userId]
    );
    if ((rows as any[]).length === 0) return null;
    const r = rows[0] as any;
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
    const [rows] = await conn.execute<RowDataPacket[]>(
      `SELECT u.id, u.username, u.email, u.created_at, u.last_login,
              r.name AS role, s.name AS status
       FROM users u
       LEFT JOIN roles r ON r.id = u.role_id
       LEFT JOIN statuses s ON s.id = u.status_id
       WHERE r.name = 'admin'
       ORDER BY u.created_at DESC`
    );
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
    const [rows] = await conn.execute<RowDataPacket[]>(
      `SELECT u.id, u.username, u.email, u.created_at, u.last_login,
              r.name AS role, s.name AS status
       FROM users u
       LEFT JOIN roles r ON r.id = u.role_id
       LEFT JOIN statuses s ON s.id = u.status_id
       WHERE r.name IN ('admin','audit')
       ORDER BY u.created_at DESC`
    );
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
    const [roleRows] = await conn.execute<RowDataPacket[]>(
      'SELECT r.name AS role FROM users u LEFT JOIN roles r ON r.id = u.role_id WHERE u.id = ? LIMIT 1',
      [id]
    );
    if ((roleRows as any[]).length === 0) return res.status(404).json({ error: 'User not found' });
    const targetRole = ((roleRows as any[])[0] as any).role as string | null;
    if (targetRole !== 'admin' && targetRole !== 'audit') return res.status(403).json({ error: 'Can only modify admin/audit users' });

    // validate allowed statuses (admins: only Activo/Deshabilitado)
    const allowed = targetRole === 'admin'
      ? ['Activo', 'Deshabilitado']
      : ['Activo', 'Pausa', 'Deshabilitado', 'Suspendido'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const [srows] = await conn.execute<RowDataPacket[]>(
      'SELECT id FROM statuses WHERE name = ? LIMIT 1',
      [status]
    );
    if ((srows as any[]).length === 0) return res.status(400).json({ error: 'Status not found' });
    const statusId = Number((srows as any[])[0].id);
    await conn.execute('UPDATE users SET status_id = ? WHERE id = ?', [statusId, id]);
    res.json({ message: 'Status updated' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update status' });
  } finally {
    conn.release();
  }
});

// Audit: sales metrics over time (independent of current cost setting)
app.get('/api/audit/metrics', requireAuth, requireAudit, async (req: express.Request, res: express.Response) => {
  const days = Math.max(1, Math.min(365, Number((req.query.days as string) ?? 30) || 30));
  const conn = await pool.getConnection();
  try {
    const [totalsRows] = await conn.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS pins, COALESCE(SUM(amount),0) AS total_amount, COALESCE(SUM(kwh),0) AS total_kwh
       FROM recharge_pins`
    );
    const totals = (totalsRows as any[])[0] || { pins: 0, total_amount: 0, total_kwh: 0 };

    const [seriesRows] = await conn.execute<RowDataPacket[]>(
      `SELECT DATE(created_at) AS day,
              COUNT(*) AS pins,
              COALESCE(SUM(amount),0) AS amount,
              COALESCE(SUM(kwh),0) AS kwh
       FROM recharge_pins
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY DATE(created_at)
       ORDER BY DATE(created_at) ASC`,
      [days]
    );

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
    const [rows] = await conn.execute<RowDataPacket[]>(
      `SELECT ec.id, ec.code, ec.used, ec.created_at, ec.used_at, r.name AS role
       FROM employee_codes ec
       LEFT JOIN roles r ON r.id = ec.role_id
       ORDER BY ec.created_at DESC`
    );
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
    const [rrows] = await conn.execute<RowDataPacket[]>(
      `SELECT id FROM roles WHERE name = ? LIMIT 1`,
      [roleName]
    );
    if ((rrows as any[]).length === 0) return res.status(400).json({ error: 'Role not found' });
    const roleId = Number((rrows as any[])[0].id);

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
        const [ins] = await conn.execute<ResultSetHeader>(
          'INSERT INTO employee_codes (code, role_id, used) VALUES (?, ?, 0)',
          [code, roleId]
        );
        const id = (ins as ResultSetHeader).insertId;
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
    const [infoRows] = await conn.execute<RowDataPacket[]>(
      `SELECT u.username, r.name AS role_name, s.name AS status_name
       FROM users u
       LEFT JOIN roles r ON r.id = u.role_id
       LEFT JOIN statuses s ON s.id = u.status_id
       WHERE u.id = ?
       LIMIT 1`,
      [userId]
    );
    const info = (infoRows as any[])[0] || { username, role_name: null, status_name: null };
    const role = (info.role_name ?? null) as string | null;

    let cards: any[] = [];
    let card: any = null;
    let pins: any[] = [];
    let logs: any[] = [];

    if (role === 'admin') {
      // Admin: show global "Últimos movimientos" (all users), hide logs and card/cards
      const [pinRows] = await conn.execute<RowDataPacket[]>(
        'SELECT rp.user_id, u.email, rp.pin_code, rp.amount, rp.kwh, rp.created_at, rp.card_number FROM recharge_pins rp LEFT JOIN users u ON u.id = rp.user_id ORDER BY rp.created_at DESC LIMIT 100'
      );
      pins = pinRows as any[];
      // logs remain empty; card/cards remain null/empty
    } else if (role === 'audit') {
      // Audit: show global security logs for all users, hide card/cards and recharge history
      const [logRows] = await conn.execute<RowDataPacket[]>(
        'SELECT event_type, event_time, ip_address, details FROM security_logs ORDER BY event_time DESC LIMIT 200'
      );
      logs = logRows as any[];
    } else {
      // Regular user: own cards, own history, and hide logs
      const [cardRows] = await conn.execute<RowDataPacket[]>(
        'SELECT card_number, name, current_balance, current_kwh FROM energy_cards WHERE user_id = ? ORDER BY COALESCE(name, card_number) ASC',
        [userId]
      );
      cards = cardRows as any[];
      card = (cards as any[])[0] || null;

      const [pinRows] = await conn.execute<RowDataPacket[]>(
        'SELECT rp.user_id, u.email, rp.pin_code, rp.amount, rp.kwh, rp.created_at, rp.card_number FROM recharge_pins rp LEFT JOIN users u ON u.id = rp.user_id WHERE rp.user_id = ? ORDER BY rp.created_at DESC',
        [userId]
      );
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
    const [statusRows] = await conn.execute<RowDataPacket[]>(
      `SELECT s.name AS status_name
       FROM users u
       LEFT JOIN statuses s ON s.id = u.status_id
       WHERE u.id = ?
       LIMIT 1`,
      [userId]
    );
    const statusName = (statusRows as any[])[0]?.status_name as string | undefined;
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
      const [cardRows] = await conn.execute<RowDataPacket[]>(
        'SELECT card_number, current_balance, current_kwh FROM energy_cards WHERE user_id = ? AND card_number = ? FOR UPDATE',
        [userId, selectedCardNumber]
      );
      if ((cardRows as any[]).length === 0) {
        await conn.rollback();
        return res.status(400).json({ error: 'No energy card for user with that card_number' });
      }
      card = (cardRows as any[])[0] as any;
    } else {
      const [cardRows] = await conn.execute<RowDataPacket[]>(
        'SELECT card_number, current_balance, current_kwh FROM energy_cards WHERE user_id = ? FOR UPDATE',
        [userId]
      );
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
    await conn.execute(
      'UPDATE energy_cards SET current_balance = ?, current_kwh = ?, last_recharge = CURRENT_TIMESTAMP WHERE user_id = ? AND card_number = ?',
      [newBalance, newKwh, userId, card.card_number]
    );
    const pin = generateSts20Token(card.card_number, amountCOP, kwhVal);
    await conn.execute(
      'INSERT INTO recharge_pins (user_id, card_number, pin_code, amount, kwh) VALUES (?, ?, ?, ?, ?)',
      [userId, card.card_number, pin, amountCOP, kwhVal]
    );
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
    const [rows] = await conn.execute<RowDataPacket[]>(
      `SELECT u.id, u.username, u.email, u.created_at, u.last_login,
              r.name AS role, s.name AS status
       FROM users u
       LEFT JOIN roles r ON r.id = u.role_id
       LEFT JOIN statuses s ON s.id = u.status_id
       WHERE r.name <> 'audit'
       ORDER BY u.created_at DESC`
    );
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
  const conn = await pool.getConnection();
  try {
    // Block modifications to audit users
    const [roleRows] = await conn.execute<RowDataPacket[]>(
      'SELECT r.name AS role FROM users u LEFT JOIN roles r ON r.id = u.role_id WHERE u.id = ? LIMIT 1',
      [id]
    );
    if ((roleRows as any[]).length === 0) return res.status(404).json({ error: 'User not found' });
    const targetRole = ((roleRows as any[])[0] as any).role as string | null;
    if (targetRole === 'audit') return res.status(403).json({ error: 'Cannot modify audit users' });

    // ensure not taken
    const [rows] = await conn.execute<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1',
      [email, id]
    );
    if ((rows as any[]).length > 0) return res.status(400).json({ error: 'Email already in use' });
    await conn.execute('UPDATE users SET email = ? WHERE id = ?', [email, id]);
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
    const [roleRows] = await conn.execute<RowDataPacket[]>(
      'SELECT r.name AS role FROM users u LEFT JOIN roles r ON r.id = u.role_id WHERE u.id = ? LIMIT 1',
      [id]
    );
    if ((roleRows as any[]).length === 0) return res.status(404).json({ error: 'User not found' });
    const targetRole = ((roleRows as any[])[0] as any).role as string | null;
    if (targetRole === 'audit') return res.status(403).json({ error: 'Cannot modify audit users' });

    // validate allowed statuses (admins: only Activo/Deshabilitado)
    const allowed = targetRole === 'admin'
      ? ['Activo', 'Deshabilitado']
      : ['Activo', 'Pausa', 'Deshabilitado', 'Suspendido'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const [srows] = await conn.execute<RowDataPacket[]>(
      'SELECT id FROM statuses WHERE name = ? LIMIT 1',
      [status]
    );
    if ((srows as any[]).length === 0) return res.status(400).json({ error: 'Status not found' });
    const statusId = Number((srows as any[])[0].id);
    await conn.execute('UPDATE users SET status_id = ? WHERE id = ?', [statusId, id]);
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
    const [urows] = await conn.execute<RowDataPacket[]>(
      'SELECT id FROM users WHERE id = ? LIMIT 1',
      [toUserId]
    );
    if ((urows as any[]).length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Usuario destino no existe' });
    }

    // Lock meter row
    const [crows] = await conn.execute<RowDataPacket[]>(
      'SELECT id, user_id FROM energy_cards WHERE card_number = ? LIMIT 1 FOR UPDATE',
      [card]
    );
    if ((crows as any[]).length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Medidor no existe' });
    }

    const current = (crows as any[])[0] as any;
    const fromUserId = current.user_id == null ? null : Number(current.user_id);

    if (fromUserId === toUserId) {
      await conn.rollback();
      return res.status(400).json({ error: 'El medidor ya pertenece al usuario destino' });
    }

    // Transfer ownership and clear release flags
    await conn.execute(
      'UPDATE energy_cards SET user_id = ?, released = 0, released_by_user_id = NULL, released_at = NULL WHERE id = ?',
      [toUserId, Number(current.id)]
    );

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
    const [roleRows] = await conn.execute<RowDataPacket[]>(
      'SELECT u.username, u.email, r.name AS role FROM users u LEFT JOIN roles r ON r.id = u.role_id WHERE u.id = ? LIMIT 1',
      [id]
    );
    if ((roleRows as any[]).length === 0) return res.status(404).json({ error: 'User not found' });
    const u = (roleRows as any[])[0] as any;
    if ((u.role as string | null) === 'audit') return res.status(403).json({ error: 'Cannot modify audit users' });

    const token = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    const resetLink = `${CLIENT_ORIGIN}/reset-password?token=${token}`;
    await logSecurity('password_reset_link', u.username, clientIp(req), { user_id: id, email: u.email, reset_link: resetLink });
    res.json({ message: 'Password reset link queued (mock)', link: resetLink });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to send reset link' });
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
    await conn.execute(
      "INSERT INTO settings (`key`, `value`, `created_at`, `updated_at`) VALUES ('cost_per_kwh', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`), `updated_at` = CURRENT_TIMESTAMP",
      [String(newPrice)]
    );

    // Insert into history table
    await conn.execute(
      'INSERT INTO kwh_price_history (admin_user_id, price_cop) VALUES (?, ?)',
      [userId, newPrice]
    );

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
    const [urows] = await conn.execute<RowDataPacket[]>(
      'SELECT username, email FROM users WHERE id = ? LIMIT 1',
      [userId]
    );
    if ((urows as any[]).length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    const [prows] = await conn.execute<RowDataPacket[]>(
      `SELECT primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
              tipo_identificacion, numero_identificacion, direccion, telefono
       FROM user_profiles WHERE user_id = ? LIMIT 1`,
      [userId]
    );
    const u = (urows as any[])[0] as any;
    const profile = (prows as any[]).length > 0 ? (prows as any[])[0] : null;
    res.json({ username: String(u.username), email: String(u.email), profile });
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
    await conn.execute(
      `INSERT INTO user_profiles
       (user_id, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
        tipo_identificacion, numero_identificacion, direccion, telefono)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         primer_nombre = VALUES(primer_nombre),
         segundo_nombre = VALUES(segundo_nombre),
         primer_apellido = VALUES(primer_apellido),
         segundo_apellido = VALUES(segundo_apellido),
         tipo_identificacion = VALUES(tipo_identificacion),
         numero_identificacion = VALUES(numero_identificacion),
         direccion = VALUES(direccion),
         telefono = VALUES(telefono),
         updated_at = CURRENT_TIMESTAMP`,
      [userId, pn, sn, pa, sa, tipo, num, dir, tel]
    );
    await logSecurity('profile_update', (req.session as any)?.username ?? null, clientIp(req), { user_id: userId });
    res.json({ message: 'Perfil actualizado' });
  } catch (e: any) {
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
    const [rows] = await conn.execute<RowDataPacket[]>(
      'SELECT username, email, password_hash FROM users WHERE id = ? LIMIT 1',
      [userId]
    );
    if ((rows as any[]).length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    const u = (rows as any[])[0] as any;
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
    await conn.execute('UPDATE users SET password_hash = ?, password_changed_at = CURRENT_TIMESTAMP WHERE id = ?', [hash, userId]);
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
    const [srows] = await conn.execute<RowDataPacket[]>(
      'SELECT id FROM statuses WHERE name = ? LIMIT 1',
      [desired]
    );
    if ((srows as any[]).length === 0) {
      return res.status(400).json({ error: 'Estado no disponible' });
    }
    const statusId = Number((srows as any[])[0].id);
    await conn.execute('UPDATE users SET status_id = ? WHERE id = ?', [statusId, userId]);
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
    const [rows] = await conn.execute<RowDataPacket[]>(
      'SELECT card_number, name, current_balance, current_kwh, last_recharge FROM energy_cards WHERE user_id = ? ORDER BY COALESCE(name, card_number) ASC',
      [userId]
    );
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
    const [found] = await conn.execute<RowDataPacket[]>(
      'SELECT id, user_id, card_number, current_balance, current_kwh, last_recharge, released FROM energy_cards WHERE card_number = ? LIMIT 1',
      [card]
    );

    if ((found as any[]).length > 0) {
      const r = (found as any[])[0] as any;
      if (r.user_id == null) {
        // Claim released meter by linking to this user and clearing release flags
        await conn.execute(
          'UPDATE energy_cards SET user_id = ?, name = COALESCE(?, name), released = 0, released_by_user_id = NULL, released_at = NULL WHERE id = ?',
          [userId, meterName, Number(r.id)]
        );
        await logSecurity('meter_claimed', username, ip, { card_number: card, new_user_id: userId });
      } else {
        await conn.rollback();
        return res.status(400).json({ error: 'Card number already exists' });
      }
    } else {
      // Create a new meter record
      await conn.execute(
        'INSERT INTO energy_cards (user_id, card_number, name, current_balance, current_kwh) VALUES (?, ?, ?, 0, 0)',
        [userId, card, meterName]
      );
      await logSecurity('meter_added', username, ip, { card_number: card, user_id: userId });
    }

    const [rows] = await conn.execute<RowDataPacket[]>(
      'SELECT card_number, name, current_balance, current_kwh, last_recharge FROM energy_cards WHERE user_id = ? AND card_number = ? LIMIT 1',
      [userId, card]
    );

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
    const [rows] = await conn.execute<RowDataPacket[]>(
      'SELECT id FROM energy_cards WHERE user_id = ? AND card_number = ? LIMIT 1',
      [userId, card]
    );
    if ((rows as any[]).length === 0) {
      return res.status(404).json({ error: 'Medidor no encontrado' });
    }
    const id = Number((rows as any[])[0].id);

    await conn.execute(
      'UPDATE energy_cards SET user_id = NULL, released = 1, released_by_user_id = ?, released_at = CURRENT_TIMESTAMP WHERE id = ?',
      [userId, id]
    );

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
    const [rows] = await conn.execute<RowDataPacket[]>(
      'SELECT id FROM energy_cards WHERE user_id = ? AND card_number = ? LIMIT 1',
      [userId, card]
    );
    if ((rows as any[]).length === 0) {
      return res.status(404).json({ error: 'Medidor no encontrado' });
    }

    await conn.execute(
      'UPDATE energy_cards SET name = ? WHERE user_id = ? AND card_number = ?',
      [name, userId, card]
    );

    const [out] = await conn.execute<RowDataPacket[]>(
      'SELECT card_number, name, current_balance, current_kwh, last_recharge FROM energy_cards WHERE user_id = ? AND card_number = ? LIMIT 1',
      [userId, card]
    );

    await logSecurity('meter_renamed', username, ip, { card_number: card, name });
    return res.json({ meter: (out as any[])[0] });
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