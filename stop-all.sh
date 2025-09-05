#!/bin/bash

# Script to stop all running applications

echo "Stopping all applications..."

# Find and kill processes by port
pids=()

# Kill main backend (port 3000)
pid=$(lsof -ti:3000)
if [ ! -z "$pid" ]; then
    echo "Stopping main backend (PID: $pid)"
    kill $pid
    pids+=($pid)
fi

# Kill admin panel backend (port 5001)
pid=$(lsof -ti:5001)
if [ ! -z "$pid" ]; then
    echo "Stopping admin panel backend (PID: $pid)"
    kill $pid
    pids+=($pid)
fi

# Kill main frontend (port 5173)
pid=$(lsof -ti:5173)
if [ ! -z "$pid" ]; then
    echo "Stopping main frontend (PID: $pid)"
    kill $pid
    pids+=($pid)
fi

# Kill admin panel frontend (port 3002)
pid=$(lsof -ti:3002)
if [ ! -z "$pid" ]; then
    echo "Stopping admin panel frontend (PID: $pid)"
    kill $pid
    pids+=($pid)
fi

# Wait for processes to terminate
if [ ${#pids[@]} -gt 0 ]; then
    echo "Waiting for processes to terminate..."
    for pid in "${pids[@]}"; do
        wait $pid 2>/dev/null
    done
    echo "All applications stopped."
else
    echo "No applications were running."
fi