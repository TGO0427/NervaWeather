@echo off
title Synerore Costing App Server
color 0A
echo.
echo ========================================
echo    SYNERORE COSTING APP SERVER
echo ========================================
echo.
echo Starting server...
echo.
wsl -d Ubuntu -e bash -c "cd /mnt/c/Users/Tino/new-costing-app && node server.js"
echo.
echo Server stopped. Press any key to exit...
pause