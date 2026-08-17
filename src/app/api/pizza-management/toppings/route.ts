import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const toppings = await prisma.topping.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json({ toppings });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch toppings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, additionalPrice, stock } = body;

    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });

    const newTopping = await prisma.topping.create({
      data: {
        name: name.trim(),
        additionalPrice: parseFloat(additionalPrice || 0),
        stock: parseInt(stock || 500),
      },
    });

    return NextResponse.json({ success: true, topping: newTopping });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create topping' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, additionalPrice, stock, active } = body;

    const updated = await prisma.topping.update({
      where: { id },
      data: {
        name: name?.trim(),
        additionalPrice: additionalPrice !== undefined ? parseFloat(additionalPrice) : undefined,
        stock: stock !== undefined ? parseInt(stock) : undefined,
        active: active !== undefined ? Boolean(active) : undefined,
      },
    });

    return NextResponse.json({ success: true, topping: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update topping' }, { status: 500 });
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

    await prisma.topping.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete topping' }, { status: 500 });
  }
}
