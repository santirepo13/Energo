import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import { createPool, Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';

const app = express();
const PORT = Number(process.env.PORT || 4000);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const SESSION_SECRET = process.env.SESSION_SECRET || 'insecure-dev-secret';
const DEFAULT_COST_PER_KWH = 900; // COP

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

    const password_hash = await bcrypt.hash(password, 10);
    const [userResult] = await conn.execute<ResultSetHeader>(
      'INSERT INTO users (username, password_hash, email, role_id) VALUES (?, ?, ?, ?)',
      [username, password_hash, email, role_id]
    );
    const user_id = (userResult as ResultSetHeader).insertId;
 
    // Insert energy card only if a non-empty card_number was provided
    if (card_number && card_number.trim() !== '') {
      await conn.execute(
        'INSERT INTO energy_cards (user_id, card_number, current_balance, current_kwh) VALUES (?, ?, 0, 0)',
        [user_id, card_number]
      );
    }
  
    // Mark employee code as used (if applicable) and record usage in mapping table
    if (employee_code && employee_code.trim() !== '' && employeeCodeId != null) {
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
    await logSecurity('register_success', username, ip, { user_id, card_number, role_id });
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
      'SELECT id, password_hash FROM users WHERE username = ? LIMIT 1',
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
    (req.session as any).userId = user.id;
    (req.session as any).username = username;
    await conn.execute('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);
    await logSecurity('login_success', username, ip, {});
    res.json({ message: 'Login successful' });
  } catch (e: any) {
    console.error(e);
    await logSecurity('login_error', username, ip, { error: e?.message });
    res.status(500).json({ error: 'Login failed' });
  } finally {
    conn.release();
  }
});

function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!(req.session as any)?.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

app.get('/api/dashboard', requireAuth, async (req: express.Request, res: express.Response) => {
  const userId = (req.session as any).userId as number;
  const username = (req.session as any).username as string;
  const conn = await pool.getConnection();
  try {
    const [cardRows] = await conn.execute<RowDataPacket[]>(
      'SELECT card_number, current_balance, current_kwh FROM energy_cards WHERE user_id = ? LIMIT 1',
      [userId]
    );
    const card = (cardRows as any[])[0] || null;
    const [pins] = await conn.execute<RowDataPacket[]>(
      'SELECT pin_code, amount, kwh, created_at, card_number FROM recharge_pins WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    const [logs] = await conn.execute<RowDataPacket[]>(
      'SELECT event_type, event_time, ip_address, details FROM security_logs WHERE username = ? ORDER BY event_time DESC LIMIT 100',
      [username]
    );
    const costPerKwh = await getCostPerKwh(conn);
    res.json({ card, recharge_history: pins, security_logs: logs, cost_per_kwh: costPerKwh });
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
    await conn.rollback();
    console.error(e);
    await logSecurity('recharge_error', username, ip, { error: e?.message });
    res.status(500).json({ error: 'Recharge failed' });
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

app.listen(PORT, () => {
  console.log(`Energo backend listening on http://localhost:${PORT}`);
});