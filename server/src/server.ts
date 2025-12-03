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

const app = express();
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
    cookie: { secure: false }, // dev only, not HTTPS
  })
);

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

    // If a card number was provided, check for duplicates
    if (card) {
      const [cardRows] = await conn.execute<RowDataPacket[]>(
        'SELECT id FROM energy_cards WHERE card_number = ? LIMIT 1',
        [card]
      );
      if (cardRows.length > 0) {
        await conn.rollback();
        await logSecurity('register_duplicate_card', username, ip, { card_number: card });
        return res.status(400).json({ error: 'Card number already exists' });
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
 
    // Insert energy card only if a non-empty normalized `card` was provided
    if (card) {
      try {
        await conn.execute(
          'INSERT INTO energy_cards (user_id, card_number, current_balance, current_kwh) VALUES (?, ?, 0, 0)',
          [user_id, card]
        );
      } catch (e: any) {
        // Handle race where another transaction inserted the same card concurrently
        if (e && (e.code === 'ER_DUP_ENTRY' || e.errno === 1062)) {
          await conn.rollback();
          await logSecurity('register_duplicate_card', username, ip, { card_number: card, error: e?.message });
          return res.status(400).json({ error: 'Card number already exists' });
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

    // Enforce status: block Deshabilitado and Suspendido
    const statusName = (user.status_name || '').toString();
    if (statusName === 'Deshabilitado' || statusName === 'Suspendido') {
      await logSecurity('login_blocked_status', username, ip, { status: statusName });
      return res.status(403).json({ error: `Cuenta ${statusName}. Contacte al administrador.` });
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

// Audit: update admin status
app.patch('/api/audit/users/:id/status', requireAuth, requireAudit, async (req: express.Request, res: express.Response) => {
  const id = Number(req.params.id);
  const { status } = req.body as { status?: string };
  if (!id || !status) return res.status(400).json({ error: 'Invalid request' });
  const conn = await pool.getConnection();
  try {
    // Ensure target user is admin
    const [roleRows] = await conn.execute<RowDataPacket[]>(
      'SELECT r.name AS role FROM users u LEFT JOIN roles r ON r.id = u.role_id WHERE u.id = ? LIMIT 1',
      [id]
    );
    if ((roleRows as any[]).length === 0) return res.status(404).json({ error: 'User not found' });
    const targetRole = ((roleRows as any[])[0] as any).role as string | null;
    if (targetRole !== 'admin') return res.status(403).json({ error: 'Can only modify admin users' });

    // validate allowed statuses
    const allowed = ['Activo', 'Pausa', 'Deshabilitado', 'Suspendido'];
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

    let card: any = null;
    let pins: any[] = [];
    let logs: any[] = [];

    if (role === 'admin') {
      // Admin: show global "Últimos movimientos" (all users), hide logs and card
      const [pinRows] = await conn.execute<RowDataPacket[]>(
        'SELECT rp.user_id, u.email, rp.pin_code, rp.amount, rp.kwh, rp.created_at, rp.card_number FROM recharge_pins rp LEFT JOIN users u ON u.id = rp.user_id ORDER BY rp.created_at DESC LIMIT 100'
      );
      pins = pinRows as any[];
      // logs remain empty; card remains null
    } else if (role === 'audit') {
      // Audit: show global security logs for all users, hide card and recharge history
      const [logRows] = await conn.execute<RowDataPacket[]>(
        'SELECT event_type, event_time, ip_address, details FROM security_logs ORDER BY event_time DESC LIMIT 200'
      );
      logs = logRows as any[];
    } else {
      // Regular user: own card, own history, and hide logs
      const [cardRows] = await conn.execute<RowDataPacket[]>(
        'SELECT card_number, current_balance, current_kwh FROM energy_cards WHERE user_id = ? LIMIT 1',
        [userId]
      );
      card = (cardRows as any[])[0] || null;

      const [pinRows] = await conn.execute<RowDataPacket[]>(
        'SELECT rp.user_id, u.email, rp.pin_code, rp.amount, rp.kwh, rp.created_at, rp.card_number FROM recharge_pins rp LEFT JOIN users u ON u.id = rp.user_id WHERE rp.user_id = ? ORDER BY rp.created_at DESC',
        [userId]
      );
      pins = pinRows as any[];

      // Hide logs for non-audit roles
      logs = [];
      // If you want per-user logs instead, replace the above with:
      // const [logRows] = await conn.execute<RowDataPacket[]>(
      //   'SELECT event_type, event_time, ip_address, details FROM security_logs WHERE username = ? ORDER BY event_time DESC LIMIT 100',
      //   [username]
      // );
      // logs = logRows as any[];
    }

    const costPerKwh = await getCostPerKwh(conn);
    res.json({
      current_user: { username: info.username, role: info.role_name, status: info.status_name },
      card,
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

function generatePin15(): string {
  let s = '';
  for (let i = 0; i < 15; i++) {
    s += Math.floor(Math.random() * 10).toString();
  }
  if (s.length < 15) s = s.padStart(15, '0');
  return s;
}

app.post('/api/recharge', requireAuth, async (req: express.Request, res: express.Response) => {
  const userId = (req.session as any).userId as number;
  const username = (req.session as any).username as string;
  const ip = clientIp(req);
  const { amount, kwh } = req.body as { amount?: number; kwh?: number };
  if ((amount == null || isNaN(Number(amount))) && (kwh == null || isNaN(Number(kwh)))) {
    return res.status(400).json({ error: 'Provide either amount (COP) or kwh' });
  }
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
    const [cardRows] = await conn.execute<RowDataPacket[]>(
      'SELECT card_number, current_balance, current_kwh FROM energy_cards WHERE user_id = ? FOR UPDATE',
      [userId]
    );
    if ((cardRows as any[]).length === 0) {
      await conn.rollback();
      return res.status(400).json({ error: 'No energy card for user' });
    }
    const card = (cardRows as any[])[0] as any;
    const newBalance = +(Number(card.current_balance) + amountCOP).toFixed(2);
    const newKwh = +(Number(card.current_kwh) + kwhVal).toFixed(2);
    await conn.execute(
      'UPDATE energy_cards SET current_balance = ?, current_kwh = ?, last_recharge = CURRENT_TIMESTAMP WHERE user_id = ?',
      [newBalance, newKwh, userId]
    );
    const pin = generatePin15();
    await conn.execute(
      'INSERT INTO recharge_pins (user_id, card_number, pin_code, amount, kwh) VALUES (?, ?, ?, ?, ?)',
      [userId, card.card_number, pin, amountCOP, kwhVal]
    );
    await conn.commit();
    await logSecurity('recharge', username, ip, { amount: amountCOP, kwh: kwhVal, pin });
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

    // validate allowed statuses
    const allowed = ['Activo', 'Pausa', 'Deshabilitado', 'Suspendido'];
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

    const newPrice = Number(Number(price).toFixed(2));

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
 * JSON parse error handler - body-parser throws a SyntaxError before route handlers when JSON is invalid.
 * This middleware catches that and returns a clearer response while logging the raw body to help debugging.
 */
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