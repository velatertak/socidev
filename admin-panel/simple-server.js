const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Sequelize, DataTypes } = require('sequelize');

// Load environment variables
require('dotenv').config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const sequelize = new Sequelize(
  process.env.MAIN_DB_NAME || 'social_developer',
  process.env.MAIN_DB_USER || 'root',
  process.env.MAIN_DB_PASS || '',
  {
    host: process.env.MAIN_DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false
  }
);

// User model (simplified)
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'first_name'
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'last_name'
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  role: {
    type: DataTypes.ENUM('user', 'moderator', 'admin', 'super_admin'),
    defaultValue: 'user'
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true
});

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-this';

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find admin user
    const user = await User.findOne({
      where: {
        email: email,
        role: {
          [Sequelize.Op.in]: ['admin', 'super_admin']
        }
      }
    });
    
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid credentials or insufficient privileges'
      });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid credentials'
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      {
        adminId: user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Return response
    res.json({
      message: 'Login successful',
      data: {
        admin: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        token: token
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Login failed'
    });
  }
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  res.json({
    message: 'Logout successful'
  });
});

// Get current admin profile
app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided'
      });
    }
    
    const token = authHeader.substring(7);
    
    // Verify JWT token
    const payload = jwt.verify(token, JWT_SECRET);
    
    // Find user
    const user = await User.findByPk(payload.adminId);
    
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Admin not found'
      });
    }
    
    res.json({
      message: 'Admin profile retrieved',
      data: {
        admin: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      }
    });
    
  } catch (error) {
    console.error('Profile retrieval error:', error);
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to database successfully');
    
    app.listen(PORT, () => {
      console.log(`Admin panel server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();