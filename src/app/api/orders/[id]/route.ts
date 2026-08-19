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
    const { status, riderId, riderName, riderPhone } = body;

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Cashier cannot cancel or refund order unless Admin
    if (
      status &&
      (status === 'CANCELLED' || status === 'REFUNDED') &&
      session.role !== 'ADMIN' &&
      session.role !== 'MANAGER'
    ) {
      return NextResponse.json(
        { error: 'Only Admin or Manager can cancel or refund orders' },
        { status: 403 }
      );
    }

    const updateData: any = {};
    if (status) {
      updateData.status = status;
      if (status === 'COMPLETED' && existing.amountPaid < existing.grandTotal) {
        updateData.amountPaid = existing.grandTotal;
        updateData.change = 0;
      }
    }

    if (riderName !== undefined) updateData.riderName = riderName ? riderName.trim() : null;
    if (riderPhone !== undefined) updateData.riderPhone = riderPhone ? riderPhone.trim() : null;
    if (riderId !== undefined) updateData.riderId = riderId || null;

    const updated = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        user: { select: { name: true } },
        items: { include: { toppings: true } },
      },
    });

    try {
      const userExists = session.userId ? await prisma.user.findUnique({ where: { id: session.userId } }) : null;
      await prisma.auditLog.create({
        data: {
          userId: userExists ? session.userId : null,
          userName: session.name || 'Staff',
          action: `UPDATE_ORDER_${updated.invoiceNo}`,
          details: `Updated Order ${existing.invoiceNo} status/rider`,
        },
      });
    } catch (auditErr) {
      console.warn('Audit log skipped:', auditErr);
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
