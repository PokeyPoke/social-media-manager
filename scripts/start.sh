#!/bin/bash

echo "🚀 Starting application..."

# Check if migrations have been run
if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "📦 Running database migrations..."
  npx prisma migrate deploy
  
  if [ $? -eq 0 ]; then
    echo "✅ Migrations completed successfully"
  else
    echo "❌ Migration failed"
    exit 1
  fi
fi

# Start the Next.js application
echo "🌐 Starting Next.js server..."
npm start