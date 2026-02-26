# 대시보드 E2E 실행 (SUPER_ADMIN 계정 사용).
# .env에서 SUPER_ADMIN_USERNAME, SUPER_ADMIN_PASSWORD를 읽어 로그인 후 대시보드·자산 404 검증.
# 사용: .\scripts\run-e2e-dashboard.ps1 [-EnvPath "path\to\.env"]
# 기본 EnvPath: 프로젝트 루트의 investment-backend\.env

param(
    [string] $EnvPath = ""
)

$ErrorActionPreference = "Stop"
$frontendRoot = $PSScriptRoot + "\.."
$Username = ""
$Password = ""

# .env 경로: 인자 > investment-backend\.env > 현재 .env
if ($EnvPath -and (Test-Path $EnvPath)) {
    $envFile = (Resolve-Path $EnvPath).Path
} else {
    $tryBackend = Join-Path $frontendRoot "..\investment-backend\.env"
    if (Test-Path $tryBackend) {
        $envFile = (Resolve-Path $tryBackend).Path
    } else {
        $tryLocal = Join-Path $frontendRoot ".env"
        if (Test-Path $tryLocal) { $envFile = (Resolve-Path $tryLocal).Path }
    }
}

if ($envFile) {
    Get-Content $envFile -Encoding UTF8 | ForEach-Object {
        $line = $_.Trim()
        if ($line -match '^\s*SUPER_ADMIN_USERNAME=(.+)$') { $Username = ($Matches[1].Trim().Trim('"')).TrimEnd([char]13) }
        if ($line -match '^\s*SUPER_ADMIN_PASSWORD=(.+)$') { $Password = ($Matches[1].Trim().Trim('"')).TrimEnd([char]13) }
    }
}

# 이미 설정된 E2E_* 환경변수 우선
if ($env:E2E_USERNAME) { $Username = $env:E2E_USERNAME }
if ($env:E2E_PASSWORD) { $Password = $env:E2E_PASSWORD }

if (-not $Username -or -not $Password) {
    Write-Host "SUPER_ADMIN 계정이 필요합니다. investment-backend\.env에 SUPER_ADMIN_USERNAME, SUPER_ADMIN_PASSWORD를 설정하거나," -ForegroundColor Yellow
    Write-Host "E2E_USERNAME, E2E_PASSWORD 환경변수를 설정한 뒤 다시 실행하세요." -ForegroundColor Yellow
    Write-Host "읽은 .env 경로: $envFile" -ForegroundColor Gray
    exit 1
}

$env:E2E_USERNAME = $Username
$env:E2E_PASSWORD = $Password
$env:E2E_API_PORT = "8084"

# 로그인 API 사전 검사 (백엔드가 동일 계정을 받아들이는지 확인, 리다이렉트 미따름)
$loginUrl = "http://localhost:8084/api/v1/auth/login"
$body = @{ username = $Username; password = $Password } | ConvertTo-Json
$headers = @{ "Content-Type" = "application/json; charset=utf-8"; "Accept" = "application/json" }
try {
    $r = Invoke-WebRequest -Uri $loginUrl -Method Post -Body $body -Headers $headers -UseBasicParsing -TimeoutSec 10 -MaximumRedirection 0
    if ($r.StatusCode -eq 200) {
        $json = $r.Content | ConvertFrom-Json
        if ($json.token) {
            Write-Host "로그인 API 사전 검사 OK (동일 계정으로 E2E 진행)" -ForegroundColor Green
        } else {
            Write-Host "로그인 API 200이지만 token 없음. E2E 계속 실행..." -ForegroundColor Yellow
        }
    } else {
        Write-Host "로그인 API 응답 HTTP $($r.StatusCode). E2E 계속 실행..." -ForegroundColor Yellow
    }
} catch {
    $status = 0
    if ($_.Exception.Response) { $status = [int]$_.Exception.Response.StatusCode }
    if ($status -eq 401) {
        Write-Host "로그인 API 401 (계정 불일치). 백엔드를 .env 로드 후 재기동하세요: investment-backend에서 .\scripts\bootRun-agent.ps1" -ForegroundColor Red
        Write-Host "  동일한 SUPER_ADMIN_USERNAME/PASSWORD가 백엔드 기동 시 적용되어야 합니다." -ForegroundColor Gray
        exit 1
    }
    if ($status -eq 302) {
        Write-Host "로그인 API 302 리다이렉트 (백엔드 설정 확인). E2E 계속 실행..." -ForegroundColor Yellow
    } else {
        Write-Host "로그인 API 사전 검사 HTTP $status. E2E 계속 실행..." -ForegroundColor Yellow
    }
}

Set-Location $frontendRoot
Write-Host "E2E 대시보드 실행 (API 8084, SUPER_ADMIN 계정 사용)..." -ForegroundColor Cyan
npx playwright test e2e/dashboard.spec.ts --project=chromium
exit $LASTEXITCODE
