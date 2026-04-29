@echo off
set PSQL_PATH="C:\laragon\bin\postgresql\pgsql\bin\psql.exe"
set DB_NAME=desa_cimanggu_db
set DB_USER=postgres

echo ==========================================
echo Import Database PostgreSQL (Lokal)
echo ==========================================
echo.

:: List available .sql backup files in the current directory
echo File backup (.sql) yang ditemukan:
dir /b *.sql
echo.

set /p SQL_FILE="Masukkan nama file yang ingin di-import (contoh: backup_...sql): "

if not exist "%SQL_FILE%" (
    echo.
    echo Error: File "%SQL_FILE%" tidak ditemukan!
    pause
    exit /b
)

echo.
echo Melakukan import %SQL_FILE% ke database %DB_NAME%...
echo (Ini akan menimpa data yang ada jika file backup berisi perintah DROP/CREATE)
echo.

%PSQL_PATH% -h localhost -U %DB_USER% -d %DB_NAME% -f "%SQL_FILE%"

if %ERRORLEVEL% equ 0 (
    echo.
    echo Import Berhasil! Data telah diperbarui.
) else (
    echo.
    echo Gagal meng-import database. Pastikan database %DB_NAME% sudah ada.
)

echo.
pause
