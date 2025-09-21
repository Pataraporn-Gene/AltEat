@echo off
echo Starting development environment...
echo.

REM Start n8n in a new window
echo Starting n8n...
start "n8n" cmd /k "n8n"

REM Start backend in a new window
echo Starting backend...
start "Backend" cmd /k "cd /d C:\GENE\SP2025\my-chatbot-app && conda activate base && python -m uvicorn backend_api:app --host 0.0.0.0 --port 8080 --reload"

REM Start frontend in a new window
echo Starting frontend...
start "Frontend" cmd /k "cd /d C:\GENE\SP2025\my-chatbot-app && npm start"

echo.
echo All services are starting...
echo Frontend: http://localhost:3000
echo Backend: http://localhost:8080
echo n8n: http://localhost:5678
echo.
pause