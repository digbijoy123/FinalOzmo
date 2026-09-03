@echo off
echo ===================================================
echo   MAX COMPANION ROBOT - ANDROID CAPACITOR BUILDER
echo ===================================================
echo.

echo [1/3] Syncing Capacitor Android assets...
call npx cap sync android
if %errorlevel% neq 0 (
  echo Android platform not found, adding android platform...
  call npx cap add android
  call npx cap sync android
)

echo.
echo [2/3] Building Debug APK with Gradle...
if exist "android\gradlew.bat" (
  cd android
  call gradlew.bat assembleDebug
  cd ..
  echo.
  echo [3/3] Build Complete!
  echo Output APK located at: android\app\build\outputs\apk\debug\app-debug.apk
) else (
  echo Gradle wrapper not found. Opening project in Android Studio...
  call npx cap open android
)

echo.
echo Done!
pause
