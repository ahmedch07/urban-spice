import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, hashPassword } from '@/lib/auth';

async function createSafeAuditLog(userId: string, userName: string, action: string, details: string) {
  try {
    const userExists = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
    await prisma.auditLog.create({
      data: {
        userId: userExists ? userId : null,
        userName: userName || 'Admin',
        action,
        details,
      },
    });
  } catch (err) {
    console.warn('Audit log creation skipped:', err);
  }
}

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const employees = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        active: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ employees });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, phone, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password required' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing) {
      return NextResponse.json({ error: 'User email already exists' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    const newEmployee = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone ? phone.trim() : null,
        password: hashedPassword,
        role: role || 'CASHIER',
        active: true,
      },
      select: { id: true, name: true, email: true, role: true, active: true },
    });

    await createSafeAuditLog(
      session.userId,
      session.name,
      'CREATE_EMPLOYEE',
      `Created employee ${newEmployee.name} (${newEmployee.role})`
    );

    return NextResponse.json({ success: true, employee: newEmployee });
  } catch (error: any) {
    console.error('Create employee error:', error);
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'User email already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: error?.message || 'Failed to create employee' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, email, phone, role, active, password } = body;

    const dataToUpdate: any = {
      name: name?.trim(),
      phone: phone !== undefined ? phone?.trim() : undefined,
      role: role || undefined,
      active: active !== undefined ? Boolean(active) : undefined,
    };

    if (email && email.trim() !== '') {
      dataToUpdate.email = email.toLowerCase().trim();
    }

    if (password && password.trim() !== '') {
      dataToUpdate.password = await hashPassword(password);
    }

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    let existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser && email) {
      existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    }

    if (!existingUser) {
      return NextResponse.json({ error: 'Employee account not found. Please refresh the page.' }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id: existingUser.id },
      data: dataToUpdate,
      select: { id: true, name: true, email: true, role: true, active: true },
    });

    await createSafeAuditLog(
      session.userId,
      session.name,
      'UPDATE_EMPLOYEE',
      `Updated employee ${updated.name} profile/role`
    );

    return NextResponse.json({ success: true, employee: updated });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'This email is already taken by another account' }, { status: 400 });
    }
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Employee account not found. Please refresh the page.' }, { status: 404 });
    }
    return NextResponse.json({ error: error?.message || 'Failed to update employee' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Employee ID required' }, { status: 400 });
    }

    const totalUsers = await prisma.user.count();
    if (totalUsers <= 1) {
      return NextResponse.json({ error: 'System must have at least one active user account.' }, { status: 400 });
    }

    const userToDelete = await prisma.user.findUnique({ where: { id } });
    if (!userToDelete) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    await prisma.user.delete({ where: { id } });

    await createSafeAuditLog(
      session.userId,
      session.name,
      'DELETE_EMPLOYEE',
      `Deleted employee account ${userToDelete.name} (${userToDelete.email})`
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to delete employee' }, { status: 500 });
  }
}
