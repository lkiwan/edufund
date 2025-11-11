const bcrypt = require('bcryptjs');
const db = require('../db/init-db');

/**
 * Authentication service using SQLite database
 */
const authService = {
  /**
   * Login a user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Object|null} User object without password or null if authentication fails
   */
  login: (email, password) => {
    try {
      // Get user from database
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      
      // Check if user exists and password is correct
      if (user && bcrypt.compareSync(password, user.password)) {
        // Return user without password
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }
      
      return null;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  },
  
  /**
   * Register a new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} role - User role (default: 'user')
   * @returns {Object|null} Created user without password or null if registration fails
   */
  register: (email, password, role = 'user') => {
    try {
      // Check if user already exists
      const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      if (existingUser) {
        return null;
      }
      
      // Hash password
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);
      
      // Insert user into database
      const result = db.prepare(
        'INSERT INTO users (email, password, role) VALUES (?, ?, ?)'
      ).run(email, hashedPassword, role);
      
      if (result.changes > 0) {
        // Get created user
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
        
        // Return user without password
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }
      
      return null;
    } catch (error) {
      console.error('Registration error:', error);
      return null;
    }
  },
  
  /**
   * Get user by ID
   * @param {number} id - User ID
   * @returns {Object|null} User object without password or null if not found
   */
  getUserById: (id) => {
    try {
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
      
      if (user) {
        // Return user without password
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }
      
      return null;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  },

  /**
   * Basic token verification middleware placeholder.
   * Attaches a user object based on route param when present.
   */
  verifyToken: (req, res, next) => {
    try {
      const routeUserId = Number(req.params.userId);
      if (!Number.isNaN(routeUserId)) {
        req.user = { id: routeUserId };
      }
    } catch (_) {
      // noop
    }
    next();
  }
};

module.exports = authService;