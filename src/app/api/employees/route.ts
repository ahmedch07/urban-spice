import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, hashPassword } from '@/lib/auth';

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

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.name,
        action: 'CREATE_EMPLOYEE',
        details: `Created employee ${newEmployee.name} (${newEmployee.role})`,
      },
    });

    return NextResponse.json({ success: true, employee: newEmployee });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 });
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

    const updated = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: { id: true, name: true, email: true, role: true, active: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.name,
        action: 'UPDATE_EMPLOYEE',
        details: `Updated employee ${updated.name} profile/role`,
      },
    });

    return NextResponse.json({ success: true, employee: updated });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'This email is already taken by another account' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 });
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

    try {
      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          userName: session.name,
          action: 'DELETE_EMPLOYEE',
          details: `Deleted employee account ${userToDelete.name} (${userToDelete.email})`,
        },
      });
    } catch (auditError) {
      console.warn('Audit log creation skipped:', auditError);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to delete employee' }, { status: 500 });
  }
}
