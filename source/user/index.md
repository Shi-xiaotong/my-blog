---
title: 个人中心
date: 2026-05-31
type: user
comments: false
---
{% raw %}
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
      <h3 class="uc-card-title"><i class="fas fa-history"></i> 观看记录</h3>
      <div id="ucHistoryList"><div class="uc-hint">加载中...</div></div>
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
            <span class="uc-account-name">邮箱</span>
            <span class="uc-account-status" id="ucEmailStatus">未绑定</span>
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
{% endraw %}
