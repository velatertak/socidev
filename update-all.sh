#!/bin/bash

echo "Updating socidev project..."

# Pull latest changes from GitHub
echo "Pulling latest changes from GitHub..."
git pull origin master

# Check if there were any changes
if [ $? -eq 0 ]; then
    echo "Git pull successful"
else
    echo "Git pull failed. Please check for conflicts."
    exit 1
fi

# Install/update npm dependencies in all directories
echo "Updating npm dependencies..."

# Root directory
echo "Updating root dependencies..."
npm install

# Backend
if [ -d "backend" ]; then
    echo "Updating backend dependencies..."
    cd backend
    npm install
    cd ..
fi

# Frontend
if [ -d "frontend" ]; then
    echo "Updating frontend dependencies..."
    cd frontend
    npm install
    cd ..
fi

# Admin panel
if [ -d "admin-panel" ]; then
    echo "Updating admin-panel dependencies..."
    cd admin-panel
    npm install
    cd ..
fi

# Admin panel frontend
if [ -d "admin-panel/frontend" ]; then
    echo "Updating admin-panel frontend dependencies..."
    cd admin-panel/frontend
    npm install
    cd ../..
fi

echo "All dependencies updated successfully!"

# Show current status
echo "Current Git status:"
git status

echo "Update complete!"