#!/bin/bash
set -e

echo "🚀 Deploying Manhattan Dashboard to Vercel..."

# Build with analysis
echo "📊 Building with bundle analysis..."
ANALYZE=true pnpm build

# Deploy to preview
echo "🌐 Deploying to preview..."
vercel --yes

# Deploy to production (uncomment when ready)
# echo "🌐 Deploying to production..."
# vercel --prod --yes

echo "✅ Deployment complete!"
