#!/bin/bash

# Script to start all applications with proper port configuration

echo "Starting all applications..."

# Start main backend (port 3000)
echo "Starting main backend on port 3000..."
cd backend
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Start admin panel backend (port 5001)
echo "Starting admin panel backend on port 5001..."
cd admin-panel
npm run dev > ../admin-backend.log 2>&1 &
ADMIN_BACKEND_PID=$!
cd ..

# Start main frontend (port 5173)
echo "Starting main frontend on port 5173..."
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Start admin panel frontend (port 3002)
echo "Starting admin panel frontend on port 3002..."
cd admin-panel/frontend
npm run dev > ../../admin-frontend.log 2>&1 &
ADMIN_FRONTEND_PID=$!
cd ../..

echo "All applications started!"
echo "Main Backend PID: $BACKEND_PID"
echo "Admin Backend PID: $ADMIN_BACKEND_PID"
echo "Main Frontend PID: $FRONTEND_PID"
echo "Admin Frontend PID: $ADMIN_FRONTEND_PID"

echo ""
echo "Applications are now running:"
echo "Main Backend: http://localhost:3000"
echo "Admin Backend: http://localhost:5001"
echo "Main Frontend: http://localhost:5173"
echo "Admin Frontend: http://localhost:3002"

# Wait for all processes
wait $BACKEND_PID $ADMIN_BACKEND_PID $FRONTEND_PID $ADMIN_FRONTEND_PID