#!/bin/bash

# Script to push to all remotes simultaneously
# Usage: ./scripts/push-all.sh [branch-name]
# If branch-name is not provided, uses current branch

set -e

# Get branch name from argument or current branch
BRANCH=${1:-$(git symbolic-ref --short HEAD)}

echo "🚀 Pushing to all remotes..."
echo "📦 Branch: $BRANCH"
echo ""

# Push to origin
echo "📍 Pushing to origin..."
git push origin "$BRANCH" || {
    echo "❌ Failed to push to origin"
    exit 1
}

# Push to xirothedev
echo "📍 Pushing to xirothedev..."
git push xirothedev "$BRANCH" || {
    echo "⚠️  Failed to push to xirothedev (continuing anyway)"
}

echo ""
echo "✅ Push completed!"

