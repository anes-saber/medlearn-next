# Push local migrations to the linked Supabase project.
# Requires SUPABASE_DB_PASSWORD in .env.local (Database password from dashboard).
$ErrorActionPreference = "Stop"
$Root = Split-Path $PSScriptRoot -Parent
Set-Location $Root

if (-not $env:SUPABASE_DB_PASSWORD) {
  $envFile = Join-Path $Root ".env.local"
  if (Test-Path $envFile) {
    $raw = Get-Content $envFile -Raw
    if ($raw -match '(?m)^SUPABASE_DB_PASSWORD=(.+)$') {
      $env:SUPABASE_DB_PASSWORD = $matches[1].Trim().Trim('"').Trim("'")
    }
  }
}

if (-not $env:SUPABASE_DB_PASSWORD) {
  Write-Host ""
  Write-Host "Missing SUPABASE_DB_PASSWORD." -ForegroundColor Red
  Write-Host "Add it to .env.local (Project Settings -> Database -> Database password):"
  Write-Host '  SUPABASE_DB_PASSWORD="your-password"'
  Write-Host ""
  Write-Host "PowerShell tip: use single quotes when setting manually:" -ForegroundColor Yellow
  Write-Host '  $env:SUPABASE_DB_PASSWORD=''your-password'''
  Write-Host "  (# and @ are special in double-quoted strings)"
  Write-Host ""
  exit 1
}

Write-Host "Pushing migrations..." -ForegroundColor Cyan
$output = npx supabase db push @args 2>&1 | Tee-Object -Variable pushOutput
$code = $LASTEXITCODE

if ($code -ne 0 -and ($pushOutput -match "28P01|password authentication failed")) {
  Write-Host ""
  Write-Host "Database password rejected by Supabase." -ForegroundColor Red
  Write-Host "Your SUPABASE_DB_PASSWORD does not match the MEDlearn project password."
  Write-Host ""
  Write-Host "Fix option A — reset password:"
  Write-Host "  https://supabase.com/dashboard/project/zjueqlqbbykckqtidmqz/settings/database"
  Write-Host '  Then update .env.local: SUPABASE_DB_PASSWORD="new-password"'
  Write-Host "  Then run: npm run db:push"
  Write-Host ""
  Write-Host "Fix option B — apply SQL manually (no CLI password needed):"
  Write-Host "  npm run db:bundle"
  Write-Host "  Paste supabase/ALL_MIGRATIONS.sql into the SQL Editor and Run."
  Write-Host ""
}

exit $code
