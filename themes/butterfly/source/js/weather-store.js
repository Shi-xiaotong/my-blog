/**
 * 天气数据共享模块
 * 统一管理 API 请求、数据缓存、工具函数
 */
(function () {
    'use strict';

    window.WeatherStore = {
        API: {
            location: 'https://location.233002.xyz',
            weather: 'https://api.open-meteo.com/v1/forecast'
        },
        CACHE_KEY: 'weather_data',
        CACHE_EXPIRE: 10 * 60 * 1000,
        UPDATE_INTERVAL: 30 * 60 * 1000,
        data: null,
        location: null,
        _initPromise: null,
        _updateTimer: null,

        // 获取缓存
        getCache() {
            try {
                const cache = localStorage.getItem(this.CACHE_KEY);
                if (!cache) return null;
                const {data, location, timestamp} = JSON.parse(cache);
                if (Date.now() - timestamp > this.CACHE_EXPIRE) {
                    localStorage.removeItem(this.CACHE_KEY);
                    return null;
                }
                return {data, location};
            } catch {
                return null;
            }
        },

        // 保存缓存
        setCache() {
            if (!this.data || !this.location) return;
            try {
                localStorage.setItem(this.CACHE_KEY, JSON.stringify({
                    data: this.data,
                    location: this.location,
                    timestamp: Date.now()
                }));
            } catch {
            }
        },

        // 获取默认位置配置
        getDefaultLocation() {
            const container = document.getElementById('weather-page-container') ||
                document.getElementById('weather-aside-container');
            if (!container) return {city: '北京', lat: 39.9042, lon: 116.4074};
            return {
                city: container.dataset.defaultCity || '北京',
                lat: parseFloat(container.dataset.defaultLat) || 39.9042,
                lon: parseFloat(container.dataset.defaultLon) || 116.4074
            };
        },

        // 获取位置（IP定位）
        async fetchLocation() {
            const defaultLocation = this.getDefaultLocation();
            const cache = this.getCache();

            if (cache?.location) {
                this.location = cache.location;
                return;
            }

            try {
                const res = await fetch(this.API.location);
                const json = await res.json();
                this.location = json.code === '200'
                    ? {city: json.city || defaultLocation.city, lat: json.lat, lon: json.lon}
                    : defaultLocation;
            } catch {
                this.location = defaultLocation;
            }
        },

        // 获取天气数据
        async fetchWeather(lat, lon) {
            const params = new URLSearchParams({
                latitude: lat,
                longitude: lon,
                current: 'temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,uv_index',
                hourly: 'temperature_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,relative_humidity_2m,wind_speed_10m,wind_direction_10m',
                daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max',
                timezone: 'Asia/Shanghai',
                forecast_days: 7
            });

            const res = await fetch(`${this.API.weather}?${params}`);
            return res.json();
        },

        // 初始化
        async init() {
            if (this._initPromise) return this._initPromise;

            this._initPromise = (async () => {
                const cache = this.getCache();

                if (cache?.data && cache?.location) {
                    this.data = cache.data;
                    this.location = cache.location;
                    this.refresh();
                } else {
                    await this.fetchLocation();
                    if (this.location) {
                        this.data = await this.fetchWeather(this.location.lat, this.location.lon);
                        this.setCache();
                    }
                }
            })();

            return this._initPromise;
        },

        // 后台刷新数据
        async refresh() {
            if (!this.location) return;
            try {
                this.data = await this.fetchWeather(this.location.lat, this.location.lon);
                this.setCache();
            } catch {
            }
        },

        // 启动定时更新
        startAutoUpdate() {
            if (this._updateTimer) return;
            this._updateTimer = setInterval(() => this.refresh(), this.UPDATE_INTERVAL);
        },

        // 获取数据（等待初始化后返回）
        async getData() {
            await this.init();
            return this.data;
        },

        // 获取位置
        async getLocationInfo() {
            await this.init();
            return this.location;
        },

        // 工具方法：天气代码 -> 图标
        getWeatherIcon(code) {
            const icons = {
                0: 'fa-sun', 1: 'fa-cloud-sun', 2: 'fa-cloud-sun', 3: 'fa-cloud',
                45: 'fa-smog', 48: 'fa-smog',
                51: 'fa-cloud-rain', 53: 'fa-cloud-rain', 55: 'fa-cloud-rain',
                56: 'fa-cloud-rain', 57: 'fa-cloud-rain',
                61: 'fa-cloud-rain', 63: 'fa-cloud-rain', 65: 'fa-cloud-rain',
                66: 'fa-cloud-rain', 67: 'fa-cloud-rain',
                71: 'fa-snowflake', 73: 'fa-snowflake', 75: 'fa-snowflake',
                77: 'fa-snowflake', 80: 'fa-cloud-rain', 81: 'fa-cloud-rain', 82: 'fa-cloud-rain',
                85: 'fa-snowflake', 86: 'fa-snowflake',
                95: 'fa-bolt', 96: 'fa-bolt', 99: 'fa-bolt'
            };
            const icon = icons[code] ?? 'fa-thermometer-half';
            return `<i class="fas ${icon}"></i>`;
        },

        // 工具方法：天气代码 -> 文字
        getWeatherText(code) {
            const texts = {
                0: '晴', 1: '晴间多云', 2: '多云', 3: '阴',
                45: '雾', 48: '雾凇/冻雾',
                51: '小毛毛雨', 53: '中毛毛雨', 55: '大毛毛雨',
                56: '小冻雨', 57: '大冻雨',
                61: '小雨', 63: '中雨', 65: '大雨',
                66: '小冻雨', 67: '大冻雨',
                71: '小雪', 73: '中雪', 75: '大雪', 77: '雪粒',
                80: '小阵雨', 81: '中阵雨', 82: '大阵雨',
                85: '小阵雪', 86: '大阵雪',
                95: '雷暴', 96: '雷暴+冰雹', 99: '雷暴+冰雹'
            };
            return texts[code] ?? '未知';
        },

        // 工具方法：风向角度 -> 文字
        getWindDirection(deg) {
            const dirs = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
            return dirs[Math.round(deg / 45) % 8];
        },

        // 工具方法：紫外线指数 -> 等级
        getUVLevel(uv) {
            if (uv < 3) return {text: '弱', color: '#4CAF50'};
            if (uv < 6) return {text: '中等', color: '#FF9800'};
            if (uv < 8) return {text: '强', color: '#FF5722'};
            if (uv < 11) return {text: '很强', color: '#E91E63'};
            return {text: '极强', color: '#9C27B0'};
        }
    };
})();
