#preproc ispp
#define MyAppName "LwXLabs.Mcp.Template.NodeJs"
#define MyPublisher "LwXLabs"
#define PublishDir SourcePath + "artifacts\publish\win-x64"
#ifndef MyVersion
  #define MyVersion "0.1.0"
#endif
#ifndef SkipPublish
  #define PublishExitCode Exec("powershell.exe", "-NoProfile -ExecutionPolicy Bypass -File scripts\Publish.ps1", SourcePath, 1, SW_SHOWNORMAL)
  #if PublishExitCode != 0
    #error "Publish failed."
  #endif
#endif
#define PublishedExe PublishDir + "\node.exe"
#ifnexist PublishedExe
  #error "Missing bundled Node runtime."
#endif
[Setup]
AppId={{F94689DC-2A55-4C90-90E4-3BBF3AC2B87D}
AppName={#MyAppName}
AppPublisher={#MyPublisher}
AppVersion={#MyVersion}
VersionInfoVersion={#MyVersion}
DefaultDirName={localappdata}\Programs\LwXLabs\{#MyAppName}
DefaultGroupName={#MyAppName}
PrivilegesRequired=lowest
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64os
UninstallDisplayIcon={app}\node.exe
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
CloseApplications=yes
RestartApplications=no
DisableProgramGroupPage=yes
OutputDir=artifacts\installer
OutputBaseFilename={#MyAppName}-{#MyVersion}-Setup
LicenseFile=LICENSE
[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"
[Files]
Source: "{#PublishDir}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
[Icons]
Name: "{autoprograms}\{#MyAppName}\Local web status"; Filename: "{app}\node.exe"; Parameters: """{app}\dist\index.js"" --http"; WorkingDir: "{app}"
Name: "{autoprograms}\{#MyAppName}\Uninstall"; Filename: "{uninstallexe}"
