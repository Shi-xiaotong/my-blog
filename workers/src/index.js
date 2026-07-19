// ─── Existing ffzy-proxy code (preserved) ─────────────────────────────────────

var CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Admin-Secret"
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json; charset=utf-8" }
  });
}

function notFound() {
  return jsonResponse({ error: "Not Found" }, 404);
}

function badRequest(msg) {
  return jsonResponse({ error: msg }, 400);
}

function unauthorized(msg = "Unauthorized") {
  return jsonResponse({ error: msg }, 401);
}

function redirect(url) {
  return Response.redirect(url, 302);
}

function generateToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

// ─── New auth utilities ───────────────────────────────────────────────────────

function generateId() {
  return crypto.randomUUID();
}

function generateCode() {
  return String(100000 + Math.floor(Math.random() * 900000));
}

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const hash = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial, 256
  );
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  const hashHex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  return `pbkdf2:sha256:100000:${saltHex}:${hashHex}`;
}

async function verifyPassword(password, stored) {
  const parts = stored.split(':');
  if (parts[0] !== 'pbkdf2' || parts[1] !== 'sha256') return false;
  const iterations = parseInt(parts[2], 10);
  const salt = new Uint8Array(parts[3].match(/.{2}/g).map(b => parseInt(b, 16)));
  const storedHash = parts[4];
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const hash = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    keyMaterial, 256
  );
  const hashHex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex === storedHash;
}

async function sendEmail(env, to, subject, html) {
  if (!env.RESEND_API_KEY) {
    console.log('[dev] email not sent:', { to, subject });
    return;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: env.EMAIL_FROM || 'noreply@233002.xyz', to, subject, html }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('[email] send failed:', err);
    throw new Error('邮件发送失败');
  }
}

// ─── Database migration ───────────────────────────────────────────────────────

async function migrateDatabase(env) {
  try {
    await env.DB.prepare(`ALTER TABLE anime_users ADD COLUMN password_hash TEXT`).run();
  } catch (e) {
    // column already exists - ignore
  }
  try {
    await env.DB.prepare(`ALTER TABLE anime_users ADD COLUMN display_name TEXT`).run();
  } catch (e) {}
  try {
      await env.DB.prepare(`ALTER TABLE anime_users ADD COLUMN avatar_url TEXT`).run();
    } catch (e) {}
    try {
      await env.DB.prepare(`ALTER TABLE anime_users ADD COLUMN website TEXT`).run();
    } catch (e) {}
    try {
      await env.DB.prepare(`ALTER TABLE anime_users ADD COLUMN created_at TEXT`).run();
  } catch (e) {}
  try {
    await env.DB.prepare(`ALTER TABLE anime_users ADD COLUMN updated_at TEXT`).run();
  } catch (e) {}
}

async function ensureTables(env) {
  // Core auth tables
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS anime_users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    display_name TEXT,
    avatar_url TEXT,
    website TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    last_login TEXT
  )`).run();

  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS anime_user_auth_methods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    auth_type TEXT NOT NULL,
    auth_id TEXT NOT NULL,
    linked_at TEXT DEFAULT (datetime('now')),
    UNIQUE(auth_type, auth_id)
  )`).run();
  await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_aum_email ON anime_user_auth_methods(email)`).run();

  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS anime_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    email TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL
  )`).run();
  await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_as_token ON anime_sessions(token)`).run();
  await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_as_user ON anime_sessions(user_id)`).run();

  // Verification / password reset codes
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS anime_password_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'register',
    used INTEGER DEFAULT 0,
    expires_at TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  )`).run();
  await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_apc_email ON anime_password_codes(email, code)`).run();

  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS anime_verify_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  )`).run();
  await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_avc_email ON anime_verify_codes(email)`).run();

  // Anime-specific tables
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS anime_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    anime_id TEXT NOT NULL,
    watched_at TEXT DEFAULT (datetime('now'))
  )`).run();
  await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_ah_email ON anime_history(email)`).run();

  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS anime_danmaku (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    anime_id TEXT NOT NULL,
    content TEXT NOT NULL,
    color TEXT DEFAULT '#ffffff',
    size TEXT DEFAULT 'normal',
    created_at TEXT DEFAULT (datetime('now'))
  )`).run();
  await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_ad_anime ON anime_danmaku(anime_id)`).run();
  await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_ad_email ON anime_danmaku(email)`).run();
}

// ─── Existing auth helpers ────────────────────────────────────────────────────

var ADJECTIVES = ["快乐的", "勇敢的", "聪明的", "温柔的", "酷酷的", "可爱的", "神秘的", "闪耀的", "安静的", "热情的", "优雅的", "调皮的", "幸运的", "自由的", "梦幻的", "星空的", "月光的", "阳光的", "微风的", "彩虹的"];
var NOUNS = ["小猫", "小狗", "兔子", "狐狸", "熊猫", "海豚", "天鹅", "蝴蝶", "松鼠", "企鹅", "白鸽", "鲸鱼", "猎鹰", "鹿", "狮子", "老虎", "龙", "凤凰", "独角兽", "精灵"];

function generateRandomName() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 1000);
  return adj + noun + (num < 100 ? String(num) : "");
}

async function getAuthEmail(env, request) {
  const auth = request.headers.get("Authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  const session = await env.DB.prepare(
    "SELECT email FROM anime_sessions WHERE token = ?1 AND expires_at > datetime('now')"
  ).bind(token).first();
  return session ? session.email : null;
}

async function upsertUser(env, email, authType, authId, displayName, avatarUrl) {
  const existing = await env.DB.prepare("SELECT email FROM anime_users WHERE email = ?").bind(email).first();
  if (existing) {
    await env.DB.prepare(
      "UPDATE anime_users SET last_login = datetime('now'), auth_type = ?1, auth_id = ?2, display_name = COALESCE(NULLIF(?3,''), display_name), avatar_url = COALESCE(NULLIF(?4,''), avatar_url), updated_at = datetime('now') WHERE email = ?5"
    ).bind(authType, authId, displayName || "", avatarUrl || "", email).run();
  } else {
    const name = displayName || generateRandomName();
    await env.DB.prepare(
      "INSERT INTO anime_users (email, auth_type, auth_id, display_name, avatar_url, created_at, last_login, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, datetime('now'), datetime('now'), datetime('now'))"
    ).bind(email, authType, authId, name, avatarUrl || "").run();
  }
  await env.DB.prepare(
    "INSERT OR IGNORE INTO anime_user_auth_methods (email, auth_type, auth_id) VALUES (?1, ?2, ?3)"
  ).bind(email, authType, authId).run();
}

async function createSession(env, email) {
  const token = generateToken();
  await env.DB.prepare(
    "INSERT INTO anime_sessions (token, email, created_at, expires_at) VALUES (?1, ?2, datetime('now'), datetime('now', '+30 days'))"
  ).bind(token, email).run();
  return token;
}

// ─── New auth handlers ────────────────────────────────────────────────────────

async function handleRegister(env, request) {
  const { email, type } = await request.json();
  if (!email || email.indexOf('@') < 0) return badRequest('请输入有效邮箱');
  const normalized = email.toLowerCase().trim();

  const existing = await env.DB.prepare("SELECT email FROM anime_users WHERE email = ?").bind(normalized).first();
  if (existing) return badRequest('该邮箱已注册，请直接登录');

  const recent = await env.DB.prepare(
    "SELECT created_at FROM anime_password_codes WHERE email = ?1 AND type = 'register' AND created_at > datetime('now', '-60 seconds')"
  ).bind(normalized).first();
  if (recent) return badRequest('请等待60秒后再试');

  const code = generateCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  await env.DB.prepare(
    `UPDATE anime_password_codes SET used = 1 WHERE email = ? AND type = 'register' AND used = 0`
  ).bind(normalized).run();
  await env.DB.prepare(
    "INSERT INTO anime_password_codes (email, code, type, expires_at) VALUES (?1, ?2, 'register', ?3)"
  ).bind(normalized, code, expiresAt).run();

  const htmlContent = `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
    <h2 style="color:#ffd93d">Mercury Blog</h2>
    <p>您的注册验证码为：</p>
    <div style="font-size:32px;letter-spacing:8px;font-weight:700;color:#ffd93d;background:#1a1a2e;padding:16px;text-align:center;border-radius:8px;margin:16px 0">${code}</div>
    <p style="color:#888">验证码有效期为10分钟，请勿泄露给他人。</p>
  </div>`;

  try {
    await sendEmail(env, normalized, '注册 Mercury Blog', htmlContent);
  } catch (e) {
    return badRequest('邮件发送失败，请稍后重试');
  }
  return jsonResponse({ success: true, dev_code: env.DEV_MODE === "true" ? code : undefined });
}

async function handleRegisterVerify(env, request) {
  const { email, code, password } = await request.json();
  if (!email || !code || !password) return badRequest('请填写完整信息');
  if (password.length < 6) return badRequest('密码至少6位');
  const normalized = email.toLowerCase().trim();

  const existing = await env.DB.prepare("SELECT email FROM anime_users WHERE email = ?").bind(normalized).first();
  if (existing) return badRequest('该邮箱已注册');

  const vc = await env.DB.prepare(
    `SELECT id, code FROM anime_password_codes WHERE email = ? AND type = 'register' AND used = 0 AND expires_at > datetime('now') ORDER BY created_at DESC LIMIT 1`
  ).bind(normalized).first();
  if (!vc) return badRequest('验证码已过期，请重新获取');
  if (vc.code !== code) return badRequest('验证码错误');

  await env.DB.prepare(`UPDATE anime_password_codes SET used = 1 WHERE id = ?`).bind(vc.id).run();

  const passwordHash = await hashPassword(password);
  const name = generateRandomName();
  await env.DB.prepare(
    "INSERT INTO anime_users (email, auth_type, password_hash, display_name, created_at, last_login, updated_at) VALUES (?1, 'email', ?2, ?3, datetime('now'), datetime('now'), datetime('now'))"
  ).bind(normalized, passwordHash, name).run();

  const sessionToken = await createSession(env, normalized);
  const user = await env.DB.prepare("SELECT email, display_name, avatar_url, created_at FROM anime_users WHERE email = ?").bind(normalized).first();
  return jsonResponse({ token: sessionToken, user });
}

async function handleLogin(env, request) {
  const { email, password } = await request.json();
  if (!email || !password) return badRequest('请输入邮箱和密码');
  const normalized = email.toLowerCase().trim();

  const user = await env.DB.prepare("SELECT * FROM anime_users WHERE email = ?").bind(normalized).first();
  if (!user) return badRequest('邮箱未注册');

  if (!user.password_hash) {
    return jsonResponse({ error: '请使用 OAuth 登录或重置密码', need_reset: true });
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) return badRequest('密码错误');

  await env.DB.prepare("UPDATE anime_users SET last_login = datetime('now') WHERE email = ?").bind(normalized).run();
  const sessionToken = await createSession(env, normalized);
  return jsonResponse({
    token: sessionToken,
    user: { email: user.email, display_name: user.display_name, avatar_url: user.avatar_url, created_at: user.created_at },
  });
}

async function handleChangePassword(env, request) {
  const email = await getAuthEmail(env, request);
  if (!email) return unauthorized();

  const { old_password, new_password } = await request.json();
  if (!new_password) return badRequest('请填写新密码');
  if (new_password.length < 6) return badRequest('密码至少6位');

  const user = await env.DB.prepare("SELECT password_hash FROM anime_users WHERE email = ?").bind(email).first();

  if (user && user.password_hash) {
    if (!old_password) return badRequest('请填写当前密码');
    const valid = await verifyPassword(old_password, user.password_hash);
    if (!valid) return badRequest('当前密码错误');
  }

  const newHash = await hashPassword(new_password);
  await env.DB.prepare("UPDATE anime_users SET password_hash = ?, updated_at = datetime('now') WHERE email = ?").bind(newHash, email).run();
  return jsonResponse({ success: true, message: '密码设置成功' });
}

async function handlePasswordReset(env, request) {
  const { email, type } = await request.json();
  if (!email || email.indexOf('@') < 0) return badRequest('请输入有效邮箱');
  const normalized = email.toLowerCase().trim();

  const existing = await env.DB.prepare("SELECT email FROM anime_users WHERE email = ?").bind(normalized).first();
  if (!existing) return badRequest('该邮箱未注册');

  const recent = await env.DB.prepare(
    "SELECT created_at FROM anime_password_codes WHERE email = ?1 AND type = 'reset' AND created_at > datetime('now', '-60 seconds')"
  ).bind(normalized).first();
  if (recent) return badRequest('请等待60秒后再试');

  const code = generateCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  await env.DB.prepare(
    `UPDATE anime_password_codes SET used = 1 WHERE email = ? AND type = 'reset' AND used = 0`
  ).bind(normalized).run();
  await env.DB.prepare(
    "INSERT INTO anime_password_codes (email, code, type, expires_at) VALUES (?1, ?2, 'reset', ?3)"
  ).bind(normalized, code, expiresAt).run();

  const htmlContent = `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
    <h2 style="color:#ffd93d">Mercury Blog</h2>
    <p>您的重置密码验证码为：</p>
    <div style="font-size:32px;letter-spacing:8px;font-weight:700;color:#ffd93d;background:#1a1a2e;padding:16px;text-align:center;border-radius:8px;margin:16px 0">${code}</div>
    <p style="color:#888">验证码有效期为10分钟，请勿泄露给他人。</p>
  </div>`;

  try {
    await sendEmail(env, normalized, '重置密码 - Mercury Blog', htmlContent);
  } catch (e) {
    return badRequest('邮件发送失败，请稍后重试');
  }
  return jsonResponse({ success: true, dev_code: env.DEV_MODE === "true" ? code : undefined });
}

async function handlePasswordResetVerify(env, request) {
  const { email, code, password } = await request.json();
  if (!email || !code || !password) return badRequest('请填写完整信息');
  if (password.length < 6) return badRequest('密码至少6位');
  const normalized = email.toLowerCase().trim();

  const user = await env.DB.prepare("SELECT email FROM anime_users WHERE email = ?").bind(normalized).first();
  if (!user) return badRequest('该邮箱未注册');

  const vc = await env.DB.prepare(
    `SELECT id, code FROM anime_password_codes WHERE email = ? AND type = 'reset' AND used = 0 AND expires_at > datetime('now') ORDER BY created_at DESC LIMIT 1`
  ).bind(normalized).first();
  if (!vc) return badRequest('验证码已过期，请重新获取');
  if (vc.code !== code) return badRequest('验证码错误');

  await env.DB.prepare(`UPDATE anime_password_codes SET used = 1 WHERE id = ?`).bind(vc.id).run();

  const newHash = await hashPassword(password);
  await env.DB.prepare("UPDATE anime_users SET password_hash = ?, updated_at = datetime('now') WHERE email = ?").bind(newHash, normalized).run();

  const sessionToken = await createSession(env, normalized);
  const userData = await env.DB.prepare("SELECT email, display_name, avatar_url, created_at FROM anime_users WHERE email = ?").bind(normalized).first();
  return jsonResponse({ token: sessionToken, user: userData });
}

// ─── Existing auth handlers (modified) ────────────────────────────────────────

async function handleSendCode(env, request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON");
  }
  const { email } = body;
  if (!email || !email.includes("@")) return badRequest("Valid email required");
  const normalizedEmail = email.toLowerCase().trim();
  const recent = await env.DB.prepare(
    "SELECT created_at FROM anime_verify_codes WHERE email = ?1 AND created_at > datetime('now', '-60 seconds')"
  ).bind(normalizedEmail).first();
  if (recent) return badRequest("请等待60秒后再试");
  const code = generateCode();
  await env.DB.prepare(
    "INSERT OR REPLACE INTO anime_verify_codes (email, code, created_at) VALUES (?1, ?2, datetime('now'))"
  ).bind(normalizedEmail, code).run();
  if (env.DEV_MODE !== "true") {
    try {
      const sendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: env.EMAIL_FROM || "noreply@233002.xyz",
          to: normalizedEmail,
          subject: "登录验证码 - Mercury 博客",
          html: `<div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:20px"><h2 style="color:#ffd93d">Mercury 博客</h2><p>你的登录验证码是：</p><div style="font-size:32px;font-weight:bold;letter-spacing:8px;padding:16px;background:#1a1a2e;border-radius:8px;text-align:center;color:#ffd93d">${code}</div><p style="color:#888;font-size:13px">验证码 5 分钟内有效，请勿泄露给他人。</p></div>`
        })
      });
      if (!sendRes.ok) {
        const errText = await sendRes.text();
        return jsonResponse({ error: "邮件发送失败，请稍后重试" }, 500);
      }
    } catch {
      return jsonResponse({ error: "邮件发送失败，请稍后重试" }, 500);
    }
  }
  return jsonResponse({ success: true, ...env.DEV_MODE === "true" ? { dev_code: code } : {} });
}

async function handleVerifyCode(env, request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON");
  }
  const { email, code } = body;
  if (!email || !code) return badRequest("Email and code required");
  const normalizedEmail = email.toLowerCase().trim();
  const record = await env.DB.prepare(
    "SELECT code, created_at FROM anime_verify_codes WHERE email = ?"
  ).bind(normalizedEmail).first();
  if (!record) return badRequest("请先获取验证码");
  if (record.code !== code) return badRequest("验证码错误");
  const codeTime = (new Date(record.created_at + "Z")).getTime();
  if (Date.now() - codeTime > 5 * 60 * 1000) return badRequest("验证码已过期，请重新获取");
  await env.DB.prepare("DELETE FROM anime_verify_codes WHERE email = ?").bind(normalizedEmail).run();
  await upsertUser(env, normalizedEmail, "email", `email:${normalizedEmail}`, "", "");
  const sessionToken = await createSession(env, normalizedEmail);
  const user = await env.DB.prepare("SELECT email, display_name, avatar_url FROM anime_users WHERE email = ?").bind(normalizedEmail).first();
  return jsonResponse({ token: sessionToken, user });
}

async function handleAuthMe(env, request) {
  const email = await getAuthEmail(env, request);
  if (!email) return unauthorized();
  const user = await env.DB.prepare(
    "SELECT email, display_name, avatar_url, website, created_at, last_login FROM anime_users WHERE email = ?"
  ).bind(email).first();
  if (!user) return unauthorized("User not found");
  const { results: linked } = await env.DB.prepare(
    "SELECT auth_type, auth_id, linked_at FROM anime_user_auth_methods WHERE email = ?"
  ).bind(email).all();
  const hasPassword = await env.DB.prepare("SELECT password_hash FROM anime_users WHERE email = ?").bind(email).first();
  return jsonResponse({ user, linked: linked || [], has_password: !!hasPassword?.password_hash });
}

async function handleAuthLogout(env, request) {
  const auth = request.headers.get("Authorization");
  if (auth && auth.startsWith("Bearer ")) {
    await env.DB.prepare("DELETE FROM anime_sessions WHERE token = ?").bind(auth.slice(7)).run();
  }
  return jsonResponse({ success: true });
}

async function handleProfile(env, request) {
  const email = await getAuthEmail(env, request);
  if (!email) return unauthorized();
  if (request.method === "GET") {
      const user = await env.DB.prepare(
        "SELECT email, display_name, avatar_url, website, created_at, last_login FROM anime_users WHERE email = ?"
      ).bind(email).first();
    if (!user) return unauthorized("User not found");
    const hc = await env.DB.prepare("SELECT COUNT(*) as cnt FROM anime_history WHERE email = ?").bind(email).first();
    const dc = await env.DB.prepare("SELECT COUNT(*) as cnt FROM anime_danmaku WHERE email = ?").bind(email).first();
    return jsonResponse({ user, stats: { history: hc?.cnt || 0, danmaku: dc?.cnt || 0 } });
  }
  if (request.method === "PUT") {
    let body;
    try {
      body = await request.json();
    } catch {
      return badRequest("Invalid JSON");
    }
    const { display_name, avatar_url, website } = body;
        if (display_name !== void 0) {
          await env.DB.prepare("UPDATE anime_users SET display_name = ?1, updated_at = datetime('now') WHERE email = ?2").bind(display_name.trim() || "", email).run();
        }
        if (avatar_url !== void 0) {
          await env.DB.prepare("UPDATE anime_users SET avatar_url = ?1, updated_at = datetime('now') WHERE email = ?2").bind(avatar_url, email).run();
        }
        if (website !== void 0) {
          await env.DB.prepare("UPDATE anime_users SET website = ?1, updated_at = datetime('now') WHERE email = ?2").bind(website.trim() || "", email).run();
        }
        const user = await env.DB.prepare("SELECT email, display_name, avatar_url, website, created_at FROM anime_users WHERE email = ?").bind(email).first();
    return jsonResponse({ success: true, user });
  }
  return badRequest("Method not allowed");
}

async function handleUnlinkAccount(env, request) {
  const email = await getAuthEmail(env, request);
  if (!email) return unauthorized();
  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON");
  }
  const { type } = body;
  if (!type || !["github", "google"].includes(type)) return badRequest("Invalid auth type");
  const { results: methods } = await env.DB.prepare(
    "SELECT auth_type FROM anime_user_auth_methods WHERE email = ?"
  ).bind(email).all();
  const hasPassword = await env.DB.prepare("SELECT password_hash FROM anime_users WHERE email = ?").bind(email).first();
  const totalMethods = (methods?.length || 0) + (hasPassword?.password_hash ? 1 : 0);
  if (totalMethods < 2) return badRequest("至少需要保留一种登录方式");
  await env.DB.prepare(
    "DELETE FROM anime_user_auth_methods WHERE email = ?1 AND auth_type = ?2"
  ).bind(email, type).run();
  const user = await env.DB.prepare("SELECT auth_type FROM anime_users WHERE email = ?").bind(email).first();
  if (user && user.auth_type === type) {
    const remaining = methods.filter((m) => m.auth_type !== type);
    if (remaining.length > 0) {
      await env.DB.prepare("UPDATE anime_users SET auth_type = ?1 WHERE email = ?2").bind(remaining[0].auth_type, email).run();
    }
  }
  return jsonResponse({ success: true });
}

async function handleDeleteAccount(env, request) {
  const email = await getAuthEmail(env, request);
  if (!email) return unauthorized();

  const { password } = await request.json();
  const user = await env.DB.prepare("SELECT password_hash FROM anime_users WHERE email = ?").bind(email).first();
  if (user?.password_hash) {
    if (!password) return badRequest('需要输入密码确认注销');
    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) return badRequest('密码错误');
  }

  await env.DB.prepare("DELETE FROM anime_user_auth_methods WHERE email = ?").bind(email).run();
  await env.DB.prepare("DELETE FROM anime_sessions WHERE email = ?").bind(email).run();
  await env.DB.prepare("DELETE FROM anime_history WHERE email = ?").bind(email).run();
  await env.DB.prepare("DELETE FROM anime_danmaku WHERE email = ?").bind(email).run();
  await env.DB.prepare("DELETE FROM anime_users WHERE email = ?").bind(email).run();
  return jsonResponse({ success: true });
}

// ─── Existing OAuth handlers ──────────────────────────────────────────────────

async function handleGithubLogin(env, url) {
  const linkToken = url.searchParams.get("link_token") || "";
  const state = generateToken().slice(0, 16);
  const stateData = linkToken ? `${state}:${linkToken}` : state;
  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    redirect_uri: `${env.WORKER_URL}/api/auth/github/callback`,
    scope: "read:user user:email",
    state: stateData
  });
  return redirect(`https://github.com/login/oauth/authorize?${params}`);
}

async function handleGithubCallback(env, url) {
  const code = url.searchParams.get("code");
  if (!code) return badRequest("Missing code");
  const stateRaw = url.searchParams.get("state") || "";
  const stateParts = stateRaw.split(":");
  const linkToken = stateParts.length > 1 ? stateParts.slice(1).join(":") : "";
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({ client_id: env.GITHUB_CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET, code })
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) return badRequest("GitHub auth failed");
  const [userRes, emailRes] = await Promise.all([
    fetch("https://api.github.com/user", { headers: { Authorization: `Bearer ${tokenData.access_token}`, "User-Agent": "ffzy-proxy" } }),
    fetch("https://api.github.com/user/emails", { headers: { Authorization: `Bearer ${tokenData.access_token}`, "User-Agent": "ffzy-proxy" } })
  ]);
  const ghUser = await userRes.json();
  const emails = await emailRes.json();
  const primaryEmail = (emails.find((e) => e.primary && e.verified) || emails.find((e) => e.verified) || {}).email || `github_${ghUser.id}@users.233002.xyz`;
  const authId = `github:${ghUser.id}`;
  if (linkToken) {
    const linkSession = await env.DB.prepare("SELECT email FROM anime_sessions WHERE token = ?1 AND expires_at > datetime('now')").bind(linkToken).first();
    if (linkSession) {
      const existingEmail = linkSession.email;
      const existingLink = await env.DB.prepare("SELECT email FROM anime_user_auth_methods WHERE auth_type = 'github' AND auth_id = ?").bind(authId).first();
      if (existingLink && existingLink.email !== existingEmail) {
        return redirect(`${env.SITE_URL || "https://www.233002.xyz"}/user/?error=github_already_linked`);
      }
      await env.DB.prepare("INSERT OR IGNORE INTO anime_user_auth_methods (email, auth_type, auth_id) VALUES (?1, 'github', ?2)").bind(existingEmail, authId).run();
      await env.DB.prepare("UPDATE anime_users SET avatar_url = COALESCE(NULLIF(avatar_url,''), ?1), updated_at = datetime('now') WHERE email = ?2 AND avatar_url = ''").bind(ghUser.avatar_url || "", existingEmail).run();
      const sessionToken2 = await createSession(env, existingEmail);
      const user2 = await env.DB.prepare("SELECT email, display_name, avatar_url FROM anime_users WHERE email = ?").bind(existingEmail).first();
      const encoded2 = encodeURIComponent(JSON.stringify({ token: sessionToken2, user: user2 }));
      return redirect(`${env.SITE_URL || "https://www.233002.xyz"}/user/?auth=${encoded2}`);
    }
  }
  // Before upsert: check if this GitHub account is already linked to an existing user
  const existingGithubLink = await env.DB.prepare("SELECT email FROM anime_user_auth_methods WHERE auth_type = 'github' AND auth_id = ?").bind(authId).first();
  if (existingGithubLink) {
    await env.DB.prepare("UPDATE anime_users SET last_login = datetime('now'), avatar_url = COALESCE(NULLIF(?1,''), avatar_url), display_name = COALESCE(NULLIF(?2,''), display_name), updated_at = datetime('now') WHERE email = ?3").bind(ghUser.avatar_url || "", ghUser.login || "", existingGithubLink.email).run();
    const sessionToken3 = await createSession(env, existingGithubLink.email);
    const user3 = await env.DB.prepare("SELECT email, display_name, avatar_url FROM anime_users WHERE email = ?").bind(existingGithubLink.email).first();
    const encoded3 = encodeURIComponent(JSON.stringify({ token: sessionToken3, user: user3 }));
    return redirect(`${env.SITE_URL || "https://www.233002.xyz"}/?auth=${encoded3}`);
  }
  await upsertUser(env, primaryEmail, "github", authId, ghUser.login || "", ghUser.avatar_url || "");
  const sessionToken = await createSession(env, primaryEmail);
  const user = await env.DB.prepare("SELECT email, display_name, avatar_url FROM anime_users WHERE email = ?").bind(primaryEmail).first();
  const encoded = encodeURIComponent(JSON.stringify({ token: sessionToken, user }));
  return redirect(`${env.SITE_URL || "https://www.233002.xyz"}/?auth=${encoded}`);
}

async function handleGoogleLogin(env, url) {
  const linkToken = url.searchParams.get("link_token") || "";
  const state = generateToken().slice(0, 16);
  const stateData = linkToken ? `${state}:${linkToken}` : state;
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: `${env.WORKER_URL}/api/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    state: stateData
  });
  return redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}

async function handleGoogleCallback(env, url) {
  const code = url.searchParams.get("code");
  if (!code) return badRequest("Missing code");
  const stateRaw = url.searchParams.get("state") || "";
  const stateParts = stateRaw.split(":");
  const linkToken = stateParts.length > 1 ? stateParts.slice(1).join(":") : "";
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${env.WORKER_URL}/api/auth/google/callback`,
      grant_type: "authorization_code"
    })
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) return badRequest("Google auth failed");
  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` }
  });
  const gUser = await userRes.json();
  if (!gUser.email) return badRequest("Google email not available");
  const authId = `google:${gUser.id}`;
  if (linkToken) {
    const linkSession = await env.DB.prepare("SELECT email FROM anime_sessions WHERE token = ?1 AND expires_at > datetime('now')").bind(linkToken).first();
    if (linkSession) {
      const existingEmail = linkSession.email;
      const existingLink = await env.DB.prepare("SELECT email FROM anime_user_auth_methods WHERE auth_type = 'google' AND auth_id = ?").bind(authId).first();
      if (existingLink && existingLink.email !== existingEmail) {
        return redirect(`${env.SITE_URL || "https://www.233002.xyz"}/user/?error=google_already_linked`);
      }
      await env.DB.prepare("INSERT OR IGNORE INTO anime_user_auth_methods (email, auth_type, auth_id) VALUES (?1, 'google', ?2)").bind(existingEmail, authId).run();
      await env.DB.prepare("UPDATE anime_users SET avatar_url = COALESCE(NULLIF(avatar_url,''), ?1), updated_at = datetime('now') WHERE email = ?2 AND avatar_url = ''").bind(gUser.picture || "", existingEmail).run();
      const sessionToken2 = await createSession(env, existingEmail);
      const user2 = await env.DB.prepare("SELECT email, display_name, avatar_url FROM anime_users WHERE email = ?").bind(existingEmail).first();
      const encoded2 = encodeURIComponent(JSON.stringify({ token: sessionToken2, user: user2 }));
      return redirect(`${env.SITE_URL || "https://www.233002.xyz"}/user/?auth=${encoded2}`);
    }
  }
  // Before upsert: check if this Google account is already linked to an existing user
  const existingGoogleLink = await env.DB.prepare("SELECT email FROM anime_user_auth_methods WHERE auth_type = 'google' AND auth_id = ?").bind(authId).first();
  if (existingGoogleLink) {
    // Already linked — log in as that user instead of creating a new one
    await env.DB.prepare("UPDATE anime_users SET last_login = datetime('now'), avatar_url = COALESCE(NULLIF(?1,''), avatar_url), display_name = COALESCE(NULLIF(?2,''), display_name), updated_at = datetime('now') WHERE email = ?3").bind(gUser.picture || "", gUser.name || "", existingGoogleLink.email).run();
    const sessionToken3 = await createSession(env, existingGoogleLink.email);
    const user3 = await env.DB.prepare("SELECT email, display_name, avatar_url FROM anime_users WHERE email = ?").bind(existingGoogleLink.email).first();
    const encoded3 = encodeURIComponent(JSON.stringify({ token: sessionToken3, user: user3 }));
    return redirect(`${env.SITE_URL || "https://www.233002.xyz"}/?auth=${encoded3}`);
  }
  await upsertUser(env, gUser.email, "google", authId, gUser.name || "", gUser.picture || "");
  const sessionToken = await createSession(env, gUser.email);
  const user = await env.DB.prepare("SELECT email, display_name, avatar_url FROM anime_users WHERE email = ?").bind(gUser.email).first();
  const encoded = encodeURIComponent(JSON.stringify({ token: sessionToken, user }));
  return redirect(`${env.SITE_URL || "https://www.233002.xyz"}/?auth=${encoded}`);
}

// ─── Existing video/anime handlers ────────────────────────────────────────────

async function handleHistory(env, request, vodId) {
  const method = request.method;
  const email = await getAuthEmail(env, request);
  if (method === "GET" && vodId === null) {
    if (!email) return jsonResponse({ list: [], logged_in: false });
    const { results } = await env.DB.prepare(
      "SELECT vod_id, vod_name, vod_pic, episode_index, episode_name, position, duration, skip_intro, updated_at FROM anime_history WHERE email = ? ORDER BY updated_at DESC"
    ).bind(email).all();
    return jsonResponse({ list: results, logged_in: true });
  }
  if (method === "POST" && vodId === null) {
    if (!email) return unauthorized("Login required to save history");
    let body;
    try {
      body = await request.json();
    } catch {
      return badRequest("Invalid JSON");
    }
    const { vod_id, vod_name, vod_pic, episode_index, episode_name, position, duration, skip_intro } = body;
    if (vod_id == null || vod_name == null) return badRequest("vod_id and vod_name are required");
    await env.DB.prepare(
      `INSERT INTO anime_history (email, vod_id, vod_name, vod_pic, episode_index, episode_name, position, duration, skip_intro, updated_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, datetime('now'))
       ON CONFLICT(email, vod_id) DO UPDATE SET
         vod_name=excluded.vod_name, vod_pic=excluded.vod_pic, episode_index=excluded.episode_index,
         episode_name=excluded.episode_name, position=excluded.position, duration=excluded.duration,
         skip_intro=excluded.skip_intro, updated_at=datetime('now')`
    ).bind(email, vod_id, vod_name, vod_pic || "", episode_index ?? 0, episode_name || "", position ?? 0, duration ?? 0, skip_intro ?? 0).run();
    return jsonResponse({ success: true });
  }
  if (method === "GET" && vodId !== null) {
    if (!email) return unauthorized("Login required");
    const row = await env.DB.prepare(
      "SELECT * FROM anime_history WHERE email = ?1 AND vod_id = ?2"
    ).bind(email, vodId).first();
    if (!row) return notFound();
    return jsonResponse(row);
  }
  if (method === "DELETE" && vodId !== null) {
    if (!email) return unauthorized("Login required");
    await env.DB.prepare("DELETE FROM anime_history WHERE email = ?1 AND vod_id = ?2").bind(email, vodId).run();
    return jsonResponse({ success: true });
  }
  return badRequest("Method not allowed");
}

async function handleDanmaku(env, request, danmakuId) {
  const method = request.method;
  const url = new URL(request.url);
  if (method === "GET" && danmakuId === null) {
    const vodId = url.searchParams.get("vod_id");
    const episodeIndex = url.searchParams.get("episode_index");
    if (vodId == null || episodeIndex == null) return badRequest("vod_id and episode_index are required");
    const { results } = await env.DB.prepare(
      "SELECT id, vod_id, episode_index, time, content, color, type, email, created_at FROM anime_danmaku WHERE vod_id = ?1 AND episode_index = ?2 ORDER BY time ASC"
    ).bind(vodId, episodeIndex).all();
    const enriched = results.map((d) => ({ ...d, display_name: d.email.split("@")[0] }));
    return jsonResponse({ list: enriched });
  }
  if (method === "POST" && danmakuId === null) {
    const email = await getAuthEmail(env, request);
    if (!email) return unauthorized("Login required to send danmaku");
    let body;
    try {
      body = await request.json();
    } catch {
      return badRequest("Invalid JSON");
    }
    const { vod_id, episode_index, time, content, color, type } = body;
    if (vod_id == null || episode_index == null || time == null || !content) return badRequest("Missing required fields");
    const result = await env.DB.prepare(
      "INSERT INTO anime_danmaku (email, vod_id, episode_index, time, content, color, type) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)"
    ).bind(email, vod_id, episode_index, time, content, color || "#ffffff", type || "scroll").run();
    return jsonResponse({ id: result.meta.last_row_id, success: true });
  }
  if (method === "DELETE" && danmakuId !== null) {
    const email = await getAuthEmail(env, request);
    if (!email) return unauthorized("Login required");
    await env.DB.prepare("DELETE FROM anime_danmaku WHERE id = ?1 AND email = ?2").bind(danmakuId, email).run();
    return jsonResponse({ success: true });
  }
  return badRequest("Method not allowed");
}

async function handleUserDanmaku(env, request) {
  const email = await getAuthEmail(env, request);
  if (!email) return unauthorized();
  const { results } = await env.DB.prepare(
    "SELECT id, vod_id, episode_index, time, content, color, type, created_at FROM anime_danmaku WHERE email = ? ORDER BY created_at DESC LIMIT 100"
  ).bind(email).all();
  return jsonResponse({ list: results });
}

async function handleUserComments(env, request) {
  const email = await getAuthEmail(env, request);
  if (!email) return unauthorized();
  const { results } = await env.DB.prepare(
    "SELECT id, name, email, content_text, post_slug, post_url, created FROM Comment WHERE email = ? ORDER BY created DESC LIMIT 50"
  ).bind(email).all();
  return jsonResponse({ list: results });
}

async function handleAdminUsers(env, request) {
  const adminSecret = request.headers.get("X-Admin-Secret");
  if (!adminSecret || adminSecret !== env.ADMIN_SECRET) return unauthorized("Admin access required");
  if (request.method === "GET") {
    const { results } = await env.DB.prepare(
      `SELECT u.email, u.auth_type, u.display_name, u.avatar_url, u.created_at, u.last_login,
              (SELECT COUNT(*) FROM anime_history h WHERE h.email = u.email) as history_count,
              (SELECT COUNT(*) FROM anime_danmaku d WHERE d.email = u.email) as danmaku_count
       FROM anime_users u ORDER BY u.last_login DESC`
    ).all();
    return jsonResponse({ users: results });
  }
  if (request.method === "DELETE") {
    const email = new URL(request.url).searchParams.get("email");
    if (!email) return badRequest("email required");
    await env.DB.prepare("DELETE FROM anime_users WHERE email = ?").bind(email).run();
    await env.DB.prepare("DELETE FROM anime_sessions WHERE email = ?").bind(email).run();
    await env.DB.prepare("DELETE FROM anime_history WHERE email = ?").bind(email).run();
    await env.DB.prepare("DELETE FROM anime_danmaku WHERE email = ?").bind(email).run();
    return jsonResponse({ success: true });
  }
  return badRequest("Method not allowed");
}

// ─── Router ───────────────────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

    // Run migration on each deploy (first request)
    try { await migrateDatabase(env); await ensureTables(env); } catch (e) { console.error('[migrate]', e); }

    const url = new URL(request.url);
    const path = url.pathname;

    // ── New auth routes ──
    if (path === "/api/auth/login" && request.method === "POST") return handleLogin(env, request);
    if (path === "/api/auth/register" && request.method === "POST") return handleRegister(env, request);
    if (path === "/api/auth/register/verify" && request.method === "POST") return handleRegisterVerify(env, request);
    if (path === "/api/auth/password" && request.method === "PUT") return handleChangePassword(env, request);
    if (path === "/api/auth/password/reset" && request.method === "POST") return handlePasswordReset(env, request);
    if (path === "/api/auth/password/reset/verify" && request.method === "POST") return handlePasswordResetVerify(env, request);

    // ── Existing auth routes ──
    if (path === "/api/auth/github") return handleGithubLogin(env, url);
    if (path === "/api/auth/github/callback") return handleGithubCallback(env, url);
    if (path === "/api/auth/google") return handleGoogleLogin(env, url);
    if (path === "/api/auth/google/callback") return handleGoogleCallback(env, url);
    if (path === "/api/auth/email/send" && request.method === "POST") return handleSendCode(env, request);
    if (path === "/api/auth/email/verify" && request.method === "POST") return handleVerifyCode(env, request);
    if (path === "/api/auth/me" && request.method === "GET") return handleAuthMe(env, request);
    if (path === "/api/auth/logout" && request.method === "POST") return handleAuthLogout(env, request);
    if (path === "/api/auth/profile") return handleProfile(env, request);
    if (path === "/api/auth/unlink" && request.method === "POST") return handleUnlinkAccount(env, request);
    if (path === "/api/auth/account" && request.method === "DELETE") return handleDeleteAccount(env, request);

    // ── Existing video/anime routes ──
    if (path === "/api/user/danmaku" && request.method === "GET") return handleUserDanmaku(env, request);
    if (path === "/api/user/comments" && request.method === "GET") return handleUserComments(env, request);
    if (path === "/api/admin/users") return handleAdminUsers(env, request);

    if (path === "/api/ffzy" || path === "/api/ffzy/" || path === "/api" || path === "/api/") {
      const params = url.searchParams.toString();
      const target = params ? `https://cj.ffzyapi.com/api.php/provide/vod?${params}` : "https://cj.ffzyapi.com/api.php/provide/vod";
      try {
        const resp = await fetch(target, { headers: { "User-Agent": "Mozilla/5.0" }, cf: { cacheTtl: 300, cacheEverything: true } });
        return new Response(await resp.text(), { headers: { ...CORS, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=300" } });
      } catch (e) {
        return jsonResponse({ error: e.message }, 502);
      }
    }

    if (path === "/api/history") return handleHistory(env, request, null);
    const hm = path.match(/^\/api\/history\/(\d+)$/);
    if (hm) return handleHistory(env, request, parseInt(hm[1], 10));
    if (path === "/api/danmaku") return handleDanmaku(env, request, null);
    const dm = path.match(/^\/api\/danmaku\/(\d+)$/);
    if (dm) return handleDanmaku(env, request, parseInt(dm[1], 10));

    // ── M3U8 proxy (SSRF-protected) ──
    if (path === "/m3u8") {
      const target = url.searchParams.get("url");
      if (!target) return badRequest("missing url param");
      let targetUrl;
      try {
        targetUrl = new URL(target);
      } catch {
        return badRequest("invalid url");
      }
      // Only allow https, block private/internal IPs
      if (targetUrl.protocol !== "https:") return badRequest("only https allowed");
      const hostname = targetUrl.hostname.toLowerCase();
      if (/^(localhost|127\.\d+\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|192\.168\.\d+\.\d+|::1|fc00|fe80)/i.test(hostname)) {
        return badRequest("internal hosts not allowed");
      }
      // Block IP literals
      if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) return badRequest("IP addresses not allowed");
      try {
        const origin = targetUrl.origin;
        const browserHeaders = {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "*/*",
          "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
          "Accept-Encoding": "gzip, deflate, br",
          "Referer": origin + "/",
          "Origin": origin,
          "Connection": "keep-alive",
          "Sec-Ch-Ua": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
          "Sec-Ch-Ua-Mobile": "?0",
          "Sec-Ch-Ua-Platform": '"Windows"',
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin"
        };
        const resp = await fetch(target, { headers: browserHeaders, cf: { cacheTtl: 60, cacheEverything: true } });
        let body = await resp.text();
        const ct = resp.headers.get("content-type") || "";
        if (body.includes("#EXTM3U") && !ct.includes("octet-stream")) {
          const base = target.substring(0, target.lastIndexOf("/") + 1);
          body = body.replace(/^(?!#)(.+\.m3u8.*)$/gm, (m) => m.startsWith("http") ? m : `/m3u8?url=${encodeURIComponent(base + m)}`);
          body = body.replace(/^(?!#)(.+\.ts.*)$/gm, (m) => m.startsWith("http") ? m : `/ts?url=${encodeURIComponent(base + m)}`);
          return new Response(body, { headers: { ...CORS, "Content-Type": "application/vnd.apple.mpegurl", "Cache-Control": "public, max-age=10" } });
        }
        return new Response(body, { headers: { ...CORS, "Content-Type": ct || "application/octet-stream" } });
      } catch (e) {
        return jsonResponse({ error: e.message }, 502);
      }
    }

    if (path === "/ts") {
      const target = url.searchParams.get("url");
      if (!target) return badRequest("missing url param");
      let targetUrl;
      try {
        targetUrl = new URL(target);
      } catch {
        return badRequest("invalid url");
      }
      // Only allow https, block private/internal IPs
      if (targetUrl.protocol !== "https:") return badRequest("only https allowed");
      const hostname = targetUrl.hostname.toLowerCase();
      if (/^(localhost|127\.\d+\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|192\.168\.\d+\.\d+|::1|fc00|fe80)/i.test(hostname)) {
        return badRequest("internal hosts not allowed");
      }
      if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) return badRequest("IP addresses not allowed");
      try {
        const origin = targetUrl.origin;
        const browserHeaders = {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "*/*",
          "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
          "Accept-Encoding": "gzip, deflate, br",
          "Referer": origin + "/",
          "Origin": origin,
          "Connection": "keep-alive",
          "Sec-Ch-Ua": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
          "Sec-Ch-Ua-Mobile": "?0",
          "Sec-Ch-Ua-Platform": '"Windows"',
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin"
        };
        const resp = await fetch(target, { headers: browserHeaders, cf: { cacheTtl: 3600, cacheEverything: true } });
        return new Response(resp.body, { headers: { ...CORS, "Content-Type": "video/mp2t", "Cache-Control": "public, max-age=86400" } });
      } catch (e) {
        return jsonResponse({ error: e.message }, 502);
      }
    }

    return notFound();
  }
};
