(function () {
    'use strict';

    // API 配置（硬编码）
    const API = {
        // IP 定位 API：ip-api.com（免费，无需注册）
        location: 'http://ip-api.com/json?lang=zh-CN&fields=lat,lon,city,regionName,status',
        // 天气 API：Open-Meteo（免费，无需注册）
        weather: 'https://api.open-meteo.com/v1/forecast'
    };

    class WeatherWidget {
        constructor() {
            this.location = null;
            this.updateInterval = 30 * 60 * 1000; // 30分钟更新一次
            this.container = null;
        }

        // 从 DOM 读取默认位置配置
        loadConfig() {
            const container = document.getElementById('weather-aside-container');
            if (!container) return null;

            return {
                region: container.dataset.defaultProvince || '',
                city: container.dataset.defaultCity || '北京',
                lat: parseFloat(container.dataset.defaultLat) || 39.9042,
                lon: parseFloat(container.dataset.defaultLon) || 116.4074
            };
        }

        async init() {
            this.container = document.getElementById('weather-aside-container');
            if (!this.container) return;

            // 先获取位置
            await this.getLocation();
            // 再获取天气
            await this.fetchAndRender();
            this.startAutoUpdate();
        }

        // 通过 IP 获取位置
        async getLocation() {
            const defaultLocation = this.loadConfig();

            try {
                const response = await fetch(API.location);
                const data = await response.json();

                // ip-api.com 返回格式: { status, city, regionName, lat, lon }
                if (data.status === 'success') {
                    this.location = {
                        region: data.regionName || '',  // 省/州
                        city: data.city || '',          // 市
                        lat: data.lat,
                        lon: data.lon
                    };
                    return;
                }
                throw new Error('IP定位失败');
            } catch (error) {
                console.warn('IP定位失败，使用默认位置:', error);
                this.location = defaultLocation;
            }
        }

        async fetchAndRender() {
            if (!this.location) return;
            try {
                const weather = await this.getWeather(this.location.lat, this.location.lon);
                this.render(weather);
            } catch (error) {
                console.error('天气加载失败:', error);
                this.renderError();
            }
        }

        async getWeather(lat, lon) {
            const params = new URLSearchParams({
                latitude: lat,
                longitude: lon,
                current: 'temperature_2m,weather_code,wind_speed_10m',
                daily: 'weather_code,temperature_2m_max,temperature_2m_min',
                timezone: 'Asia/Shanghai',
                forecast_days: 4
            });

            const response = await fetch(`${API.weather}?${params}`);
            return await response.json();
        }

        getWeatherIcon(code) {
            const icons = {
                0: '☀️',   // 晴
                1: '🌤️', 2: '⛅', 3: '☁️', // 多云
                45: '🌫️', 48: '🌫️', // 雾
                51: '🌧️', 53: '🌧️', 55: '🌧️', // 毛毛雨
                61: '🌧️', 63: '🌧️', 65: '🌧️', // 雨
                71: '🌨️', 73: '🌨️', 75: '🌨️', // 雪
                80: '🌦️', 81: '🌦️', 82: '🌦️', // 阵雨
                95: '⛈️', 96: '⛈️', 99: '⛈️'  // 雷暴
            };
            return icons[code] || '🌡️';
        }

        getWeatherText(code) {
            const texts = {
                0: '晴',
                1: '晴间多云', 2: '多云', 3: '阴',
                45: '雾', 48: '雾凇',
                51: '小毛毛雨', 53: '中毛毛雨', 55: '大毛毛雨',
                61: '小雨', 63: '中雨', 65: '大雨',
                71: '小雪', 73: '中雪', 75: '大雪',
                80: '小阵雨', 81: '中阵雨', 82: '大阵雨',
                95: '雷暴', 96: '雷暴+冰雹', 99: '雷暴+大雨'
            };
            return texts[code] || '未知';
        }

        render(data) {
            const current = data.current;
            const daily = data.daily;
            const icon = this.getWeatherIcon(current.weather_code);
            const text = this.getWeatherText(current.weather_code);

            // 预报只显示后3天
            let forecastHTML = '';
            for (let i = 1; i < Math.min(daily.time.length, 4); i++) {
                const date = new Date(daily.time[i]);
                const dayName = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()];
                forecastHTML += `
          <div class="weather-day">
            <span class="day-name">周${dayName}</span>
            <span class="day-icon">${this.getWeatherIcon(daily.weather_code[i])}</span>
            <span class="day-temp">${Math.round(daily.temperature_2m_min[i])}° ~ ${Math.round(daily.temperature_2m_max[i])}°</span>
          </div>
        `;
            }

            // 位置显示：省 市
            const locationText = [this.location.region, this.location.city].filter(Boolean).join(' ');

            this.container.innerHTML = `
        <div class="weather-content">
          <div class="weather-current">
            <span class="weather-city"><i class="fas fa-map-marker-alt"></i>${locationText || this.location.region || this.location.city || '未知'}</span>
            <div class="weather-main-row">
              <span class="weather-icon-lg">${icon}</span>
              <span class="weather-temp-lg">${Math.round(current.temperature_2m)}°</span>
              <span class="weather-desc">${text}</span>
            </div>
          </div>
          <div class="weather-forecast-compact">
            ${forecastHTML}
          </div>
        </div>
      `;
        }

        renderError() {
            if (!this.container) return;
            this.container.innerHTML = `
        <div class="weather-error">
          <i class="fas fa-cloud-sun-rain"></i>
          <span>天气加载失败</span>
        </div>
      `;
        }

        startAutoUpdate() {
            setInterval(async () => {
                try {
                    const weather = await this.getWeather(this.location.lat, this.location.lon);
                    if (this.container) {
                        this.render(weather);
                    }
                } catch (error) {
                    console.error('天气更新失败:', error);
                }
            }, this.updateInterval);
        }
    }

    // DOM 加载完成后初始化
    async function initWeatherWidget() {
        const widget = new WeatherWidget();
        await widget.init();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWeatherWidget);
    } else {
        initWeatherWidget();
    }

})();
