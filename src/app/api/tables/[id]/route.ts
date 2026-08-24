import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { isValidObjectId } from '@/lib/utils';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid table ID' }, { status: 400 });
    }

    const table = await prisma.restaurantTable.findUnique({
      where: { id },
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
          },
        },
      },
    });

    if (!table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    const activeOrder = table.orders && table.orders.length > 0 ? table.orders[0] : null;

    return NextResponse.json({
      table: {
        ...table,
        status: activeOrder ? 'OCCUPIED' : table.status,
        activeOrder,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch table' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid table ID' }, { status: 400 });
    }

    const body = await request.json();
    const { name, number, capacity, status, active } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (number !== undefined) updateData.number = Number(number);
    if (capacity !== undefined) updateData.capacity = Number(capacity);
    if (status !== undefined) {
      const validStatuses = ['AVAILABLE', 'OCCUPIED', 'RESERVED'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: 'Invalid table status' }, { status: 400 });
      }
      updateData.status = status;
    }
    if (active !== undefined) updateData.active = Boolean(active);

    const updatedTable = await prisma.restaurantTable.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, table: updatedTable });
  } catch (error: any) {
    console.error('Update table error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update table' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only Admin can delete restaurant tables' }, { status: 403 });
    }

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid table ID' }, { status: 400 });
    }

    // Check if table has active unpaid orders
    const activeOrder = await prisma.order.findFirst({
      where: {
        tableId: id,
        paymentStatus: 'UNPAID',
        status: { notIn: ['CANCELLED', 'REFUNDED'] },
      },
    });

    if (activeOrder) {
      return NextResponse.json(
        { error: 'Cannot delete table with an active dining order. Settle or cancel the order first.' },
        { status: 400 }
      );
    }

    await prisma.restaurantTable.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Table deleted successfully' });
  } catch (error: any) {
    console.error('Delete table error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to delete table' }, { status: 500 });
  }
}
