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
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
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
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    const body = await request.json();
    const { status, riderId, riderName, riderPhone, orderType, tableNo, paymentMethod, items } = body;

    if (
      (orderType !== undefined || tableNo !== undefined || paymentMethod !== undefined || items !== undefined) &&
      !['ADMIN', 'MANAGER'].includes(session.role)
    ) {
      return NextResponse.json({ error: 'Only Admin or Manager can edit order details' }, { status: 403 });
    }

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
    if (riderId !== undefined) updateData.riderId = isValidObjectId(riderId) ? riderId : null;
    if (orderType !== undefined) updateData.orderType = orderType;
    if (tableNo !== undefined) updateData.tableNo = tableNo ? tableNo.trim() : null;
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;

    if (items !== undefined) {
      if (!Array.isArray(items) || items.length === 0) {
        return NextResponse.json({ error: 'An order must contain at least one item' }, { status: 400 });
      }

      const validProductIds = new Set(
        (await prisma.product.findMany({ select: { id: true } })).map((product) => product.id)
      );
      const normalizedItems = items.map((item: any) => {
        const quantity = Math.max(1, Number(item.quantity) || 1);
        const unitPrice = Math.max(0, Number(item.unitPrice) || 0);
        const toppings = Array.isArray(item.toppings) ? item.toppings : [];
        const toppingsTotal = toppings.reduce((sum: number, topping: any) => sum + (Number(topping.price) || 0), 0);
        return {
          productId: isValidObjectId(item.productId) && validProductIds.has(item.productId) ? item.productId : null,
          productName: item.productName || 'Custom Item',
          quantity,
          unitPrice,
          total: (unitPrice + toppingsTotal) * quantity,
          toppings,
        };
      });
      const subtotal = normalizedItems.reduce((sum, item) => sum + item.total, 0);
      const previousTaxableAmount = Math.max(0, existing.subtotal - existing.discount);
      const taxRate = previousTaxableAmount > 0 ? existing.tax / previousTaxableAmount : 0;
      const taxableAmount = Math.max(0, subtotal - existing.discount);
      const tax = Math.round(taxableAmount * taxRate);
      const grandTotal = Math.round(taxableAmount + tax + existing.deliveryFee);

      updateData.subtotal = subtotal;
      updateData.tax = tax;
      updateData.grandTotal = grandTotal;
      if (status === 'COMPLETED' || (status === undefined && existing.status === 'COMPLETED')) {
        updateData.amountPaid = grandTotal;
        updateData.change = 0;
      }
      updateData.items = {
        deleteMany: {},
        create: normalizedItems.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
          toppings: {
            create: item.toppings.map((topping: any) => ({
              toppingName: topping.toppingName || topping.name || 'Extra Topping',
              price: Number(topping.price) || 0,
            })),
          },
        })),
      };
    }

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
      const userExists = isValidObjectId(session.userId)
        ? await prisma.user.findUnique({ where: { id: session.userId } })
        : null;
      await prisma.auditLog.create({
        data: {
          userId: userExists ? session.userId : null,
          userName: session.name || 'Staff',
          action: `UPDATE_ORDER_${updated.invoiceNo}`,
          details: `Updated Order ${existing.invoiceNo}`,
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

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentUser();
    if (!session || !['ADMIN', 'MANAGER'].includes(session.role)) {
      return NextResponse.json({ error: 'Only Admin or Manager can delete orders' }, { status: 403 });
    }

    const { id } = await params;
    if (!isValidObjectId(id)) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const order = await prisma.order.findUnique({ where: { id }, select: { invoiceNo: true } });
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    await prisma.order.delete({ where: { id } });

    try {
      const userExists = isValidObjectId(session.userId)
        ? await prisma.user.findUnique({ where: { id: session.userId } })
        : null;
      await prisma.auditLog.create({
        data: {
          userId: userExists ? session.userId : null,
          userName: session.name || 'Staff',
          action: `DELETE_ORDER_${order.invoiceNo}`,
          details: `Deleted Order ${order.invoiceNo}`,
        },
      });
    } catch (auditErr) {
      console.warn('Audit log skipped:', auditErr);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete order error:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
