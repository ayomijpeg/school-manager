import { jwtVerify } from 'jose';

export async function verifyJwt(token: string) {
  try {
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
      console.error('JWT_SECRET is not set; refusing to verify token.');
      return null;
    }
    const secret = new TextEncoder().encode(secretKey);

    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('JWT verification failed:', error);
    }
    return null;
  }
}
