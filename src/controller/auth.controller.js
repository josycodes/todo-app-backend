import bcrypt from 'bcryptjs';
import { createUser, findUserByEmail } from '../db/users.js';
import Joi from 'joi';

const authSchema = Joi.object({
  first_name: Joi.string().min(1).max(50).required(),
  last_name: Joi.string().min(1).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export async function register(req, res) {
  const { error } = authSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const { email, password, first_name, last_name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  try {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already in use.' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser(email, passwordHash, first_name, last_name);
    res.status(201).json({ id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed.' });
  }
}

export async function login(req, res) {
  const { error } = authSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    res.json({ id: user.id, email: user.email });
  } catch (err) {
    res.status(500).json({ error: 'Login failed.' });
  }
} 