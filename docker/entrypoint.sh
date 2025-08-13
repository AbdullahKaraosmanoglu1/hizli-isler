#!/bin/sh
set -e

echo ">> Waiting DB..."
sleep 3

if [ -d "prisma" ]; then
  echo ">> Running Prisma migrations (deploy)"
  npx prisma migrate deploy || (echo ">> deploy failed, trying dev" && npx prisma migrate dev)

  if [ -f "prisma/seed.ts" ] || [ -f "prisma/seed.js" ]; then
    echo ">> Seeding data"
    npm run seed || true
  fi
fi

echo ">> Starting app"
node dist/main.js
