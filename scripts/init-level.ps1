param(
  [string]$LevelId,
  [string]$LevelName,
  [switch]$DryRun,
  [switch]$Force
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($LevelId)) {
  $LevelId = Read-Host "levelId"
}

if ([string]::IsNullOrWhiteSpace($LevelName)) {
  $LevelName = Read-Host "levelName"
}

$arguments = @(
  "scripts/init-level.mjs",
  "--levelId",
  $LevelId,
  "--levelName",
  $LevelName
)

if ($DryRun) {
  $arguments += "--dry-run"
}

if ($Force) {
  $arguments += "--force"
}

& node @arguments
