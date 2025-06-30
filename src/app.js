import express from 'express';
import dotenv from 'dotenv';
import router from './routes/index.route.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Todo App Backend is running!');
});

app.use('/api', router);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 