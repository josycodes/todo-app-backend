import db from './knex.js';

export async function createUser(email, passwordHash) {
  const [user] = await db('users')
    .insert({ email, password_hash: passwordHash })
    .returning(['id', 'email']);
  return user;
}

export async function findUserByEmail(email) {
  return db('users').where({ email }).first();
} 