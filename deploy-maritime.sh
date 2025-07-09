#!/bin/bash

# Maritime API Production Deployment Script
# This script prepares the maritime API integration for production deployment

set -e

echo "🚢 Starting Maritime API Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PRODUCTION_DOMAIN=${PRODUCTION_DOMAIN:-"yourproductiondomain.com"}
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
LOG_FILE="./logs/deployment_$(date +%Y%m%d_%H%M%S).log"

# Create necessary directories
mkdir -p logs backups

# Function to log messages
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO:${NC} $1" | tee -a "$LOG_FILE"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    # Check if required files exist
    required_files=("costing-app.html" "env.js" "maritime-config.js" "maritime-provider.js" "build-env.js")
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            error "Required file '$file' not found."
            exit 1
        fi
    done
    
    log "Prerequisites check passed ✅"
}

# Create backup
create_backup() {
    log "Creating backup..."
    mkdir -p "$BACKUP_DIR"
    
    # Backup current files
    cp -r . "$BACKUP_DIR/" 2>/dev/null || true
    
    log "Backup created at $BACKUP_DIR ✅"
}

# Validate environment configuration
validate_environment() {
    log "Validating environment configuration..."
    
    # Check if environment variables are set
    if [ -z "$AISHUB_USERNAME" ] && [ -z "$DATALASTIC_API_KEY" ] && [ -z "$SEARATES_API_KEY" ]; then
        warning "No maritime API keys configured. Application will use mock data."
        warning "Set environment variables: AISHUB_USERNAME, DATALASTIC_API_KEY, SEARATES_API_KEY"
    fi
    
    # Validate API key formats (basic validation)
    if [ -n "$AISHUB_USERNAME" ]; then
        if [[ ! "$AISHUB_USERNAME" =~ ^[a-zA-Z0-9_-]{8,32}$ ]]; then
            warning "AISHUB_USERNAME format may be invalid"
        else
            log "AISHub configuration validated ✅"
        fi
    fi
    
    if [ -n "$DATALASTIC_API_KEY" ]; then
        if [[ ! "$DATALASTIC_API_KEY" =~ ^[a-zA-Z0-9_-]{32,64}$ ]]; then
            warning "DATALASTIC_API_KEY format may be invalid"
        else
            log "Datalastic configuration validated ✅"
        fi
    fi
    
    if [ -n "$SEARATES_API_KEY" ]; then
        if [[ ! "$SEARATES_API_KEY" =~ ^[a-zA-Z0-9_-]{16,48}$ ]]; then
            warning "SEARATES_API_KEY format may be invalid"
        else
            log "SeaRates configuration validated ✅"
        fi
    fi
}

# Build production environment
build_production() {
    log "Building production environment..."
    
    # Generate env.js with production settings
    node build-env.js
    
    # Update security settings for production
    sed -i.bak "s/yourproductiondomain.com/$PRODUCTION_DOMAIN/g" maritime-config.js
    
    # Enable production mode
    sed -i.bak "s/environment: 'development'/environment: 'production'/g" maritime-config.js
    
    log "Production build completed ✅"
}

# Optimize for production
optimize_production() {
    log "Optimizing for production..."
    
    # Remove development-only console.log statements (optional)
    if [ "$REMOVE_DEBUG_LOGS" = "true" ]; then
        info "Removing debug logs for production..."
        sed -i.bak '/console\.debug/d' maritime-provider.js
        sed -i.bak '/console\.log.*debug/d' maritime-provider.js
    fi
    
    # Minify CSS (if you have a CSS file)
    # Add minification here if needed
    
    log "Production optimization completed ✅"
}

# Security hardening
security_hardening() {
    log "Applying security hardening..."
    
    # Set secure headers in maritime-config.js
    sed -i.bak "s/encryptStorage: false/encryptStorage: true/g" maritime-config.js
    
    # Add Content Security Policy headers (for server deployment)
    cat > .htaccess << 'EOF'
# Maritime API Security Headers
Header always set Content-Security-Policy "default-src 'self' 'unsafe-inline' 'unsafe-eval' https:; connect-src 'self' https://data.aishub.net https://api.datalastic.com https://api.searates.com; img-src 'self' data: https:;"
Header always set X-Content-Type-Options "nosniff"
Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-XSS-Protection "1; mode=block"
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
EOF
    
    log "Security hardening applied ✅"
}

# Performance optimization
performance_optimization() {
    log "Applying performance optimizations..."
    
    # Enable compression
    cat >> .htaccess << 'EOF'

# Enable compression for maritime API responses
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Enable caching for static assets
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType application/json "access plus 5 minutes"
</IfModule>
EOF
    
    log "Performance optimizations applied ✅"
}

# Health check setup
setup_health_check() {
    log "Setting up health check endpoint..."
    
    cat > health-check.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Maritime API Health Check</title>
    <script src="env.js"></script>
    <script src="maritime-config.js"></script>
    <script src="maritime-provider.js"></script>
</head>
<body>
    <h1>Maritime API Health Check</h1>
    <div id="status">Checking...</div>
    
    <script>
        async function checkHealth() {
            try {
                const status = window.MaritimeDataProvider.getStatus();
                const response = {
                    timestamp: new Date().toISOString(),
                    status: status.initialized ? 'healthy' : 'unhealthy',
                    providers: status.providers.map(p => ({
                        name: p.name,
                        configured: p.configured,
                        type: p.type
                    })),
                    metrics: {
                        requests: status.metrics.requests,
                        errors: status.metrics.errors,
                        cacheHitRate: status.cache.hitRate
                    }
                };
                
                document.getElementById('status').innerHTML = `
                    <h2>Status: ${response.status}</h2>
                    <pre>${JSON.stringify(response, null, 2)}</pre>
                `;
                
                // Set appropriate HTTP status for monitoring
                if (response.status === 'healthy') {
                    document.title = 'Maritime API - Healthy';
                } else {
                    document.title = 'Maritime API - Unhealthy';
                }
                
            } catch (error) {
                document.getElementById('status').innerHTML = `
                    <h2>Status: Error</h2>
                    <p>Error: ${error.message}</p>
                `;
            }
        }
        
        window.addEventListener('load', checkHealth);
    </script>
</body>
</html>
EOF
    
    log "Health check endpoint created at health-check.html ✅"
}

# Generate monitoring configuration
generate_monitoring_config() {
    log "Generating monitoring configuration..."
    
    cat > monitoring-config.json << EOF
{
    "version": "1.0.0",
    "deployment": {
        "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
        "environment": "production",
        "domain": "$PRODUCTION_DOMAIN"
    },
    "endpoints": {
        "health": "/health-check.html",
        "dashboard": "/maritime-dashboard.html",
        "main": "/costing-app.html"
    },
    "monitoring": {
        "healthCheck": {
            "interval": "5m",
            "timeout": "30s",
            "retries": 3
        },
        "alerts": {
            "errorRate": {
                "threshold": 10,
                "window": "5m"
            },
            "responseTime": {
                "threshold": 5000,
                "window": "1m"
            }
        }
    },
    "providers": [
        {
            "name": "AISHub",
            "configured": $([ -n "$AISHUB_USERNAME" ] && echo "true" || echo "false"),
            "type": "free"
        },
        {
            "name": "Datalastic",
            "configured": $([ -n "$DATALASTIC_API_KEY" ] && echo "true" || echo "false"),
            "type": "paid"
        },
        {
            "name": "SeaRates",
            "configured": $([ -n "$SEARATES_API_KEY" ] && echo "true" || echo "false"),
            "type": "freemium"
        }
    ]
}
EOF
    
    log "Monitoring configuration generated ✅"
}

# Generate deployment summary
generate_deployment_summary() {
    log "Generating deployment summary..."
    
    cat > DEPLOYMENT_SUMMARY.md << EOF
# Maritime API Deployment Summary

**Deployment Date:** $(date -u +%Y-%m-%dT%H:%M:%SZ)
**Environment:** Production
**Domain:** $PRODUCTION_DOMAIN

## Components Deployed

- ✅ Maritime API Configuration (maritime-config.js)
- ✅ Production Maritime Provider (maritime-provider.js)
- ✅ Management Dashboard (maritime-dashboard.html)
- ✅ Health Check Endpoint (health-check.html)
- ✅ Security Headers (.htaccess)
- ✅ Monitoring Configuration (monitoring-config.json)

## Provider Configuration

- **AISHub:** $([ -n "$AISHUB_USERNAME" ] && echo "✅ Configured" || echo "❌ Not Configured")
- **Datalastic:** $([ -n "$DATALASTIC_API_KEY" ] && echo "✅ Configured" || echo "❌ Not Configured")
- **SeaRates:** $([ -n "$SEARATES_API_KEY" ] && echo "✅ Configured" || echo "❌ Not Configured")

## Next Steps

1. **Configure API Keys** (if not already done):
   - Set environment variables for your chosen providers
   - Run deployment script again to update configuration

2. **Set Up Monitoring:**
   - Configure health check monitoring at: https://$PRODUCTION_DOMAIN/health-check.html
   - Access management dashboard at: https://$PRODUCTION_DOMAIN/maritime-dashboard.html

3. **Test Deployment:**
   - Visit the main application at: https://$PRODUCTION_DOMAIN/costing-app.html
   - Test Live Schedule Updates functionality
   - Verify provider connections in dashboard

## Support

For technical support or issues:
- Check health check endpoint for system status
- Review browser console for detailed error messages
- Consult provider documentation for API-specific issues

## Backup

A backup of the previous deployment was created at: $BACKUP_DIR
EOF
    
    log "Deployment summary generated ✅"
}

# Main deployment function
main() {
    log "🚢 Maritime API Production Deployment Started"
    
    check_prerequisites
    create_backup
    validate_environment
    build_production
    optimize_production
    security_hardening
    performance_optimization
    setup_health_check
    generate_monitoring_config
    generate_deployment_summary
    
    log "🎉 Maritime API Production Deployment Completed Successfully!"
    log "📊 Access your management dashboard at: https://$PRODUCTION_DOMAIN/maritime-dashboard.html"
    log "🏥 Health check endpoint: https://$PRODUCTION_DOMAIN/health-check.html"
    log "📋 Deployment summary: ./DEPLOYMENT_SUMMARY.md"
}

# Run deployment
main "$@"