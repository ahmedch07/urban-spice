import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        user: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            toppings: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
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
    const body = await request.json();
    const { status } = body;

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Cashier cannot cancel or refund order unless Admin
    if (
      (status === 'CANCELLED' || status === 'REFUNDED') &&
      session.role !== 'ADMIN' &&
      session.role !== 'MANAGER'
    ) {
      return NextResponse.json(
        { error: 'Only Admin or Manager can cancel or refund orders' },
        { status: 403 }
      );
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        customer: true,
        user: { select: { name: true } },
        items: { include: { toppings: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.name,
        action: `UPDATE_ORDER_STATUS_${status}`,
        details: `Updated Order ${existing.invoiceNo} status from ${existing.status} to ${status}`,
      },
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
