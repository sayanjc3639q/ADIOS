; Inno Setup Script for ADIOS Personal Desktop Manager
; Builds official ADIOS_Setup.exe with customizable installation folder,
; backup folder selection, Start Menu shortcuts, Desktop icon, and complete Windows Uninstaller.

#define MyAppName "ADIOS"
#define MyAppVersion "2.0.0"
#define MyAppPublisher "Sayan Marty / ADIOS"
#define MyAppURL "http://localhost:3000"
#define MyAppExeName "ADIOS.exe"

[Setup]
AppId={{7B89E23D-8A7B-4E90-B8A2-E34241AA3C81}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
AllowNoIcons=yes
OutputDir=dist
OutputBaseFilename=ADIOS_Setup
Compression=lzma
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=lowest
DisableProgramGroupPage=auto
UninstallDisplayIcon={app}\{#MyAppExeName}
UninstallDisplayName={#MyAppName} Personal Desktop Manager

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "startmenuicon"; Description: "Create a Start Menu shortcut"; GroupDescription: "{cm:AdditionalIcons}"

[Files]
Source: "dist\{#MyAppExeName}"; DestDir: "{app}"; Flags: ignoreversion
; Include default templates and assets if needed
Source: "README.md"; DestDir: "{app}"; Flags: ignoreversion isreadme

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

[Code]
var
  BackupDirPage: TInputDirWizardPage;

procedure InitializeWizard;
begin
  // Custom Wizard Page allowing user to choose their preferred backup folder during installation
  BackupDirPage := CreateInputDirPage(wpSelectDir,
    'Select Backup Folder',
    'Where should ADIOS store automatic backup snapshots?',
    'Select the folder where ADIOS will archive rolling database backups. You can change this later in Settings.',
    False, '');
  BackupDirPage.Add('Backup Archive Location:');
  BackupDirPage.Values[0] := ExpandConstant('{userdocs}\ADIOS_Backups');
end;

function GetBackupDir(Param: String): String;
begin
  Result := BackupDirPage.Values[0];
end;

procedure CurStepChanged(CurStep: TSetupStep);
var
  ConfigFile: String;
begin
  if CurStep = ssPostInstall then
  begin
    // Create the user selected backup directory
    ForceDirectories(BackupDirPage.Values[0]);
  end;
end;
