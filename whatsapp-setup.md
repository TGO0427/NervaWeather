# 📱 WhatsApp Business API Setup Guide

## 🎯 Option 1: Meta WhatsApp Business API (Official)

### 1. Create Meta Business Account
1. Go to [business.facebook.com](https://business.facebook.com)
2. Create business account with your company details
3. Verify your business

### 2. Set Up WhatsApp Business API
1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Create new app → Business → WhatsApp
3. Add WhatsApp product to your app
4. Get Phone Number ID and Access Token

### 3. Required Information
- **Phone Number ID**: `123456789012345`
- **Access Token**: `EAAxxxxxxxxx...`
- **Webhook URL**: `https://yourapp.com/webhook` (for receiving status updates)

## 🚀 Option 2: Twilio WhatsApp API (Easier Setup)

### 1. Create Twilio Account
1. Sign up at [twilio.com](https://twilio.com)
2. Get Account SID and Auth Token
3. Enable WhatsApp in console

### 2. Sandbox Setup (Testing)
- **WhatsApp Number**: +1 415 523 8886
- **Sandbox**: Join by sending "join [your-code]" to the number

### 3. Production Setup
- Request WhatsApp Business Profile approval
- Get dedicated WhatsApp number

## 🛠️ Option 3: Third-Party Services (Fastest)

### ChatAPI.com
- Instant setup with QR code
- No business verification needed
- $39/month for unlimited messages

### 360Dialog
- Official WhatsApp Business API partner
- €49/month + message costs
- Full business features

### Wassenger
- Quick setup in 5 minutes
- $25/month starter plan
- Good for small businesses

## 📞 Contact Information Storage

Customers need to provide WhatsApp numbers in these formats:
- **International format**: +27123456789
- **Country code required**: +1, +44, +27, etc.
- **No spaces or special characters**: +27123456789 ✅, +27 123 456 789 ❌

## 🔐 Message Templates (Required for Production)

WhatsApp requires pre-approved message templates for automated messages:

### Template Example: "shipment_alert"
```
🌊 *{{company_name}} Alert*

📦 Shipment: {{shipment_id}}
🚢 Route: {{route}}
⚠️ Status: {{status}}
🌪️ Weather Risk: {{weather_risk}}
📅 ETA: {{eta}}

Track: {{tracking_url}}
```

## 💰 Costs

### Meta WhatsApp Business API
- **Setup**: Free
- **Messages**: $0.0055 - $0.09 per message (varies by country)
- **SA Rate**: ~$0.03 per message

### Twilio
- **Setup**: Free
- **Messages**: $0.0055 per message
- **Monthly fee**: None

### Third-Party Services
- **Setup**: Free
- **Monthly fee**: $25-$49
- **Messages**: Usually included in monthly fee