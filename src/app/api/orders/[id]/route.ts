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
    const order = await (prisma.order as any).findUnique({
      where: { id },
      include: {
        table: true,
        rider: true,
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
    const {
      status,
      paymentStatus,
      orderType,
      tableId,
      tableNo,
      riderId,
      riderName,
      riderPhone,
      deliveryFee,
      paymentMethod,
      amountPaid,
      items,
      notes,
    } = body;

    const existing: any = await (prisma.order as any).findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Cashier cannot cancel or refund order unless Admin / Manager
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
    if (status !== undefined) updateData.status = status;
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
    if (notes !== undefined) updateData.notes = notes;
    if (orderType !== undefined) updateData.orderType = orderType;
    if (deliveryFee !== undefined) updateData.deliveryFee = Number(deliveryFee);

    // Handle Rider updates
    if (riderId !== undefined) {
      if (riderId && isValidObjectId(riderId)) {
        const riderObj = await (prisma as any).rider?.findUnique({ where: { id: riderId } });
        if (riderObj) {
          updateData.riderId = riderObj.id;
          updateData.riderName = riderObj.name;
          updateData.riderPhone = riderObj.phone;
        }
      } else if (!riderId) {
        updateData.riderId = null;
        updateData.riderName = null;
        updateData.riderPhone = null;
      }
    }
    if (riderName !== undefined && updateData.riderName === undefined) {
      updateData.riderName = riderName ? riderName.trim() : null;
    }
    if (riderPhone !== undefined && updateData.riderPhone === undefined) {
      updateData.riderPhone = riderPhone ? riderPhone.trim() : null;
    }

    // Handle table updates
    let targetTableId = existing.tableId;
    if (tableId !== undefined) {
      if (tableId && isValidObjectId(tableId)) {
        const tableObj = await prisma.restaurantTable.findUnique({ where: { id: tableId } });
        if (tableObj) {
          updateData.tableId = tableObj.id;
          updateData.tableNo = tableObj.name;
          targetTableId = tableObj.id;
        }
      } else if (!tableId) {
        updateData.tableId = null;
        targetTableId = null;
      }
    }
    if (tableNo !== undefined && updateData.tableNo === undefined) {
      updateData.tableNo = tableNo ? tableNo.trim() : null;
    }

    // If items are modified, recalculate totals
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
          productName: item.productName || 'Item',
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
      const effDeliveryFee = updateData.deliveryFee !== undefined ? updateData.deliveryFee : existing.deliveryFee;
      const grandTotal = Math.round(taxableAmount + tax + effDeliveryFee);

      updateData.subtotal = subtotal;
      updateData.tax = tax;
      updateData.grandTotal = grandTotal;

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

    const currentGrandTotal = updateData.grandTotal !== undefined ? updateData.grandTotal : existing.grandTotal;

    // Handle payment settlement
    if (paymentStatus === 'PAID' || status === 'COMPLETED') {
      updateData.paymentStatus = 'PAID';
      updateData.status = 'COMPLETED';
      const paid = amountPaid !== undefined ? Number(amountPaid) : (existing.amountPaid || currentGrandTotal);
      updateData.amountPaid = paid >= currentGrandTotal ? paid : currentGrandTotal;
      updateData.change = Math.max(0, updateData.amountPaid - currentGrandTotal);
    } else if (amountPaid !== undefined) {
      updateData.amountPaid = Number(amountPaid);
      updateData.change = Math.max(0, Number(amountPaid) - currentGrandTotal);
    }

    const updated = await (prisma.order as any).update({
      where: { id },
      data: updateData,
      include: {
        table: true,
        rider: true,
        customer: true,
        user: { select: { name: true } },
        items: { include: { toppings: true } },
      },
    });

    // Update Table status accordingly
    if (targetTableId) {
      try {
        if (updated.paymentStatus === 'PAID' || updated.status === 'COMPLETED' || updated.status === 'CANCELLED' || updated.status === 'REFUNDED') {
          const otherActive = await prisma.order.findFirst({
            where: {
              tableId: targetTableId,
              id: { not: updated.id },
              paymentStatus: 'UNPAID',
              status: { notIn: ['CANCELLED', 'REFUNDED'] },
            },
          });
          await prisma.restaurantTable.update({
            where: { id: targetTableId },
            data: { status: otherActive ? 'OCCUPIED' : 'AVAILABLE' },
          });
        } else {
          await prisma.restaurantTable.update({
            where: { id: targetTableId },
            data: { status: 'OCCUPIED' },
          });
        }
      } catch (tblErr) {
        console.warn('Table update error:', tblErr);
      }
    }

    // Audit log
    try {
      const userExists = isValidObjectId(session.userId)
        ? await prisma.user.findUnique({ where: { id: session.userId } })
        : null;
      await prisma.auditLog.create({
        data: {
          userId: userExists ? userExists.id : null,
          userName: session.name || 'Staff User',
          action: 'UPDATE_ORDER',
          details: `Updated order ${existing.invoiceNo} (Status: ${updated.status}, Payment: ${updated.paymentStatus})`,
        },
      });
    } catch {}

    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    console.error('Update order error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update order' }, { status: 500 });
  }
}
