import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

export class AuthService {
  async register(userData) {
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email: userData.email }, { username: userData.username }]
      }
    });

    if (existingUser) {
      throw new ApiError(400, 'User already exists');
    }

    const user = await User.create(userData);
    const token = this.generateToken(user.id);

    return {
      token,
      user: this.sanitizeUser(user)
    };
  }

  async login({ email, password }) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const token = this.generateToken(user.id);

    return {
      token,
      user: this.sanitizeUser(user)
    };
  }

  generateToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
  }

  sanitizeUser(user) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      balance: user.balance
    };
  }
}