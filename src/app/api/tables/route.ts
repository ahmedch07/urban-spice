import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const tables = await prisma.restaurantTable.findMany({
      where: { active: true },
      include: {
        orders: {
          where: {
            paymentStatus: 'UNPAID',
            status: { notIn: ['CANCELLED', 'REFUNDED'] },
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            items: {
              include: { toppings: true },
            },
            customer: {
              select: { name: true, phone: true },
            },
          },
        },
      },
      orderBy: { number: 'asc' },
    });

    const formattedTables = tables.map((t) => {
      const activeOrder = t.orders && t.orders.length > 0 ? t.orders[0] : null;
      return {
        id: t.id,
        name: t.name,
        number: t.number,
        capacity: t.capacity,
        status: activeOrder ? 'OCCUPIED' : (t.status || 'AVAILABLE'),
        active: t.active,
        activeOrder,
      };
    });

    return NextResponse.json({ tables: formattedTables });
  } catch (error) {
    console.error('Fetch tables error:', error);
    return NextResponse.json({ error: 'Failed to fetch restaurant tables' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'Only Admin or Manager can configure restaurant tables' }, { status: 403 });
    }

    const body = await request.json();
    const { name, number, capacity } = body;

    if (!name || number === undefined) {
      return NextResponse.json({ error: 'Table name and number are required' }, { status: 400 });
    }

    const existingNumber = await prisma.restaurantTable.findUnique({
      where: { number: Number(number) },
    });
    if (existingNumber) {
      return NextResponse.json({ error: `Table number ${number} already exists` }, { status: 400 });
    }

    const table = await prisma.restaurantTable.create({
      data: {
        name: name.trim(),
        number: Number(number),
        capacity: Number(capacity) || 4,
        status: 'AVAILABLE',
        active: true,
      },
    });

    return NextResponse.json({ success: true, table });
  } catch (error: any) {
    console.error('Create table error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to create table' }, { status: 500 });
  }
}
