import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, signJWT } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, expectedRole } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'No staff account found with this email address. Please check the email or create it in Staff Management.' },
        { status: 401 }
      );
    }

    if (!user.active) {
      return NextResponse.json(
        { error: 'This account has been deactivated. Please contact Admin.' },
        { status: 401 }
      );
    }

    if (expectedRole === 'ADMIN' && user.role !== 'ADMIN' && user.role !== 'MANAGER') {
      return NextResponse.json({ error: 'This sign-in is restricted to Admin accounts.' }, { status: 403 });
    }
    if (expectedRole === 'CASHIER' && user.role !== 'CASHIER' && user.role !== 'ADMIN' && user.role !== 'MANAGER') {
      return NextResponse.json({ error: 'This sign-in is restricted to Cashier accounts.' }, { status: 403 });
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Incorrect password. Please double-check your password.' },
        { status: 401 }
      );
    }

    const token = await signJWT({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role as 'ADMIN' | 'CASHIER' | 'MANAGER',
    });

    // Create Audit Log safely
    try {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          userName: user.name,
          action: 'USER_LOGIN',
          details: `User ${user.name} (${user.role}) logged in successfully.`,
        },
      });
    } catch (auditError) {
      console.warn('Audit log creation failed/skipped:', auditError);
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400, // 24 hours
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Login error details:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error during authentication' },
      { status: 500 }
    );
  }
}
