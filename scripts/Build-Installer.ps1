param([string] $CompilerPath)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
if (-not $CompilerPath) {
    $command = Get-Command ISCC.exe -ErrorAction SilentlyContinue
    if ($command) { $CompilerPath = $command.Source }
    else {
        $folders = @([Environment]::GetFolderPath('ProgramFilesX86'), [Environment]::GetFolderPath('ProgramFiles'), [Environment]::GetEnvironmentVariable('ProgramFiles(x86)'), [Environment]::GetEnvironmentVariable('ProgramW6432'))
        if ($env:SystemDrive) { $folders += "$env:SystemDrive\Program Files (x86)"; $folders += "$env:SystemDrive\Program Files" }
        $CompilerPath = $folders | Where-Object { $_ } | ForEach-Object { Join-Path $_ 'Inno Setup 6/ISCC.exe' } | Where-Object { Test-Path -LiteralPath $_ -PathType Leaf } | Select-Object -First 1
    }
}
if (-not $CompilerPath -or -not (Test-Path -LiteralPath $CompilerPath -PathType Leaf)) { throw 'Install Inno Setup 6 or supply -CompilerPath.' }
& (Join-Path $PSScriptRoot 'Publish.ps1')
$version = (Get-Content (Join-Path $root 'package.json') -Raw | ConvertFrom-Json).version
& $CompilerPath '/DSkipPublish=1' "/DMyVersion=$version" (Join-Path $root 'LwXLabs.Mcp.Template.NodeJs-setup.iss')
if ($LASTEXITCODE) { throw 'Inno Setup compilation failed.' }
