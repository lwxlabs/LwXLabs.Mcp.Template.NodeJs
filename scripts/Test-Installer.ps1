param([string] $Installer)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$identity = '{F94689DC-2A55-4C90-90E4-3BBF3AC2B87D}'
$uninstallKey = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\$($identity)_is1"
if (Test-Path $uninstallKey) { throw 'Existing installation detected; use a clean test machine.' }
if (-not $Installer) { $Installer = Get-ChildItem (Join-Path $root 'artifacts/installer') -Filter 'LwXLabs.Mcp.Template.NodeJs-*-Setup.exe' -File | Sort-Object LastWriteTime -Descending | Select-Object -First 1 -ExpandProperty FullName }
if (-not $Installer -or -not (Test-Path -LiteralPath $Installer -PathType Leaf)) { throw 'Build the installer first.' }
$workspace = Join-Path ([IO.Path]::GetTempPath()) ('mcp-node-installer-test-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory $workspace | Out-Null
$destination = Join-Path $workspace 'installed'
$setupLog = Join-Path $workspace 'setup.log'
$uninstallLog = Join-Path $workspace 'uninstall.log'
$oldExe = $env:MCP_TEMPLATE_TEST_EXECUTABLE
$oldEntry = $env:MCP_TEMPLATE_TEST_ENTRY
try {
    $setup = Start-Process -FilePath $Installer -ArgumentList @('/VERYSILENT','/SUPPRESSMSGBOXES','/NORESTART', ('/DIR="' + $destination + '"'), ('/LOG="' + $setupLog + '"')) -Wait -PassThru
    if ($setup.ExitCode -ne 0) { throw "Setup failed: $($setup.ExitCode)" }
    $exe = Join-Path $destination 'node.exe'
    $entry = Join-Path $destination 'dist/index.js'
    if (-not (Test-Path $exe) -or -not (Test-Path $entry) -or -not (Test-Path $uninstallKey)) { throw 'Installation verification failed.' }
    $health = & $exe $entry --health | ConvertFrom-Json
    if ($LASTEXITCODE -or $health.status -ne 'ok' -or $health.name -ne 'LwXLabs.Mcp.Template.NodeJs') { throw 'Installed health check failed.' }
    Write-Host "Installed healthy: $($health.name) $($health.version)"
    $env:MCP_TEMPLATE_TEST_EXECUTABLE = $exe
    $env:MCP_TEMPLATE_TEST_ENTRY = $entry
    Push-Location $root
    try { npm run test:installed; if ($LASTEXITCODE) { throw 'Installed tests failed.' } } finally { Pop-Location }
} finally {
    $env:MCP_TEMPLATE_TEST_EXECUTABLE = $oldExe
    $env:MCP_TEMPLATE_TEST_ENTRY = $oldEntry
    $uninstaller = Join-Path $destination 'unins000.exe'
    if (Test-Path $uninstaller) {
        $uninstall = Start-Process -FilePath $uninstaller -ArgumentList @('/VERYSILENT','/SUPPRESSMSGBOXES','/NORESTART', ('/LOG="' + $uninstallLog + '"')) -Wait -PassThru
        if ($uninstall.ExitCode -ne 0 -or (Test-Path $uninstallKey) -or (Test-Path (Join-Path $destination 'node.exe'))) { throw 'Test uninstall failed.' }
        Write-Host 'Temporary installation removed successfully.'
    }
    Write-Host "Installer logs: $workspace"
}
