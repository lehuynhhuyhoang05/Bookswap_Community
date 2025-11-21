#!/bin/bash
# ==========================================
# BookSwap Backend - Docker Helper Script
# For Linux/Mac Users
# ==========================================

echo ""
echo "╔═══════════════════════════════════════════════════╗"
echo "║     BookSwap Backend - Docker Setup              ║"
echo "╚═══════════════════════════════════════════════════╝"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed!"
    echo ""
    echo "Please install Docker:"
    echo "https://www.docker.com/products/docker-desktop/"
    echo ""
    exit 1
fi

echo "✅ Docker is installed"
echo ""

# Check if Docker is running
if ! docker ps &> /dev/null; then
    echo "❌ Docker is not running!"
    echo ""
    echo "Please start Docker and try again."
    echo ""
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Start services
echo "📦 Starting BookSwap Backend Services..."
echo ""
echo "This will start:"
echo "  - MySQL Database (port 3308)"
echo "  - Redis Cache (port 6379)"
echo "  - Backend API (port 3000)"
echo "  - Adminer (port 8080)"
echo ""

docker-compose up -d

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Failed to start services!"
    echo ""
    echo "Please check the error messages above."
    exit 1
fi

echo ""
echo "═══════════════════════════════════════════════════"
echo ""
echo "✅ All services started successfully!"
echo ""
echo "📊 Service URLs:"
echo "  - Backend API:  http://localhost:3000"
echo "  - Health Check: http://localhost:3000/health"
echo "  - Database UI:  http://localhost:8080"
echo ""
echo "⏳ Please wait 1-2 minutes for services to fully start..."
echo ""
echo "📝 To view logs:"
echo "   docker-compose logs -f backend"
echo ""
echo "🛑 To stop services:"
echo "   docker-compose stop"
echo ""
echo "═══════════════════════════════════════════════════"
echo ""
