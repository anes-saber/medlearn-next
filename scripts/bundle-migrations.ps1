# Concatenates supabase/migrations/*.sql in order for the Supabase SQL Editor.
# Use when `npm run db:push` fails (e.g. wrong database password).
$ErrorActionPreference = "Stop"
$Root = Split-Path $PSScriptRoot -Parent
$MigrationsDir = Join-Path $Root "supabase\migrations"
$OutFile = Join-Path $Root "supabase\ALL_MIGRATIONS.sql"

$files = Get-ChildItem $MigrationsDir -Filter "*.sql" | Sort-Object Name
if ($files.Count -eq 0) {
  Write-Host "No migration files found in $MigrationsDir" -ForegroundColor Red
  exit 1
}

$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine("-- MEDlearn: run this entire file in Supabase Dashboard -> SQL Editor")
[void]$sb.AppendLine("-- Project: zjueqlqbbykckqtidmqz (anes-saber's Project)")
[void]$sb.AppendLine("-- Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm')")
[void]$sb.AppendLine("")

foreach ($file in $files) {
  [void]$sb.AppendLine("-- =============================================================================")
  [void]$sb.AppendLine("-- FILE: $($file.Name)")
  [void]$sb.AppendLine("-- =============================================================================")
  [void]$sb.AppendLine("")
  [void]$sb.AppendLine((Get-Content $file.FullName -Raw))
  [void]$sb.AppendLine("")
}

Set-Content -Path $OutFile -Value $sb.ToString() -Encoding UTF8
Write-Host "Wrote $OutFile ($($files.Count) migrations)" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Open https://supabase.com/dashboard/project/zjueqlqbbykckqtidmqz/sql/new"
Write-Host "  2. Paste the contents of supabase/ALL_MIGRATIONS.sql"
Write-Host "  3. Click Run"
