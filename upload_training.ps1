param(
    [string]$AdminEmail    = "admin@lms.local",
    [string]$AdminPassword = "Admin@123",
    [string]$ApiBase       = "http://localhost:5199"
)

$ErrorActionPreference = "Stop"
$ContentDir = Join-Path $PSScriptRoot "backend\ShareMarketLMS.Api\Content"

function Post-Api {
    param([string]$Path, [object]$Body, [string]$Token = "")
    $h = @{ "Content-Type" = "application/json" }
    if ($Token) { $h["Authorization"] = "Bearer $Token" }
    $json = $Body | ConvertTo-Json -Depth 10 -Compress
    return Invoke-RestMethod -Uri "$ApiBase$Path" -Method POST -Headers $h -Body $json
}

function Get-Api {
    param([string]$Path, [string]$Token = "")
    $h = @{}
    if ($Token) { $h["Authorization"] = "Bearer $Token" }
    return Invoke-RestMethod -Uri "$ApiBase$Path" -Method GET -Headers $h
}

# Login
Write-Host "Logging in..." -ForegroundColor Cyan
$auth  = Post-Api -Path "/api/auth/login" -Body @{ email = $AdminEmail; password = $AdminPassword }
$TOKEN = $auth.token
Write-Host "Login OK" -ForegroundColor Green

# Track definitions
$TRACKS = @(
    @{ Slug="training-csharp";  Title="C# Complete Course";           File="training_csharp.md";  Desc="Comprehensive C# from fundamentals to advanced patterns, LINQ, async/await, and interview prep." },
    @{ Slug="training-dotnet";  Title=".NET and ASP.NET Core";        File="training_dotnet.md";  Desc="Build production-grade APIs with ASP.NET Core 9: EF Core, JWT, middleware, background services." },
    @{ Slug="training-java";    Title="Java Complete Course";          File="training_java.md";    Desc="Java from OOP and collections to Streams, lambdas, and Spring Boot with interview prep." },
    @{ Slug="training-angular"; Title="Angular Deep Dive";             File="training_angular.md"; Desc="Master Angular: components, RxJS, reactive forms, routing, NgRx, and performance." },
    @{ Slug="training-sql";     Title="SQL and Database Design";       File="training_sql.md";     Desc="SQL from queries and joins to window functions, CTEs, indexes, and query optimization." },
    @{ Slug="training-react";   Title="React Complete Course";         File="training_react.md";   Desc="React from JSX and hooks to custom hooks, React Query, Zustand, and performance patterns." }
)

function Parse-Markdown {
    param([string]$FilePath)
    $raw     = [IO.File]::ReadAllText($FilePath, [Text.Encoding]::UTF8)
    $modules = [System.Collections.ArrayList]::new()

    # Split on ## headings
    $modParts = [regex]::Split($raw, '(?m)^## ')
    foreach ($part in $modParts) {
        $part = $part.Trim()
        if (-not $part) { continue }

        $lines     = $part -split "`n"
        $modTitle  = $lines[0].Trim()
        $modBody   = ($lines[1..($lines.Length-1)] -join "`n")

        $lessons   = [System.Collections.ArrayList]::new()

        # Split on ### headings
        $lessParts = [regex]::Split($modBody, '(?m)^### ')
        foreach ($lp in $lessParts) {
            $lp = $lp.Trim()
            if (-not $lp) { continue }
            $llines = $lp -split "`n"
            $ltitle = $llines[0].Trim()
            $lcontent = "### " + $lp
            [void]$lessons.Add(@{ Title=$ltitle; Content=$lcontent })
        }

        if ($lessons.Count -gt 0) {
            [void]$modules.Add(@{ Title=$modTitle; Lessons=$lessons })
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

$grandTotal = 0

foreach ($track in $TRACKS) {
    Write-Host ""
    Write-Host "=== $($track.Title) ===" -ForegroundColor Cyan

    # Create course
    $courseId = $null
    try {
        $course   = Post-Api -Path "/api/admin/courses" -Token $TOKEN -Body @{
            slug        = $track.Slug
            title       = $track.Title
            description = $track.Desc
            category    = "Training"
        }
        $courseId = $course.id
        Write-Host "  Course created id=$courseId" -ForegroundColor Green
    } catch {
        Write-Host "  Course exists or error - searching..." -ForegroundColor Yellow
        $all = Get-Api -Path "/api/courses" -Token $TOKEN
        $existing = $all | Where-Object { $_.slug -eq $track.Slug }
        if ($existing) {
            $courseId = $existing.id
            Write-Host "  Using existing course id=$courseId" -ForegroundColor Yellow
        } else {
            Write-Host "  SKIP: cannot create course" -ForegroundColor Red
            continue
        }
    }

    # Parse content file
    $filePath = Join-Path $ContentDir $track.File
    if (-not (Test-Path $filePath)) {
        Write-Host "  SKIP: file not found $filePath" -ForegroundColor Red
        continue
    }

    $modules = Parse-Markdown -FilePath $filePath
    Write-Host "  Parsed $($modules.Count) modules" -ForegroundColor Gray

    $mOrder     = 1
    $trackTotal = 0

    foreach ($mod in $modules) {
        $modTitle   = $mod.Title
        $lessonList = $mod.Lessons
        $isInterview = $modTitle -match 'Interview'
        $phase       = if ($isInterview) { "InterviewReady" } else { "Core" }
        $topicType   = if ($isInterview) { "InterviewReady" } else { "Regular" }

        Write-Host "  Module $mOrder $modTitle" -ForegroundColor Gray

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
            Write-Host "    ERROR creating module $modTitle" -ForegroundColor Red
            $mOrder++
            continue
        }

        $lOrder = 1
        foreach ($lesson in $lessonList) {
            $mins = Get-Minutes -text $lesson.Content
            try {
                [void](Post-Api -Path "/api/admin/lessons" -Token $TOKEN -Body ([PSCustomObject]@{
                    moduleId         = $moduleId
                    title            = $lesson.Title
                    order            = $lOrder
                    estimatedMinutes = $mins
                    contentMarkdown  = $lesson.Content
                }))
                $trackTotal++
                $lOrder++
            } catch {
                Write-Host "    ERROR lesson $($lesson.Title)" -ForegroundColor Red
            }
        }

        $mOrder++
    }

    Write-Host "  Done: $trackTotal lessons" -ForegroundColor Green
    $grandTotal += $trackTotal
}

Write-Host ""
Write-Host "COMPLETE. Total lessons uploaded: $grandTotal" -ForegroundColor Cyan
