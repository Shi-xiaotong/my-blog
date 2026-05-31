---
title: 个人中心
date: 2026-05-31
type: user
comments: false
---

<div id="user-center">
  <div class="uc-loading" id="ucLoading"><i class="fas fa-spinner fa-spin"></i> 加载中...</div>
  <div class="uc-main" id="ucMain" style="display:none">
    <div class="uc-card">
      <div class="uc-avatar-wrap">
        <div class="uc-avatar" id="ucAvatar"><i class="fas fa-user"></i></div>
        <button class="uc-avatar-edit" id="ucAvatarEdit" title="修改头像"><i class="fas fa-camera"></i></button>
      </div>
      <div class="uc-info">
        <div class="uc-name-row">
          <span class="uc-name" id="ucName"></span>
          <button class="uc-edit-btn" id="ucNameEdit" title="编辑昵称"><i class="fas fa-pen"></i></button>
        </div>
        <div class="uc-email" id="ucEmail"></div>
        <div class="uc-meta" id="ucMeta"></div>
      </div>
    </div>

    <div class="uc-modal" id="ucNameModal">
      <div class="uc-modal-box">
        <h3>修改昵称</h3>
        <input type="text" id="ucNameInput" placeholder="输入新昵称" maxlength="50">
        <div class="uc-modal-actions">
          <button class="uc-btn uc-btn-secondary" id="ucNameCancel">取消</button>
          <button class="uc-btn uc-btn-primary" id="ucNameSave">保存</button>
        </div>
      </div>
    </div>

    <div class="uc-modal" id="ucAvatarModal">
      <div class="uc-modal-box">
        <h3>修改头像</h3>
        <input type="url" id="ucAvatarInput" placeholder="输入头像图片 URL">
        <div class="uc-modal-actions">
          <button class="uc-btn uc-btn-secondary" id="ucAvatarCancel">取消</button>
          <button class="uc-btn uc-btn-primary" id="ucAvatarSave">保存</button>
        </div>
      </div>
    </div>

    <div class="uc-card">
      <h3 class="uc-card-title"><i class="fas fa-link"></i> 关联账户</h3>
      <div class="uc-accounts" id="ucAccounts">
        <div class="uc-account-item">
          <div class="uc-account-icon"><i class="fab fa-github"></i></div>
          <div class="uc-account-info">
            <span class="uc-account-name">GitHub</span>
            <span class="uc-account-status" id="ucGithubStatus">未关联</span>
          </div>
          <button class="uc-btn uc-btn-sm" id="ucGithubBtn">关联</button>
        </div>
        <div class="uc-account-item">
          <div class="uc-account-icon"><i class="fab fa-google"></i></div>
          <div class="uc-account-info">
            <span class="uc-account-name">Google</span>
            <span class="uc-account-status" id="ucGoogleStatus">未关联</span>
          </div>
          <button class="uc-btn uc-btn-sm" id="ucGoogleBtn">关联</button>
        </div>
        <div class="uc-account-item">
          <div class="uc-account-icon"><i class="fas fa-envelope"></i></div>
          <div class="uc-account-info">
            <span class="uc-account-name">邮箱验证码</span>
            <span class="uc-account-status" id="ucEmailStatus">未关联</span>
          </div>
          <span id="ucEmailBtn"></span>
        </div>
      </div>
    </div>

    <div class="uc-card">
      <h3 class="uc-card-title"><i class="fas fa-cog"></i> 账户操作</h3>
      <div class="uc-actions">
        <button class="uc-btn uc-btn-secondary" id="ucLogoutBtn"><i class="fas fa-sign-out-alt"></i> 退出登录</button>
        <button class="uc-btn uc-btn-danger" id="ucDeleteBtn"><i class="fas fa-trash-alt"></i> 注销账号</button>
      </div>
      <p class="uc-danger-note">注销账号将删除所有观看历史、弹幕和评论数据，且无法恢复。</p>
    </div>
  </div>
  <div class="uc-not-login" id="ucNotLogin" style="display:none">
    <div class="uc-card uc-login-prompt">
      <i class="fas fa-user-lock" style="font-size:48px;color:#555;margin-bottom:16px"></i>
      <h3>请先登录</h3>
      <p>登录后可管理个人信息和关联账户</p>
      <button class="uc-btn uc-btn-primary" id="ucLoginBtn">去登录</button>
    </div>
  </div>
</div>

<style>
#user-center{max-width:640px;margin:0 auto;padding:80px 20px 40px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
.uc-card{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:24px;margin-bottom:16px}
.uc-card-title{margin:0 0 16px;font-size:16px;color:#ffd93d;display:flex;align-items:center;gap:8px}
.uc-card-title i{font-size:14px}
.uc-avatar-wrap{position:relative;width:80px;height:80px;margin-bottom:16px}
.uc-avatar{width:80px;height:80px;border-radius:50%;background:#333;display:flex;align-items:center;justify-content:center;font-size:32px;color:#ffd93d;overflow:hidden}
.uc-avatar img{width:100%;height:100%;object-fit:cover}
.uc-avatar-edit{position:absolute;bottom:0;right:0;width:28px;height:28px;border-radius:50%;background:#ffd93d;color:#0f0f1a;border:none;cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center}
.uc-name-row{display:flex;align-items:center;gap:8px;margin-bottom:4px}
.uc-name{font-size:22px;font-weight:700;color:#fff}
.uc-edit-btn{background:none;border:none;color:#888;cursor:pointer;font-size:13px;padding:4px}
.uc-edit-btn:hover{color:#ffd93d}
.uc-email{color:#888;font-size:14px;margin-bottom:4px}
.uc-meta{color:#666;font-size:13px}
.uc-account-item{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.06)}
.uc-account-item:last-child{border-bottom:none}
.uc-account-icon{width:36px;height:36px;border-radius:8px;background:rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;font-size:18px;color:#ccc}
.uc-account-info{flex:1}
.uc-account-name{display:block;font-size:14px;color:#ddd}
.uc-account-status{font-size:12px;color:#888}
.uc-account-status.linked{color:#4ecdc4}
.uc-actions{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:12px}
.uc-danger-note{color:#666;font-size:12px;margin:0}
.uc-btn{padding:8px 20px;border:none;border-radius:8px;font-size:14px;cursor:pointer;transition:all .2s;font-family:inherit}
.uc-btn-primary{background:#ffd93d;color:#0f0f1a;font-weight:600}
.uc-btn-primary:hover{background:#e94560;color:#fff}
.uc-btn-secondary{background:rgba(255,255,255,.1);color:#ccc;border:1px solid rgba(255,255,255,.15)}
.uc-btn-secondary:hover{background:rgba(255,255,255,.2)}
.uc-btn-danger{background:rgba(233,69,96,.15);color:#e94560;border:1px solid rgba(233,69,96,.3)}
.uc-btn-danger:hover{background:#e94560;color:#fff}
.uc-btn-sm{padding:5px 14px;font-size:12px}
.uc-login-prompt{text-align:center;padding:48px 24px}
.uc-login-prompt h3{color:#ffd93d;margin:0 0 8px}
.uc-login-prompt p{color:#888;margin:0 0 20px}
.uc-modal{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.6);z-index:1002;align-items:center;justify-content:center}
.uc-modal.show{display:flex}
.uc-modal-box{background:#1a1a2e;border:1px solid #333;border-radius:12px;padding:24px;width:360px;max-width:90vw}
.uc-modal-box h3{margin:0 0 16px;color:#ffd93d;font-size:16px}
.uc-modal-box input{width:100%;padding:10px 14px;background:#0f0f1a;border:1px solid #333;border-radius:8px;color:#fff;font-size:14px;outline:none;box-sizing:border-box}
.uc-modal-box input:focus{border-color:#ffd93d}
.uc-modal-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:16px}
.uc-loading{text-align:center;padding:120px 20px;color:#888;font-size:16px}
.uc-loading i{margin-right:8px}
@media(max-width:768px){#user-center{padding:70px 16px 30px}.uc-card{padding:18px}}
</style>

<script src="/js/user-center.js"></script>
