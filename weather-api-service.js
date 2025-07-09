// Real Weather API Service Integration
// Using Open-Meteo Marine Weather API (Free for non-commercial use)

class WeatherAPIService {
    constructor() {
        this.baseUrl = 'https://marine-api.open-meteo.com/v1/marine';
        this.cache = new Map();
        this.cacheTimeout = 10 * 60 * 1000; // 10 minutes cache
        this.requestCount = 0;
        this.maxRequestsPerHour = 100; // Conservative limit
        this.initialized = false;
        
        this.init();
    }

    init() {
        console.log('🌊 Initializing Weather API Service...');
        console.log('📍 Provider: Open-Meteo Marine Weather API');
        console.log('💰 Cost: FREE (non-commercial use)');
        console.log('🚀 Status: Ready');
        this.initialized = true;
    }

    // Get coordinates for major ports
    getPortCoordinates(portName) {
        const portCoordinates = {
            // Major Asian Ports
            'Shanghai': { lat: 31.2304, lon: 121.4737 },
            'Singapore': { lat: 1.3521, lon: 103.8198 },
            'Hong Kong': { lat: 22.3193, lon: 114.1694 },
            'Tokyo': { lat: 35.6762, lon: 139.6503 },
            'Busan': { lat: 35.1796, lon: 129.0756 },
            'Mumbai': { lat: 18.9220, lon: 72.8347 },
            'Colombo': { lat: 6.9271, lon: 79.8612 },
            'Bangkok': { lat: 13.7563, lon: 100.5018 },
            'Manila': { lat: 14.5995, lon: 120.9842 },
            'Jakarta': { lat: -6.2088, lon: 106.8456 },
            
            // European Ports
            'Rotterdam': { lat: 51.9244, lon: 4.4777 },
            'Hamburg': { lat: 53.5488, lon: 9.9872 },
            'Antwerp': { lat: 51.2194, lon: 4.4025 },
            'Felixstowe': { lat: 51.9642, lon: 1.3508 },
            'Le Havre': { lat: 49.4944, lon: 0.1079 },
            'Genoa': { lat: 44.4056, lon: 8.9463 },
            'Barcelona': { lat: 41.3851, lon: 2.1734 },
            'Valencia': { lat: 39.4699, lon: -0.3763 },
            'Algeciras': { lat: 36.1408, lon: -5.4526 },
            'Piraeus': { lat: 37.9755, lon: 23.6348 },
            
            // American Ports
            'New York': { lat: 40.7128, lon: -74.0060 },
            'Los Angeles': { lat: 34.0522, lon: -118.2437 },
            'Long Beach': { lat: 33.7701, lon: -118.1937 },
            'Norfolk': { lat: 36.8468, lon: -76.2852 },
            'Seattle': { lat: 47.6062, lon: -122.3321 },
            'Vancouver': { lat: 49.2827, lon: -123.1207 },
            'Santos': { lat: -23.9618, lon: -46.3322 },
            'Buenos Aires': { lat: -34.6118, lon: -58.3960 },
            'Valparaiso': { lat: -33.0458, lon: -71.6197 },
            
            // African Ports
            'Durban': { lat: -29.8587, lon: 31.0218 },
            'Cape Town': { lat: -33.9249, lon: 18.4241 },
            'Gqeberha': { lat: -33.9608, lon: 25.6022 },
            'Lagos': { lat: 6.5244, lon: 3.3792 },
            'Alexandria': { lat: 31.2001, lon: 29.9187 },
            'Casablanca': { lat: 33.5731, lon: -7.5898 },
            
            // Middle Eastern Ports
            'Jebel Ali': { lat: 25.0657, lon: 55.1713 },
            'Jeddah': { lat: 21.4858, lon: 39.1925 },
            'Kuwait': { lat: 29.3759, lon: 47.9774 },
            'Doha': { lat: 25.2854, lon: 51.5310 },
            'Bandar Abbas': { lat: 27.1865, lon: 56.2808 },
            'Istanbul': { lat: 41.0082, lon: 28.9784 },
            
            // Oceanian Ports
            'Sydney': { lat: -33.8688, lon: 151.2093 },
            'Melbourne': { lat: -37.8136, lon: 144.9631 },
            'Brisbane': { lat: -27.4705, lon: 153.0260 },
            'Auckland': { lat: -36.8485, lon: 174.7633 },
            'Suva': { lat: -18.1248, lon: 178.4501 }
        };

        return portCoordinates[portName] || { lat: 0, lon: 0 };
    }

    // Check cache for existing data
    getCachedData(cacheKey) {
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            console.log('📦 Using cached weather data for', cacheKey);
            return cached.data;
        }
        return null;
    }

    // Store data in cache
    setCachedData(cacheKey, data) {
        this.cache.set(cacheKey, {
            data: data,
            timestamp: Date.now()
        });
    }

    // Rate limiting check
    checkRateLimit() {
        if (this.requestCount >= this.maxRequestsPerHour) {
            console.warn('⚠️ Rate limit approached, using cached data');
            return false;
        }
        return true;
    }

    // Get marine weather data for a specific port
    async getPortWeather(portName) {
        const cacheKey = `port_weather_${portName}`;
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        if (!this.checkRateLimit()) {
            return this.getFallbackWeatherData(portName);
        }

        try {
            const coords = this.getPortCoordinates(portName);
            if (coords.lat === 0 && coords.lon === 0) {
                console.warn(`⚠️ No coordinates found for port: ${portName}`);
                return this.getFallbackWeatherData(portName);
            }

            const url = `${this.baseUrl}?latitude=${coords.lat}&longitude=${coords.lon}&hourly=wave_height,wave_direction,wave_period,wind_wave_height,wind_wave_direction,wind_wave_period,swell_wave_height,swell_wave_direction,swell_wave_period,ocean_current_velocity,ocean_current_direction,sea_surface_temperature&daily=wave_height_max,wave_direction_dominant,wave_period_max,wind_wave_height_max,swell_wave_height_max&forecast_days=7&timezone=auto`;

            console.log(`🌊 Fetching real weather data for ${portName}...`);
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            this.requestCount++;
            
            const processedData = this.processWeatherData(data, portName);
            this.setCachedData(cacheKey, processedData);
            
            console.log(`✅ Real weather data retrieved for ${portName}`);
            return processedData;

        } catch (error) {
            console.error(`❌ Weather API error for ${portName}:`, error);
            return this.getFallbackWeatherData(portName);
        }
    }

    // Get route weather analysis
    async getRouteWeather(originPort, destinationPort) {
        const cacheKey = `route_weather_${originPort}_${destinationPort}`;
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        try {
            console.log(`🌊 Analyzing route weather: ${originPort} → ${destinationPort}`);
            
            // Get weather for both ports
            const originWeather = await this.getPortWeather(originPort);
            const destinationWeather = await this.getPortWeather(destinationPort);
            
            // Analyze route conditions
            const routeAnalysis = this.analyzeRouteConditions(originWeather, destinationWeather, originPort, destinationPort);
            
            this.setCachedData(cacheKey, routeAnalysis);
            return routeAnalysis;

        } catch (error) {
            console.error(`❌ Route weather analysis error:`, error);
            return this.getFallbackRouteWeather(originPort, destinationPort);
        }
    }

    // Process raw weather data from API
    processWeatherData(rawData, portName) {
        const current = rawData.hourly;
        const daily = rawData.daily;
        
        const currentIndex = 0; // Current hour
        
        return {
            port: portName,
            timestamp: new Date().toISOString(),
            current: {
                waveHeight: current.wave_height?.[currentIndex] || 0,
                waveDirection: current.wave_direction?.[currentIndex] || 0,
                wavePeriod: current.wave_period?.[currentIndex] || 0,
                windWaveHeight: current.wind_wave_height?.[currentIndex] || 0,
                swellHeight: current.swell_wave_height?.[currentIndex] || 0,
                swellDirection: current.swell_wave_direction?.[currentIndex] || 0,
                oceanCurrent: current.ocean_current_velocity?.[currentIndex] || 0,
                currentDirection: current.ocean_current_direction?.[currentIndex] || 0,
                seaTemperature: current.sea_surface_temperature?.[currentIndex] || 20
            },
            forecast: {
                maxWaveHeight: daily.wave_height_max?.[0] || 0,
                dominantWaveDirection: daily.wave_direction_dominant?.[0] || 0,
                maxWavePeriod: daily.wave_period_max?.[0] || 0,
                maxWindWaveHeight: daily.wind_wave_height_max?.[0] || 0,
                maxSwellHeight: daily.swell_wave_height_max?.[0] || 0
            },
            conditions: this.assessConditions(current, daily),
            dataSource: 'Open-Meteo Marine API',
            isLive: true
        };
    }

    // Assess weather conditions
    assessConditions(current, daily) {
        const currentWaveHeight = current.wave_height?.[0] || 0;
        const maxWaveHeight = daily.wave_height_max?.[0] || 0;
        const windWaveHeight = current.wind_wave_height?.[0] || 0;
        
        let severity = 'normal';
        let description = 'Favorable conditions';
        let recommendations = [];
        
        if (maxWaveHeight > 6) {
            severity = 'severe';
            description = 'High seas with significant wave heights';
            recommendations.push('Consider route deviation', 'Monitor weather updates closely', 'Prepare for rough conditions');
        } else if (maxWaveHeight > 4) {
            severity = 'moderate';
            description = 'Moderate sea conditions';
            recommendations.push('Standard precautions advised', 'Monitor conditions');
        } else if (maxWaveHeight > 2) {
            severity = 'light';
            description = 'Slight sea conditions';
            recommendations.push('Good conditions for sailing');
        }
        
        return {
            severity,
            description,
            recommendations,
            waveCondition: this.classifyWaveCondition(maxWaveHeight),
            safetyLevel: this.calculateSafetyLevel(currentWaveHeight, windWaveHeight)
        };
    }

    classifyWaveCondition(waveHeight) {
        if (waveHeight <= 0.5) return 'Calm';
        if (waveHeight <= 1.5) return 'Light';
        if (waveHeight <= 2.5) return 'Moderate';
        if (waveHeight <= 4) return 'Rough';
        if (waveHeight <= 6) return 'Very Rough';
        return 'High';
    }

    calculateSafetyLevel(currentWave, windWave) {
        const combinedWave = Math.max(currentWave, windWave);
        if (combinedWave <= 1) return 'Excellent';
        if (combinedWave <= 2) return 'Good';
        if (combinedWave <= 3) return 'Fair';
        if (combinedWave <= 4) return 'Poor';
        return 'Dangerous';
    }

    // Analyze route conditions
    analyzeRouteConditions(originWeather, destinationWeather, originPort, destinationPort) {
        const avgWaveHeight = (originWeather.current.waveHeight + destinationWeather.current.waveHeight) / 2;
        const maxWaveHeight = Math.max(originWeather.forecast.maxWaveHeight, destinationWeather.forecast.maxWaveHeight);
        
        let overallRisk = 'Low';
        let recommendations = [];
        let alerts = [];
        
        if (maxWaveHeight > 5) {
            overallRisk = 'High';
            alerts.push('High wave conditions expected along route');
            recommendations.push('Consider alternative route', 'Delay departure if possible', 'Ensure vessel is equipped for rough seas');
        } else if (maxWaveHeight > 3) {
            overallRisk = 'Moderate';
            recommendations.push('Monitor weather updates', 'Maintain standard safety protocols');
        } else {
            recommendations.push('Favorable conditions for transit', 'Maintain regular watch schedule');
        }
        
        return {
            route: `${originPort} → ${destinationPort}`,
            origin: originWeather,
            destination: destinationWeather,
            analysis: {
                overallRisk,
                averageWaveHeight: avgWaveHeight,
                maxWaveHeight,
                estimatedConditions: this.classifyWaveCondition(maxWaveHeight),
                recommendations,
                alerts
            },
            timestamp: new Date().toISOString(),
            dataSource: 'Open-Meteo Marine API',
            isLive: true
        };
    }

    // Fallback weather data when API fails
    getFallbackWeatherData(portName) {
        console.log(`🔄 Using fallback weather data for ${portName}`);
        
        // Generate realistic fallback data based on geographical location
        const baseWaveHeight = Math.random() * 2 + 0.5;
        const baseTemp = this.getBaseTemperature(portName);
        
        return {
            port: portName,
            timestamp: new Date().toISOString(),
            current: {
                waveHeight: baseWaveHeight,
                waveDirection: Math.random() * 360,
                wavePeriod: Math.random() * 5 + 3,
                windWaveHeight: baseWaveHeight * 0.7,
                swellHeight: baseWaveHeight * 0.8,
                swellDirection: Math.random() * 360,
                oceanCurrent: Math.random() * 2,
                currentDirection: Math.random() * 360,
                seaTemperature: baseTemp
            },
            forecast: {
                maxWaveHeight: baseWaveHeight * 1.5,
                dominantWaveDirection: Math.random() * 360,
                maxWavePeriod: Math.random() * 3 + 5,
                maxWindWaveHeight: baseWaveHeight * 1.2,
                maxSwellHeight: baseWaveHeight * 1.3
            },
            conditions: {
                severity: 'normal',
                description: 'Moderate sea conditions (estimated)',
                recommendations: ['Standard maritime precautions'],
                waveCondition: this.classifyWaveCondition(baseWaveHeight),
                safetyLevel: 'Good'
            },
            dataSource: 'Fallback (Estimated)',
            isLive: false
        };
    }

    getFallbackRouteWeather(originPort, destinationPort) {
        const originWeather = this.getFallbackWeatherData(originPort);
        const destinationWeather = this.getFallbackWeatherData(destinationPort);
        
        return {
            route: `${originPort} → ${destinationPort}`,
            origin: originWeather,
            destination: destinationWeather,
            analysis: {
                overallRisk: 'Moderate',
                averageWaveHeight: 1.5,
                maxWaveHeight: 2.5,
                estimatedConditions: 'Moderate',
                recommendations: ['Standard route precautions', 'Monitor weather updates'],
                alerts: ['Weather data estimated - verify with local sources']
            },
            timestamp: new Date().toISOString(),
            dataSource: 'Fallback (Estimated)',
            isLive: false
        };
    }

    getBaseTemperature(portName) {
        const tempMap = {
            'Shanghai': 15, 'Singapore': 28, 'Dubai': 25, 'Mumbai': 27,
            'Rotterdam': 10, 'Hamburg': 8, 'Durban': 22, 'Cape Town': 18,
            'New York': 12, 'Los Angeles': 18, 'Sydney': 20, 'Tokyo': 16
        };
        return tempMap[portName] || 20;
    }

    // Get API status
    getStatus() {
        return {
            provider: 'Open-Meteo Marine Weather API',
            status: this.initialized ? 'Active' : 'Inactive',
            cost: 'FREE (non-commercial use)',
            requestCount: this.requestCount,
            maxRequests: this.maxRequestsPerHour,
            cacheSize: this.cache.size,
            features: [
                'Marine weather forecasts',
                'Wave height and direction',
                'Ocean currents',
                'Sea surface temperature',
                'Swell conditions',
                '7-day forecasts'
            ]
        };
    }
}

// Initialize the weather service
window.WeatherAPIService = new WeatherAPIService();

console.log('🌊 Weather API Service loaded and ready!');
console.log('📊 Status:', window.WeatherAPIService.getStatus());

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WeatherAPIService;
}