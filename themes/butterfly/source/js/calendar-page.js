/**
 * 万年历页面组件
 * 使用 lunar-javascript 日历库获取农历、节假日等信息
 * 文档: https://6tail.cn/calendar/api.html
 */
(function () {
    'use strict';

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
            // 默认选中今天
            this.selectDate(this.getTodayStr());
        }

        getTodayStr() {
            const today = new Date();
            return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
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
                            <span class="cal-month">${this.currentMonth}月</span>
                        </div>
                        <button class="cal-nav-btn" id="cal-next-month" title="下一月">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                        <button class="cal-nav-btn" id="cal-next-year" title="下一年">
                            <i class="fas fa-angle-double-right"></i>
                        </button>
                    </div>
                    <div class="calendar-main">
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
                    </div>
                    <div class="calendar-detail" id="calendar-detail"></div>
                </div>
            `;

            this.bindEvents();
        }

        bindEvents() {
            document.getElementById('cal-prev-year').addEventListener('click', () => this.changeMonth(-12));
            document.getElementById('cal-next-year').addEventListener('click', () => this.changeMonth(12));
            document.getElementById('cal-prev-month').addEventListener('click', () => this.changeMonth(-1));
            document.getElementById('cal-next-month').addEventListener('click', () => this.changeMonth(1));

            // 日期点击事件
            document.getElementById('calendar-grid').addEventListener('click', (e) => {
                const dayEl = e.target.closest('.cal-day:not(.empty)');
                if (dayEl) {
                    this.selectDate(dayEl.dataset.date);
                }
            });
        }

        changeMonth(delta) {
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
            this.renderCalendar();
            // 保持选中日期
            const todayStr = this.getTodayStr();
            if (this.selectedDate && this.selectedDate.startsWith(`${this.currentYear}-${String(this.currentMonth).padStart(2, '0')}`)) {
                this.selectDate(this.selectedDate);
            } else if (this.selectedDate !== todayStr) {
                this.selectDate(todayStr);
            }
        }

        selectDate(dateStr) {
            this.selectedDate = dateStr;
            // 更新选中状态
            document.querySelectorAll('.cal-day').forEach(el => {
                el.classList.toggle('selected', el.dataset.date === dateStr);
            });
            // 显示详情
            this.renderDetail(dateStr);
        }

        renderCalendar() {
            const grid = document.getElementById('calendar-grid');
            const today = new Date();
            const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

            const firstDay = new Date(this.currentYear, this.currentMonth - 1, 1).getDay();
            const daysInMonth = new Date(this.currentYear, this.currentMonth, 0).getDate();

            let html = '';

            // 填充空白格子
            for (let i = 0; i < firstDay; i++) {
                html += '<div class="cal-day empty"></div>';
            }

            // 填充日期格子
            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `${this.currentYear}-${String(this.currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isToday = dateStr === todayStr;
                const dayOfWeek = new Date(this.currentYear, this.currentMonth - 1, day).getDay();
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                // 使用 lunar-javascript API 获取数据
                const solar = Solar.fromYmd(this.currentYear, this.currentMonth, day);
                const lunar = solar.getLunar();

                // 农历日期显示
                const lunarStr = lunar.getMonthInChinese() + '月' + lunar.getDayInChinese();

                // 节假日标签
                let holidayTag = '';
                let tagClass = '';

                const holiday = HolidayUtil.getHoliday(this.currentYear, this.currentMonth, day);
                if (holiday) {
                    if (holiday.isWork()) {
                        holidayTag = '班';
                        tagClass = 'tag-workday';
                    } else {
                        holidayTag = '休';
                        tagClass = 'tag-holiday';
                    }
                }

                let extraClass = '';
                if (isToday) extraClass += ' today';
                if (isWeekend) extraClass += ' weekend';
                if (holidayTag) extraClass += ' has-tag';

                html += `
                    <div class="cal-day${extraClass}" data-date="${dateStr}">
                        <span class="cal-day-num">${day}</span>
                        ${holidayTag ? `<span class="cal-tag ${tagClass}">${holidayTag}</span>` : `<span class="cal-lunar">${lunarStr}</span>`}
                    </div>
                `;
            }

            grid.innerHTML = html;
        }

        renderDetail(dateStr) {
            const detail = document.getElementById('calendar-detail');
            const [year, month, day] = dateStr.split('-').map(Number);

            const solar = Solar.fromYmd(year, month, day);
            const lunar = solar.getLunar();
            const weekDay = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][solar.getWeek()];

            // 获取详情信息
            const lunarDate = lunar.getMonthInChinese() + '月' + lunar.getDayInChinese();
            const ganZhi = lunar.getYearInGanZhi() + '年 ' + lunar.getMonthInGanZhi() + '月 ' + lunar.getDayInGanZhi() + '日';
            const week = weekDay;
            const wuXing = lunar.getEightChar().getDayWuXing();

            // 八字
            const baZi = lunar.getBaZi();
            const baZiStr = baZi.join(' ');

            // 纳音五行
            const baZiNaYin = lunar.getBaZiNaYin();
            const naYinStr = baZiNaYin.join(' ');

            // 节气信息
            const jieQi = lunar.getJieQi() || '';
            const jieQiRow = jieQi ? `
                <div class="detail-row">
                    <span class="detail-label">节气:</span>
                    <span class="detail-value jieqi-value">${jieQi}</span>
                </div>
            ` : '';

            // 二十八星宿
            const xiu = lunar.getXiu();
            const xiuLuck = lunar.getXiuLuck();
            const xiuZheng = lunar.getZheng();
            const xiuAnimal = lunar.getAnimal();

            // 六曜
            const liuYao = lunar.getLiuYao();

            // 每日九星
            const nineStar = lunar.getDayNineStar().toString();

            // 吉神凶煞
            const jiShen = lunar.getDayJiShen();
            const xiongSha = lunar.getDayXiongSha();

            // 彭祖百忌
            const pengZu = lunar.getPengZuGan() + ' ' + lunar.getPengZuZhi();

            // 生肖
            const shengXiao = lunar.getYearShengXiao();

            // 煞方
            const sha = lunar.getSha();

            detail.innerHTML = `
                <div class="detail-header">
                    <div class="detail-lunar-date">${lunarDate}</div>
                    <div class="detail-ganzhi">${ganZhi}</div>
                    <div class="detail-shengxiao">${shengXiao}</div>
                </div>
                <div class="detail-info">
                    <div class="detail-row">
                        <span class="detail-label">星期:</span>
                        <span class="detail-value">${week}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">五行:</span>
                        <span class="detail-value">${wuXing}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">冲:</span>
                        <span class="detail-value">${lunar.getChong()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">煞:</span>
                        <span class="detail-value">${sha}</span>
                    </div>
                    ${jieQiRow}
                    <div class="detail-row">
                        <span class="detail-label">星宿:</span>
                        <span class="detail-value">${xiu}${xiuZheng}${xiuAnimal} (${xiuLuck})</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">六曜:</span>
                        <span class="detail-value">${liuYao}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">九星:</span>
                        <span class="detail-value">${nineStar}</span>
                    </div>
                </div>
                <div class="detail-bazi">
                    <div class="bazi-title">八字</div>
                    <div class="bazi-content">${baZiStr}</div>
                    <div class="bazi-na-yin">纳音: ${naYinStr}</div>
                </div>
                <div class="detail-positions">
                    <div class="position-item">
                        <span class="pos-label">喜神</span>
                        <span class="pos-value">${lunar.getDayPositionXi()} ${lunar.getDayPositionXiDesc()}</span>
                    </div>
                    <div class="position-item">
                        <span class="pos-label">福神</span>
                        <span class="pos-value">${lunar.getDayPositionFu()} ${lunar.getDayPositionFuDesc()}</span>
                    </div>
                    <div class="position-item">
                        <span class="pos-label">财神</span>
                        <span class="pos-value">${lunar.getDayPositionCai()} ${lunar.getDayPositionCaiDesc()}</span>
                    </div>
                    <div class="position-item">
                        <span class="pos-label">阳贵</span>
                        <span class="pos-value">${lunar.getDayPositionYangGui()} ${lunar.getDayPositionYangGuiDesc()}</span>
                    </div>
                    <div class="position-item">
                        <span class="pos-label">阴贵</span>
                        <span class="pos-value">${lunar.getDayPositionYinGui()} ${lunar.getDayPositionYinGuiDesc()}</span>
                    </div>
                    <div class="position-item">
                        <span class="pos-label">胎神</span>
                        <span class="pos-value">${lunar.getDayPositionTai()}</span>
                    </div>
                </div>
                <div class="detail-pengzu">
                    <span class="detail-label">彭祖百忌:</span>
                    <span class="detail-value">${pengZu}</span>
                </div>
                <div class="detail-yi-ji">
                    <div class="yi-section">
                        <div class="section-title">宜</div>
                        <div class="section-content">${lunar.getDayYi().join(' ')}</div>
                    </div>
                    <div class="ji-section">
                        <div class="section-title">忌</div>
                        <div class="section-content">${lunar.getDayJi().join(' ')}</div>
                    </div>
                </div>
                <div class="detail-footer">
                    <div class="detail-row">
                        <span class="detail-label">吉神:</span>
                        <span class="detail-value">${jiShen}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">凶神:</span>
                        <span class="detail-value">${xiongSha}</span>
                    </div>
                </div>
            `;
        }
    }

    document.readyState === 'loading'
        ? document.addEventListener('DOMContentLoaded', () => new CalendarPage().init())
        : new CalendarPage().init();
})();
