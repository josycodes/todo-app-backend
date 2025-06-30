import bcrypt from 'bcryptjs';
import { createUser, findUserByEmail } from '../db/users.js';
import Joi from 'joi';

// Joi validation schema for authentication (register and login)
const authSchema = Joi.object({
  first_name: Joi.string().min(1).max(50).required(),
  last_name: Joi.string().min(1).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

/**
 * Register a new user
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing user registration data
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with created user info or error
 */
export async function register(req, res) {
  // Validate request body against schema
  const { error } = authSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  
  const { email, password, first_name, last_name } = req.body;
  
  try {
    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already in use.' });
    }
    
    // Hash password before storing
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create new user
    const user = await createUser(email, passwordHash, first_name, last_name);
    res.status(201).json({ id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed.' });
  }
}

/**
 * Authenticate and login a user
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing login credentials
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with user info or error
 */
export async function login(req, res) {
  // Validate request body against schema
  const { error } = authSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  
  const { email, password } = req.body;
  
  try {
    // Find user by email
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    
    // Verify password
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    
    // Return user info (excluding password)
    res.json({ id: user.id, email: user.email });
  } catch (err) {
    res.status(500).json({ error: 'Login failed.' });
  }
} 