# Social Developer Platform

This project contains multiple applications that work together to provide a complete social media automation platform.

## Applications and Ports

1. **Main Backend API** - Port 3000
   - REST API for the main application
   - Built with Node.js, Express, and Sequelize

2. **Admin Panel Backend** - Port 5001
   - REST API for the admin panel
   - Built with Node.js, Express, and Prisma

3. **Main Frontend** - Port 5173
   - User-facing web application
   - Built with React, TypeScript, and Vite

4. **Admin Panel Frontend** - Port 3002
   - Administrative dashboard
   - Built with React, TypeScript, and Vite

## Running the Applications

### Option 1: Using npm scripts (Recommended)

To start all applications simultaneously:

```bash
npm run dev
```

To start individual applications:

```bash
# Start main backend
npm run backend

# Start admin panel backend
npm run admin-backend

# Start main frontend
npm run frontend

# Start admin panel frontend
npm run admin-frontend
```

### Option 2: Using shell scripts

To start all applications:

```bash
./start-all.sh
```

To stop all applications:

```bash
./stop-all.sh
```

## Accessing the Applications

After starting the applications, you can access them at:

- **Main Frontend**: http://localhost:5173
- **Admin Panel**: http://localhost:3002
- **Main Backend API**: http://localhost:3000
- **Admin Backend API**: http://localhost:5001

## API Endpoints

### Main Backend (Port 3000)
- Base URL: http://localhost:3000/api

### Admin Backend (Port 5001)
- Base URL: http://localhost:5001/api

## Environment Variables

Each application has its own `.env` file for configuration:

- Main Backend: `backend/.env`
- Admin Backend: `admin-panel/.env`
- Main Frontend: `frontend/.env`
- Admin Frontend: `admin-panel/frontend/.env`

Make sure to configure these files with your specific settings before running the applications.