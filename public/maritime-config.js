// Production-ready Maritime API Configuration
// This file contains all maritime data provider configurations and utilities

window.MaritimeConfig = {
    // Production API endpoints and configurations
    providers: {
        aishub: {
            name: 'AISHub',
            type: 'free',
            priority: 1,
            baseUrl: 'https://data.aishub.net/ws.php',
            features: ['vessel_tracking', 'real_time_positions'],
            rateLimit: {
                requests: 1000,
                period: 'hour',
                resetTime: 3600000
            },
            endpoints: {
                vessel: '/ws.php?username={key}&format=1&output=json&mmsi={mmsi}',
                area: '/ws.php?username={key}&format=1&output=json&latmin={lat1}&latmax={lat2}&lonmin={lon1}&lonmax={lon2}',
                imo: '/ws.php?username={key}&format=1&output=json&imo={imo}'
            },
            documentation: 'https://www.aishub.net/api',
            setup: {
                requirements: ['AIS receiving station', 'Data contribution'],
                signup: 'Email aishub@astrapaging.com',
                cost: 'Free with data contribution'
            }
        },
        
        datalastic: {
            name: 'Datalastic',
            type: 'paid',
            priority: 2,
            baseUrl: 'https://api.datalastic.com/api/v0',
            features: ['vessel_tracking', 'vessel_info', 'port_data', 'historical_data'],
            rateLimit: {
                requests: 10000,
                period: 'hour',
                resetTime: 3600000
            },
            endpoints: {
                vessel: '/vessel?mmsi={mmsi}',
                vessel_pro: '/vessel_pro?mmsi={mmsi}',
                vessel_bulk: '/vessel_bulk?mmsi={mmsi_list}',
                port: '/port?port_id={port_id}',
                area: '/area?lat1={lat1}&lat2={lat2}&lon1={lon1}&lon2={lon2}'
            },
            documentation: 'https://datalastic.com/api-reference/',
            setup: {
                requirements: ['API subscription'],
                signup: 'https://datalastic.com/pricing/',
                cost: '€99/month',
                trial: '2 weeks free trial'
            }
        },
        
        searates: {
            name: 'SeaRates',
            type: 'freemium',
            priority: 3,
            baseUrl: 'https://api.searates.com',
            features: ['vessel_schedules', 'carrier_data', 'port_schedules', 'tracking'],
            rateLimit: {
                requests: 5000,
                period: 'hour',
                resetTime: 3600000
            },
            endpoints: {
                schedules: '/schedule/v1/points?origin={origin}&destination={destination}',
                vessel: '/schedule/v1/vessel?imo={imo}',
                tracking: '/tracking/v1/container?number={container}',
                carriers: '/schedule/v1/carriers'
            },
            documentation: 'https://docs.searates.com/',
            setup: {
                requirements: ['API subscription'],
                signup: 'Contact SeaRates customer support',
                cost: 'Custom pricing',
                trial: 'Free trial available'
            }
        }
    },

    // Production environment detection
    isProduction: () => {
        return window.location.hostname !== 'localhost' && 
               window.location.hostname !== '127.0.0.1' &&
               !window.location.hostname.includes('192.168.');
    },

    // API key validation patterns
    validation: {
        aishub: {
            pattern: /^[a-zA-Z0-9_-]{8,32}$/,
            testEndpoint: '/ws.php?username={key}&format=1&output=json&mmsi=123456789'
        },
        datalastic: {
            pattern: /^[a-zA-Z0-9_-]{32,64}$/,
            testEndpoint: '/vessel?mmsi=123456789'
        },
        searates: {
            pattern: /^[a-zA-Z0-9_-]{16,48}$/,
            testEndpoint: '/schedule/v1/carriers'
        }
    },

    // Rate limiting configuration
    rateLimiting: {
        enabled: true,
        defaultWindow: 60000, // 1 minute
        maxRequests: 100,
        backoffMultiplier: 2,
        maxBackoff: 300000, // 5 minutes
        retryAttempts: 3
    },

    // Error handling configuration
    errorHandling: {
        retryableErrors: [408, 429, 500, 502, 503, 504],
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 30000,
        jitter: true
    },

    // Caching configuration
    caching: {
        enabled: true,
        defaultTTL: 300000, // 5 minutes
        maxCacheSize: 1000,
        cleanupInterval: 600000, // 10 minutes
        storage: 'memory' // 'memory', 'localStorage', 'sessionStorage'
    },

    // Data normalization schemas
    schemas: {
        vessel: {
            required: ['mmsi', 'latitude', 'longitude', 'timestamp'],
            optional: ['imo', 'name', 'callsign', 'type', 'speed', 'course', 'destination', 'eta', 'status'],
            transforms: {
                timestamp: (value) => new Date(value).toISOString(),
                coordinates: (lat, lon) => ({ latitude: parseFloat(lat), longitude: parseFloat(lon) })
            }
        },
        schedule: {
            required: ['id', 'carrier', 'vessel', 'origin', 'destination', 'departure', 'arrival'],
            optional: ['service', 'transitTime', 'frequency', 'cutOff', 'vesselSize', 'status', 'ports'],
            transforms: {
                dates: (value) => new Date(value).toISOString(),
                transitTime: (value) => parseInt(value) || 0
            }
        }
    },

    // Health check configuration
    healthCheck: {
        enabled: true,
        interval: 300000, // 5 minutes
        timeout: 10000, // 10 seconds
        endpoints: {
            aishub: '/ws.php?username={key}&format=1&output=json&mmsi=123456789',
            datalastic: '/vessel?mmsi=123456789',
            searates: '/schedule/v1/carriers'
        }
    },

    // Analytics and monitoring
    analytics: {
        enabled: true,
        trackRequests: true,
        trackErrors: true,
        trackPerformance: true,
        batchSize: 100,
        flushInterval: 60000 // 1 minute
    },

    // Security configuration
    security: {
        apiKeyRotation: true,
        encryptStorage: false, // Set to true for production
        allowedOrigins: ['https://yourproductiondomain.com'],
        headers: {
            'User-Agent': 'Nerva-Weather-Intelligence/1.0',
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    },

    // Deployment configuration
    deployment: {
        environment: 'production',
        version: '1.0.0',
        buildId: Date.now().toString(),
        features: {
            realTimeUpdates: true,
            historicalData: true,
            predictiveAnalytics: true,
            multiProvider: true
        }
    }
};

// Production-ready utility functions
window.MaritimeUtils = {
    // Validate API key format
    validateApiKey(provider, key) {
        const validation = window.MaritimeConfig.validation[provider];
        if (!validation) return false;
        return validation.pattern.test(key);
    },

    // Generate API request URL
    buildApiUrl(provider, endpoint, params) {
        const config = window.MaritimeConfig.providers[provider];
        if (!config) throw new Error(`Unknown provider: ${provider}`);
        
        let url = config.baseUrl + config.endpoints[endpoint];
        
        // Replace parameters in URL
        Object.entries(params).forEach(([key, value]) => {
            url = url.replace(`{${key}}`, encodeURIComponent(value));
        });
        
        return url;
    },

    // Check if provider is configured
    isProviderConfigured(provider) {
        const key = this.getApiKey(provider);
        return key && !key.includes('YOUR_') && this.validateApiKey(provider, key);
    },

    // Get API key from environment
    getApiKey(provider) {
        const keyMap = {
            aishub: 'AISHUB_USERNAME',
            datalastic: 'DATALASTIC_API_KEY',
            searates: 'SEARATES_API_KEY'
        };
        
        return window.ENV?.[keyMap[provider]] || null;
    },

    // Get configured providers
    getConfiguredProviders() {
        return Object.keys(window.MaritimeConfig.providers).filter(provider => 
            this.isProviderConfigured(provider)
        );
    },

    // Get provider priority order
    getProvidersByPriority() {
        return Object.entries(window.MaritimeConfig.providers)
            .sort(([, a], [, b]) => a.priority - b.priority)
            .map(([key]) => key);
    },

    // Format provider status for display
    getProviderStatus() {
        return Object.entries(window.MaritimeConfig.providers).map(([key, config]) => ({
            id: key,
            name: config.name,
            type: config.type,
            priority: config.priority,
            configured: this.isProviderConfigured(key),
            features: config.features,
            rateLimit: config.rateLimit,
            cost: config.setup.cost,
            documentation: config.documentation
        }));
    }
};

// Production logging system
window.MaritimeLogger = {
    levels: {
        ERROR: 0,
        WARN: 1,
        INFO: 2,
        DEBUG: 3
    },
    
    currentLevel: window.MaritimeConfig.isProduction() ? 1 : 3, // WARN in production, DEBUG in development
    
    log(level, message, data = null) {
        if (this.levels[level] > this.currentLevel) return;
        
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            data,
            url: window.location.href,
            userAgent: navigator.userAgent
        };
        
        // Console output
        const consoleMethod = level === 'ERROR' ? 'error' : 
                            level === 'WARN' ? 'warn' : 
                            level === 'INFO' ? 'info' : 'debug';
        
        console[consoleMethod](`[${timestamp}] [${level}] ${message}`, data || '');
        
        // In production, send to monitoring service
        if (window.MaritimeConfig.isProduction() && window.MaritimeConfig.analytics.enabled) {
            this.sendToMonitoring(logEntry);
        }
    },
    
    error(message, data) { this.log('ERROR', message, data); },
    warn(message, data) { this.log('WARN', message, data); },
    info(message, data) { this.log('INFO', message, data); },
    debug(message, data) { this.log('DEBUG', message, data); },
    
    sendToMonitoring(logEntry) {
        // Implement monitoring service integration here
        // e.g., send to Sentry, LogRocket, DataDog, etc.
        console.debug('Sending to monitoring service:', logEntry);
    }
};

// Initialize configuration
console.log('🚢 Maritime API Configuration loaded');
console.log('📊 Providers available:', Object.keys(window.MaritimeConfig.providers));
console.log('🔧 Production mode:', window.MaritimeConfig.isProduction());

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MaritimeConfig, MaritimeUtils, MaritimeLogger };
}