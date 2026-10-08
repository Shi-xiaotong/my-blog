/**
 * 人生选择题 v2 — 纯前端文字选项游戏
 * 数据文件: /games/life-choices.json
 *
 * v2 新增:
 *   - 8 个阶段 (童年→小学→高中→大学→初入职场→奋斗期→中年→老年)
 *   - 5 个属性 (家境/智力/快乐/事业/健康)
 *   - 20 个天赋 (含随机池天赋)
 *   - 每阶段 4 个选项
 *   - 16 个随机事件 (命运插叙)
 *   - 15+ 个结局 (条件更细)
 *   - 18 个隐藏 flag
 */
(function () {
  'use strict';

  var DATA_URL = '/games/life-choices.json';
  var $game = document.getElementById('lcGame');

  var data = null;
  var state = null;
  var lastDeltas = {};
  var lastRandomEvent = null;   // 本回合触发的随机事件, 用于显示插叙

  // ---------- 图标映射表 ----------
  var ICONS = {
    coins: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="9" r="6"/><path d="M15 15a6 6 0 1 0-6-6"/></svg>',
    brain: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 3a4 4 0 0 0-4 4 4 4 0 0 0 1 8v2a3 3 0 0 0 3 3h1V3H9z"/><path d="M15 3a4 4 0 0 1 4 4 4 4 0 0 1-1 8v2a3 3 0 0 1-3 3h-1V3h1z"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s-7-4.5-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.5-9 9-9 9z"/></svg>',
    gift: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M3 12h18M12 8v13"/><path d="M12 8c-1.5-3-5-3-5-1s3 2 5 1 3.5-1 5-1-3.5-2-5 1z"/></svg>',
    sparkle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/></svg>',
    books: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 5h6v14H4z"/><path d="M14 5h6v14h-6z"/><path d="M10 5v14M14 5v14"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z"/><path d="M18 20H7a2 2 0 0 1-2-2"/><path d="M9 8h6"/></svg>',
    clover: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="9" r="3"/><circle cx="15" cy="9" r="3"/><circle cx="9" cy="15" r="3"/><circle cx="15" cy="15" r="3"/><path d="M12 15v6"/></svg>',
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg>',
    flame: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2c1 3-1 4-1 7a4 4 0 0 0 8 0c0-2-1-3-2-4 0 2-1 3-2 3 1-3-2-5-3-6z"/><path d="M8 15a4 4 0 0 0 8 0c0-2-1-3-2-4"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><rect x="9" y="14" width="6" height="6"/></svg>',
    meditate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="5" r="2"/><path d="M12 8v4M8 12l4 4 4-4M5 20c1.2-3 3.8-4 7-4s5.8 1 7 4"/></svg>',
    pencil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 4l6 6-10 10H4v-6z"/><path d="M12 6l6 6"/></svg>',
    plane: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 3L10 14M21 3l-7 18-4-7-7-4z"/></svg>',
    rocket: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2c3 3 4 7 4 10l3 3-3 1c-1 3-3 5-4 6-1-1-3-3-4-6l-3-1 3-3c0-3 1-7 4-10z"/><circle cx="12" cy="9" r="1.5"/></svg>',
    rose: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="9" r="3"/><circle cx="12" cy="9" r="6"/><path d="M12 15v6"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19"/></svg>',
    trophy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4"/><path d="M9 14h6M12 14v4M10 18h4"/></svg>',
    worm: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 15c0 3 2 5 5 5s5-2 5-5"/><circle cx="7" cy="10" r="2"/><circle cx="12" cy="9" r="2"/><circle cx="17" cy="10" r="2"/></svg>'
  };
  function icon(key) { return ICONS[key] || ''; }

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
      phase: 'talent',
      talentPool: null,
      talent: null,
      stageIdx: 0,
      attrs: attrs,
      flags: [],
      choices: [],
      randomEventHistory: []   // 记录所有触发过的随机事件
    };
    lastDeltas = {};
    lastRandomEvent = null;
    // 随机抽 3 个天赋 (v2: 20 个里抽 3)
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
    // v2: 天赋带随机池 → 选一个随机效果
    if (t.randomEffectPool && t.randomEffectPool.length) {
      var pick = t.randomEffectPool[Math.floor(Math.random() * t.randomEffectPool.length)];
      applyEffects(pick.effects);
      state.choices.push({ label: '天赋·意外', value: pick.text || '未知命运' });
    } else {
      state.choices.push({ label: '天赋', value: t.name });
    }
    state.phase = 'stage';
    lastDeltas = {};
    lastRandomEvent = null;
    render();
  }

  function skipTalent() {
    state.talent = null;
    state.choices.push({ label: '天赋', value: '（没有选择天赋）' });
    state.phase = 'stage';
    lastDeltas = {};
    lastRandomEvent = null;
    render();
  }

  function chooseOption(stageId, optionId) {
    var stage = data.stages[state.stageIdx];
    var opt = stage.options.find(function (o) { return o.id === optionId; });
    if (!opt || stage.id !== stageId) return;

    applyEffects(opt.effects);

    // v2: 选项带随机池 → 随机一条
    if (opt.randomEffectPool && opt.randomEffectPool.length) {
      var pick = opt.randomEffectPool[Math.floor(Math.random() * opt.randomEffectPool.length)];
      applyEffects(pick.effects);
      state.choices.push({ label: stage.title + '·意外', value: pick.text || '命运插叙' });
    }

    (opt.flags || []).forEach(function (f) {
      if (state.flags.indexOf(f) === -1) state.flags.push(f);
    });
    if (!opt.randomEffectPool || !opt.randomEffectPool.length) {
      state.choices.push({ label: stage.title, value: opt.title });
    }
    // 若随机池已记录了, 这里不重复记
    if (!opt.randomEffectPool || !opt.randomEffectPool.length) {
      state.choices.push({ label: stage.title, value: opt.title });
    }

    // v2: 每个阶段结束后触发一条随机事件 (40% 概率)
    lastRandomEvent = null;
    if (Math.random() < 0.4 && data.random_events && data.random_events.length) {
      var evt = data.random_events[Math.floor(Math.random() * data.random_events.length)];
      applyEffects(evt.effects);
      (evt.flags || []).forEach(function (f) {
        if (state.flags.indexOf(f) === -1) state.flags.push(f);
      });
      lastRandomEvent = evt;
      state.randomEventHistory.push(evt);
      state.choices.push({ label: '命运插叙', value: evt.title });
    }

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
        lastDeltas[k] = (lastDeltas[k] || 0) + effects[k];
      }
    });
  }

  // v2: 结局判定增强 — 支持 minScore / minWealth / minHappiness / minIntellect / minHealth / minCareer / flag / maxScore
  function resolveEnding() {
    var total = totalScore();
    var candidates = data.endings
      .filter(function (e) {
        var c = e.conditions || {};
        if (c.minScore !== undefined && total < c.minScore) return false;
        if (c.maxScore !== undefined && total > c.maxScore) return false;
        if (c.flag && state.flags.indexOf(c.flag) === -1) return false;
        if (c.minWealth !== undefined && state.attrs.wealth < c.minWealth) return false;
        if (c.minHappiness !== undefined && state.attrs.happiness < c.minHappiness) return false;
        if (c.minIntellect !== undefined && state.attrs.intellect < c.minIntellect) return false;
        if (c.minHealth !== undefined && state.attrs.health < c.minHealth) return false;
        if (c.minCareer !== undefined && state.attrs.career < c.minCareer) return false;
        return true;
      })
      .sort(function (a, b) { return (b.priority || 0) - (a.priority || 0); });
    state.ending = candidates[0] || null;
  }

  function totalScore() {
    return data.meta.attributes.reduce(function (s, a) {
      return s + (state.attrs[a.id] || 0);
    }, 0);
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
        '<div class="lc-attr-icon">' + icon(a.icon) + '</div>' +
        '<div class="lc-attr-name">' + esc(a.name) + '</div>' +
        '<div class="lc-attr-val" style="color:' + (v > 0 ? 'var(--accent)' : v < 0 ? 'var(--danger)' : 'var(--text-secondary)') + '">' +
        (v > 0 ? '+' : '') + v + '</div> ' + dHtml +
        '</div>';
    }).join('');
  }

  function randomEventHTML() {
    if (!lastRandomEvent) return '';
    var evt = lastRandomEvent;
    return '<div class="lc-random-event lc-fade-in">' +
      '<div class="lc-random-event-title">✦ 命运插叙</div>' +
      '<div class="lc-random-event-name">' + esc(evt.title) + '</div>' +
      '<div class="lc-random-event-desc">' + esc(evt.desc) + '</div>' +
      '</div>';
  }

  function render() {
    if (state.phase === 'talent') return renderTalent();
    if (state.phase === 'stage') return renderStage();
    if (state.phase === 'ending') return renderEnding();
  }

  function renderTalent() {
    var cards = state.talentPool.map(function (t) {
      var randHint = t.randomEffectPool ? '<span class="lc-option-hint">? 触发未知命运</span>' : '';
      return '<button class="lc-option lc-fade-in" onclick="LC.pickTalent(\'' + t.id + '\')">' +
        '<div class="lc-option-head"><span class="lc-option-icon">' + icon(t.icon) + '</span>' +
        '<span class="lc-option-title">' + esc(t.name) + '</span></div>' +
        '<div class="lc-option-desc">' + esc(t.desc) + '</div>' + randHint +
        '</button>';
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
    var progress = (state.stageIdx + 1) + ' / ' + data.stages.length;
    var cards = stage.options.map(function (o) {
      var flagHint = '';
      if (o.flags && o.flags.length) {
        flagHint = '<span class="lc-option-hint">✦ 可能触发隐藏事件</span>';
      }
      var randHint = (o.randomEffectPool && o.randomEffectPool.length)
        ? '<span class="lc-option-hint lc-hint-random">? 结果未知</span>' : '';
      return '<button class="lc-option lc-fade-in" onclick="LC.chooseOption(\'' + stage.id + '\',\'' + o.id + '\')">' +
        '<div class="lc-option-head"><span class="lc-option-icon">' + icon(o.icon) + '</span>' +
        '<span class="lc-option-title">' + esc(o.title) + '</span></div>' +
        '<div class="lc-option-desc">' + esc(o.desc) + '</div>' +
        flagHint + randHint +
        '</button>';
    }).join('');

    var talentLine = state.talent
      ? '<div class="lc-echo">你的天赋：<strong>' + icon(state.talent.icon) + esc(state.talent.name) + '</strong></div>'
      : '';

    // v2: 进度条
    var progressPct = Math.round((state.stageIdx / data.stages.length) * 100);

    $game.innerHTML =
      '<div class="lc-container">' +
      '<div class="lc-progress"><div class="lc-progress-fill" style="width:' + progressPct + '%"></div></div>' +
      '<div class="lc-phase">' +
      '<div class="lc-age">' + esc(stage.subtitle) + ' · ' + progress + '</div>' +
      '<h2>' + esc(stage.title) + '</h2>' +
      '<p class="lc-intro">' + esc(stage.intro) + '</p></div>' +
      talentLine +
      '<div class="lc-attrs">' + attrBarHTML() + '</div>' +
      randomEventHTML() +
      '<div class="lc-options">' + cards + '</div>' +
      '</div>';
  }

  function renderEnding() {
    var e = state.ending;
    var total = totalScore();

    var choiceList = state.choices.map(function (c) {
      var cls = c.label === '命运插叙' ? ' class="lc-choice-random"' : '';
      return '<li' + cls + '>' + esc(c.label) + '：' + esc(c.value) + '</li>';
    }).join('');

    var flagLine = '';
    if (state.flags.length) {
      var fnames = state.flags.map(function (fid) {
        var f = (data.meta.flags || []).find(function (x) { return x.id === fid; });
        return f ? f.name : fid;
      });
      flagLine = '<div class="lc-ending-flag">✦ 触发隐藏事件：' + esc(fnames.join('、')) + '</div>';
    }

    // v2: 随机事件回顾
    var evtLine = '';
    if (state.randomEventHistory.length) {
      var evts = state.randomEventHistory.map(function (ev) { return esc(ev.title); }).join('、');
      evtLine = '<div class="lc-ending-flag lc-ending-flag-random">⚡ 命运插叙：' + evts + '</div>';
    }

    $game.innerHTML =
      '<div class="lc-container lc-ending">' +
      '<div class="lc-ending-emoji">' + icon(e.emoji) + '</div>' +
      '<div class="lc-ending-title">' + esc(e.title) + '</div>' +
      '<div class="lc-ending-desc">' + esc(e.desc) + '</div>' +
      flagLine + evtLine +
      '<div class="lc-ending-attrs">' +
      data.meta.attributes.map(function (a) {
        var v = state.attrs[a.id] || 0;
        return '<div class="lc-attr"><div class="lc-attr-icon">' + icon(a.icon) + '</div>' +
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
