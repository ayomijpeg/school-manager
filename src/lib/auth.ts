import { jwtVerify } from 'jose';

export async function verifyJwt(token: string) {
  try {
    const secretKey = process.env.JWT_SECRET || 'default-secret-key';
    const secret = new TextEncoder().encode(secretKey);
    
    // DEBUG: Uncomment this if you are still stuck to see what secret is being used
    // console.log("Verifying with secret:", secretKey);

    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    console.error("JWT Verification Failed:", error); // <--- This will show up in your terminal
    return null;
  }
}
