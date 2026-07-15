# Upload BA courses to Nexora LMS
# Usage: .\upload_ba_courses.ps1 -AdminEmail "admin@nexora.com" -AdminPassword "Admin@123" -ApiBase "https://sharemarketlms-api.onrender.com"

param(
  [string]$AdminEmail    = "admin@nexora.com",
  [string]$AdminPassword = "Admin@123",
  [string]$ApiBase       = "https://sharemarketlms-api.onrender.com"
)

$ErrorActionPreference = "Stop"

function Invoke-Api {
  param([string]$Method, [string]$Path, [hashtable]$Body, [string]$Token)
  $headers = @{ "Content-Type" = "application/json" }
  if ($Token) { $headers["Authorization"] = "Bearer $Token" }
  $json = if ($Body) { $Body | ConvertTo-Json -Depth 10 } else { $null }
  $resp = Invoke-RestMethod -Method $Method -Uri "$ApiBase$Path" -Headers $headers -Body $json -ErrorAction Stop
  return $resp
}

# ── Login ────────────────────────────────────────────────────────────────────
Write-Host "Logging in..." -ForegroundColor Cyan
$login = Invoke-Api -Method POST -Path "/api/auth/login" -Body @{ email = $AdminEmail; password = $AdminPassword }
$token = $login.token
Write-Host "Logged in as $($login.displayName)" -ForegroundColor Green

# ── Course definitions ────────────────────────────────────────────────────────
$courses = @(
  @{
    slug        = "ba-role"
    title       = "Business Analyst - Interview Preparation"
    description = "Complete step-by-step BA interview prep: requirements, process analysis, Agile BA, stakeholder management, and 50+ scenario-based questions."
    emoji       = "📋"
    category    = "Training"
    file        = "course_ba_role.md"
  },
  @{
    slug        = "senior-ba-role"
    title       = "Senior Business Analyst - Advanced Preparation"
    description = "Advanced Senior BA interview prep: enterprise analysis, business case development, strategic stakeholder management, and 60+ complex scenario questions."
    emoji       = "🎯"
    category    = "Training"
    file        = "course_senior_ba.md"
  }
)

$contentBase = "$PSScriptRoot\backend\ShareMarketLMS.Api\Content"

foreach ($course in $courses) {
  Write-Host "`n=== Processing: $($course.title) ===" -ForegroundColor Yellow

  # Check if course exists
  $existing = $null
  try {
    $all = Invoke-Api -Method GET -Path "/api/admin/courses" -Token $token
    $existing = $all | Where-Object { $_.slug -eq $course.slug }
  } catch { }

  $courseId = $null
  if ($existing) {
    $courseId = $existing.id
    Write-Host "  Course already exists (ID: $courseId) - updating..." -ForegroundColor DarkYellow
  } else {
    Write-Host "  Creating course..." -ForegroundColor Cyan
    $created = Invoke-Api -Method POST -Path "/api/admin/courses" -Token $token -Body @{
      slug        = $course.slug
      title       = $course.title
      description = $course.description
      emoji       = $course.emoji
      category    = $course.category
    }
    $courseId = $created.id
    Write-Host "  Created course ID: $courseId" -ForegroundColor Green
  }

  # Parse the markdown content file
  $mdPath = Join-Path $contentBase $course.file
  if (-not (Test-Path $mdPath)) {
    Write-Host "  ERROR: Content file not found: $mdPath" -ForegroundColor Red
    continue
  }

  $lines = Get-Content $mdPath -Encoding UTF8

  # Parse modules (## headings) and lessons (### headings)
  $modules = @()
  $currentModule = $null
  $lessonBuffer = @()

  foreach ($line in $lines) {
    if ($line -match '^## (.+)$') {
      # Save previous module
      if ($currentModule) {
        $currentModule.LessonBuffer = $lessonBuffer
        $modules += $currentModule
        $lessonBuffer = @()
      }
      $currentModule = @{ Title = $matches[1].Trim(); Lessons = @(); LessonBuffer = @() }
    } elseif ($line -match '^### (.+)$') {
      if ($currentModule) {
        # Save previous lesson body to last lesson
        if ($currentModule.Lessons.Count -gt 0) {
          $lastLesson = $currentModule.Lessons[-1]
          $lastLesson.Body = ($lessonBuffer -join "`n").Trim()
          $lessonBuffer = @()
        }
        $currentModule.Lessons += @{ Title = $matches[1].Trim(); Body = "" }
        $lessonBuffer = @()
      }
    } else {
      $lessonBuffer += $line
    }
  }

  # Flush final lesson and module
  if ($currentModule) {
    if ($currentModule.Lessons.Count -gt 0) {
      $lastLesson = $currentModule.Lessons[-1]
      $lastLesson.Body = ($lessonBuffer -join "`n").Trim()
    }
    $currentModule.LessonBuffer = @()
    $modules += $currentModule
  }

  Write-Host "  Parsed $($modules.Count) modules" -ForegroundColor Cyan

  # Get existing modules
  $existingModules = @()
  try {
    $existingModules = Invoke-Api -Method GET -Path "/api/admin/courses/$courseId/modules" -Token $token
  } catch { }

  $moduleOrder = 1
  foreach ($mod in $modules) {
    Write-Host "  Module $moduleOrder`: $($mod.Title) ($($mod.Lessons.Count) lessons)" -ForegroundColor White

    # Find or create module
    $existingMod = $existingModules | Where-Object { $_.title -eq $mod.Title }
    $moduleId = $null
    if ($existingMod) {
      $moduleId = $existingMod.id
      Write-Host "    Module exists (ID: $moduleId)" -ForegroundColor DarkGray
    } else {
      $newMod = Invoke-Api -Method POST -Path "/api/admin/courses/$courseId/modules" -Token $token -Body @{
        title = $mod.Title
        order = $moduleOrder
      }
      $moduleId = $newMod.id
      Write-Host "    Created module ID: $moduleId" -ForegroundColor Green
    }

    # Get existing lessons
    $existingLessons = @()
    try {
      $existingLessons = Invoke-Api -Method GET -Path "/api/admin/modules/$moduleId/lessons" -Token $token
    } catch { }

    $lessonOrder = 1
    foreach ($lesson in $mod.Lessons) {
      $lessonTitle = $lesson.Title
      $lessonBody  = $lesson.Body

      $existingLesson = $existingLessons | Where-Object { $_.title -eq $lessonTitle }
      if ($existingLesson) {
        Write-Host "    [SKIP] Lesson already exists: $lessonTitle" -ForegroundColor DarkGray
      } else {
        $null = Invoke-Api -Method POST -Path "/api/admin/modules/$moduleId/lessons" -Token $token -Body @{
          title           = $lessonTitle
          markdownContent = $lessonBody
          order           = $lessonOrder
          topicType       = "Regular"
          estimatedMinutes = [int]([Math]::Max(5, [Math]::Min(45, ($lessonBody.Length / 120))))
        }
        Write-Host "    [OK] $lessonTitle" -ForegroundColor Green
      }
      $lessonOrder++
    }
    $moduleOrder++
  }

  Write-Host "  Done: $($course.title)" -ForegroundColor Green
}

Write-Host "`nAll BA courses uploaded successfully!" -ForegroundColor Green
