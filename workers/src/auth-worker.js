// ─── Auth Worker - pure auth, no video proxy ─────────────────────────────────

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

function badRequest(msg) { return jsonResponse({ error: msg }, 400); }
function unauthorized(msg = "Unauthorized") { return jsonResponse({ error: msg }, 401); }
function redirect(url) { return Response.redirect(url, 302); }

function generateToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
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
  const from = env.EMAIL_FROM || 'noreply@233002.xyz';
  // SendGrid (via HTTP API, good China deliverability)
  if (env.SENDGRID_API_KEY) {
    const r = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + env.SENDGRID_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: from },
        subject: subject,
        content: [{ type: 'text/html', value: html }],
      }),
    });
    if (!r.ok) {
      const err = await r.text();
      console.error('[email] sendgrid error:', err.slice(0, 500));
      throw new Error('邮件发送失败');
    }
    return;
  }
  console.log('[dev] email not sent (no SENDGRID_API_KEY):', { to, subject });
}

// ─── Migration ───────────────────────────────────────────────────────────────

async function migrate(env) {
  for (const col of ['password_hash', 'display_name', 'avatar_url', 'website', 'created_at', 'updated_at']) {
    try { await env.DB.prepare(`ALTER TABLE anime_users ADD COLUMN ${col} TEXT`).run(); } catch (e) {}
  }
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS anime_password_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL, code TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'register', used INTEGER DEFAULT 0,
    expires_at TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now'))
  )`).run();
  await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_apc_email ON anime_password_codes(email, code)`).run();
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

var ADJECTIVES = ["快乐的","勇敢的","聪明的","温柔的","酷酷的","可爱的","神秘的","闪耀的","安静的","热情的","优雅的","调皮的","幸运的","自由的","梦幻的","星空的","月光的","阳光的","微风的","彩虹的"];
var NOUNS = ["小猫","小狗","兔子","狐狸","熊猫","海豚","天鹅","蝴蝶","松鼠","企鹅","白鸽","鲸鱼","猎鹰","鹿","狮子","老虎","龙","凤凰","独角兽","精灵"];

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

// ─── New auth handlers ───────────────────────────────────────────────────────

async function handleRegister(env, request) {
  const { email } = await request.json();
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
  await env.DB.prepare(`UPDATE anime_password_codes SET used = 1 WHERE email = ? AND type = 'register' AND used = 0`).bind(normalized).run();
  await env.DB.prepare("INSERT INTO anime_password_codes (email, code, type, expires_at) VALUES (?1, ?2, 'register', ?3)").bind(normalized, code, expiresAt).run();
  const html = `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px"><h2 style="color:#ffd93d">Mercury Blog</h2><p>您的注册验证码为：</p><div style="font-size:32px;letter-spacing:8px;font-weight:700;color:#ffd93d;background:#1a1a2e;padding:16px;text-align:center;border-radius:8px;margin:16px 0">${code}</div><p style="color:#888">验证码有效期为10分钟，请勿泄露给他人。</p></div>`;
  try { await sendEmail(env, normalized, '注册 Mercury Blog', html); } catch (e) { return badRequest('邮件发送失败，请稍后重试'); }
  return jsonResponse({ success: true, dev_code: env.DEV_MODE === "true" ? code : undefined });
}

async function handleRegisterVerify(env, request) {
  const { email, code, password } = await request.json();
  if (!email || !code || !password) return badRequest('请填写完整信息');
  if (password.length < 6) return badRequest('密码至少6位');
  const normalized = email.toLowerCase().trim();
  const existing = await env.DB.prepare("SELECT email FROM anime_users WHERE email = ?").bind(normalized).first();
  if (existing) return badRequest('该邮箱已注册');
  const vc = await env.DB.prepare(`SELECT id, code FROM anime_password_codes WHERE email = ? AND type = 'register' AND used = 0 AND expires_at > datetime('now') ORDER BY created_at DESC LIMIT 1`).bind(normalized).first();
  if (!vc) return badRequest('验证码已过期，请重新获取');
  if (vc.code !== code) return badRequest('验证码错误');
  await env.DB.prepare(`UPDATE anime_password_codes SET used = 1 WHERE id = ?`).bind(vc.id).run();
  const pwHash = await hashPassword(password);
  await env.DB.prepare("INSERT INTO anime_users (email, auth_type, password_hash, display_name, created_at, last_login, updated_at) VALUES (?1, 'email', ?2, ?3, datetime('now'), datetime('now'), datetime('now'))").bind(normalized, pwHash, generateRandomName()).run();
  const st = await createSession(env, normalized);
  const u = await env.DB.prepare("SELECT email, display_name, avatar_url, created_at FROM anime_users WHERE email = ?").bind(normalized).first();
  return jsonResponse({ token: st, user: u });
}

async function handleLogin(env, request) {
  const { email, password } = await request.json();
  if (!email || !password) return badRequest('请输入邮箱和密码');
  const normalized = email.toLowerCase().trim();
  const user = await env.DB.prepare("SELECT * FROM anime_users WHERE email = ?").bind(normalized).first();
  if (!user) return badRequest('邮箱未注册');
  if (!user.password_hash) return jsonResponse({ error: '请使用 OAuth 登录或重置密码', need_reset: true });
  if (!await verifyPassword(password, user.password_hash)) return badRequest('密码错误');
  await env.DB.prepare("UPDATE anime_users SET last_login = datetime('now') WHERE email = ?").bind(normalized).run();
  const st = await createSession(env, normalized);
  return jsonResponse({ token: st, user: { email: user.email, display_name: user.display_name, avatar_url: user.avatar_url, created_at: user.created_at } });
}

async function handleChangePassword(env, request) {
  const email = await getAuthEmail(env, request);
  if (!email) return unauthorized();
  const { old_password, new_password } = await request.json();
  if (!new_password) return badRequest('请填写新密码');
  if (new_password.length < 6) return badRequest('密码至少6位');
  const user = await env.DB.prepare("SELECT password_hash FROM anime_users WHERE email = ?").bind(email).first();
  if (user?.password_hash) {
    if (!old_password) return badRequest('请填写当前密码');
    if (!await verifyPassword(old_password, user.password_hash)) return badRequest('当前密码错误');
  }
  await env.DB.prepare("UPDATE anime_users SET password_hash = ?, updated_at = datetime('now') WHERE email = ?").bind(await hashPassword(new_password), email).run();
  return jsonResponse({ success: true, message: '密码设置成功' });
}

async function handlePasswordReset(env, request) {
  const { email } = await request.json();
  if (!email || email.indexOf('@') < 0) return badRequest('请输入有效邮箱');
  const normalized = email.toLowerCase().trim();
  if (!await env.DB.prepare("SELECT email FROM anime_users WHERE email = ?").bind(normalized).first()) return badRequest('该邮箱未注册');
  const recent = await env.DB.prepare("SELECT created_at FROM anime_password_codes WHERE email = ?1 AND type = 'reset' AND created_at > datetime('now', '-60 seconds')").bind(normalized).first();
  if (recent) return badRequest('请等待60秒后再试');
  const code = generateCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  await env.DB.prepare(`UPDATE anime_password_codes SET used = 1 WHERE email = ? AND type = 'reset' AND used = 0`).bind(normalized).run();
  await env.DB.prepare("INSERT INTO anime_password_codes (email, code, type, expires_at) VALUES (?1, ?2, 'reset', ?3)").bind(normalized, code, expiresAt).run();
  const html = `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px"><h2 style="color:#ffd93d">Mercury Blog</h2><p>您的重置密码验证码为：</p><div style="font-size:32px;letter-spacing:8px;font-weight:700;color:#ffd93d;background:#1a1a2e;padding:16px;text-align:center;border-radius:8px;margin:16px 0">${code}</div><p style="color:#888">验证码有效期为10分钟，请勿泄露给他人。</p></div>`;
  try { await sendEmail(env, normalized, '重置密码 - Mercury Blog', html); } catch (e) { return badRequest('邮件发送失败，请稍后重试'); }
  return jsonResponse({ success: true, dev_code: env.DEV_MODE === "true" ? code : undefined });
}

async function handlePasswordResetVerify(env, request) {
  const { email, code, password } = await request.json();
  if (!email || !code || !password) return badRequest('请填写完整信息');
  if (password.length < 6) return badRequest('密码至少6位');
  const normalized = email.toLowerCase().trim();
  if (!await env.DB.prepare("SELECT email FROM anime_users WHERE email = ?").bind(normalized).first()) return badRequest('该邮箱未注册');
  const vc = await env.DB.prepare(`SELECT id, code FROM anime_password_codes WHERE email = ? AND type = 'reset' AND used = 0 AND expires_at > datetime('now') ORDER BY created_at DESC LIMIT 1`).bind(normalized).first();
  if (!vc) return badRequest('验证码已过期，请重新获取');
  if (vc.code !== code) return badRequest('验证码错误');
  await env.DB.prepare(`UPDATE anime_password_codes SET used = 1 WHERE id = ?`).bind(vc.id).run();
  await env.DB.prepare("UPDATE anime_users SET password_hash = ?, updated_at = datetime('now') WHERE email = ?").bind(await hashPassword(password), normalized).run();
  const st = await createSession(env, normalized);
  const u = await env.DB.prepare("SELECT email, display_name, avatar_url, created_at FROM anime_users WHERE email = ?").bind(normalized).first();
  return jsonResponse({ token: st, user: u });
}

// ─── Existing auth handlers ──────────────────────────────────────────────────

async function handleSendCode(env, request) {
  let body; try { body = await request.json(); } catch { return badRequest("Invalid JSON"); }
  const { email } = body;
  if (!email || !email.includes("@")) return badRequest("Valid email required");
  const ne = email.toLowerCase().trim();
  if (await env.DB.prepare("SELECT created_at FROM anime_verify_codes WHERE email = ?1 AND created_at > datetime('now', '-60 seconds')").bind(ne).first()) return badRequest("请等待60秒后再试");
  const code = generateCode();
  await env.DB.prepare("INSERT OR REPLACE INTO anime_verify_codes (email, code, created_at) VALUES (?1, ?2, datetime('now'))").bind(ne, code).run();
  if (env.DEV_MODE !== "true") {
    const html = '<div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:20px">'
      + '<h2 style="color:#ffd93d">Mercury 博客</h2><p>你的登录验证码是：</p>'
      + '<div style="font-size:32px;font-weight:bold;letter-spacing:8px;padding:16px;background:#1a1a2e;border-radius:8px;text-align:center;color:#ffd93d">'
      + code + '</div>'
      + '<p style="color:#888;font-size:13px">验证码 5 分钟内有效，请勿泄露给他人。</p></div>';
    try { await sendEmail(env, ne, "登录验证码 - Mercury 博客", html); }
    catch { return jsonResponse({ error: "邮件发送失败，请稍后重试" }, 500); }
  }
  return jsonResponse({ success: true, ...env.DEV_MODE === "true" ? { dev_code: code } : {} });
}

async function handleVerifyCode(env, request) {
  let body; try { body = await request.json(); } catch { return badRequest("Invalid JSON"); }
  const { email, code } = body;
  if (!email || !code) return badRequest("Email and code required");
  const ne = email.toLowerCase().trim();
  const rec = await env.DB.prepare("SELECT code, created_at FROM anime_verify_codes WHERE email = ?").bind(ne).first();
  if (!rec) return badRequest("请先获取验证码");
  if (rec.code !== code) return badRequest("验证码错误");
  if (Date.now() - new Date(rec.created_at + "Z").getTime() > 5 * 60 * 1000) return badRequest("验证码已过期，请重新获取");
  await env.DB.prepare("DELETE FROM anime_verify_codes WHERE email = ?").bind(ne).run();
  await upsertUser(env, ne, "email", `email:${ne}`, "", "");
  const st = await createSession(env, ne);
  const u = await env.DB.prepare("SELECT email, display_name, avatar_url, website FROM anime_users WHERE email = ?").bind(ne).first();
  return jsonResponse({ token: st, user: u });
}

async function handleAuthMe(env, request) {
  const email = await getAuthEmail(env, request);
  if (!email) return unauthorized();
  const user = await env.DB.prepare("SELECT email, display_name, avatar_url, website, created_at, last_login FROM anime_users WHERE email = ?").bind(email).first();
  if (!user) return unauthorized("User not found");
  const { results: linked } = await env.DB.prepare("SELECT auth_type, auth_id, linked_at FROM anime_user_auth_methods WHERE email = ?").bind(email).all();
  const hp = await env.DB.prepare("SELECT password_hash FROM anime_users WHERE email = ?").bind(email).first();
  const hc = await env.DB.prepare("SELECT COUNT(*) as cnt FROM anime_history WHERE email = ?").bind(email).first();
  const dc = await env.DB.prepare("SELECT COUNT(*) as cnt FROM anime_danmaku WHERE email = ?").bind(email).first();
  return jsonResponse({ user, linked: linked || [], has_password: !!hp?.password_hash, stats: { history: hc?.cnt || 0, danmaku: dc?.cnt || 0 } });
}

async function handleAuthLogout(env, request) {
  const auth = request.headers.get("Authorization");
  if (auth && auth.startsWith("Bearer ")) { await env.DB.prepare("DELETE FROM anime_sessions WHERE token = ?").bind(auth.slice(7)).run(); }
  return jsonResponse({ success: true });
}

async function handleProfile(env, request) {
  const email = await getAuthEmail(env, request);
  if (!email) return unauthorized();
  if (request.method === "GET") {
    const user = await env.DB.prepare("SELECT email, display_name, avatar_url, created_at, last_login FROM anime_users WHERE email = ?").bind(email).first();
    if (!user) return unauthorized("User not found");
    return jsonResponse({ user });
  }
  if (request.method === "PUT") {
    let body; try { body = await request.json(); } catch { return badRequest("Invalid JSON"); }
    const { display_name, avatar_url, website } = body;
    if (display_name !== void 0) { await env.DB.prepare("UPDATE anime_users SET display_name = ?1, updated_at = datetime('now') WHERE email = ?2").bind(display_name.trim() || "", email).run(); }
    if (avatar_url !== void 0) { await env.DB.prepare("UPDATE anime_users SET avatar_url = ?1, updated_at = datetime('now') WHERE email = ?2").bind(avatar_url, email).run(); }
    if (website !== void 0) { await env.DB.prepare("UPDATE anime_users SET website = ?1, updated_at = datetime('now') WHERE email = ?2").bind(website.trim() || "", email).run(); }
    const user = await env.DB.prepare("SELECT email, display_name, avatar_url, website, created_at FROM anime_users WHERE email = ?").bind(email).first();
    return jsonResponse({ success: true, user });
  }
  return badRequest("Method not allowed");
}

async function handleUnlinkAccount(env, request) {
  const email = await getAuthEmail(env, request);
  if (!email) return unauthorized();
  let body; try { body = await request.json(); } catch { return badRequest("Invalid JSON"); }
  const { type } = body;
  if (!type || !["github", "google"].includes(type)) return badRequest("Invalid auth type");
  const { results: methods } = await env.DB.prepare("SELECT auth_type FROM anime_user_auth_methods WHERE email = ?").bind(email).all();
  const hp = await env.DB.prepare("SELECT password_hash FROM anime_users WHERE email = ?").bind(email).first();
  if ((methods?.length || 0) + (hp?.password_hash ? 1 : 0) < 2) return badRequest("至少需要保留一种登录方式");
  await env.DB.prepare("DELETE FROM anime_user_auth_methods WHERE email = ?1 AND auth_type = ?2").bind(email, type).run();
  return jsonResponse({ success: true });
}

async function handleDeleteAccount(env, request) {
  const email = await getAuthEmail(env, request);
  if (!email) return unauthorized();
  const { password } = await request.json();
  const user = await env.DB.prepare("SELECT password_hash FROM anime_users WHERE email = ?").bind(email).first();
  if (user?.password_hash) {
    if (!password) return badRequest('需要输入密码确认注销');
    if (!await verifyPassword(password, user.password_hash)) return badRequest('密码错误');
  }
  await env.DB.prepare("DELETE FROM anime_user_auth_methods WHERE email = ?").bind(email).run();
  await env.DB.prepare("DELETE FROM anime_sessions WHERE email = ?").bind(email).run();
  await env.DB.prepare("DELETE FROM anime_history WHERE email = ?").bind(email).run();
  await env.DB.prepare("DELETE FROM anime_danmaku WHERE email = ?").bind(email).run();
  await env.DB.prepare("DELETE FROM anime_users WHERE email = ?").bind(email).run();
  return jsonResponse({ success: true });
}

// ─── OAuth handlers ─────────────────────────────────────────────────────────

async function handleGithubLogin(env, url) {
  const lt = url.searchParams.get("link_token") || "";
  const s = generateToken().slice(0, 16);
  return redirect(`https://github.com/login/oauth/authorize?${new URLSearchParams({ client_id: env.GITHUB_CLIENT_ID, scope: "read:user user:email", state: lt ? `${s}:${lt}` : s })}`);
}

async function handleGithubCallback(env, url) {
  const code = url.searchParams.get("code");
  if (!code) return badRequest("Missing code");
  const sp = (url.searchParams.get("state") || "").split(":");
  const lt = sp.length > 1 ? sp.slice(1).join(":") : "";
  const tr = await (await fetch("https://github.com/login/oauth/access_token", { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify({ client_id: env.GITHUB_CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET, code }) })).json();
  if (!tr.access_token) return badRequest("GitHub auth failed");
  const [ur, er] = await Promise.all([ fetch("https://api.github.com/user", { headers: { Authorization: `Bearer ${tr.access_token}`, "User-Agent": "auth-worker" } }), fetch("https://api.github.com/user/emails", { headers: { Authorization: `Bearer ${tr.access_token}`, "User-Agent": "auth-worker" } }) ]);
  const gu = await ur.json(); const ems = await er.json();
  const pe = (ems.find(e => e.primary && e.verified) || ems.find(e => e.verified) || {}).email || `github_${gu.id}@users.233002.xyz`;
  const aid = `github:${gu.id}`;
  if (lt) {
    const ls = await env.DB.prepare("SELECT email FROM anime_sessions WHERE token = ?1 AND expires_at > datetime('now')").bind(lt).first();
    if (ls) {
      const el = await env.DB.prepare("SELECT email FROM anime_user_auth_methods WHERE auth_type = 'github' AND auth_id = ?").bind(aid).first();
      if (el && el.email !== ls.email) return redirect(`${env.SITE_URL || "https://www.233002.xyz"}/user/?error=github_already_linked`);
      await env.DB.prepare("INSERT OR IGNORE INTO anime_user_auth_methods (email, auth_type, auth_id) VALUES (?1, 'github', ?2)").bind(ls.email, aid).run();
      const st2 = await createSession(env, ls.email);
      const u2 = await env.DB.prepare("SELECT email, display_name, avatar_url FROM anime_users WHERE email = ?").bind(ls.email).first();
      return redirect(`${env.SITE_URL || "https://www.233002.xyz"}/user/?auth=${encodeURIComponent(JSON.stringify({ token: st2, user: u2 }))}`);
    }
  }
  await upsertUser(env, pe, "github", aid, gu.login || "", gu.avatar_url || "");
  const st = await createSession(env, pe);
  const u = await env.DB.prepare("SELECT email, display_name, avatar_url FROM anime_users WHERE email = ?").bind(pe).first();
  return redirect(`${env.SITE_URL || "https://www.233002.xyz"}/?auth=${encodeURIComponent(JSON.stringify({ token: st, user: u }))}`);
}

async function handleGoogleLogin(env, url) {
  const lt = url.searchParams.get("link_token") || "";
  const s = generateToken().slice(0, 16);
  return redirect(`https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({ client_id: env.GOOGLE_CLIENT_ID, redirect_uri: `${env.WORKER_URL}/api/auth/google/callback`, response_type: "code", scope: "openid email profile", state: lt ? `${s}:${lt}` : s })}`);
}

async function handleGoogleCallback(env, url) {
  const code = url.searchParams.get("code");
  if (!code) return badRequest("Missing code");
  const sp = (url.searchParams.get("state") || "").split(":");
  const lt = sp.length > 1 ? sp.slice(1).join(":") : "";
  const tr = await (await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code, client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET, redirect_uri: `${env.WORKER_URL}/api/auth/google/callback`, grant_type: "authorization_code" }) })).json();
  if (!tr.access_token) return badRequest("Google auth failed");
  const gu = await (await fetch("https://www.googleapis.com/oauth2/v2/userinfo", { headers: { Authorization: `Bearer ${tr.access_token}` } })).json();
  if (!gu.email) return badRequest("Google email not available");
  const aid = `google:${gu.id}`;
  if (lt) {
    const ls = await env.DB.prepare("SELECT email FROM anime_sessions WHERE token = ?1 AND expires_at > datetime('now')").bind(lt).first();
    if (ls) {
      const el = await env.DB.prepare("SELECT email FROM anime_user_auth_methods WHERE auth_type = 'google' AND auth_id = ?").bind(aid).first();
      if (el && el.email !== ls.email) return redirect(`${env.SITE_URL || "https://www.233002.xyz"}/user/?error=google_already_linked`);
      await env.DB.prepare("INSERT OR IGNORE INTO anime_user_auth_methods (email, auth_type, auth_id) VALUES (?1, 'google', ?2)").bind(ls.email, aid).run();
      const st2 = await createSession(env, ls.email);
      const u2 = await env.DB.prepare("SELECT email, display_name, avatar_url FROM anime_users WHERE email = ?").bind(ls.email).first();
      return redirect(`${env.SITE_URL || "https://www.233002.xyz"}/user/?auth=${encodeURIComponent(JSON.stringify({ token: st2, user: u2 }))}`);
    }
  }
  await upsertUser(env, gu.email, "google", aid, gu.name || "", gu.picture || "");
  const st = await createSession(env, gu.email);
  const u = await env.DB.prepare("SELECT email, display_name, avatar_url FROM anime_users WHERE email = ?").bind(gu.email).first();
  return redirect(`${env.SITE_URL || "https://www.233002.xyz"}/?auth=${encodeURIComponent(JSON.stringify({ token: st, user: u }))}`);
}

// ─── Router ──────────────────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
    try { await migrate(env); } catch (e) { console.error('[migrate]', e); }
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/api/auth/login" && request.method === "POST") return handleLogin(env, request);
    if (path === "/api/auth/register" && request.method === "POST") return handleRegister(env, request);
    if (path === "/api/auth/register/verify" && request.method === "POST") return handleRegisterVerify(env, request);
    if (path === "/api/auth/password" && request.method === "PUT") return handleChangePassword(env, request);
    if (path === "/api/auth/password/reset" && request.method === "POST") return handlePasswordReset(env, request);
    if (path === "/api/auth/password/reset/verify" && request.method === "POST") return handlePasswordResetVerify(env, request);
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

    return jsonResponse({ error: "Not Found" }, 404);
  }
};
