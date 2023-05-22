import * as jwt from 'jsonwebtoken';
import { PrismaClient, User } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

export const APP_SECRET = process.env.JWT_SECRET as jwt.Secret;

export async function authenticateUser(
  prisma: PrismaClient,
  request: Request
): Promise<User | null> {
  const header = request.headers.get('authorization');
  if (header !== null) {
    const token = header.split(' ')[1];
    if (!token) {
      return null;
    }
    const tokenPayload = jwt.verify(token, APP_SECRET) as jwt.JwtPayload;
    const userId = tokenPayload.userId;
    return await prisma.user.findUnique({ where: { id: userId } });
  }

  return null;
}
