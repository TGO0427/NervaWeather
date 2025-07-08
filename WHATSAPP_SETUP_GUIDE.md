# 📱 WhatsApp Automatic Alerts Setup Guide

## 🚀 How to Send WhatsApp Alerts to Other People Automatically

### Current Status
✅ **Alert System**: Fully implemented with 3 API options  
✅ **Message Templates**: Professional alert formats ready  
✅ **Contact Management**: Phone number generation and validation  
✅ **Multi-Channel**: SMS, WhatsApp, Email, Webhooks  
✅ **Failover System**: Automatic retry with 3 different APIs  

---

## 🎯 Quick Start (Choose One Option)

### Option 1: ChatAPI.com (Fastest - 5 Minutes)
**Best for**: Immediate testing and small businesses

1. **Sign Up**: Go to [chat-api.com](https://chat-api.com)
2. **Get QR Code**: They'll show you a QR code
3. **Scan with WhatsApp**: Open WhatsApp on your phone → Settings → Linked Devices → Link a Device
4. **Get Credentials**: Copy your Instance ID and Token
5. **Update Config**: Edit `whatsapp-config.js`:
   ```javascript
   chatapi: {
       instanceId: 'instance123456', // Your actual instance ID
       token: 'your_actual_token',   // Your actual token
       apiUrl: 'https://api.chat-api.com'
   }
   ```

**Cost**: $39/month for unlimited messages

---

### Option 2: Twilio (Developer-Friendly)
**Best for**: Developers and scalable solutions

1. **Create Account**: Sign up at [twilio.com](https://twilio.com)
2. **WhatsApp Sandbox**: Go to Console → Messaging → WhatsApp
3. **Join Sandbox**: Send "join [your-code]" to +1 415 523 8886
4. **Get Credentials**: Copy Account SID and Auth Token
5. **Update Config**: Edit `whatsapp-config.js`:
   ```javascript
   twilio: {
       accountSid: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
       authToken: 'your_auth_token',
       fromNumber: 'whatsapp:+14155238886',
       apiUrl: 'https://api.twilio.com/2010-04-01'
   }
   ```

**Cost**: $0.0055 per message (very cheap)

---

### Option 3: Meta WhatsApp Business API (Enterprise)
**Best for**: Large businesses and official verification

1. **Business Account**: Create at [business.facebook.com](https://business.facebook.com)
2. **Developer App**: Go to [developers.facebook.com](https://developers.facebook.com)
3. **WhatsApp Product**: Add WhatsApp to your app
4. **Get Credentials**: Copy Phone Number ID and Access Token
5. **Update Config**: Edit `whatsapp-config.js`:
   ```javascript
   meta: {
       phoneNumberId: '123456789012345',
       accessToken: 'EAAxxxxxxxxxxxxxxxxxxxxxxx',
       apiUrl: 'https://graph.facebook.com/v17.0'
   }
   ```

**Cost**: $0.03 per message + verification process

---

## 🔧 Implementation Steps

### Step 1: Choose Your API (Above)
Pick ChatAPI.com for fastest setup, Twilio for developers, or Meta for enterprise.

### Step 2: Update Configuration
Edit the `whatsapp-config.js` file with your actual credentials.

### Step 3: Add Customer Phone Numbers
**Option A**: Manual entry in shipment forms  
**Option B**: Bulk import via CSV with phone number column  
**Option C**: Use auto-generated numbers (for testing)

### Step 4: Test the System
1. Open `costing-app.html`
2. Go to `📦 Shipment Tracking`
3. Click `➕ Add Batch` to create test shipments
4. Select shipments with checkboxes
5. Click `📱 Send Alerts`
6. **Real WhatsApp messages will be sent!**

---

## 📞 Phone Number Format Requirements

### Supported Formats:
- ✅ `+27123456789` (International format)
- ✅ `+1234567890` (Any country code)
- ✅ `27123456789` (Will add + automatically)
- ✅ `0123456789` (SA format - converts to +27)

### Invalid Formats:
- ❌ `123-456-7890` (Dashes not supported)
- ❌ `(012) 345 6789` (Spaces/brackets not supported)

The system automatically formats phone numbers correctly.

---

## 💬 Example WhatsApp Alert

When you click "📱 Send Alerts", customers receive:

```
🌊 *Nerva Weather Intelligence Alert*

📦 Shipment: NERVA1234
🚢 Route: Shanghai → Durban
⚠️ Status: In Transit  
🌪️ Weather Risk: Critical
📅 ETA: 2025-02-15
💰 Value: R285,000

*Recommended Action:* Immediate action required: Consider alternative routing or delay shipment until weather improves.

Track live: https://nerva.ai/track/NERVA1234
```

---

## 🔄 How the Automatic System Works

### 1. Smart Alert Distribution
- **Critical Weather**: SMS + WhatsApp + Email
- **Delays**: SMS + Email  
- **Regular Updates**: WhatsApp + Email
- **System Integration**: Always webhook

### 2. Failover System
1. **Try Meta API** (if configured)
2. **Fallback to Twilio** (if Meta fails)
3. **Fallback to ChatAPI** (if Twilio fails)  
4. **Log for manual follow-up** (if all fail)

### 3. Contact Information Storage
Each shipment stores:
- `contactPhone`: For SMS alerts
- `contactWhatsApp`: For WhatsApp messages  
- `contactEmail`: For email notifications
- `contactName`: For personalization

---

## 🎯 Production Deployment

### For Real Business Use:

1. **Get WhatsApp Business Verification**
   - Apply for official WhatsApp Business account
   - Get green checkmark verification
   - Use approved message templates

2. **Set Up Webhooks**
   - Receive delivery confirmations
   - Handle message status updates
   - Process customer replies

3. **Customer Onboarding**
   - Collect WhatsApp numbers during signup
   - Get consent for automated messages
   - Allow customers to opt-out

4. **Compliance**
   - Follow WhatsApp Business Policy
   - Respect opt-out requests
   - Send only relevant business messages

---

## 💰 Cost Comparison

| Provider | Setup | Monthly | Per Message | Best For |
|----------|-------|---------|-------------|----------|
| ChatAPI | Free | $39 | Unlimited | Quick Start |
| Twilio | Free | $0 | $0.0055 | Developers |
| Meta API | Free | $0 | $0.03 | Enterprise |

---

## 🛠️ Troubleshooting

### WhatsApp Not Sending?
1. Check browser console for errors
2. Verify API credentials in `whatsapp-config.js`
3. Ensure phone numbers are in +27 format
4. Test with your own number first

### API Errors?
- **401 Unauthorized**: Check your API tokens
- **400 Bad Request**: Verify phone number format  
- **429 Rate Limited**: Too many messages - wait and retry

### Messages Not Received?
1. Check if recipient has WhatsApp installed
2. Verify the phone number is correct
3. Ensure recipient hasn't blocked business messages
4. Check WhatsApp Business settings

---

## 🎉 Ready to Send Real WhatsApp Alerts!

Once configured, your logistics system will automatically send professional WhatsApp alerts to customers whenever:
- ⚠️ Critical weather threatens their shipments
- 🚢 Shipments are delayed or arrive early  
- 📍 Status changes occur
- 💰 Cost optimizations save them money

**The system is fully automated - no manual intervention required!**