import bcrypt from 'bcrypt';

export async function hashingPassword(password, saltRound = 10) {
  let salt = await bcrypt.genSalt(saltRound);
  let hash = await bcrypt.hash(password,salt);
  return hash;
}

export async function verifyPassword(plainPassword, hashPassword) {
  return await bcrypt.compare(plainPassword, hashPassword); // returns true or false
}