import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  const user = await getCurrentUser();
  if (user) {
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        userName: user.name,
        action: 'USER_LOGOUT',
        details: `User ${user.name} logged out.`,
      },
    });
  }

  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  response.cookies.set('token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });
  return response;
}
