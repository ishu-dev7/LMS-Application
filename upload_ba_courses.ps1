# Upload BA and Senior BA courses to Nexora LMS
# Usage: .\upload_ba_courses.ps1 -AdminEmail "admin@nexora.com" -AdminPassword "Admin@123" -ApiBase "https://sharemarketlms-api.onrender.com"

param(
  [string]$AdminEmail    = "admin@nexora.com",
  [string]$AdminPassword = "Admin@123",
  [string]$ApiBase       = "https://sharemarketlms-api.onrender.com"
)

$ErrorActionPreference = "Stop"
$ContentDir = Join-Path $PSScriptRoot "backend\ShareMarketLMS.Api\Content"

function Post-Api {
  param([string]$Path, [object]$Body, [string]$Token = "")
  $h = @{ "Content-Type" = "application/json; charset=utf-8" }
  if ($Token) { $h["Authorization"] = "Bearer $Token" }
  $json  = $Body | ConvertTo-Json -Depth 10 -Compress
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
  return Invoke-RestMethod -Uri "$ApiBase$Path" -Method POST -Headers $h -Body $bytes
}

function Get-Api {
  param([string]$Path, [string]$Token = "")
  $h = @{}
  if ($Token) { $h["Authorization"] = "Bearer $Token" }
  return Invoke-RestMethod -Uri "$ApiBase$Path" -Method GET -Headers $h
}

# ── Login ─────────────────────────────────────────────────────────────────────
Write-Host "Logging in..." -ForegroundColor Cyan
$auth  = Post-Api -Path "/api/auth/login" -Body @{ email = $AdminEmail; password = $AdminPassword }
$TOKEN = $auth.token
Write-Host "Login OK as $($auth.displayName)" -ForegroundColor Green

# ── Parse markdown ─────────────────────────────────────────────────────────────
function Parse-Markdown {
  param([string]$FilePath)
  $raw     = [IO.File]::ReadAllText($FilePath, [Text.Encoding]::UTF8)
  $modules = [System.Collections.ArrayList]::new()

  # Split on ## headings (modules)
  $modParts = [regex]::Split($raw, '(?m)^## ')
  foreach ($part in $modParts) {
    $part = $part.Trim()
    if (-not $part) { continue }

    $lines    = $part -split "`n"
    $modTitle = $lines[0].Trim()
    $modBody  = ($lines[1..($lines.Length - 1)] -join "`n")

    $lessons = [System.Collections.ArrayList]::new()

    # Split on ### headings (lessons)
    $lessParts = [regex]::Split($modBody, '(?m)^### ')
    foreach ($lp in $lessParts) {
      $lp = $lp.Trim()
      if (-not $lp) { continue }
      $llines  = $lp -split "`n"
      $ltitle  = $llines[0].Trim()
      $lcontent = "### " + $lp
      [void]$lessons.Add(@{ Title = $ltitle; Content = $lcontent })
    }

    if ($lessons.Count -gt 0) {
      [void]$modules.Add(@{ Title = $modTitle; Lessons = $lessons })
    }
  }
  return $modules
}

function Get-Minutes {
  param([string]$text)
  $words = ($text -split '\s+').Count
  $mins  = [Math]::Max(5, [Math]::Ceiling($words / 200))
  return [Math]::Min($mins, 60)
}

# ── Course definitions ─────────────────────────────────────────────────────────
$COURSES = @(
  @{
    Slug  = "ba-role"
    Title = "Business Analyst - Interview Preparation"
    Desc  = "Complete step-by-step BA interview prep: requirements, process analysis, Agile BA, stakeholder management, and 50+ scenario-based questions."
    File  = "course_ba_role.md"
  },
  @{
    Slug  = "senior-ba-role"
    Title = "Senior Business Analyst - Advanced Preparation"
    Desc  = "Advanced Senior BA interview prep: enterprise analysis, business case development, strategic stakeholder management, and 60+ complex scenario questions."
    File  = "course_senior_ba.md"
  }
)

$grandTotal = 0

foreach ($c in $COURSES) {
  Write-Host ""
  Write-Host "=== $($c.Title) ===" -ForegroundColor Cyan

  # Create or find course
  $courseId = $null
  try {
    $course   = Post-Api -Path "/api/admin/courses" -Token $TOKEN -Body @{
      slug        = $c.Slug
      title       = $c.Title
      description = $c.Desc
      category    = "Training"
    }
    $courseId = $course.id
    Write-Host "  Course created id=$courseId" -ForegroundColor Green
  } catch {
    Write-Host "  Course may already exist - searching..." -ForegroundColor Yellow
    try {
      $all      = Get-Api -Path "/api/courses" -Token $TOKEN
      $existing = $all | Where-Object { $_.slug -eq $c.Slug }
      if ($existing) {
        $courseId = $existing.id
        Write-Host "  Using existing course id=$courseId" -ForegroundColor Yellow
      } else {
        Write-Host "  SKIP: cannot find or create course" -ForegroundColor Red
        continue
      }
    } catch {
      Write-Host "  SKIP: error finding course" -ForegroundColor Red
      continue
    }
  }

  # Parse content
  $filePath = Join-Path $ContentDir $c.File
  if (-not (Test-Path $filePath)) {
    Write-Host "  SKIP: file not found $filePath" -ForegroundColor Red
    continue
  }

  $modules = Parse-Markdown -FilePath $filePath
  Write-Host "  Parsed $($modules.Count) modules" -ForegroundColor Gray

  $mOrder     = 1
  $trackTotal = 0

  foreach ($mod in $modules) {
    $modTitle    = $mod.Title
    $isInterview = $modTitle -match 'Interview'
    $phase       = if ($isInterview) { "InterviewReady" } else { "Core" }
    $topicType   = if ($isInterview) { "InterviewReady" } else { "Regular" }

    Write-Host "  Module $mOrder`: $modTitle ($($mod.Lessons.Count) lessons)" -ForegroundColor Gray

    try {
      $module   = Post-Api -Path "/api/admin/modules" -Token $TOKEN -Body @{
        courseId  = $courseId
        title     = $modTitle
        order     = $mOrder
        phase     = $phase
        topicType = $topicType
      }
      $moduleId = $module.id
    } catch {
      Write-Host "    ERROR creating module: $modTitle" -ForegroundColor Red
      $mOrder++
      continue
    }

    $lOrder = 1
    foreach ($lesson in $mod.Lessons) {
      $mins = Get-Minutes -text $lesson.Content
      try {
        [void](Post-Api -Path "/api/admin/lessons" -Token $TOKEN -Body ([PSCustomObject]@{
          moduleId         = $moduleId
          title            = $lesson.Title
          order            = $lOrder
          estimatedMinutes = $mins
          contentMarkdown  = $lesson.Content
        }))
        Write-Host "    [OK] $($lesson.Title)" -ForegroundColor Green
        $trackTotal++
        $lOrder++
      } catch {
        Write-Host "    ERROR lesson: $($lesson.Title)" -ForegroundColor Red
      }
    }

    $mOrder++
  }

  Write-Host "  Done: $trackTotal lessons uploaded" -ForegroundColor Cyan
  $grandTotal += $trackTotal
}

Write-Host ""
Write-Host "COMPLETE. Total lessons uploaded: $grandTotal" -ForegroundColor Cyan
