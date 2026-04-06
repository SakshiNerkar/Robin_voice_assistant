@echo off
TITLE ASTRA Desktop Server
echo =========================================
echo Starting ASTRA Node.js Backend Server...
echo =========================================

:: Start the Node.js server in a dedicated window so it stays alive
start "ASTRA Backend Server" cmd /k "node server.js"

:: Give the server a moment to spin up
timeout /t 2 /nobreak > nul

echo =========================================
echo Launching ASTRA UI in Persistent Mode...
echo =========================================

:: Open ASTRA in Chrome's dedicated "App Mode"
:: This removes the URL bar and treats it like a native Windows App.
:: Crucially, App Mode tabs are rarely throttled by Chrome,
:: allowing the SpeechRecognition microphone loop to run persistently in the background.
start chrome --app="http://localhost:5500"

echo ASTRA is now running globally. Check your taskbar for the ASTRA icon.
exit
