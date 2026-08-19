import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { signJWT, verifyJWT, JWTPayload } from './jwt';

export type { JWTPayload };
export { signJWT, verifyJWT };

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashed: string): Promise<boolean> {
  return await bcrypt.compare(password, hashed);
}

export async function getCurrentUser(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  return await verifyJWT(token);
}
