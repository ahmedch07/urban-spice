import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const sizes = await prisma.pizzaSize.findMany({ orderBy: { sortOrder: 'asc' } });
    return NextResponse.json({ sizes });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch pizza sizes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, code, sortOrder } = body;

    if (!name || !code) {
      return NextResponse.json({ error: 'Name and Code are required' }, { status: 400 });
    }

    const newSize = await prisma.pizzaSize.create({
      data: {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        sortOrder: parseInt(sortOrder || 0),
      },
    });

    return NextResponse.json({ success: true, size: newSize });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create size' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, code, sortOrder } = body;

    const updated = await prisma.pizzaSize.update({
      where: { id },
      data: {
        name: name?.trim(),
        code: code?.trim().toUpperCase(),
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder) : undefined,
      },
    });

    return NextResponse.json({ success: true, size: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update size' }, { status: 500 });
  }
}
