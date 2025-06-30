import knex from 'knex';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Knex database connection configuration
 * Uses environment variables for database credentials
 * Supports PostgreSQL, MySQL, SQLite, and other databases
 */
const db = knex({
  client: process.env.DB_CLIENT,        // Database client (e.g., 'pg' for PostgreSQL)
  connection: {
    host: process.env.DB_HOST,          // Database host (e.g., 'localhost')
    port: process.env.DB_PORT,          // Database port (e.g., 5432 for PostgreSQL)
    user: process.env.DB_USER,          // Database username
    password: process.env.DB_PASSWORD,  // Database password
    database: process.env.DB_NAME,      // Database name
  },
});

// Export the configured database instance
export default db; 