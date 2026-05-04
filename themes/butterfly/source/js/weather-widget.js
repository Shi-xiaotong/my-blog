/**
 * 天气侧边栏小组件
 */
(function () {
    'use strict';

    class WeatherWidget {
        constructor() {
            this.container = document.getElementById('weather-aside-container');
        }

        async init() {
            if (!this.container) return;

            try {
                await WeatherStore.init();
                const data = await WeatherStore.getData();
                const location = await WeatherStore.getLocationInfo();

                data?.current ? this.render(data, location) : this.renderError();
            } catch (e) {
                this.renderError();
            }
        }

        render(data, location) {
            const { current, daily } = data;
            const { city = '未知' } = location ?? {};

            this.container.innerHTML = `
                <div class="weather-content">
                    <div class="weather-current">
                        <span class="weather-city"><i class="fas fa-map-marker-alt"></i>${city}</span>
                        <div class="weather-main-row">
                            <span class="weather-icon-lg">${WeatherStore.getWeatherIcon(current.weather_code)}</span>
                            <span class="weather-temp-lg">${Math.round(current.temperature_2m)}°</span>
                            <span class="weather-desc">${WeatherStore.getWeatherText(current.weather_code)}</span>
                        </div>
                        <div class="weather-temp-range">
                            ${Math.round(daily.temperature_2m_min[0])}° ~ ${Math.round(daily.temperature_2m_max[0])}°
                        </div>
                    </div>
                </div>
            `;
        }

        renderError() {
            if (!this.container) return;
            this.container.innerHTML = `
                <div class="weather-error">
                    <i class="fas fa-cloud-rain"></i>
                    <span>天气加载失败</span>
                </div>
            `;
        }
    }

    const initWidget = () => new WeatherWidget().init();

    // PJAX 导航后重新初始化
    typeof btf?.addGlobalFn === 'function' && btf.addGlobalFn('pjaxComplete', initWidget, 'weatherWidget');

    initWidget();
})();
