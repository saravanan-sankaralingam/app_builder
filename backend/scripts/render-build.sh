#!/usr/bin/env bash
# Render build script

set -e

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building application..."
npm run build

echo "🗄️  Running database migrations..."
npm run db:migrate:deploy

echo "✅ Build complete!"
