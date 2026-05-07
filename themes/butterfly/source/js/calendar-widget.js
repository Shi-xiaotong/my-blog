/**
 * 日历侧边栏小组件
 * 使用 lunar-javascript 库获取农历、节气、节日等信息
 */
(function () {
    'use strict';

    const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

    class CalendarWidget {
        constructor() {
            this.container = document.getElementById('calendar-aside-container');
        }

        init() {
            if (!this.container) return;
            this.render();
        }

        getLunarInfo(date) {
            if (typeof Solar === 'undefined') return null;
            try {
                const solar = Solar.fromDate(date);
                const lunar = solar.getLunar();
                return {
                    lunarStr: `${lunar.getMonthInChinese()}${lunar.getDayInChinese()}`,
                    jieQi: lunar.getJieQi(),
                    festivals: [...(lunar.getFestivals() || []), ...(solar.getFestivals() || [])]
                };
            } catch (e) {
                return null;
            }
        }

        getDayOfYear(date) {
            const start = new Date(date.getFullYear(), 0, 0);
            return Math.ceil((date - start) / 86400000);
        }

        getWeekOfYear(date) {
            const start = new Date(date.getFullYear(), 0, 1);
            return Math.ceil(((date - start) / 86400000 + start.getDay() + 1) / 7);
        }

        getUpcomingHolidays(today) {
            const holidays = [];
            const seen = new Set();

            for (let i = 1; i <= 365; i++) {
                const futureDate = new Date(today);
                futureDate.setDate(today.getDate() + i);

                const info = this.getLunarInfo(futureDate);
                if (!info) continue;

                // 节假日
                const holiday = HolidayUtil?.getHoliday(
                    futureDate.getFullYear(),
                    futureDate.getMonth() + 1,
                    futureDate.getDate()
                );
                if (holiday && !seen.has(holiday.getName())) {
                    seen.add(holiday.getName());
                    holidays.push({ name: holiday.getName(), diff: i });
                }

                // 农历节日
                info.festivals.forEach(f => {
                    if (!seen.has(f)) {
                        seen.add(f);
                        holidays.push({ name: f, diff: i });
                    }
                });

                // 节气
                if (info.jieQi && !seen.has(info.jieQi)) {
                    seen.add(info.jieQi);
                    holidays.push({ name: info.jieQi, diff: i });
                }
            }

            return holidays.sort((a, b) => a.diff - b.diff).slice(0, 5);
        }

        render() {
            const now = new Date();
            const info = this.getLunarInfo(now);

            // 优先级：节假日 > 农历节日 > 节气
            let holidayDesc = '';
            if (info?.festivals?.[0]) {
                holidayDesc = info.festivals[0];
            } else if (info?.jieQi) {
                holidayDesc = info.jieQi;
            }

            const upcoming = this.getUpcomingHolidays(now);

            this.container.innerHTML = `
                <div class="date-card">
                    <div class="date-ymd">
                        <span class="date-year">${now.getFullYear()}年</span>
                        <span class="date-month">${now.getMonth() + 1}月</span>
                        <span class="date-day-num">${now.getDate()}日</span>
                        <span class="date-weekday">${WEEKDAYS[now.getDay()]}</span>
                    </div>
                    <div class="date-lunar">${info?.lunarStr || ''}</div>
                    <div class="date-day-info">第${this.getDayOfYear(now)}天 · 第${this.getWeekOfYear(now)}周</div>
                    ${holidayDesc ? `<div class="date-holiday">${holidayDesc}</div>` : ''}
                </div>
                <div class="holiday-list">
                    ${upcoming.map(h => `
                        <div class="holiday-item">
                            <span class="holiday-name">${h.name}</span>
                            <span class="holiday-info"><span class="holiday-days-remaining"><span class="holiday-num">${h.diff}</span>天后</span></span>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }

    const initWidget = () => new CalendarWidget().init();
    typeof btf?.addGlobalFn === 'function' && btf.addGlobalFn('pjaxComplete', initWidget, 'calendarWidget');
    initWidget();
})();
