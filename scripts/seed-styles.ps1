Write-Host "🎨 Seeding Style Templates..."
Write-Host ""

# 1. Remove old seed data
Write-Host "🗑️  Removing old seed data..."
Remove-Item convex/seed-styles-data.json -ErrorAction SilentlyContinue

# 2. Process images and generate seed data
Write-Host "🖼️  Processing images..."
node scripts/upload-style-templates.js

# 3. Seed the database
Write-Host ""
Write-Host "💾 Seeding database..."
npx convex run seedStyles:seedAllStyles

Write-Host ""
Write-Host "✅ Done!"
