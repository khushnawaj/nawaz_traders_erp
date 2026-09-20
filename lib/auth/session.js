import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

const secretString = process.env.JWT_SECRET;
if (process.env.NODE_ENV === 'production' && !secretString) {
  throw new Error('FATAL SECURITY ERROR: JWT_SECRET environment variable is not defined in production!');
}

const JWT_SECRET = new TextEncoder().encode(
  secretString || 'fallback-secret-key-grain-erp-2026'
);

/**
 * Hashes plain text password
 * @param {string} password 
 * @returns {Promise<string>}
 */
export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

/**
 * Compares plain text password with stored hash
 * @param {string} password 
 * @param {string} hash 
 * @returns {Promise<boolean>}
 */
export async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

/**
 * Creates signed JWT token for user session
 * @param {object} payload { userId, username, role, fullName }
 * @returns {Promise<string>}
 */
export async function signSessionToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

/**
 * Verifies JWT token and extracts session payload
 * @param {string} token 
 * @returns {Promise<object|null>}
 */
export async function verifySessionToken(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}
