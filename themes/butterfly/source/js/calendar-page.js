/**
 * 万年历页面组件
 * 使用 lunar-javascript 日历库获取农历、节假日等信息
 * 文档: https://6tail.cn/calendar/api.html
 */
(function () {
    'use strict';

    const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

    class CalendarPage {
        constructor() {
            this.container = null;
            this.currentYear = new Date().getFullYear();
            this.currentMonth = new Date().getMonth() + 1;
            this.selectedDate = null;
        }

        async init() {
            this.container = document.getElementById('calendar-page-container');
            if (!this.container) return;

            this.render();
            this.renderCalendar();
            this.selectDate(this.getTodayStr());
        }

        getTodayStr() {
            const d = new Date();
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }

        render() {
            this.container.innerHTML = `
                <div class="calendar-content">
                    <div class="calendar-header">
                        <button class="cal-nav-btn" id="cal-prev-year" title="上一年"><i class="fas fa-angle-double-left"></i></button>
                        <button class="cal-nav-btn" id="cal-prev-month" title="上一月"><i class="fas fa-chevron-left"></i></button>
                        <button class="cal-today-btn" id="cal-today" title="回到今天">今天</button>
                        <button class="cal-nav-btn" id="cal-next-month" title="下一月"><i class="fas fa-chevron-right"></i></button>
                        <button class="cal-nav-btn" id="cal-next-year" title="下一年"><i class="fas fa-angle-double-right"></i></button>
                    </div>
                    <div class="calendar-main">
                        <div class="calendar-weekdays">
                            <span class="weekday" style="color:#e74c3c">日</span>
                            <span class="weekday">一</span><span class="weekday">二</span>
                            <span class="weekday">三</span><span class="weekday">四</span>
                            <span class="weekday">五</span><span class="weekday" style="color:#e74c3c">六</span>
                        </div>
                        <div class="calendar-grid" id="calendar-grid"></div>
                    </div>
                    <div class="calendar-detail" id="calendar-detail"></div>
                </div>
            `;
            this.bindEvents();
        }

        bindEvents() {
            const btns = [
                ['cal-prev-year', -12], ['cal-next-year', 12],
                ['cal-prev-month', -1], ['cal-next-month', 1]
            ];
            btns.forEach(([id, delta]) => {
                document.getElementById(id).addEventListener('click', () => this.changeMonth(delta));
            });
            document.getElementById('cal-today').addEventListener('click', () => this.goToToday());
            document.getElementById('calendar-grid').addEventListener('click', (e) => {
                const dayEl = e.target.closest('.cal-day:not(.empty)');
                dayEl && this.selectDate(dayEl.dataset.date);
            });
        }

        goToToday() {
            const d = new Date();
            this.currentYear = d.getFullYear();
            this.currentMonth = d.getMonth() + 1;
            this.selectDate(d.toISOString().split('T')[0]);
            this.renderCalendar();
        }

        changeMonth(delta) {
            this.currentMonth += delta;
            if (this.currentMonth <= 0) { this.currentMonth += 12; this.currentYear--; }
            if (this.currentMonth > 12) { this.currentMonth -= 12; this.currentYear++; }

            this.render();
            this.renderCalendar();

            const todayStr = this.getTodayStr();
            const d = new Date();
            const isCurrentMonth = this.currentYear === d.getFullYear() && this.currentMonth === d.getMonth() + 1;

            if (this.selectedDate?.startsWith(`${this.currentYear}-${String(this.currentMonth).padStart(2, '0')}`)) {
                this.selectDate(this.selectedDate);
            } else if (isCurrentMonth) {
                this.selectDate(todayStr);
            } else {
                this.selectDate(`${this.currentYear}-${String(this.currentMonth).padStart(2, '0')}-01`);
            }
        }

        selectDate(dateStr) {
            this.selectedDate = dateStr;
            document.querySelectorAll('.cal-day').forEach(el => {
                el.classList.toggle('selected', el.dataset.date === dateStr);
            });
            this.renderDetail(dateStr);
        }

        renderCalendar() {
            const grid = document.getElementById('calendar-grid');
            const d = new Date();
            const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            const firstDay = new Date(this.currentYear, this.currentMonth - 1, 1).getDay();
            const daysInMonth = new Date(this.currentYear, this.currentMonth, 0).getDate();

            let html = '<div class="cal-day empty"></div>'.repeat(firstDay);

            // 记录已显示的节假日名称（只显示该节假日在当月的第一天）
            const shownHolidays = new Set();

            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `${this.currentYear}-${String(this.currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isToday = dateStr === todayStr;
                const isWeekend = [0, 6].includes(new Date(this.currentYear, this.currentMonth - 1, day).getDay());

                const solar = Solar.fromYmd(this.currentYear, this.currentMonth, day);
                const lunar = solar.getLunar();
                const jieQi = lunar.getJieQi();
                const holiday = HolidayUtil.getHoliday(this.currentYear, this.currentMonth, day);

                // 优先级：节假日(仅第一次) > 节气 > 农历
                let subText = `${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`;
                let subClass = 'cal-lunar';

                if (holiday && !shownHolidays.has(holiday.getName())) {
                    subText = holiday.getName();
                    subClass = 'cal-holiday-name';
                    shownHolidays.add(holiday.getName());
                } else if (jieQi) {
                    subText = jieQi;
                    subClass = 'cal-jieqi-name';
                }

                let extraClass = '';
                if (isToday) extraClass += ' today';
                if (isWeekend) extraClass += ' weekend';
                if (holiday) extraClass += ' is-holiday';
                if (jieQi && !holiday) extraClass += ' is-jieqi';

                const tagHtml = holiday ? `<span class="cal-tag ${holiday.isWork() ? 'tag-workday' : 'tag-holiday'}">${holiday.isWork() ? '班' : '休'}</span>` : '';

                html += `<div class="cal-day${extraClass}" data-date="${dateStr}">${tagHtml}<span class="cal-day-num">${day}</span><span class="${subClass}">${subText}</span></div>`;
            }

            grid.innerHTML = html;
        }

        renderDetail(dateStr) {
            const detail = document.getElementById('calendar-detail');
            const [year, month, day] = dateStr.split('-').map(Number);

            const solar = Solar.fromYmd(year, month, day);
            const lunar = solar.getLunar();

            // 八字信息
            const baZi = lunar.getBaZi();
            const naYin = lunar.getBaZiNaYin();
            const jieQi = lunar.getJieQi();
            const positions = [
                ['喜神', lunar.getDayPositionXi(), lunar.getDayPositionXiDesc()],
                ['福神', lunar.getDayPositionFu(), lunar.getDayPositionFuDesc()],
                ['财神', lunar.getDayPositionCai(), lunar.getDayPositionCaiDesc()],
                ['阳贵', lunar.getDayPositionYangGui(), lunar.getDayPositionYangGuiDesc()],
                ['阴贵', lunar.getDayPositionYinGui(), lunar.getDayPositionYinGuiDesc()],
                ['胎神', lunar.getDayPositionTai(), '']
            ];

            detail.innerHTML = `
                <div class="detail-header">
                    <div class="detail-lunar-date">${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}</div>
                    <div class="detail-ganzhi">${lunar.getYearInGanZhi()}年 ${lunar.getMonthInGanZhi()}月 ${lunar.getDayInGanZhi()}日</div>
                    <div class="detail-shengxiao">${lunar.getYearShengXiao()}</div>
                </div>
                <div class="detail-info">
                    <div class="detail-row"><span class="detail-label">星期:</span><span class="detail-value">${WEEKDAYS[solar.getWeek()]}</span></div>
                    <div class="detail-row"><span class="detail-label">五行:</span><span class="detail-value">${lunar.getEightChar().getDayWuXing()}</span></div>
                    <div class="detail-row"><span class="detail-label">冲:</span><span class="detail-value">${lunar.getChong()}</span></div>
                    <div class="detail-row"><span class="detail-label">煞:</span><span class="detail-value">${lunar.getSha()}</span></div>
                    ${jieQi ? `<div class="detail-row"><span class="detail-label">节气:</span><span class="detail-value jieqi-value">${jieQi}</span></div>` : ''}
                    <div class="detail-row"><span class="detail-label">星宿:</span><span class="detail-value">${lunar.getXiu()}${lunar.getZheng()}${lunar.getAnimal()} (${lunar.getXiuLuck()})</span></div>
                    <div class="detail-row"><span class="detail-label">六曜:</span><span class="detail-value">${lunar.getLiuYao()}</span></div>
                    <div class="detail-row"><span class="detail-label">九星:</span><span class="detail-value">${lunar.getDayNineStar()}</span></div>
                </div>
                <div class="detail-bazi">
                    <div class="bazi-title">八字</div>
                    <div class="bazi-content">${baZi.join(' ')}</div>
                    <div class="bazi-na-yin">纳音: ${naYin.join(' ')}</div>
                </div>
                <div class="detail-positions">
                    ${positions.map(([label, value, desc]) => `<div class="position-item"><span class="pos-label">${label}</span><span class="pos-value">${value} ${desc}</span></div>`).join('')}
                </div>
                <div class="detail-pengzu">
                    <span class="detail-label">彭祖百忌:</span>
                    <span class="detail-value">${lunar.getPengZuGan()} ${lunar.getPengZuZhi()}</span>
                </div>
                <div class="detail-yi-ji">
                    <div class="yi-section"><div class="section-title">宜</div><div class="section-content">${lunar.getDayYi().join(' ')}</div></div>
                    <div class="ji-section"><div class="section-title">忌</div><div class="section-content">${lunar.getDayJi().join(' ')}</div></div>
                </div>
                <div class="detail-footer">
                    <div class="detail-row"><span class="detail-label">吉神:</span><span class="detail-value">${lunar.getDayJiShen()}</span></div>
                    <div class="detail-row"><span class="detail-label">凶神:</span><span class="detail-value">${lunar.getDayXiongSha()}</span></div>
                </div>
            `;
        }
    }

    document.readyState === 'loading'
        ? document.addEventListener('DOMContentLoaded', () => new CalendarPage().init())
        : new CalendarPage().init();
})();
