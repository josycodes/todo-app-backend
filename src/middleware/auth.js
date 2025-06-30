import { verifyToken } from '../utils/token.js';

/**
 * Authentication middleware to verify JWT tokens
 * Extracts the Bearer token from Authorization header and verifies it
 * Sets req.user with the decoded token payload if valid
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.headers - Request headers
 * @param {string} req.headers.authorization - Authorization header (Bearer token)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @returns {Object} - JSON error response if authentication fails
 */
export function authenticate(req, res, next) {
  // Extract Authorization header
  const authHeader = req.headers.authorization;
  
  // Check if Authorization header exists and starts with 'Bearer '
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  // Extract token from "Bearer <token>" format
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify and decode the token
    const user = verifyToken(token);
    
    // Set user info in request object for use in route handlers
    req.user = user;
    
    // Continue to next middleware/route handler
    next();
  } catch (err) {
    // Token is invalid or expired
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
} 