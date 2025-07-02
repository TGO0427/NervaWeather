param()

Write-Host "
========================================
   SYNERORE COSTING APP SERVER
========================================
" -ForegroundColor Green

Write-Host "Starting server..." -ForegroundColor Yellow

try {
    # Start the Node.js server
    wsl -d Ubuntu -e bash -c "cd /mnt/c/Users/Tino/new-costing-app && node server.js"
} 
catch {
    Write-Host "Error starting server: $_" -ForegroundColor Red
}

Write-Host "`nServer stopped. Press any key to exit..." -ForegroundColor Yellow
Read-Host