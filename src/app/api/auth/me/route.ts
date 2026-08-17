import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, role: true, phone: true, active: true },
  });

  if (!user || !user.active) {
    return NextResponse.json({ error: 'User not found or inactive' }, { status: 401 });
  }

  return NextResponse.json({ user });
}
