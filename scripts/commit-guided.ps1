param(
  [switch]$All,
  [switch]$DryRun,
  [string]$Type,
  [string]$Scope,
  [string]$Summary,
  [string]$Reason
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Test-GitSafeDirectory {
  $previousErrorActionPreference = $ErrorActionPreference
  $ErrorActionPreference = "Continue"

  try {
    $output = & git status --short 2>&1
    $exitCode = $LASTEXITCODE
  } catch {
    $output = $_.ToString()
    $exitCode = 1
  } finally {
    $ErrorActionPreference = $previousErrorActionPreference
  }

  return @{
    IsSafe = $exitCode -eq 0
    Output = ($output | Out-String).Trim()
  }
}

function Read-RequiredValue {
  param(
    [string]$Label,
    [string]$CurrentValue
  )

  if (-not [string]::IsNullOrWhiteSpace($CurrentValue)) {
    return $CurrentValue.Trim()
  }

  while ($true) {
    $value = Read-Host $Label
    if (-not [string]::IsNullOrWhiteSpace($value)) {
      return $value.Trim()
    }

    Write-Host "Value cannot be empty. Please try again." -ForegroundColor Yellow
  }
}

function Normalize-Type {
  param([string]$RawType)

  $allowedTypes = @("feat", "fix", "refactor", "test", "docs", "chore", "build", "ci", "perf", "style")
  $normalizedType = $RawType.Trim().ToLowerInvariant()

  if ($allowedTypes -notcontains $normalizedType) {
    throw "type must be one of: $($allowedTypes -join ', ')"
  }

  return $normalizedType
}

function Normalize-Scope {
  param([string]$RawScope)

  if ([string]::IsNullOrWhiteSpace($RawScope)) {
    return ""
  }

  $trimmed = $RawScope.Trim().ToLowerInvariant()

  if ($trimmed -notmatch '^[a-z0-9-]+$') {
    throw "scope may only contain lowercase letters, numbers, and hyphens."
  }

  return $trimmed
}

function Build-CommitSubject {
  param(
    [string]$CommitType,
    [string]$CommitScope,
    [string]$CommitSummary
  )

  if ([string]::IsNullOrWhiteSpace($CommitScope)) {
    return "${CommitType}: $CommitSummary"
  }

  return "${CommitType}(${CommitScope}): $CommitSummary"
}

$safeCheck = Test-GitSafeDirectory
if (-not $safeCheck.IsSafe) {
  Write-Host "This repository is not marked as a git safe.directory, so commit cannot continue." -ForegroundColor Red
  Write-Host ""
  Write-Host "Run this first:" -ForegroundColor Yellow
  Write-Host "git config --global --add safe.directory D:/workspace/rhythm-havoc-monkey-king"
  Write-Host ""
  if ($safeCheck.Output) {
    Write-Host "git output:" -ForegroundColor Yellow
    Write-Host $safeCheck.Output
  }
  exit 1
}

Write-Host "Commit message format:" -ForegroundColor Cyan
Write-Host "type(scope): summary"
Write-Host ""
Write-Host "reason: why this change is needed"
Write-Host ""
Write-Host "Allowed type: feat, fix, refactor, test, docs, chore, build, ci, perf, style"
Write-Host "scope is optional, for example: level1, audio, scene"
Write-Host ""

$commitType = Normalize-Type (Read-RequiredValue -Label "type" -CurrentValue $Type)
$commitScope = Normalize-Scope $Scope
$commitSummary = Read-RequiredValue -Label "summary" -CurrentValue $Summary
$commitReason = Read-RequiredValue -Label "reason" -CurrentValue $Reason

$subject = Build-CommitSubject -CommitType $commitType -CommitScope $commitScope -CommitSummary $commitSummary
$bodyLine = "reason: $commitReason"

Write-Host ""
Write-Host "Commit message preview:" -ForegroundColor Cyan
Write-Host $subject
Write-Host ""
Write-Host $bodyLine
Write-Host ""

$tempFile = [System.IO.Path]::GetTempFileName()

try {
  $commitMessage = "$subject`n`n$bodyLine`n"
  Set-Content -LiteralPath $tempFile -Value $commitMessage -Encoding UTF8

  & node scripts/validate-commit-message.mjs $tempFile
  if ($LASTEXITCODE -ne 0) {
    throw "Commit message validation failed."
  }

  if ($DryRun) {
    Write-Host "Dry run mode. Skipping git add and git commit." -ForegroundColor Yellow
    exit 0
  }

  if ($All) {
    & git add -A
    if ($LASTEXITCODE -ne 0) {
      throw "git add -A failed."
    }
  } else {
    Write-Host "-All not enabled. Only currently staged files will be committed." -ForegroundColor Yellow
  }

  & git commit -m $subject -m $bodyLine
  if ($LASTEXITCODE -ne 0) {
    throw "git commit failed."
  }

  Write-Host "Commit complete." -ForegroundColor Green
} finally {
  if (Test-Path -LiteralPath $tempFile) {
    Remove-Item -LiteralPath $tempFile -Force
  }
}
