# Social Media Admin Panel

A comprehensive admin panel for managing the Social Media Automation Platform. Built with Node.js, TypeScript, Express, and Sequelize.

## Features

### 🔐 Authentication & Authorization
- Role-based access control (Super Admin, Admin, Moderator)
- JWT-based authentication with session management
- Secure password hashing and validation
- Admin activity logging and audit trails

### 👥 User Management
- Complete user CRUD operations
- User filtering, searching, and pagination
- Balance management and transaction history
- User activity monitoring
- Bulk user operations

### 📋 Order Management
- Order lifecycle management
- Status updates and tracking
- Revenue analytics
- Platform and service type filtering
- Order completion monitoring

### ✅ Task Management
- Task approval/rejection workflows
- Bulk task operations
- Performance analytics
- Task completion tracking
- Automated reward distribution

### 📊 Analytics & Reporting
- Comprehensive dashboard with key metrics
- Revenue and profit analytics
- User behavior analysis
- Platform performance metrics
- Data export capabilities (CSV/JSON)

### ⚙️ System Configuration
- Dynamic system settings management
- Service pricing configuration
- Admin user management
- System health monitoring

## Technology Stack

- **Backend**: Node.js, TypeScript, Express.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT with bcrypt
- **Validation**: express-validator, Joi
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate limiting
- **File Processing**: Multer

## Prerequisites

- Node.js 18+ 
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   cd admin-panel
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   MAIN_DB_HOST="localhost"
   MAIN_DB_PORT=3306
   MAIN_DB_NAME="social_developer"
   MAIN_DB_USER="root"
   MAIN_DB_PASS=""
   JWT_SECRET="your-super-secret-jwt-key"
   DEFAULT_ADMIN_EMAIL="admin@socialdev.com"
   DEFAULT_ADMIN_PASSWORD="admin123!"
   ```

4. **Database setup**
   ```bash
   # Run database initialization script
   node init-db.js
   
   # Seed initial data
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## API Documentation

### Authentication Endpoints

#### POST /api/auth/login
Login admin user
```json
{
  "email": "admin@socialdev.com",
  "password": "admin123!"
}
```

#### POST /api/auth/logout
Logout admin user (requires authentication)

#### GET /api/auth/me
Get current admin profile (requires authentication)

### Dashboard Endpoints

#### GET /api/dashboard/overview
Get dashboard overview statistics

#### GET /api/dashboard/recent-activities
Get recent system activities

#### GET /api/dashboard/analytics/chart-data
Get chart data for analytics

### User Management Endpoints

#### GET /api/users
Get paginated users list with filtering
- Query params: `page`, `limit`, `search`, `userMode`, `isActive`, `sortBy`, `sortOrder`

#### GET /api/users/:id
Get detailed user information

#### POST /api/users
Create new user (Admin+ only)

#### PUT /api/users/:id
Update user information (Admin+ only)

#### DELETE /api/users/:id
Deactivate user (Admin+ only)

#### POST /api/users/:id/balance
Adjust user balance (Admin+ only)

### Order Management Endpoints

#### GET /api/orders
Get paginated orders list with filtering

#### GET /api/orders/:id
Get detailed order information

#### PUT /api/orders/:id/status
Update order status (Admin+ only)

#### GET /api/orders/statistics/overview
Get order statistics

#### DELETE /api/orders/:id
Delete order (Admin+ only)

### Task Management Endpoints

#### GET /api/tasks
Get paginated tasks list with filtering

#### GET /api/tasks/:id
Get detailed task information

#### PUT /api/tasks/:id/status
Update task status (Admin+ only)

#### POST /api/tasks/bulk-action
Perform bulk actions on tasks (Admin+ only)

#### GET /api/tasks/statistics/overview
Get task statistics

### Analytics Endpoints

#### GET /api/analytics/overview
Get comprehensive analytics overview

#### GET /api/analytics/charts/revenue
Get revenue chart data

#### GET /api/analytics/platform-performance
Get platform performance analytics

#### GET /api/analytics/user-behavior
Get user behavior analytics

#### GET /api/analytics/export
Export analytics data (CSV/JSON)

### Settings Endpoints

#### GET /api/settings
Get all system settings

#### GET /api/settings/:category
Get settings by category

#### PUT /api/settings/:id
Update setting (Super Admin only)

#### POST /api/settings
Create new setting (Super Admin only)

#### GET /api/settings/pricing/services
Get service pricing configuration

#### PUT /api/settings/pricing/services/:id
Update service price (Super Admin only)

## Authentication

All API endpoints (except login) require authentication via Bearer token:

```
Authorization: Bearer <your_jwt_token>
```

## Role Permissions

### Super Admin
- Full system access
- Manage admin users
- Modify system settings
- Access all analytics

### Admin
- Manage users, orders, and tasks
- View analytics
- Cannot modify system settings or admin users

### Moderator
- View-only access to most features
- Basic user support operations

## Development

### Project Structure
```
src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middleware/     # Express middleware
├── models/         # Database models (Sequelize)
├── routes/         # API routes
├── scripts/        # Utility scripts
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── server.ts       # Main server file
```

### Running Tests
```bash
npm test
```

### Building for Production
```bash
npm run build
npm start
```

### Database Operations
```bash
# Reset database
node init-db.js

# Check database tables
node check-tables.js
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation and sanitization
- SQL injection prevention (Sequelize)
- Session management
- Admin activity logging

## Monitoring & Logging

- Structured logging with Winston
- Request/response logging
- Error tracking
- Performance monitoring
- Admin activity audit trails

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MAIN_DB_HOST` | Database host | localhost |
| `MAIN_DB_PORT` | Database port | 3306 |
| `MAIN_DB_NAME` | Database name | social_developer |
| `MAIN_DB_USER` | Database user | root |
| `MAIN_DB_PASS` | Database password | (empty) |
| `JWT_SECRET` | Secret key for JWT tokens | Required |
| `PORT` | Server port | 3001 |
| `NODE_ENV` | Environment (development/production) | development |
| `DEFAULT_ADMIN_EMAIL` | Default super admin email | admin@socialdev.com |
| `DEFAULT_ADMIN_PASSWORD` | Default super admin password | admin123! |
| `CORS_ORIGIN` | Allowed CORS origins | http://localhost:3000 |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions:
- Create an issue in the repository
- Email: support@socialdev.com

---

Built with ❤️ for efficient social media platform management.