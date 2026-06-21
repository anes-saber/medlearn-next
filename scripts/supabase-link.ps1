# Link local repo to the MEDlearn Supabase project.
$ErrorActionPreference = "Stop"
$Root = Split-Path $PSScriptRoot -Parent
Set-Location $Root

$ProjectRef = "zjueqlqbbykckqtidmqz"

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
  Write-Host "Set SUPABASE_DB_PASSWORD in .env.local first." -ForegroundColor Red
  Write-Host 'Use quotes if the password contains # or @: SUPABASE_DB_PASSWORD="your-pass"'
  Write-Host ""
  exit 1
}

Write-Host "Linking to project $ProjectRef..." -ForegroundColor Cyan
npx supabase link --project-ref $ProjectRef --yes @args
