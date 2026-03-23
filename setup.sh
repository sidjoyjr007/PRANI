#!/bin/bash

# Prani Database Migration - Setup Script
# This script automates the setup and data restoration on a new computer.

set -e

# Configuration
DUMP_FILE="db_dump.sql"
CONTAINER_NAME="prani_postgres"
DB_USER="prani_user"
DB_NAME="prani_db"

echo "🌟 Prani Setup & Migration Script"
echo "----------------------------------"

# 1. Dependency Check
echo "🔍 Checking dependencies..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker and try again."
    exit 1
fi

if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install it and try again."
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    echo "⚠️ Python3 is not installed. You will need to install it manually for the backend."
fi

if ! command -v node &> /dev/null; then
    echo "⚠️ Node.js is not installed. You will need to install it manually for the frontend."
fi

# 2. Start Containers
echo "🐳 Starting Docker containers..."
docker compose up -d

# 3. Wait for Database to be ready
echo "⏳ Waiting for Postgres to be ready..."
MAX_RETRIES=30
COUNT=0
until docker exec "$CONTAINER_NAME" pg_isready -U "$DB_USER" &> /dev/null || [ $COUNT -eq $MAX_RETRIES ]; do
    sleep 2
    ((COUNT++))
    echo -n "."
done

if [ $COUNT -eq $MAX_RETRIES ]; then
    echo "❌ Timeout waiting for Postgres."
    exit 1
fi
echo " Ready!"

# 4. Restore Data
if [ -f "$DUMP_FILE" ]; then
    echo "📥 Restoring database dump from $DUMP_FILE..."
    # We clear the existing data if it's already there (optional but safer for clean restoration)
    # Since this is likely a new system, it's fine.
    cat "$DUMP_FILE" | docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME"
    echo "✅ Database restored successfully!"
else
    echo "⚠️ Warning: $DUMP_FILE not found. Skipping data restoration."
fi

# 5. Environment File Setup
if [ ! -f "backend/.env" ] && [ -f "backend/.env.example" ]; then
    echo "📄 Creating backend/.env from .env.example..."
    cp backend/.env.example backend/.env
    echo "⚠️ Please update backend/.env with your secrets (JWT, SMTP, etc.)"
fi

echo "----------------------------------"
echo "🎉 Setup complete! Prani database is running."
echo ""
echo "📱 Next steps to start the application:"
echo ""
echo "Backend (Terminal 1):"
echo "  cd backend"
echo "  python3 -m venv venv"
echo "  source venv/bin/activate"
echo "  pip install -r requirements.txt"
echo "  python3 main.py"
echo ""
echo "Frontend (Terminal 2):"
echo "  cd frontend"
echo "  npm install"
echo "  npm run dev"
echo ""
echo "Access the frontend at http://localhost:5173"
echo "Access the backend API at http://localhost:8000"
