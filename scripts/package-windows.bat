@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0\.."

where mvn >nul 2>&1
if errorlevel 1 (
  echo Maven is required. Install from https://maven.apache.org/
  exit /b 1
)

where jpackage >nul 2>&1
if errorlevel 1 (
  echo jpackage is required. Install JDK 17 or newer.
  exit /b 1
)

echo Building desktop app for Windows...
call mvn -q clean package -Pwindows
if errorlevel 1 exit /b 1

if not exist dist\windows mkdir dist\windows

jpackage ^
  --name DoodleHopHop ^
  --app-version 1.0.0 ^
  --vendor DoodleJump ^
  --description "Doodle Jump arcade game" ^
  --type exe ^
  --input target\package-input ^
  --main-jar doodlejump-1.0.0.jar ^
  --main-class doodlejump.App ^
  --dest dist\windows ^
  --win-menu ^
  --win-shortcut ^
  --java-options "-Xmx512m"

if not exist web\downloads mkdir web\downloads
if not exist server\downloads mkdir server\downloads
copy /Y dist\windows\DoodleHopHop-1.0.0.exe web\downloads\
copy /Y dist\windows\DoodleHopHop-1.0.0.exe server\downloads\

echo.
echo Installer created in dist\windows\
echo Web download copy: web\downloads\DoodleHopHop-1.0.0.exe
dir dist\windows

endlocal
