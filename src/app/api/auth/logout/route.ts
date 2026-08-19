import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isValidObjectId } from '@/lib/utils';

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (user) {
      try {
        await prisma.auditLog.create({
          data: {
            userId: isValidObjectId(user.userId) ? user.userId : null,
            userName: user.name,
            action: 'USER_LOGOUT',
            details: `User ${user.name} logged out.`,
          },
        });
      } catch (auditErr) {
        console.warn('Logout audit log creation skipped:', auditErr);
      }
    }
  } catch (e) {
    console.warn('Get current user during logout skipped:', e);
  }

  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  response.cookies.set('token', '', {
    httpOnly: true,
    expires: new Date(0),
    maxAge: 0,
    path: '/',
  });
  return response;
}
