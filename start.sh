#!/bin/sh

# Start all services

echo "Starting HMIF Platform..."

# Start backend API in background
cd server
node server.js &
BACKEND_PID=$!

cd ..

# Start chatbot API in background
cd chatbot-api
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 &
CHATBOT_PID=$!

cd ..

echo "Backend running on PID: $BACKEND_PID"
echo "Chatbot running on PID: $CHATBOT_PID"

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?
