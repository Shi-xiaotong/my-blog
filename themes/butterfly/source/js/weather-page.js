/**
 * 天气页面组件
 */
(function () {
    'use strict';

    class WeatherPage {
        constructor() {
            this.container = null;
        }

        async init() {
            this.container = document.getElementById('weather-page-container');
            if (!this.container) return;

            await WeatherStore.init();

            const data = await WeatherStore.getData();
            const location = await WeatherStore.getLocationInfo();

            if (data) {
                this.render(data, location);
                WeatherStore.startAutoUpdate();
            } else {
                this.renderError();
            }
        }

        render(data, location) {
            const { current, daily, hourly } = data;
            const icon = WeatherStore.getWeatherIcon(current.weather_code);
            const text = WeatherStore.getWeatherText(current.weather_code);

            // 获取当前小时索引
            const now = new Date();
            const currentHour = now.getHours();
            let hourIdx = hourly.time.findIndex(t => {
                const d = new Date(t);
                return d.getHours() === currentHour && d.getDate() === now.getDate();
            });
            if (hourIdx === -1) hourIdx = 0;

            // 逐小时预报（24小时）
            let hourlyHTML = '';
            for (let i = 0; i < 24; i++) {
                const idx = hourIdx + i;
                if (idx >= hourly.time.length) break;
                const time = new Date(hourly.time[idx]);
                const hourStr = String(time.getHours()).padStart(2, '0') + ':00';
                const pop = hourly.precipitation_probability?.[idx] ?? 0;
                hourlyHTML += `
                    <div class="hourly-card">
                        <span class="hourly-time">${hourStr}</span>
                        <span class="hourly-icon">${WeatherStore.getWeatherIcon(hourly.weather_code[idx])}</span>
                        <span class="hourly-temp">${Math.round(hourly.temperature_2m[idx])}°</span>
                        ${pop > 5 ? `<span class="hourly-pop">${pop}%</span>` : ''}
                    </div>
                `;
            }

            // 7日预报
            let dailyHTML = '';
            const dayNames = ['今天', '明天', '后天', '日', '一', '二', '三', '四', '五', '六'];

            for (let i = 0; i < daily.time.length; i++) {
                const date = new Date(daily.time[i]);
                const dayName = i < 3 ? dayNames[i] : '周' + dayNames[date.getDay() + 3];
                const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
                const sunrise = new Date(daily.sunrise[i]).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
                const sunset = new Date(daily.sunset[i]).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
                const uvInfo = WeatherStore.getUVLevel(daily.uv_index_max[i]);
                const pop = daily.precipitation_probability_max?.[i] ?? 0;

                dailyHTML += `
                    <div class="daily-row">
                        <div class="daily-date-col">
                            <span class="daily-day">${dayName}</span>
                            <span class="daily-date">${dateStr}</span>
                        </div>
                        <div class="daily-weather-col">
                            <span class="daily-icon">${WeatherStore.getWeatherIcon(daily.weather_code[i])}</span>
                            <span class="daily-text">${WeatherStore.getWeatherText(daily.weather_code[i])}</span>
                        </div>
                        <div class="daily-temp-col">
                            <span class="daily-temp">${Math.round(daily.temperature_2m_min[i])}°</span>
                            <div class="daily-temp-bar">
                                <div class="daily-temp-fill" style="width: ${((daily.temperature_2m_max[i] - daily.temperature_2m_min[i]) / 40) * 100}%"></div>
                            </div>
                            <span class="daily-temp">${Math.round(daily.temperature_2m_max[i])}°</span>
                        </div>
                        <div class="daily-info-col">
                            <span><i class="fas fa-cloud-sun"></i>${sunrise}</span>
                            <span><i class="fas fa-cloud-moon"></i>${sunset}</span>
                            <span style="color:${uvInfo.color}"><i class="fas fa-sun"></i>${uvInfo.text}</span>
                            ${pop > 5 ? `<span><i class="fas fa-tint"></i>${pop}%</span>` : ''}
                        </div>
                    </div>
                `;
            }

            // 当前详情
            const details = [
                { label: '体感', value: `${Math.round(current.apparent_temperature ?? current.temperature_2m)}°` },
                { label: '湿度', value: `${current.relative_humidity_2m ?? 0}%` },
                { label: '气压', value: `${Math.round(current.surface_pressure ?? 0)}hPa` },
                { label: '风速', value: `${current.wind_speed_10m.toFixed(1)}m/s ${WeatherStore.getWindDirection(current.wind_direction_10m ?? 0)}` },
                { label: '紫外线', value: WeatherStore.getUVLevel(current.uv_index ?? 0).text, color: WeatherStore.getUVLevel(current.uv_index ?? 0).color }
            ];

            const detailsHTML = details.map(d =>
                `<div class="detail-row">
                    <span class="detail-label">${d.label}</span>
                    <span class="detail-value"${d.color ? ` style="color:${d.color}"` : ''}>${d.value}</span>
                </div>`
            ).join('');

            this.container.innerHTML = `
                <div class="weather-page-content">
                    <div class="weather-current-page">
                        <div class="current-location">
                            <i class="fas fa-map-marker-alt"></i>${location?.city ?? '未知'}
                        </div>
                        <div class="current-main">
                            <span class="current-icon-lg">${icon}</span>
                            <span class="current-temp-lg">${Math.round(current.temperature_2m)}°</span>
                            <span class="current-desc">${text}</span>
                        </div>
                        <div class="current-details">${detailsHTML}</div>
                    </div>
                    <div class="weather-section">
                        <h3 class="section-title"><i class="fas fa-clock"></i>逐小时预报</h3>
                        <div class="hourly-grid">${hourlyHTML}</div>
                    </div>
                    <div class="weather-section">
                        <h3 class="section-title"><i class="fas fa-calendar-alt"></i>7日预报</h3>
                        <div class="daily-list">${dailyHTML}</div>
                    </div>
                </div>
            `;
        }

        renderError() {
            if (!this.container) return;
            this.container.innerHTML = `
                <div class="weather-error-page">
                    <i class="fas fa-cloud-rain"></i>
                    <span>天气加载失败</span>
                    <button onclick="location.reload()">重试</button>
                </div>
            `;
        }
    }

    document.readyState === 'loading'
        ? document.addEventListener('DOMContentLoaded', () => new WeatherPage().init())
        : new WeatherPage().init();
})();
