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
        },

        // 工具方法：出行建议
        getTravelAdvice({temp, feelTemp, humidity, pressure, windSpeed, windDir, uvIndex, weatherCode}) {
            const advice = [];

            // 穿衣建议
            const tempAdvice = this._getClothingAdvice(temp, feelTemp);
            if (tempAdvice) advice.push({icon: 'fa-tshirt', text: tempAdvice});

            // 湿度建议
            const humidityAdvice = this._getHumidityAdvice(humidity);
            if (humidityAdvice) advice.push({icon: 'fa-tint', text: humidityAdvice});

            // 风速建议
            const windAdvice = this._getWindAdvice(windSpeed, windDir);
            if (windAdvice) advice.push({icon: 'fa-wind', text: windAdvice});

            // 紫外线建议
            const uvAdvice = this._getUVAdvice(uvIndex);
            if (uvAdvice) advice.push({icon: 'fa-sun', text: uvAdvice});

            // 天气状况建议
            const weatherAdvice = this._getWeatherAdvice(weatherCode);
            if (weatherAdvice) advice.push({icon: weatherAdvice.icon, text: weatherAdvice.text});

            // 生成HTML
            const itemsHTML = advice.map(item =>
                `<div class="advice-item">
                    <i class="fas ${item.icon}"></i>
                    <span>${item.text}</span>
                </div>`
            ).join('');

            return `
                <div class="advice-section">
                    <div class="advice-title"><i class="fas fa-lightbulb"></i>出行建议</div>
                    <div class="advice-list">${itemsHTML}</div>
                </div>
            `;
        },

        // 穿衣建议
        _getClothingAdvice(temp, feelTemp) {
            const t = feelTemp ?? temp;
            if (t < 5) return '建议穿羽绒服/棉服等厚冬装，注意防寒保暖';
            if (t < 10) return '建议穿毛衣/夹克/风衣等秋装，怕冷可加件外套';
            if (t < 15) return '建议穿长袖+薄外套或针织衫，早晚可加件外套';
            if (t < 20) return '建议穿长袖衬衫/T恤，早晚可加件薄外套';
            if (t < 25) return '建议穿轻薄长袖或短袖，适合户外活动';
            if (t < 30) return '建议穿短袖短裤，注意防暑降温';
            return '建议穿轻薄透气衣物，注意防晒防暑';
        },

        // 湿度建议
        _getHumidityAdvice(humidity) {
            if (humidity < 30) return '空气干燥，记得多喝水，可备润唇膏';
            if (humidity > 80) return '空气潮湿，注意防潮，衣物易晾不干';
            return null;
        },

        // 风速建议
        _getWindAdvice(windSpeed, windDir) {
            const dir = this.getWindDirection(windDir);
            if (windSpeed > 15) return `${dir}风较大，外出注意避开广告牌等易被风吹落的物品`;
            if (windSpeed > 10) return `${dir}风有点大，外出可戴帽子扎好头发`;
            if (windSpeed > 5) return `${dir}风轻拂，户外活动很舒适`;
            return null;
        },

        // 紫外线建议
        _getUVAdvice(uvIndex) {
            if (uvIndex >= 8) return '紫外线很强，避免在烈日下活动，务必做好防晒';
            if (uvIndex >= 6) return '紫外线较强，出门建议涂防晒霜、戴墨镜';
            if (uvIndex >= 3) return '紫外线中等，户外活动可适当防晒';
            return null;
        },

        // 天气状况建议
        _getWeatherAdvice(weatherCode) {
            // 晴天
            if (weatherCode === 0) return null;
            // 多云
            if (weatherCode <= 3) return {icon: 'fa-cloud', text: '多云天气，户外活动注意适时增减衣物'};
            // 雾
            if (weatherCode === 45 || weatherCode === 48) return {icon: 'fa-smog', text: '有雾，能见度较差，外出注意交通安全'};
            // 毛毛雨/小雨
            if (weatherCode >= 51 && weatherCode <= 67) return {icon: 'fa-cloud-rain', text: '有降水，外出记得带伞，开车注意慢行'};
            // 阵雨
            if (weatherCode >= 80 && weatherCode <= 82) return {icon: 'fa-cloud-rain', text: '有阵雨，外出带把伞，户外活动注意防雨'};
            // 雪
            if (weatherCode >= 71 && weatherCode <= 86) return {icon: 'fa-snowflake', text: '有降雪，道路可能结冰，外出注意防滑保暖'};
            // 雷暴
            if (weatherCode >= 95) return {icon: 'fa-bolt', text: '有雷暴，尽量待在室内，远离大树和金属物品'};
            return null;
        }
    };
})();
