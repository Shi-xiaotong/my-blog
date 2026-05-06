/**
 * 万年历页面组件
 * 使用公开API获取节假日和农历信息
 */
(function () {
    'use strict';

    class CalendarPage {
        constructor() {
            this.container = null;
            this.currentYear = new Date().getFullYear();
            this.currentMonth = new Date().getMonth() + 1;
            this.holidayCache = {};
        }

        async init() {
            this.container = document.getElementById('calendar-page-container');
            if (!this.container) return;

            this.render();
            await this.loadMonthData();
        }

        // 农历数据
        lunarMonths = [0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
            0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
            0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
            0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
            0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
            0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,
            0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
            0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,
            0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
            0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0,
            0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
            0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
            0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
            0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
            0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
            0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0,
            0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4,
            0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0,
            0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160,
            0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252,
            0x0d520];

        Gan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
        Zhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
        ShouXing = ['摩羯', '水瓶', '双鱼', '白羊', '金牛', '双子', '巨蟹', '狮子', '处女', '天秤', '天蝎', '射手'];
        monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

        // 获取农历日期字符串
        getLunarDate(year, month, day) {
            // 计算从1921年春节到目标日期的天数
            let offset = 0;
            for (let y = 1921; y < year; y++) {
                offset += this.isLeapYear(y) ? 366 : 365;
            }

            // 加上当年春节到目标月份的天数（简化计算）
            const lunarYearData = this.lunarMonths[year - 1921];
            const leapMonth = (lunarYearData >> 13) & 0xf;

            for (let m = 1; m < month; m++) {
                let days = this.getLunarMonthDays(lunarYearData, m, leapMonth);
                offset += days;
            }
            offset += day;

            // 转换offset为农历日期（简化算法）
            const lunarDate = this.offsetToLunar(offset, year);
            return lunarDate;
        }

        isLeapYear(year) {
            return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
        }

        getLunarMonthDays(lunarYearData, month, leapMonth) {
            const bit = 1 << (month - 1);
            if (month === leapMonth) {
                return (lunarYearData >> 12) & 1 ? 30 : 29;
            }
            return lunarYearData & bit ? 30 : 29;
        }

        offsetToLunar(offset, year) {
            // 简化算法：根据offset估算农历日期
            const lunarData = this.lunarMonths[year - 1921] || 0;
            const leapMonth = (lunarData >> 13) & 0xf;

            let lunarMonth = 1;
            let lunarDay = 1;
            let remaining = offset;

            // 粗略估算
            const avgMonthDays = 29.5;
            lunarMonth = Math.min(Math.floor(remaining / avgMonthDays) + 1, 12);
            remaining = offset - Math.floor((lunarMonth - 1) * avgMonthDays);
            lunarDay = Math.min(Math.floor(remaining) + 1, 30);

            // 转换为中文
            return {
                month: this.toLunarMonth(lunarMonth),
                day: this.toLunarDay(lunarDay),
                isLeap: false
            };
        }

        toLunarMonth(month) {
            const names = ['', '正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月'];
            return names[month] || `${month}月`;
        }

        toLunarDay(day) {
            const names = ['', '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
                '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
                '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];
            return names[day] || `${day}`;
        }

        getYearGanZhi(year) {
            return this.Gan[(year - 4) % 10] + this.Zhi[(year - 4) % 12];
        }

        getConstellation(month, day) {
            const thresholds = [20, 19, 21, 20, 21, 22, 23, 23, 23, 24, 23, 22];
            const idx = day < thresholds[month - 1] ? month - 2 : month - 1;
            return this.ShouXing[(idx + 12) % 12];
        }

        render() {
            this.container.innerHTML = `
                <div class="calendar-content">
                    <div class="calendar-header">
                        <button class="cal-nav-btn" id="cal-prev-year" title="上一年">
                            <i class="fas fa-angle-double-left"></i>
                        </button>
                        <button class="cal-nav-btn" id="cal-prev-month" title="上一月">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <div class="cal-title">
                            <span class="cal-year">${this.currentYear}</span>
                            <span class="cal-month">${this.monthNames[this.currentMonth - 1]}</span>
                        </div>
                        <button class="cal-nav-btn" id="cal-next-month" title="下一月">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                        <button class="cal-nav-btn" id="cal-next-year" title="下一年">
                            <i class="fas fa-angle-double-right"></i>
                        </button>
                    </div>
                    <div class="calendar-today-bar">
                        <button class="cal-today-btn" id="cal-today">
                            <i class="fas fa-bullseye"></i> 今天
                        </button>
                        <span class="cal-current-info" id="cal-current-info"></span>
                    </div>
                    <div class="calendar-weekdays">
                        <span class="weekday" style="color:#e74c3c">日</span>
                        <span class="weekday">一</span>
                        <span class="weekday">二</span>
                        <span class="weekday">三</span>
                        <span class="weekday">四</span>
                        <span class="weekday">五</span>
                        <span class="weekday" style="color:#e74c3c">六</span>
                    </div>
                    <div class="calendar-grid" id="calendar-grid"></div>
                    <div class="calendar-holidays" id="calendar-holidays">
                        <h3><i class="fas fa-star"></i> 本月节假日</h3>
                        <div class="holiday-list" id="holiday-list"></div>
                    </div>
                </div>
            `;

            this.bindEvents();
        }

        bindEvents() {
            document.getElementById('cal-prev-year').addEventListener('click', () => this.changeMonth(-12));
            document.getElementById('cal-next-year').addEventListener('click', () => this.changeMonth(12));
            document.getElementById('cal-prev-month').addEventListener('click', () => this.changeMonth(-1));
            document.getElementById('cal-next-month').addEventListener('click', () => this.changeMonth(1));
            document.getElementById('cal-today').addEventListener('click', () => this.goToToday());
        }

        async changeMonth(delta) {
            this.currentMonth += delta;
            while (this.currentMonth <= 0) {
                this.currentMonth += 12;
                this.currentYear--;
            }
            while (this.currentMonth > 12) {
                this.currentMonth -= 12;
                this.currentYear++;
            }
            this.render();
            await this.loadMonthData();
        }

        goToToday() {
            const today = new Date();
            this.currentYear = today.getFullYear();
            this.currentMonth = today.getMonth() + 1;
            this.render();
            this.loadMonthData();
        }

        async loadMonthData() {
            try {
                const holidays = await this.fetchHolidays(this.currentYear);
                this.renderCalendar(holidays);
            } catch (error) {
                console.error('加载数据失败:', error);
                this.renderCalendar({});
            }
        }

        async fetchHolidays(year) {
            const cacheKey = `${year}`;
            if (this.holidayCache[cacheKey]) {
                return this.holidayCache[cacheKey];
            }

            try {
                const response = await fetch(`https://timor.tech/api/holiday/year/${year}/`);
                const data = await response.json();
                if (data.code === 0) {
                    this.holidayCache[cacheKey] = data.holiday;
                    return data.holiday;
                }
            } catch (e) {
                console.warn('节假日API请求失败');
            }
            this.holidayCache[cacheKey] = {};
            return {};
        }

        renderCalendar(holidays) {
            const grid = document.getElementById('calendar-grid');
            const today = new Date();
            const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

            const firstDay = new Date(this.currentYear, this.currentMonth - 1, 1).getDay();
            const daysInMonth = new Date(this.currentYear, this.currentMonth, 0).getDate();

            let html = '';
            for (let i = 0; i < firstDay; i++) {
                html += '<div class="cal-day empty"></div>';
            }

            // 节假日字典
            const holidayDict = {
                '01-01': '元旦', '02-14': '情人节', '03-08': '妇女节', '03-12': '植树节',
                '04-01': '愚人节', '04-05': '清明', '05-01': '劳动节', '05-04': '青年节',
                '06-01': '儿童节', '06-18': '端午节', '07-01': '建党节', '08-01': '建军节',
                '09-10': '教师节', '10-01': '国庆', '10-31': '万圣节', '12-24': '平安夜', '12-25': '圣诞节'
            };

            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `${this.currentYear}-${String(this.currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dateKey = `${String(this.currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isToday = dateStr === todayStr;
                const dayOfWeek = new Date(this.currentYear, this.currentMonth - 1, day).getDay();
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                // 检查节假日API数据
                const apiHoliday = holidays[dateStr];
                const isHoliday = apiHoliday?.holiday || holidayDict[dateKey];
                const holidayName = apiHoliday?.name || holidayDict[dateKey] || '';

                // 获取农历日期
                const lunarDate = this.getLunarDate(this.currentYear, this.currentMonth, day);
                const lunarStr = `${lunarDate.month.replace('月', '')}${lunarDate.day}`;

                let extraClass = '';
                if (isToday) extraClass += ' today';
                if (isWeekend) extraClass += ' weekend';
                if (isHoliday) extraClass += ' holiday';

                html += `
                    <div class="cal-day${extraClass}" data-date="${dateStr}">
                        <span class="cal-day-num">${day}</span>
                        <span class="cal-lunar">${lunarStr}</span>
                        ${holidayName ? `<span class="cal-holiday-tag">${holidayName}</span>` : ''}
                    </div>
                `;
            }

            grid.innerHTML = html;

            // 更新当前日期信息
            const infoEl = document.getElementById('cal-current-info');
            const ganZhi = this.getYearGanZhi(this.currentYear);
            const constellation = this.getConstellation(today.getMonth() + 1, today.getDate());
            infoEl.innerHTML = `<span>${ganZhi}年 · ${constellation}</span>`;

            // 渲染节假日列表
            this.renderHolidayList(holidays);
        }

        renderHolidayList(holidays) {
            const listEl = document.getElementById('holiday-list');
            const monthPrefix = `${this.currentYear}-${String(this.currentMonth).padStart(2, '0')}-`;

            const holidaysInMonth = Object.entries(holidays)
                .filter(([date, info]) => date.startsWith(monthPrefix) && info.holiday && info.name)
                .map(([date, info]) => ({ date, ...info }))
                .sort((a, b) => a.date.localeCompare(b.date));

            if (holidaysInMonth.length === 0) {
                listEl.innerHTML = '<div class="no-holidays">本月暂无法定节假日</div>';
                return;
            }

            listEl.innerHTML = holidaysInMonth.map(h => {
                const dateObj = new Date(h.date);
                const dateStr = `${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
                return `<div class="holiday-item"><span class="holiday-date">${dateStr}</span><span class="holiday-name">${h.name}</span></div>`;
            }).join('');
        }
    }

    document.readyState === 'loading'
        ? document.addEventListener('DOMContentLoaded', () => new CalendarPage().init())
        : new CalendarPage().init();
})();
