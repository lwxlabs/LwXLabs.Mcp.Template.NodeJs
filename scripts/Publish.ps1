param()
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Push-Location $root
try {
    npm ci --ignore-scripts
    if ($LASTEXITCODE) { throw 'npm ci failed.' }
    npm run build
    if ($LASTEXITCODE) { throw 'Build failed.' }
    $destination = Join-Path $root 'artifacts/publish/win-x64'
    if (Test-Path $destination) { Remove-Item -LiteralPath $destination -Recurse -Force }
    New-Item -ItemType Directory -Path $destination -Force | Out-Null
    Copy-Item -Path 'package.json','package-lock.json','LICENSE','README.md' -Destination $destination
    Copy-Item -Path 'dist' -Destination $destination -Recurse
    Push-Location $destination
    try {
        npm ci --omit=dev --ignore-scripts --registry=https://registry.npmjs.org/
        if ($LASTEXITCODE) { throw 'Production dependency restore failed.' }
    } finally { Pop-Location }
    # Pin the official Node runtime and verify its archive checksum.
    $nodeVersion = '24.19.0'
    $archiveName = "node-v$nodeVersion-win-x64.zip"
    $download = Join-Path $root 'artifacts/runtime'
    New-Item -ItemType Directory -Path $download -Force | Out-Null
    $archive = Join-Path $download $archiveName
    $checksums = Join-Path $download 'SHASUMS256.txt'
    $base = "https://nodejs.org/dist/v$nodeVersion"
    Invoke-WebRequest -UseBasicParsing "$base/SHASUMS256.txt" -OutFile $checksums
    if (-not (Test-Path $archive)) { Invoke-WebRequest -UseBasicParsing "$base/$archiveName" -OutFile $archive }
    $line = Get-Content $checksums | Where-Object { $_ -match ('^[a-fA-F0-9]{64}\s+\*?' + [regex]::Escape($archiveName) + '$') } | Select-Object -First 1
    if (-not $line -or (Get-FileHash $archive -Algorithm SHA256).Hash -ne ($line -split '\s+')[0]) { throw 'Node archive checksum mismatch.' }
    $expanded = Join-Path $download 'expanded'
    if (Test-Path $expanded) { Remove-Item -LiteralPath $expanded -Recurse -Force }
    Expand-Archive -LiteralPath $archive -DestinationPath $expanded
    $runtime = Join-Path $expanded "node-v$nodeVersion-win-x64"
    Copy-Item (Join-Path $runtime 'node.exe') $destination
    Copy-Item (Join-Path $runtime 'LICENSE') (Join-Path $destination 'NODE-LICENSE.txt')
    $exe = Join-Path $destination 'node.exe'
    $entry = Join-Path $destination 'dist/index.js'
    $health = & $exe $entry --health | ConvertFrom-Json
    if ($LASTEXITCODE -or $health.status -ne 'ok') { throw 'Published executable failed health probe.' }
    Write-Host "Published: $destination"
} finally { Pop-Location }
