# Social Developer Platform - API Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Project Goals](#project-goals)
3. [Core Functionality](#core-functionality)
4. [Database Schema](#database-schema)
5. [Authentication](#authentication)
6. [API Endpoints](#api-endpoints)
7. [Frontend Structure](#frontend-structure)
8. [Admin Panel Prompt](#admin-panel-prompt)

## Project Overview

The Social Developer Platform (socidev) is a comprehensive social media automation solution designed to help users efficiently manage and grow their social media presence across multiple platforms. The system provides tools for both task creators (task givers) who want to boost their social media metrics and task executors (task doers) who can earn by completing these tasks.

The platform supports major social media platforms including Instagram and YouTube, offering services such as likes, followers, views, and subscribers. It features a dual-user system where users can switch between creating tasks and executing tasks based on their needs.

### Target Audience
- Social media marketers and influencers seeking to increase their online presence
- Individuals looking to earn money by completing social media tasks
- Businesses wanting to automate their social media growth
- Developers and administrators managing the platform

## Project Goals

The Social Developer Platform aims to achieve several key objectives:

1. **Streamline Social Media Management**: Provide an intuitive interface for users to create, manage, and track social media growth campaigns without manual intervention.

2. **Create a Marketplace for Social Media Services**: Establish a platform where users can either offer their services (as task doers) or purchase services (as task givers) for various social media platforms.

3. **Ensure Quality and Authenticity**: Implement robust verification and approval systems to maintain the quality of services and prevent spam or fake interactions.

4. **Provide Comprehensive Analytics**: Offer detailed reporting and analytics to help users understand their social media growth and platform performance.

5. **Enable Secure Financial Transactions**: Implement a secure payment system that allows users to safely add funds, make purchases, and withdraw earnings.

6. **Facilitate Community Building**: Create a community of users who can collaborate and support each other's social media growth goals.

7. **Offer Administrative Oversight**: Provide administrators with powerful tools to monitor, manage, and moderate the platform to ensure fair usage and policy compliance.

## Core Functionality

The Social Developer Platform provides a wide range of features designed to meet the needs of both task givers and task doers:

### For Task Givers:
- **Order Creation**: Create orders for various social media services including likes, followers, views, and subscribers
- **Campaign Management**: Manage multiple social media campaigns across different platforms
- **Budget Control**: Set budgets and track spending on social media growth
- **Progress Tracking**: Monitor the status and progress of all active orders
- **Balance Management**: Add funds to account and track spending history
- **Account Integration**: Connect and manage social media accounts directly through the platform

### For Task Doers:
- **Task Discovery**: Browse and discover available tasks that match their skills and preferences
- **Task Execution**: Complete social media tasks to earn rewards
- **Earnings Management**: Track earnings and withdraw funds when desired
- **Performance Metrics**: View personal performance statistics and ratings
- **Device Management**: Register and manage devices used for task execution

### For Administrators:
- **User Management**: Oversee all platform users, including account verification and issue resolution
- **Order Oversight**: Monitor orders and intervene when necessary
- **Task Moderation**: Review and approve tasks before they become available to task doers
- **Financial Monitoring**: Track all financial transactions and process withdrawals
- **System Analytics**: Access comprehensive platform metrics and usage statistics
- **Content Moderation**: Review reported content and resolve disputes between users
- **System Configuration**: Manage platform settings, service rates, and automation rules

### Key Platform Features:
- **Multi-Platform Support**: Services for Instagram and YouTube with potential for expansion
- **Dual User Modes**: Users can switch between task giver and task doer modes
- **Real-time Processing**: Automated task distribution and execution systems
- **Quality Assurance**: Task approval workflow to ensure service quality
- **Secure Payments**: Integrated payment processing with balance management
- **Comprehensive Reporting**: Detailed analytics and reporting for all user activities
- **Rate Limiting**: API rate limiting to prevent abuse and ensure fair usage
- **Audit Trail**: Complete logging of all user and administrative actions

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  balance DECIMAL(10,2) DEFAULT 0.00,
  role ENUM('user', 'admin') DEFAULT 'user',
  user_mode ENUM('taskDoer', 'taskGiver') DEFAULT 'taskDoer',
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Orders Table
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  platform ENUM('instagram', 'youtube') NOT NULL,
  service VARCHAR(255) NOT NULL,
  target_url VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  start_count INTEGER DEFAULT 0,
  remaining_count INTEGER NOT NULL,
  status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
  speed ENUM('normal', 'fast', 'express') DEFAULT 'normal',
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Tasks Table
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  type ENUM('like', 'follow', 'view', 'subscribe') NOT NULL,
  platform ENUM('instagram', 'youtube') NOT NULL,
  target_url VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  remaining_quantity INTEGER NOT NULL,
  rate DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
  last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX tasks_platform_type (platform, type),
  INDEX tasks_status (status),
  INDEX tasks_last_updated_at (last_updated_at)
);
```

### Other Tables
- **ActivityLog** - Tracks user activities
- **Device** - Stores user device information
- **Dispute** - Handles order disputes
- **InstagramAccount** - Manages Instagram accounts
- **InstagramFollowedAccount** - Tracks followed Instagram accounts
- **InstagramManagement** - Manages Instagram automation
- **OrderStatistics** - Stores order statistics
- **PaymentGateway** - Payment gateway configurations
- **Refund** - Refund transactions
- **Session** - User sessions
- **SocialAccount** - Social media accounts
- **TaskExecution** - Tracks task execution
- **Transaction** - Financial transactions
- **UserSettings** - User preferences
- **Withdrawal** - Withdrawal requests

## Authentication

All protected endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

### Register
**POST** `/api/auth/register`

Registers a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "username": "johndoe",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "token": "jwt_token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe",
    "phone": "+1234567890",
    "balance": 0,
    "createdAt": "timestamp"
  }
}
```

### Login
**POST** `/api/auth/login`

Authenticates a user and returns a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe",
    "phone": "+1234567890",
    "balance": 0,
    "createdAt": "timestamp"
  }
}
```

### Validate Token
**GET** `/api/auth/validate`

Validates a JWT token and returns user information.

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe",
    "phone": "+1234567890",
    "balance": 0,
    "createdAt": "timestamp"
  }
}
```

## API Endpoints

### Orders

**GET** `/api/orders/stats`
Get order statistics for the authenticated user.

**GET** `/api/orders`
Get all orders for the authenticated user.

**GET** `/api/orders/:id`
Get details of a specific order.

**POST** `/api/orders`
Create a new order.

**POST** `/api/orders/bulk`
Create multiple orders.

**POST** `/api/orders/:id/report`
Report an issue with an order.

**POST** `/api/orders/:id/repeat`
Repeat an existing order.

### Tasks

**GET** `/api/tasks/available`
Get available tasks for execution (task doers).

**POST** `/api/tasks/:id/start`
Start working on a task.

**POST** `/api/tasks/:id/complete`
Complete a task.

**GET** `/api/tasks/:id`
Get details of a specific task.

### Balance

**GET** `/api/balance`
Get the authenticated user's balance.

**POST** `/api/balance/add`
Add funds to the user's balance.

**POST** `/api/balance/withdraw`
Withdraw funds from the user's balance.

### Instagram Accounts

**GET** `/api/instagram-accounts`
Get user's Instagram accounts.

**POST** `/api/instagram-accounts`
Add a new Instagram account.

**DELETE** `/api/instagram-accounts/:id`
Remove an Instagram account.

### User

**GET** `/api/user/profile`
Get the authenticated user's profile.

**PUT** `/api/user/profile`
Update the authenticated user's profile.

**PUT** `/api/user/mode`
Change user mode (taskGiver/taskDoer).

## Admin API Endpoints

**GET** `/api/admin/tasks`
Get all tasks (admin only).

**GET** `/api/admin/tasks/pending`
Get pending tasks for approval (admin only).

**POST** `/api/admin/tasks/:id/approve`
Approve a task (admin only).

**POST** `/api/admin/tasks/:id/reject`
Reject a task (admin only).

**GET** `/api/admin/tasks/:id`
Get details of a specific task (admin only).

## Frontend Structure

The frontend is organized into the following main sections:

### Pages
- Home (`/`) - Landing page for unauthenticated users
- Dashboard (`/dashboard`) - Main dashboard for authenticated users
- Login (`/login`) - User login page
- Register (`/register`) - User registration page
- New Order (`/new-order`) - Create new social media orders (task givers only)
- My Orders (`/my-orders`) - View user's orders (task givers only)
- Add Balance (`/add-balance`) - Add funds to account (task givers only)
- Withdraw Balance (`/withdraw-balance`) - Withdraw funds from account
- Add Devices (`/add-devices`) - Add device for automation
- My Devices (`/my-devices`) - View registered devices
- Instagram Accounts (`/my-accounts/instagram`) - Manage Instagram accounts
- YouTube Accounts (`/my-accounts/youtube`) - Manage YouTube accounts
- Tasks (`/tasks`) - View and execute available tasks (task doers only)

### Components
- Layout components for consistent UI
- ProtectedRoute for authentication-based routing
- Form components for data input
- UI components for displaying data

### Context Providers
- AuthProvider - Manages authentication state
- LanguageProvider - Manages language preferences
- UserModeProvider - Manages user mode (taskGiver/taskDoer)
- BalanceProvider - Manages balance information

## Admin Panel Prompt

To create an admin panel for the main project, consider the following requirements:

### Backend Requirements
1. Create separate admin routes under `/api/admin/` namespace
2. Implement role-based access control (RBAC) to restrict admin endpoints
3. Add admin-specific controllers for managing users, orders, tasks, and system settings
4. Implement dashboard endpoints for system statistics and metrics
5. Add moderation endpoints for approving/rejecting user-generated content
6. Create audit logging for admin actions

### Frontend Requirements
1. Create a separate admin frontend application
2. Implement authentication with admin role verification
3. Design dashboard with system overview and key metrics
4. Create management sections for:
   - User management (view, edit, ban/unban users)
   - Order management (view, modify, refund orders)
   - Task management (approve/reject, monitor progress)
   - Financial management (view transactions, process withdrawals)
   - Content moderation (review reported content)
   - System settings (configure platform parameters)
5. Implement data visualization for statistics and analytics
6. Add audit trail for admin actions
7. Include search and filtering capabilities for all data tables

### Key Features
1. User Management Interface
   - List all users with filtering options
   - View user details and activity history
   - Edit user information and role
   - Suspend/ban users when necessary

2. Order Management Interface
   - View all orders across the platform
   - Filter orders by status, user, date range
   - Process refunds and cancellations
   - View order details and related tasks

3. Task Management Interface
   - Approve or reject submitted tasks
   - Monitor task progress and completion rates
   - View task details and execution history
   - Manually intervene in task execution if needed

4. Financial Management Interface
   - View all transactions and payment history
   - Process withdrawal requests
   - Monitor platform revenue and user balances
   - Generate financial reports

5. Analytics Dashboard
   - Display key platform metrics (user count, order volume, revenue)
   - Show trends over time with charts and graphs
   - Provide real-time monitoring of system health
   - Generate detailed reports on platform usage

6. System Configuration
   - Manage platform settings and parameters
   - Configure payment gateways and processing fees
   - Set automation rules and limits
   - Manage notification templates and preferences

7. Content Moderation
   - Review reported orders and tasks
   - Handle user disputes and complaints
   - Monitor for policy violations
   - Implement automated content filtering

This admin panel should provide comprehensive control over the platform while maintaining security and audit trails for all administrative actions.