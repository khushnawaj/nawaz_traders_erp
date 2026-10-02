#!/bin/sh
set -e

echo "--------------------------------------------------------"
echo "🌾 Nawaz Traders ERP — Production Startup"
echo "--------------------------------------------------------"

# Apply Prisma schema migrations if DATABASE_URL is configured
if [ -n "$DATABASE_URL" ]; then
  echo "⏳ Verifying database connection & applying schema..."
  npx prisma db push --skip-generate
  echo "✅ Database schema sync complete."
fi

echo "🚀 Starting Next.js Standalone Production Server on port ${PORT:-3000}..."
exec "$@"
