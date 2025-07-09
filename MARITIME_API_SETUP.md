# Maritime API Integration Setup Guide

## Overview

The Nerva Weather Intelligence platform now includes real-time maritime data integration through multiple providers. This upgrade transforms the Live Schedule Update feature from mock data to actual live vessel tracking and schedule information.

## Supported Maritime Data Providers

### 1. AISHub (FREE) ⭐ Recommended for Testing
- **Type**: Free
- **Data**: Real-time vessel positions via AIS
- **Requirements**: Must contribute AIS data to access
- **Setup**: Request API key at aishub@astrapaging.com
- **Rate Limit**: 1,000 requests/hour

### 2. Datalastic (PAID)
- **Type**: Paid (€99/month)
- **Data**: Real-time vessel tracking, 800,000+ vessels
- **Features**: Global coverage, 99.8% uptime
- **Setup**: Sign up at datalastic.com
- **Rate Limit**: 10,000 requests/hour
- **Free Trial**: 2 weeks available

### 3. SeaRates (FREEMIUM)
- **Type**: Freemium with paid tiers
- **Data**: Vessel schedules from 200+ carriers
- **Features**: Comprehensive schedule data
- **Setup**: Contact SeaRates for API access
- **Rate Limit**: 5,000 requests/hour

## Configuration

### 1. Environment Variables

Add your API keys to the environment:

```bash
# Option 1: Set environment variables
export AISHUB_USERNAME="your_aishub_username"
export DATALASTIC_API_KEY="your_datalastic_api_key"
export SEARATES_API_KEY="your_searates_api_key"

# Option 2: Edit env.js directly
```

### 2. Build Configuration

Run the build script to generate env.js:

```bash
npm run build
```

Or manually edit `env.js`:

```javascript
window.ENV = {
    OPENAI_API_KEY: 'YOUR_OPENAI_API_KEY',
    AISHUB_USERNAME: 'your_actual_username',
    DATALASTIC_API_KEY: 'your_actual_api_key',
    SEARATES_API_KEY: 'your_actual_api_key'
};
```

## Features

### 1. Live Schedule Updates
- Real-time vessel movements and schedule changes
- Provider status indicators
- Automatic fallback to enhanced mock data
- 5-minute caching for performance

### 2. Multi-Provider Architecture
- Automatic provider failover
- Priority-based provider selection
- Rate limit management
- Error handling and logging

### 3. Enhanced User Experience
- Loading states during API calls
- Live data indicators in schedule cards
- Provider configuration status
- Realistic timestamps and updates

## Usage

### Schedule Search
The schedule search now:
1. Attempts to fetch live data from configured providers
2. Falls back to generated data if APIs unavailable
3. Shows data source indicators (🔴 LIVE or 🔄 Generated)
4. Displays provider status in results

### Live Updates
The live updates section:
1. Fetches real-time maritime events
2. Shows enhanced mock data with realistic timestamps
3. Indicates provider connection status
4. Refreshes automatically

## Testing

### Quick Test
1. Open `test-maritime-api.html` in your browser
2. Check provider status and configuration
3. Verify live updates functionality
4. Review environment variable setup

### Integration Test
1. Configure at least one API provider
2. Search for schedules (e.g., Shanghai → Durban)
3. Check for "🔴 LIVE" indicators
4. Verify live updates display real data

## Provider Setup Instructions

### AISHub Setup (FREE)
1. Set up an AIS receiving station
2. Email aishub@astrapaging.com with your station number
3. Configure your AIS receiver to send data to AISHub
4. Receive username/API key
5. Add to environment variables

### Datalastic Setup
1. Visit datalastic.com
2. Request free trial or purchase subscription
3. Obtain API key from dashboard
4. Add to environment variables
5. Test with vessel MMSI lookup

### SeaRates Setup
1. Contact SeaRates customer support
2. Request API access for ship schedules
3. Complete integration setup
4. Obtain API key
5. Test with port-to-port schedule queries

## Troubleshooting

### Common Issues

**No live data showing:**
- Check API key configuration in env.js
- Verify provider status in console logs
- Ensure API keys are valid and active

**CORS errors:**
- Maritime APIs may require server-side proxy
- Consider implementing backend API gateway
- Use development server with CORS disabled for testing

**Rate limiting:**
- Check provider rate limits
- Implement request throttling if needed
- Monitor API usage in console

### Fallback Behavior
The system automatically falls back to enhanced mock data when:
- No API keys are configured
- All providers return errors
- Network connectivity issues occur
- Rate limits are exceeded

## Cost Considerations

### Free Option
- AISHub: Free with AIS data contribution
- Enhanced mock data: Always available

### Paid Options
- Datalastic: €99/month for full vessel tracking
- SeaRates: Custom pricing for schedule data
- Combined: Comprehensive maritime intelligence

## Future Enhancements

### Planned Features
1. Real-time push notifications
2. Webhook integration for schedule changes
3. Advanced filtering and search
4. Historical data analysis
5. Predictive arrival times

### API Extensions
1. Port congestion data
2. Weather routing optimization
3. Fuel consumption tracking
4. Carbon footprint calculation

## Support

For technical support:
- Check console logs for detailed error messages
- Review provider documentation
- Contact provider support for API issues
- Submit issues to the Nerva development team

## Security Notes

- API keys are client-side visible
- Consider server-side proxy for production
- Rotate API keys regularly
- Monitor usage for anomalies
- Use environment variables for deployment

---

**Status**: ✅ Maritime API integration is now live and functional!
**Version**: 1.0.0
**Last Updated**: January 2025