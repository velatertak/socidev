# Socidev - Social Media Automation Platform

Socidev is a comprehensive social media automation platform that allows users to automate various social media tasks such as likes, followers, views, and subscribers across multiple platforms.

## Project Structure

The project consists of multiple integrated applications:

```
socidev/
├── backend/              # Main backend API (Port 3000)
├── frontend/             # Main frontend application (Port 5173)
├── admin-panel/          # Admin panel with backend (Port 5001) and frontend (Port 3002/3003)
├── start-all.sh          # Script to start all applications
└── stop-all.sh           # Script to stop all applications
```

## Applications

1. **Main Backend API** (Port 3000)
   - RESTful services for the main application
   - Built with Node.js, Express, and Sequelize ORM

2. **Admin Panel Backend** (Port 5001)
   - Admin-specific REST API
   - Built with Node.js, Express, and Prisma ORM

3. **Main Frontend** (Port 5173)
   - User-facing web interface
   - Built with React, TypeScript, and Vite

4. **Admin Panel Frontend** (Port 3002/3003)
   - Dashboard for administrative tasks
   - Built with React, TypeScript, and Vite

## Prerequisites

- Node.js (LTS version recommended)
- npm or yarn
- MySQL database server

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/Social-Developer/socidev.git
   cd socidev
   ```

2. Install dependencies for all applications:
   ```bash
   npm install
   cd backend && npm install && cd ..
   cd frontend && npm install && cd ..
   cd admin-panel && npm install && cd ..
   cd admin-panel/frontend && npm install && cd ../..
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env` in each directory and update the values
   - Make sure to configure your database connections

4. Set up the database:
   - Create a MySQL database
   - Run the database migration scripts if available

## Running the Applications

### Development Mode

To start all applications in development mode:
```bash
./start-all.sh
```

This will start:
- Main Backend API on http://localhost:3000
- Admin Panel Backend on http://localhost:5001
- Main Frontend on http://localhost:5173
- Admin Panel Frontend on http://localhost:3002 (or 3003 if 3002 is in use)

### Individual Application Startup

You can also start each application individually:

1. **Main Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Admin Panel Backend:**
   ```bash
   cd admin-panel
   npm run dev
   ```

3. **Main Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

4. **Admin Panel Frontend:**
   ```bash
   cd admin-panel/frontend
   npm run dev
   ```

## Stopping the Applications

To stop all running applications:
```bash
./stop-all.sh
```

## Features

- User authentication and session management
- Task automation and scheduling
- Analytics and reporting
- Order and payment management
- Admin control panel for system monitoring and configuration

## Technology Stack

- **Frontend:** React, TypeScript, Vite
- **Backend:** Node.js, Express, Sequelize ORM, Prisma ORM
- **Database:** MySQL
- **DevOps:** npm scripts, Shell scripts

## Team Workflow

To ensure all team members have the latest code and dependencies, follow these practices:

### Daily Routine
1. **Start each work session** by running the update script:
   ```bash
   ./update-all.sh
   ```

2. **Before making changes**, always pull the latest code:
   ```bash
   git pull origin master
   ```

### Contributing Changes
1. **Create a feature branch** for your work:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** and commit frequently:
   ```bash
   git add .
   git commit -m "Description of your changes"
   ```

3. **Push your branch** to GitHub:
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Create a Pull Request** on GitHub for review

5. **After merging**, switch back to master and pull:
   ```bash
   git checkout master
   git pull origin master
   ```

### Keeping Dependencies Updated
The project includes Git hooks that automatically check for and install dependency updates when pulling changes.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue on the GitHub repository or contact the development team.