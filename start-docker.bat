@echo off
REM ==========================================
REM BookSwap Backend - Docker Helper Script
REM For Windows Users
REM ==========================================

echo.
echo ╔═══════════════════════════════════════════════════╗
echo ║     BookSwap Backend - Docker Setup              ║
echo ╚═══════════════════════════════════════════════════╝
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed!
    echo.
    echo Please install Docker Desktop:
    echo https://www.docker.com/products/docker-desktop/
    echo.
    pause
    exit /b 1
)

echo ✅ Docker is installed
echo.

REM Check if Docker is running
docker ps >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running!
    echo.
    echo Please start Docker Desktop and try again.
    echo.
    pause
    exit /b 1
)

echo ✅ Docker is running
echo.

REM Start services
echo 📦 Starting BookSwap Backend Services...
echo.
echo This will start:
echo   - MySQL Database (port 3308)
echo   - Redis Cache (port 6379)
echo   - Backend API (port 3000)
echo   - Adminer (port 8080)
echo.

docker-compose up -d

if errorlevel 1 (
    echo.
    echo ❌ Failed to start services!
    echo.
    echo Please check the error messages above.
    pause
    exit /b 1
)

echo.
echo ═══════════════════════════════════════════════════
echo.
echo ✅ All services started successfully!
echo.
echo 📊 Service URLs:
echo   - Backend API:  http://localhost:3000
echo   - Health Check: http://localhost:3000/health
echo   - Database UI:  http://localhost:8080
echo.
echo ⏳ Please wait 1-2 minutes for services to fully start...
echo.
echo 📝 To view logs:
echo    docker-compose logs -f backend
echo.
echo 🛑 To stop services:
echo    docker-compose stop
echo.
echo ═══════════════════════════════════════════════════
echo.

pause
