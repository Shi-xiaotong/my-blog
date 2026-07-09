/**
 * lunar-mini.js — 轻量级农历转换 (约 5KB)
 * 替代 lunar-javascript (426KB) 的侧边栏需求
 * API 兼容: Solar.fromDate(), Solar.fromYmd(), .getLunar()
 *          .getMonthInChinese(), .getDayInChinese(), .getJieQi(), .getFestivals()
 */
(function (global) {
  'use strict';

  // ─── 农历数据表 (1900-2100) ─────────────────────────────────
  // 每项编码: 低12位=各月天数(1=30,0=29), 4位闰月(0=无), 1位闰月天数
  var LUNAR_INFO = [
    0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2, // 1900-1909
    0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977, // 1910-1919
    0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970, // 1920-1929
    0x06566,0x0d4a0,0x0ea50,0x16a95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950, // 1930-1939
    0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557, // 1940-1949
    0x06ca0,0x0b550,0x15355,0x04da0,0x0a5b0,0x14573,0x052b0,0x0a9a8,0x0e950,0x06aa0, // 1950-1959
    0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0, // 1960-1969
    0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b6a0,0x195a6, // 1970-1979
    0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570, // 1980-1989
    0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x05ac0,0x0ab60,0x096d5,0x092e0, // 1990-1999
    0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5, // 2000-2009
    0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930, // 2010-2019
    0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530, // 2020-2029
    0x05aa0,0x076a3,0x096d0,0x04afb,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45, // 2030-2039
    0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0, // 2040-2049
    0x14b63,0x09370,0x049f8,0x04970,0x064b0,0x168a6,0x0ea50,0x06aa0,0x1a6c4,0x0aae0, // 2050-2059
    0x092e0,0x0d2e3,0x0c960,0x0d557,0x0d4a0,0x0da50,0x05d55,0x056a0,0x0a6d0,0x055d4, // 2060-2069
    0x052d0,0x0a9b8,0x0a950,0x0b4a0,0x0b6a6,0x0ad50,0x055a0,0x0aba4,0x0a5b0,0x052b0, // 2070-2079
    0x0b273,0x06930,0x07337,0x06aa0,0x0ad50,0x14b55,0x04b60,0x0a570,0x054e4,0x0d160, // 2080-2089
    0x0e968,0x0d520,0x0daa0,0x16aa6,0x056d0,0x04ae0,0x0a9d4,0x0a4d0,0x0d150,0x0f252, // 2090-2099
    0x0d520 // 2100
  ];

  // ─── 天干地支 ─────────────────────────────────────────────
  var GAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  var ZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  var SHENGXIAO = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];
  var LUNAR_MONTH = ['正','二','三','四','五','六','七','八','九','十','冬','腊'];
  var LUNAR_DAY = ['初一','初二','初三','初四','初五','初六','初七','初八','初九','初十',
    '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
    '廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'];

  // ─── 农历节日 (月,日,名称) ─────────────────────────────
  var FESTIVALS = [
    [1,1,'春节'],[1,15,'元宵节'],[2,2,'龙抬头'],[3,3,'上巳节'],
    [5,5,'端午节'],[6,6,'晒衣节'],[7,7,'七夕节'],[7,15,'中元节'],
    [8,15,'中秋节'],[9,9,'重阳节'],[10,15,'下元节'],
    [12,8,'腊八节'],[12,23,'小年'],[12,30,'除夕'],[12,29,'除夕']
  ];

  // ─── 公历节日 ─────────────────────────────────────────────
  var SOLAR_FESTIVALS = {
    '1-1':'元旦','2-14':'情人节','3-8':'妇女节','3-12':'植树节',
    '4-1':'愚人节','5-1':'劳动节','5-4':'青年节','6-1':'儿童节',
    '7-1':'建党节','8-1':'建军节','9-10':'教师节','10-1':'国庆节',
    '11-1':'万圣节','12-24':'平安夜','12-25':'圣诞节'
  };

  // ─── 节气近似日期表 (每月两个节气, 格式: [月, 日, 名称]) ──
  // 简化版: 只包含常见节气, 精确到±1天
  var JIE_QI = [
    [1,6,'小寒'],[1,20,'大寒'],[2,4,'立春'],[2,19,'雨水'],
    [3,6,'惊蛰'],[3,21,'春分'],[4,5,'清明'],[4,20,'谷雨'],
    [5,6,'立夏'],[5,21,'小满'],[6,6,'芒种'],[6,21,'夏至'],
    [7,7,'小暑'],[7,23,'大暑'],[8,7,'立秋'],[8,23,'处暑'],
    [9,8,'白露'],[9,23,'秋分'],[10,8,'寒露'],[10,23,'霜降'],
    [11,7,'立冬'],[11,22,'小雪'],[12,7,'大雪'],[12,22,'冬至']
  ];
  // 节气偏移修正 (按年份微调, ±1天)
  var JIE_QI_OFFSET = {
    2025: [0,0,0,-1,-1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    2026: [0,0,0,-1,-1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    2027: [0,0,0,-1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  };

  function getJieQi(year, month, day) {
    var offs = JIE_QI_OFFSET[year] || [];
    for (var i = 0; i < JIE_QI.length; i++) {
      var jq = JIE_QI[i];
      var d = jq[1] + (offs[i] || 0);
      if (jq[0] === month && d === day) return jq[2];
    }
    return null;
  }

  // ─── 核心算法 ─────────────────────────────────────────────

  function lunarLeapYear(y) {
    return LUNAR_INFO[y - 1900] & 0xf;
  }

  function lunarMonthDays(y, m) {
    return (LUNAR_INFO[y - 1900] & (0x10000 >> m)) ? 30 : 29;
  }

  function lunarLeapDays(y) {
    return (LUNAR_INFO[y - 1900] & 0x10000) ? 30 : 29;
  }

  function lunarYearDays(y) {
    var sum = 348; // 12 * 29
    var info = LUNAR_INFO[y - 1900];
    for (var i = 0x8000; i > 0x8; i >>= 1) {
      sum += (info & i) ? 1 : 0;
    }
    return sum + lunarLeapDays(y);
  }

  function solarToLunar(year, month, day) {
    // Base date: 1900-01-31 = 农历正月初一
    var base = new Date(1900, 0, 31);
    var target = new Date(year, month - 1, day);
    var offset = Math.floor((target - base) / 86400000);

    var i, lunarYear, lunarMonth, lunarDay;
    var daysInYear, leapMonth, isLeap = false;

    // Find lunar year
    for (i = 1900; i < 2101 && offset > 0; i++) {
      daysInYear = lunarYearDays(i);
      offset -= daysInYear;
    }
    if (offset < 0) {
      offset += daysInYear;
      i--;
    }
    lunarYear = i;

    leapMonth = lunarLeapYear(lunarYear);
    var isLeapYear = leapMonth > 0;

    // Find lunar month
    for (i = 1; i <= 12 && offset > 0; i++) {
      if (isLeapYear && i === leapMonth + 1 && !isLeap) {
        // Leap month
        var leapDays = lunarLeapDays(lunarYear);
        if (offset < leapDays) {
          lunarMonth = -leapMonth;
          lunarDay = offset + 1;
          isLeap = true;
          break;
        }
        offset -= leapDays;
        isLeap = true;
      }
      if (i <= 12) {
        var mDays = lunarMonthDays(lunarYear, i);
        if (offset < mDays) {
          lunarMonth = i;
          lunarDay = offset + 1;
          break;
        }
        offset -= mDays;
      }
    }
    if (i > 12) {
      lunarMonth = 12;
      lunarDay = lunarMonthDays(lunarYear, 12);
    }

    return { year: lunarYear, month: lunarMonth, day: lunarDay, isLeap: !!isLeap, leapMonth: leapMonth };
  }

  function getGanZhi(year, monthCycle) {
    var ganIdx = (year - 4) % 10;
    var zhiIdx = (year - 4) % 12;
    if (ganIdx < 0) ganIdx += 10;
    if (zhiIdx < 0) zhiIdx += 12;
    return GAN[ganIdx] + ZHI[zhiIdx];
  }

  // ─── 公共 API ─────────────────────────────────────────────

  function LunarDate(lunarYear, lunarMonth, lunarDay, solarDate) {
    this.lunarYear = lunarYear;
    this.lunarMonth = lunarMonth;
    this.lunarDay = lunarDay;
    this._solarDate = solarDate;
  }

  LunarDate.prototype.getMonthInChinese = function () {
    var m = Math.abs(this.lunarMonth);
    return LUNAR_MONTH[m - 1] + '月';
  };

  LunarDate.prototype.getDayInChinese = function () {
    return LUNAR_DAY[this.lunarDay - 1] || this.lunarDay + '日';
  };

  LunarDate.prototype.getJieQi = function () {
    var d = this._solarDate;
    return getJieQi(d.getFullYear(), d.getMonth() + 1, d.getDate());
  };

  LunarDate.prototype.getFestivals = function () {
    var result = [];
    // Lunar festivals
    for (var i = 0; i < FESTIVALS.length; i++) {
      if (FESTIVALS[i][0] === this.lunarMonth && FESTIVALS[i][1] === this.lunarDay) {
        result.push(FESTIVALS[i][2]);
      }
    }
    // Solar festivals
    var d = this._solarDate;
    var key = (d.getMonth() + 1) + '-' + d.getDate();
    if (SOLAR_FESTIVALS[key]) result.push(SOLAR_FESTIVALS[key]);
    return result;
  };

  LunarDate.prototype.getYearInGanZhi = function () {
    return getGanZhi(this.lunarYear);
  };

  LunarDate.prototype.getYearShengXiao = function () {
    var idx = (this.lunarYear - 4) % 12;
    if (idx < 0) idx += 12;
    return SHENGXIAO[idx];
  };

  // ─── Solar ─────────────────────────────────────────────

  function Solar(year, month, day) {
    this._year = year;
    this._month = month;
    this._day = day;
    this._date = new Date(year, month - 1, day);
  }

  Solar.fromDate = function (d) {
    return new Solar(d.getFullYear(), d.getMonth() + 1, d.getDate());
  };

  Solar.fromYmd = function (y, m, d) {
    return new Solar(y, m, d);
  };

  Solar.prototype.getDate = function () { return this._date; };
  Solar.prototype.getWeek = function () { return this._date.getDay(); };
  Solar.prototype.getFestivals = function () {
    var key = this._month + '-' + this._day;
    return SOLAR_FESTIVALS[key] ? [SOLAR_FESTIVALS[key]] : [];
  };

  Solar.prototype.getLunar = function () {
    var l = solarToLunar(this._year, this._month, this._day);
    return new LunarDate(l.year, l.month, l.day, this._date);
  };

  // ─── 暴露全局 ─────────────────────────────────────────────
  global.Solar = Solar;
  global.LunarDate = LunarDate;

})(typeof window !== 'undefined' ? window : this);