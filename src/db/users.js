import db from './knex.js';

/**
 * Create a new user in the database
 * @param {string} email - User's email address
 * @param {string} passwordHash - Hashed password
 * @param {string} firstName - User's first name
 * @param {string} lastName - User's last name
 * @returns {Promise<Object>} - Created user object (without password)
 */
export async function createUser(email, passwordHash, firstName, lastName) {
  const [user] = await db('users')
    .insert({ email, password_hash: passwordHash, first_name: firstName, last_name: lastName })
    .returning(['id', 'email', 'first_name', 'last_name']);
  return user;
}

/**
 * Find a user by email address
 * @param {string} email - Email address to search for
 * @returns {Promise<Object|null>} - User object if found, null otherwise
 */
export async function findUserByEmail(email) {
  return db('users').where({ email }).first();
} 