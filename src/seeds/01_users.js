import bcrypt from 'bcrypt';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('users').del();

  const hashedPassword = await bcrypt.hash('123456', 10);

  // Inserts seed entries
  await knex('users').insert([
    {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
    },
    {
      name: 'Test User',
      email: 'user@example.com',
      password: hashedPassword,
    },
  ]);
};
