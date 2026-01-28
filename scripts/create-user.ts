// Script to create a user with hashed password
// Run with: npx ts-node scripts/create-user.ts

import bcrypt from 'bcryptjs'

const password = 'admin123' // Change this!
const hash = bcrypt.hashSync(password, 10)

console.log('Password:', password)
console.log('Hash:', hash)
console.log('')
console.log('SQL to insert user:')
console.log(`
INSERT INTO users (email, password_hash, name) VALUES 
  ('admin@vitarsport.sk', '${hash}', 'Admin');
`)
