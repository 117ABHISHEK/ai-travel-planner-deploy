#!/bin/sh

echo "Starting AI Travel Planner..."

# Keep Render's provided PORT
FRONTEND_PORT=${PORT:-3000}

# Start Express backend in the background on port 5000
echo "Starting backend on port 5000..."
cd /app/backend
PORT=5000 npm run start &
BACKEND_PID=$!

# Give backend a moment to start
sleep 2

# Check if backend is still running
if ! kill -0 $BACKEND_PID 2>/dev/null; then
  echo "❌ Backend failed to start! Check environment variables like MONGO_URI and GEMINI_API_KEY."
  exit 1
fi

# Start Next.js frontend in the foreground
echo "Starting Next.js frontend on port ${FRONTEND_PORT}..."
cd /app/frontend
PORT=$FRONTEND_PORT npm run start
