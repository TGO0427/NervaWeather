# Synerore Costing App - Team Setup Guide

## 🚀 Quick Start for Administrator

### Option 1: Using Batch File (Recommended)
1. Double-click `start-server.bat`
2. Share the Network URL with your team

### Option 2: Using PowerShell
1. Right-click `start-server.ps1` → "Run with PowerShell"
2. Share the Network URL with your team

### Option 3: Manual Start
1. Open Command Prompt in this folder
2. Run: `wsl -d Ubuntu -e bash -c "cd /mnt/c/Users/Tino/new-costing-app && node server.js"`
3. Note the Network URL displayed

## 👥 For Internal Staff

### Accessing the App
1. Open any web browser (Chrome, Firefox, Edge)
2. Go to: **http://172.20.18.135:3000/costing-app.html**
3. The app will load with shared quote functionality

### Features Available
- **Cost Generator**: Create detailed shipping cost estimates
- **Dashboard**: View all saved quotes from the team
- **Cost Request**: Submit requests for complex quotes
- **PDF Export**: Generate professional quote PDFs

### Saving & Sharing Quotes
- All quotes saved through the web app are shared with the team
- Quotes appear in real-time on everyone's Dashboard
- Each quote gets a unique quote number (format: SYN-YYYYMMXXXX)

## 🔧 Troubleshooting

### If the app won't load:
1. Check if the server is running (administrator should see the server console)
2. Try the Local URL: http://localhost:3000/costing-app.html
3. Check firewall settings if on different computers

### Network Issues:
- Make sure all computers are on the same network
- Windows Firewall might block the connection - add exception for port 3000
- Try disabling Windows Firewall temporarily to test

## 📋 System Requirements
- Any modern web browser
- Network connection to the server computer
- Internet connection (for Firebase database)

## 🔒 Security Notes
- This server is only accessible on your internal network
- Firebase handles all data storage securely
- No sensitive data is transmitted unencrypted

## 📞 Support
Contact the IT administrator if you experience any issues accessing the application.

---
**Server Details:**
- Port: 3000
- Network IP: 172.20.18.135
- Database: Firebase Cloud Firestore