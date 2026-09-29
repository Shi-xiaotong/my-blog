/**
 * 人生选择题 — 纯前端文字选项游戏
 * 数据文件: /games/life-choices.json (天赋/阶段/选项/结局全部在这, 改内容不用动代码)
 */
(function () {
  'use strict';

  var DATA_URL = '/games/life-choices.json';
  var $game = document.getElementById('lcGame');

  var data = null;      // JSON 内容
  var state = null;     // 当前游戏状态
  var lastDeltas = {}; // 上次变更的属性增量 (用于显示 ±)

  // ---------- 工具 ----------
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function loadJSON() {
    return fetch(DATA_URL, { cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      });
  }

  // ---------- 游戏流程 ----------
  function startGame() {
    var attrs = {};
    data.meta.attributes.forEach(function (a) { attrs[a.id] = 0; });
    state = {
      phase: 'talent',           // talent -> stageIdx -> ending
      talentPool: null,
      talent: null,
      stageIdx: 0,
      attrs: attrs,
      flags: [],
      choices: []                // 记录走过的选择, 用于结局页回顾
    };
    lastDeltas = {};
    // 随机抽 3 个天赋
    var pool = data.talents.slice();
    for (var i = pool.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = pool[i]; pool[i] = pool[j]; pool[j] = t;
    }
    state.talentPool = pool.slice(0, 3);
    render();
  }

  function pickTalent(talentId) {
    var t = state.talentPool.find(function (x) { return x.id === talentId; });
    if (!t) return;
    state.talent = t;
    applyEffects(t.effects);
    state.choices.push({ label: '天赋', value: t.name });
    state.phase = 'stage';
    lastDeltas = {};
    render();
  }

  function skipTalent() {
    state.talent = null;
    state.choices.push({ label: '天赋', value: '（没有选择天赋）' });
    state.phase = 'stage';
    lastDeltas = {};
    render();
  }

  function chooseOption(stageId, optionId) {
    var stage = data.stages[state.stageIdx];
    var opt = stage.options.find(function (o) { return o.id === optionId; });
    if (!opt || stage.id !== stageId) return;
    applyEffects(opt.effects);
    (opt.flags || []).forEach(function (f) {
      if (state.flags.indexOf(f) === -1) state.flags.push(f);
    });
    state.choices.push({ label: stage.title, value: opt.title });
    state.stageIdx++;
    lastDeltas = {};
    if (state.stageIdx >= data.stages.length) {
      state.phase = 'ending';
      resolveEnding();
    }
    render();
  }

  function applyEffects(effects) {
    if (!effects) return;
    Object.keys(effects).forEach(function (k) {
      if (k in state.attrs) {
        state.attrs[k] += effects[k];
        lastDeltas[k] = effects[k];
      }
    });
  }

  // 结局判定: 按 priority 从高到低, conditions 全部满足才命中;
  // 都没命中就用没有 conditions 的兜底结局 (ordinary_ending)
  function resolveEnding() {
    var candidates = data.endings
      .filter(function (e) {
        var c = e.conditions || {};
        if (c.minScore !== undefined) {
          var total = data.meta.attributes.reduce(function (s, a) {
            return s + (state.attrs[a.id] || 0);
          }, 0);
          if (total < c.minScore) return false;
        }
        if (c.flag && state.flags.indexOf(c.flag) === -1) return false;
        return true;
      })
      .sort(function (a, b) { return (b.priority || 0) - (a.priority || 0); });
    state.ending = candidates[0] || null;
  }

  // ---------- 渲染 ----------
  function attrBarHTML() {
    return data.meta.attributes.map(function (a) {
      var v = state.attrs[a.id] || 0;
      var d = lastDeltas[a.id];
      var dHtml = '';
      if (d !== undefined && d !== 0) {
        dHtml = '<div class="lc-attr-delta ' + (d > 0 ? 'up' : 'down') + '">' +
          (d > 0 ? '+' : '') + d + '</div>';
      }
      return '<div class="lc-attr' + (d !== undefined && d !== 0 ? ' bump' : '') + '">' +
        '<div class="lc-attr-icon">' + esc(a.icon || '') + '</div>' +
        '<div class="lc-attr-name">' + esc(a.name) + '</div>' +
        '<div class="lc-attr-val" style="color:' + (v > 0 ? 'var(--accent)' : v < 0 ? 'var(--danger)' : 'var(--text-secondary)') + '">' +
        (v > 0 ? '+' : '') + v + '</div>' + dHtml +
        '</div>';
    }).join('');
  }

  function render() {
    if (state.phase === 'talent') return renderTalent();
    if (state.phase === 'stage') return renderStage();
    if (state.phase === 'ending') return renderEnding();
  }

  function renderTalent() {
    var cards = state.talentPool.map(function (t) {
      return '<button class="lc-option lc-fade-in" onclick="LC.pickTalent(\'' + t.id + '\')">' +
        '<div class="lc-option-head"><span class="lc-option-icon">' + esc(t.icon) + '</span>' +
        '<span class="lc-option-title">' + esc(t.name) + '</span></div>' +
        '<div class="lc-option-desc">' + esc(t.desc) + '</div></button>';
    }).join('');
    $game.innerHTML =
      '<div class="lc-container">' +
      '<div class="lc-phase"><div class="lc-age">开局</div><h2>随机天赋</h2>' +
      '<p class="lc-intro">命运随机发了 3 张天赋牌，选一张带走，或者全部跳过。</p></div>' +
      '<div class="lc-attrs">' + attrBarHTML() + '</div>' +
      '<div class="lc-options">' + cards + '</div>' +
      '<div class="lc-actions"><button class="lc-btn lc-btn-ghost" onclick="LC.skipTalent()">跳过天赋</button></div>' +
      '</div>';
  }

  function renderStage() {
    var stage = data.stages[state.stageIdx];
    var cards = stage.options.map(function (o) {
      var flagHint = '';
      if (o.flags && o.flags.length) {
        flagHint = '<span class="lc-option-hint">✦ 可能触发隐藏事件</span>';
      }
      return '<button class="lc-option lc-fade-in" onclick="LC.chooseOption(\'' + stage.id + '\',\'' + o.id + '\')">' +
        '<div class="lc-option-head"><span class="lc-option-icon">' + esc(o.icon || '•') + '</span>' +
        '<span class="lc-option-title">' + esc(o.title) + '</span></div>' +
        '<div class="lc-option-desc">' + esc(o.desc) + '</div>' + flagHint +
        '</button>';
    }).join('');

    var talentLine = state.talent
      ? '<div class="lc-echo">你的天赋：<strong>' + esc(state.talent.icon) + ' ' + esc(state.talent.name) + '</strong></div>'
      : '';

    $game.innerHTML =
      '<div class="lc-container">' +
      '<div class="lc-phase"><div class="lc-age">' + esc(stage.subtitle) + '</div><h2>' + esc(stage.title) + '</h2>' +
      '<p class="lc-intro">' + esc(stage.intro) + '</p></div>' +
      talentLine +
      '<div class="lc-attrs">' + attrBarHTML() + '</div>' +
      '<div class="lc-options">' + cards + '</div>' +
      '</div>';
  }

  function renderEnding() {
    var e = state.ending;
    var total = data.meta.attributes.reduce(function (s, a) { return s + (state.attrs[a.id] || 0); }, 0);

    var choiceList = state.choices.map(function (c) {
      return '<li>' + esc(c.label) + '：' + esc(c.value) + '</li>';
    }).join('');

    var flagLine = '';
    if (state.flags.length) {
      var fnames = state.flags.map(function (fid) {
        var f = (data.meta.flags || []).find(function (x) { return x.id === fid; });
        return f ? f.name : fid;
      });
      flagLine = '<div class="lc-ending-flag">✦ 触发隐藏事件：' + esc(fnames.join('、')) + '</div>';
    }

    $game.innerHTML =
      '<div class="lc-container lc-ending">' +
      '<div class="lc-ending-emoji">' + esc(e.emoji) + '</div>' +
      '<div class="lc-ending-title">' + esc(e.title) + '</div>' +
      '<div class="lc-ending-desc">' + esc(e.desc) + '</div>' +
      flagLine +
      '<div class="lc-ending-attrs">' +
      data.meta.attributes.map(function (a) {
        var v = state.attrs[a.id] || 0;
        return '<div class="lc-attr"><div class="lc-attr-icon">' + esc(a.icon) + '</div>' +
          '<div class="lc-attr-name">' + esc(a.name) + '</div>' +
          '<div class="lc-attr-val" style="color:' + (v > 0 ? 'var(--accent)' : v < 0 ? 'var(--danger)' : 'var(--text-secondary)') + '">' +
          (v > 0 ? '+' : '') + v + '</div></div>';
      }).join('') +
      '</div>' +
      '<div style="font-size:13px;color:var(--text-secondary);margin-bottom:8px">总评分 <strong style="font-family:\'SF Mono\',monospace;color:var(--primary)">' + total + '</strong> · 结局：<strong>' + esc(e.title) + '</strong></div>' +
      '<details style="text-align:left;background:var(--card-bg);border:1px solid var(--border);border-radius:10px;padding:12px 16px;margin-bottom:20px">' +
      '<summary style="cursor:pointer;font-size:14px;color:var(--text-secondary)">回顾你的人生选择</summary>' +
      '<ol style="margin:10px 0 0 20px;font-size:13px;color:var(--text-secondary);line-height:2">' + choiceList + '</ol>' +
      '</details>' +
      '<div class="lc-actions">' +
      '<button class="lc-btn lc-btn-primary" onclick="LC.restart()">再玩一次</button>' +
      '<a class="lc-btn lc-btn-outline" href="/games/">返回游戏列表</a>' +
      '</div></div>';
  }

  // 暴露给 onclick
  window.LC = {
    pickTalent: pickTalent,
    skipTalent: skipTalent,
    chooseOption: chooseOption,
    restart: startGame
  };

  loadJSON().then(function (d) {
    data = d;
    startGame();
  }).catch(function (err) {
    $game.innerHTML = '<div class="lc-container"><p style="color:var(--danger);text-align:center">数据加载失败：' +
      esc(err.message) + '（<a href="' + esc(DATA_URL) + '" style="color:var(--primary)">' + esc(DATA_URL) + '</a>）</p>' +
      '<div class="lc-actions"><button class="lc-btn lc-btn-primary" onclick="location.reload()">重试</button></div></div>';
  });
})();
