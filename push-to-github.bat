@echo off
title Push RanMet to GitHub
set PATH=D:\nodejs;D:\PortableGit\cmd;%PATH%
cd /d "%~dp0"
echo Dang day code len GitHub...
git push -f -u origin main
echo.
echo ===================================================
echo   DA DAY CODE LEN GITHUB HOAN TAT!
echo ===================================================
pause