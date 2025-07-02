import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the current directory
app.use(express.static(__dirname));

// Route for the main app
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'costing-app.html'));
});

// Get local IP address
import { networkInterfaces } from 'os';
const getLocalIP = () => {
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return 'localhost';
};

// Start server
app.listen(PORT, '0.0.0.0', () => {
    const localIP = getLocalIP();
    console.log(`\n🚀 Synerore Costing App Server Started!`);
    console.log(`\n📍 Access URLs:`);
    console.log(`   Local: http://localhost:${PORT}/costing-app.html`);
    console.log(`   Network: http://${localIP}:${PORT}/costing-app.html`);
    console.log(`\n📋 Share this URL with your team:`);
    console.log(`   http://${localIP}:${PORT}/costing-app.html`);
    console.log(`\n⚡ Press Ctrl+C to stop the server\n`);
});