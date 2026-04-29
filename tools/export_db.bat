@echo off
set PGDUMP_PATH="C:\laragon\bin\postgresql\pgsql\bin\pg_dump.exe"
set DB_NAME=desa_cimanggu_db
set DB_USER=postgres
set OUTPUT_FILE=backup_desa_cimanggu_%date:~10,4%%date:~4,2%%date:~7,2%.sql

echo Exporting database %DB_NAME% to %OUTPUT_FILE%...
%PGDUMP_PATH% -h localhost -U %DB_USER% -d %DB_NAME% > %OUTPUT_FILE%

if %ERRORLEVEL% equ 0 (
    echo.
    echo Export Berhasil! File tersimpan di: %OUTPUT_FILE%
) else (
    echo.
    echo Gagal mengekspor database.
)
pause
