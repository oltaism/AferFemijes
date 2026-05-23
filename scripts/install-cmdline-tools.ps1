$ErrorActionPreference = 'Stop'
$sdk = Join-Path $env:LOCALAPPDATA 'Android\Sdk'
$dest = Join-Path $sdk 'cmdline-tools'
if (-not (Test-Path $dest)) {
    New-Item -ItemType Directory -Path $dest | Out-Null
}
$zip = Join-Path $env:TEMP 'cmdline-tools.zip'
Write-Host '>> Downloading cmdline-tools...'
Invoke-WebRequest -UseBasicParsing `
    -Uri 'https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip' `
    -OutFile $zip
Write-Host '>> Extracting...'
Expand-Archive -LiteralPath $zip -DestinationPath $dest -Force
$inner = Join-Path $dest 'cmdline-tools'
$latest = Join-Path $dest 'latest'
if (Test-Path $latest) { Remove-Item -Recurse -Force $latest }
if (Test-Path $inner) { Rename-Item $inner $latest -Force }
Remove-Item $zip -Force
Write-Host '>> Installed to:' $latest
Write-Host 'DONE'
