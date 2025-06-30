import db from './knex.js';

export async function createUser(email, passwordHash, firstName, lastName) {
  const [user] = await db('users')
    .insert({ email, password_hash: passwordHash, first_name: firstName, last_name: lastName })
    .returning(['id', 'email', 'first_name', 'last_name']);
  return user;
}

export async function findUserByEmail(email) {
  return db('users').where({ email }).first();
} 