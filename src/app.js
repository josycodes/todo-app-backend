import express from 'express';
import dotenv from 'dotenv';
import router from './routes/index.route.js';

// Load environment variables from .env file
dotenv.config();

// Create Express application instance
const app = express();

// Define port from environment or default to 3000
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Root endpoint to verify server is running
app.get('/', (req, res) => {
  res.send('Todo App Backend is running!');
});

// Mount API routes under /api prefix
app.use('/api', router);

// Start the server and listen on specified port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 