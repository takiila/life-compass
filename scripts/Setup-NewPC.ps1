[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot

function Assert-Command {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name,
        [Parameter(Mandatory = $true)]
        [string]$InstallHint
    )

    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "$Name was not found. $InstallHint"
    }
}

function Invoke-Checked {
    param(
        [Parameter(Mandatory = $true)]
        [string]$FilePath,
        [Parameter(Mandatory = $true)]
        [string[]]$Arguments
    )

    & $FilePath @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "$FilePath failed with exit code $LASTEXITCODE."
    }
}

Write-Host 'Life Compass new-PC setup'
Write-Host "Project: $projectRoot"

Assert-Command -Name 'git.exe' -InstallHint 'Install Git for Windows, then run SETUP_NEW_PC.cmd again.'
Assert-Command -Name 'node.exe' -InstallHint 'Install Node.js 22.13 or newer, then run SETUP_NEW_PC.cmd again.'
Assert-Command -Name 'npm.cmd' -InstallHint 'Install npm with Node.js, then run SETUP_NEW_PC.cmd again.'

$nodeText = (& node.exe --version).Trim().TrimStart('v')
$nodeVersion = $null
if (-not [Version]::TryParse($nodeText, [ref]$nodeVersion)) {
    throw "Could not read the installed Node.js version: $nodeText"
}
if ($nodeVersion -lt [Version]'22.13.0') {
    throw "Node.js 22.13 or newer is required by Expo SDK 57. Installed: $nodeVersion"
}

Push-Location $projectRoot
try {
    if (Test-Path (Join-Path $projectRoot 'package-lock.json')) {
        Write-Host 'Installing exact dependencies with npm ci...'
        Invoke-Checked -FilePath 'npm.cmd' -Arguments @('ci')
    }
    else {
        Write-Warning 'package-lock.json was not found. Falling back to npm install.'
        Invoke-Checked -FilePath 'npm.cmd' -Arguments @('install')
    }

    $examplePath = Join-Path $projectRoot '.env.example'
    if (Test-Path $examplePath) {
        $requiredNames = @(Get-Content $examplePath | ForEach-Object {
            if ($_ -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*$') {
                $Matches[1]
            }
        })

        $configuredNames = @{}
        Get-ChildItem Env: | ForEach-Object { $configuredNames[$_.Name] = $true }
        @('.env', '.env.local') | ForEach-Object {
            $localEnvPath = Join-Path $projectRoot $_
            if (Test-Path $localEnvPath) {
                Get-Content $localEnvPath | ForEach-Object {
                    if ($_ -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=') {
                        $configuredNames[$Matches[1]] = $true
                    }
                }
            }
        }

        $missingNames = @($requiredNames | Where-Object { -not $configuredNames.ContainsKey($_) })
        if ($missingNames.Count -gt 0) {
            Write-Warning 'The following environment variable names still need local configuration:'
            $missingNames | Sort-Object -Unique | ForEach-Object { Write-Host "  $_" }
        }
    }

    $package = Get-Content (Join-Path $projectRoot 'package.json') -Raw | ConvertFrom-Json
    if ($package.scripts -and ($package.scripts.PSObject.Properties.Name -contains 'check')) {
        Write-Host 'Running project checks...'
        Invoke-Checked -FilePath 'npm.cmd' -Arguments @('run', 'check')
    }
    else {
        Write-Warning 'No npm run check script is available; project checks were not run.'
    }
}
finally {
    Pop-Location
}

Write-Host ''
Write-Host 'Life Compass setup completed.'
Write-Host "PC review: $projectRoot\START_REVIEW_WINDOWS.cmd"
Write-Host "Direct command: cd $projectRoot ; npm run web"

$memoryLauncher = Join-Path (Split-Path -Parent $projectRoot) 'AI-Memory\START_PROJECTS.cmd'
if (Test-Path $memoryLauncher) {
    Write-Host "All-project launcher: $memoryLauncher"
}
else {
    Write-Host 'AI-Memory launcher: clone takiila/AI-Memory beside this repository, then use START_PROJECTS.cmd.'
}
