import bcrypt from "bcryptjs";
import database from "infra/database.js";
import jwt from "jsonwebtoken";

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in the environment.");
  }
  return process.env.JWT_SECRET;
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function signToken(payload) {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: "7d",
  });
}

export function verifyToken(token) {
  if (!token) {
    return null;
  }
  try {
    return jwt.verify(token, getJwtSecret());
  } catch (error) {
    return null;
  }
}

export async function getUserByEmail(email) {
  const result = await database.query({
    text: "SELECT id, name, email, password_hash FROM users WHERE email = $1 LIMIT 1;",
    values: [email],
  });
  return result.rows[0] || null;
}

export async function getUserById(id) {
  const result = await database.query({
    text: "SELECT id, name, email FROM users WHERE id = $1 LIMIT 1;",
    values: [id],
  });
  return result.rows[0] || null;
}

export async function getUserFromHeaders(headers) {
  const authHeader = headers.authorization || headers.Authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.replace("Bearer ", "").trim();
  const decoded = verifyToken(token);
  if (!decoded || !decoded.userId) {
    return null;
  }
  return getUserById(decoded.userId);
}
