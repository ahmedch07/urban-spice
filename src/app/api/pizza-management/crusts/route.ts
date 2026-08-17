import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const crusts = await prisma.crust.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json({ crusts });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch crusts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, additionalPrice } = body;

    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });

    const newCrust = await prisma.crust.create({
      data: {
        name: name.trim(),
        additionalPrice: parseFloat(additionalPrice || 0),
      },
    });

    return NextResponse.json({ success: true, crust: newCrust });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create crust' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, additionalPrice, active } = body;

    const updated = await prisma.crust.update({
      where: { id },
      data: {
        name: name?.trim(),
        additionalPrice: additionalPrice !== undefined ? parseFloat(additionalPrice) : undefined,
        active: active !== undefined ? Boolean(active) : undefined,
      },
    });

    return NextResponse.json({ success: true, crust: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update crust' }, { status: 500 });
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

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await prisma.crust.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete crust' }, { status: 500 });
  }
}
