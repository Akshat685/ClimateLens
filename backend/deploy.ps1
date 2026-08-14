param(
    [Parameter(Mandatory = $true)]
    [string]$BucketName,

    [string]$Region = "us-east-1",

    [switch]$Guided,

    [switch]$UseContainer
)

$ErrorActionPreference = "Stop"

function Require-Command {
    param([string]$Name)
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Missing required command: $Name"
    }
}

function Add-ToolToPath {
    param([string]$ExePath)
    if (Test-Path $ExePath) {
        $dir = Split-Path $ExePath -Parent
        $env:PATH = "$dir;$env:PATH"
    }
}

Add-ToolToPath (Join-Path $env:LOCALAPPDATA "Programs\Amazon\AWSCLIV2\aws.exe")

$python312 = Join-Path $env:LOCALAPPDATA "Programs\Python\Python312\python.exe"
if (Test-Path $python312) {
    $pythonDir = Split-Path $python312 -Parent
    $scriptsDir = Join-Path $pythonDir "Scripts"
    $env:PATH = "$pythonDir;$scriptsDir;$env:PATH"
    $env:SAM_PYTHON = $python312
} elseif (-not $UseContainer) {
    Write-Host "Python 3.12 not found. Install: winget install Python.Python.3.12" -ForegroundColor Yellow
    Write-Host "Or rerun with -UseContainer (Docker Desktop required)." -ForegroundColor Yellow
}

Require-Command sam
Require-Command aws

function Invoke-SamBuild {
    if ($UseContainer) {
        Write-Host "Building with Docker container (Python 3.12)..." -ForegroundColor Cyan
        sam build --use-container
        if ($LASTEXITCODE -ne 0) { throw "sam build --use-container failed. Is Docker Desktop running?" }
        return
    }

    $pythonVersion = & python --version 2>&1
    Write-Host "Using $pythonVersion for SAM build" -ForegroundColor DarkGray
    Write-Host "Building Lambda package..." -ForegroundColor Cyan
    if (Test-Path ".aws-sam\build") { Remove-Item -Recurse -Force ".aws-sam\build" }
    sam build --no-cached
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Local build failed. Retrying with Docker container..." -ForegroundColor Yellow
        sam build --use-container
        if ($LASTEXITCODE -ne 0) {
            throw "sam build failed. Install Python 3.12 or start Docker Desktop."
        }
    }
}

function Remove-FailedStackIfNeeded {
    param([string]$StackName, [string]$StackRegion)

    $status = aws cloudformation describe-stacks `
        --stack-name $StackName `
        --region $StackRegion `
        --query Stacks[0].StackStatus `
        --output text 2>$null

    if ($status -eq "ROLLBACK_COMPLETE" -or $status -eq "ROLLBACK_FAILED") {
        Write-Host "Stack $StackName is in $status - deleting before redeploy..." -ForegroundColor Yellow
        aws cloudformation delete-stack --stack-name $StackName --region $StackRegion
        if ($LASTEXITCODE -ne 0) { throw "Failed to delete stack $StackName." }
        aws cloudformation wait stack-delete-complete --stack-name $StackName --region $StackRegion
        if ($LASTEXITCODE -ne 0) { throw "Timed out waiting for stack $StackName to delete." }
        Write-Host "Stack deleted. Continuing deploy..." -ForegroundColor Green
    }
}

Invoke-SamBuild
Remove-FailedStackIfNeeded -StackName "climate-lens-api" -StackRegion $Region

$deployArgs = @(
    "deploy",
    "--stack-name", "climate-lens-api",
    "--region", $Region,
    "--capabilities", "CAPABILITY_IAM",
    "--s3-bucket", $BucketName,
    "--s3-prefix", "sam-deploy",
    "--parameter-overrides", "S3BucketName=$BucketName",
    "--no-confirm-changeset",
    "--no-fail-on-empty-changeset"
)

if ($Guided) {
    $deployArgs = @(
        "deploy",
        "--guided",
        "--region", $Region,
        "--parameter-overrides", "S3BucketName=$BucketName"
    )
}

Write-Host "Deploying stack..." -ForegroundColor Cyan
& sam @deployArgs
if ($LASTEXITCODE -ne 0) { throw "sam deploy failed." }

Write-Host ""
Write-Host "Deployment complete." -ForegroundColor Green

$apiUrl = aws cloudformation describe-stacks `
    --stack-name "climate-lens-api" `
    --region $Region `
    --output json | ConvertFrom-Json | ForEach-Object {
        ($_.Stacks[0].Outputs | Where-Object { $_.OutputKey -eq "ApiUrl" }).OutputValue
    }

if ($apiUrl) {
    Write-Host ""
    Write-Host "API URL: $apiUrl" -ForegroundColor Cyan
    Write-Host "Set in frontend .env.local:" -ForegroundColor Yellow
    Write-Host "NEXT_PUBLIC_API_BASE_URL=$apiUrl" -ForegroundColor Yellow
} else {
    Write-Host "Copy the ApiUrl from the output above into NEXT_PUBLIC_API_BASE_URL" -ForegroundColor Yellow
}
