@echo off
title RanMet Web App - Dev Server
echo ===================================================
echo   Dang khoi dong RanMet Web App (Next.js 16)
echo ===================================================
set PATH=D:\nodejs;D:\PortableGit\cmd;%PATH%
cd /d "%~dp0"
call npm run dev
pause