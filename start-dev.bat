@echo off
title RanMet Web App - Dev Server
echo ===================================================
echo   Dang khoi dong RanMet Web App (Next.js 16)
echo ===================================================
set PATH=D:\nodejs;D:\PortableGit\cmd;%PATH%
cd /d "%~dp0"

if not exist ".env.local" (
    echo [CANH BAO] Chua tim thay file .env.local!
    echo Vui long tao hoac cap nhat file .env.local voi cac thong so tu Supabase.
)

call npm run dev
pause
