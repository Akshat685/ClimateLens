# Live smoke tests — backend must be running on port 8000
# Usage: .\smoke_test.ps1

$Base = "http://localhost:8000"
$Passed = 0
$Failed = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [object]$Body = $null,
        [int]$ExpectedStatus,
        [scriptblock]$Assert
    )

    Write-Host "`n[$Name]" -ForegroundColor Cyan
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            ContentType = "application/json"
            ErrorAction = "Stop"
        }
        if ($Body) { $params.Body = ($Body | ConvertTo-Json) }

        try {
            $response = Invoke-WebRequest @params
            $status = [int]$response.StatusCode
            $content = $response.Content | ConvertFrom-Json
        } catch {
            $status = [int]$_.Exception.Response.StatusCode.value__
            $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
            $content = $reader.ReadToEnd() | ConvertFrom-Json
        }

        if ($status -ne $ExpectedStatus) {
            throw "Expected HTTP $ExpectedStatus but got $status"
        }
        & $Assert $content
        Write-Host "  PASS" -ForegroundColor Green
        $script:Passed++
    } catch {
        Write-Host "  FAIL: $_" -ForegroundColor Red
        $script:Failed++
    }
}

Write-Host "ClimateLens backend smoke tests -> $Base" -ForegroundColor Yellow

Test-Endpoint -Name "1. List files (empty or not)" -Method GET -Url "$Base/list-weather-files" -ExpectedStatus 200 -Assert {
    param($json)
    if (-not $json.files) { throw "Missing files array" }
}

Test-Endpoint -Name "2. Store valid weather (7 days NYC)" -Method POST -Url "$Base/store-weather-data" -ExpectedStatus 200 -Body @{
    latitude = 40.71
    longitude = -74.01
    start_date = "2024-01-01"
    end_date = "2024-01-07"
} -Assert {
    param($json)
    if ($json.status -ne "ok") { throw "Expected status ok" }
    if ($json.file -notlike "weather_*") { throw "Bad file name: $($json.file)" }
    $script:StoredFile = $json.file
}

Test-Endpoint -Name "3. List files after store" -Method GET -Url "$Base/list-weather-files" -ExpectedStatus 200 -Assert {
    param($json)
    if ($json.files.Count -lt 1) { throw "Expected at least 1 file" }
}

if ($StoredFile) {
    Test-Endpoint -Name "4. Read stored file" -Method GET -Url "$Base/weather-file-content/$StoredFile" -ExpectedStatus 200 -Assert {
        param($json)
        if (-not $json.daily.time) { throw "Missing daily.time in Open-Meteo JSON" }
    }
}

Test-Endpoint -Name "5. Invalid latitude (expect 400)" -Method POST -Url "$Base/store-weather-data" -ExpectedStatus 400 -Body @{
    latitude = 999
    longitude = -74.01
    start_date = "2024-01-01"
    end_date = "2024-01-07"
} -Assert {
    param($json)
    if ($json.status -ne "error") { throw "Expected error status" }
}

Test-Endpoint -Name "6. Date range > 31 days (expect 400)" -Method POST -Url "$Base/store-weather-data" -ExpectedStatus 400 -Body @{
    latitude = 40.71
    longitude = -74.01
    start_date = "2024-01-01"
    end_date = "2024-02-10"
} -Assert {
    param($json)
    if ($json.status -ne "error") { throw "Expected error status" }
}

Test-Endpoint -Name "7. Missing file (expect 404)" -Method GET -Url "$Base/weather-file-content/not-a-real-file.json" -ExpectedStatus 404 -Assert {
    param($json)
    if ($json.message -ne "not found") { throw "Expected message 'not found'" }
}

Write-Host "`nResults: $Passed passed, $Failed failed" -ForegroundColor $(if ($Failed -eq 0) { "Green" } else { "Red" })
if ($Failed -gt 0) { exit 1 }
