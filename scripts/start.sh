#!/bin/bash
set -e  # Exit on any error

echo "🚀 Starting application..."

# Set memory optimization for Node.js
export NODE_OPTIONS="--max-old-space-size=512"

# Check if migrations have been run
if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "📦 Running database migrations..."
  timeout 60 npx prisma migrate deploy
  
  if [ $? -eq 0 ]; then
    echo "✅ Migrations completed successfully"
  else
    echo "❌ Migration failed or timed out"
    exit 1
  fi
fi

# Generate Prisma client if needed
echo "🔧 Ensuring Prisma client is generated..."
npx prisma generate

# Start the Next.js application
echo "🌐 Starting Next.js server..."
exec npm run start:next