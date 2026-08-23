import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { generateInvoiceNumber, getLocalDateKey, isValidObjectId } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range'); // today, all
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');
    const orderType = searchParams.get('orderType');
    const tableId = searchParams.get('tableId');
    const riderId = searchParams.get('riderId');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const whereClause: any = {};

    if (range === 'today') {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      whereClause.createdAt = { gte: todayStart };
    }

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    if (paymentStatus && paymentStatus !== 'ALL') {
      whereClause.paymentStatus = paymentStatus;
    }

    if (orderType && orderType !== 'ALL') {
      whereClause.orderType = orderType;
    }

    if (tableId && isValidObjectId(tableId)) {
      whereClause.tableId = tableId;
    }

    if (riderId && isValidObjectId(riderId)) {
      whereClause.riderId = riderId;
    }

    if (search && search.trim()) {
      const query = search.trim();
      whereClause.OR = [
        { invoiceNo: { contains: query, mode: 'insensitive' } },
        { tableNo: { contains: query, mode: 'insensitive' } },
        { riderName: { contains: query, mode: 'insensitive' } },
      ];
    }

    const totalCount = await prisma.order.count({ where: whereClause });
    const orders = await (prisma.order as any).findMany({
      where: whereClause,
      include: {
        table: true,
        rider: true,
        customer: { select: { name: true, phone: true, address: true } },
        user: { select: { name: true, email: true } },
        items: {
          include: {
            toppings: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({ orders, totalCount, page, totalPages: Math.ceil(totalCount / limit) });
  } catch (error) {
    console.error('Fetch orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      customerId,
      riderId,
      tableId,
      tableNo,
      orderType,
      items,
      discount,
      discountType,
      tax,
      deliveryFee,
      paymentMethod,
      amountPaid,
      notes,
      isPendingPayment,
      paymentStatus: explicitPaymentStatus,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart cannot be empty' }, { status: 400 });
    }

    // Get Invoice prefix
    let prefix = 'INV-2026';
    try {
      const prefixSetting = await prisma.storeSetting.findUnique({ where: { key: 'invoicePrefix' } });
      if (prefixSetting && prefixSetting.value) {
        prefix = prefixSetting.value;
      }
    } catch {}

    const orderCount = await prisma.order.count();
    const invoiceNo = generateInvoiceNumber(prefix, orderCount + 1);

    // Validate customer ID
    let validCustomerId: string | null = null;
    if (isValidObjectId(customerId)) {
      const existingCustomer = await prisma.customer.findUnique({ where: { id: customerId } });
      if (existingCustomer) validCustomerId = customerId;
    }

    // Validate rider ID
    let validRiderId: string | null = null;
    let finalRiderName: string | null = null;
    let finalRiderPhone: string | null = null;
    if (isValidObjectId(riderId)) {
      const existingRider = await (prisma as any).rider?.findUnique({ where: { id: riderId } });
      if (existingRider) {
        validRiderId = existingRider.id;
        finalRiderName = existingRider.name;
        finalRiderPhone = existingRider.phone;
      }
    }

    // Validate table ID & name
    let validTableId: string | null = null;
    let finalTableNo: string | null = tableNo ? String(tableNo).trim() : null;

    if (isValidObjectId(tableId)) {
      const existingTable = await prisma.restaurantTable.findUnique({ where: { id: tableId } });
      if (existingTable) {
        validTableId = existingTable.id;
        finalTableNo = existingTable.name;
      }
    } else if (finalTableNo) {
      const existingTable = await prisma.restaurantTable.findFirst({
        where: {
          OR: [
            { name: { equals: finalTableNo, mode: 'insensitive' } },
            { number: Number(finalTableNo.replace(/\D/g, '')) || -1 },
          ],
        },
      });
      if (existingTable) {
        validTableId = existingTable.id;
        finalTableNo = existingTable.name;
      }
    }

    // Check if table already has an active unpaid tab (prevent duplicate active tabs)
    if (validTableId && (isPendingPayment || explicitPaymentStatus === 'UNPAID')) {
      const existingActiveOrder = await prisma.order.findFirst({
        where: {
          tableId: validTableId,
          paymentStatus: 'UNPAID',
          status: { notIn: ['CANCELLED', 'REFUNDED'] },
        },
      });

      if (existingActiveOrder) {
        return NextResponse.json(
          {
            error: `Table ${finalTableNo} already has an active open tab (${existingActiveOrder.invoiceNo}). Please reopen that table in POS to append items.`,
          },
          { status: 400 }
        );
      }
    }

    // Validate User ID
    let validUserId: string = session.userId;
    if (isValidObjectId(session.userId)) {
      const existingUser = await prisma.user.findUnique({ where: { id: session.userId } });
      if (!existingUser) {
        const fallbackUser = await prisma.user.findFirst();
        if (fallbackUser) validUserId = fallbackUser.id;
      }
    } else {
      const fallbackUser = await prisma.user.findFirst();
      if (fallbackUser) validUserId = fallbackUser.id;
    }

    // Base pizza product lookup
    const customPizzaProduct = await prisma.product.findFirst({ where: { isPizza: true } });

    // Valid IDs lookup
    const validProductIds = new Set((await prisma.product.findMany({ select: { id: true } })).map((p: { id: string }) => p.id));
    const validFlavorIds = new Set((await prisma.pizzaFlavor.findMany({ select: { id: true } })).map((f: { id: string }) => f.id));
    const validSizeIds = new Set((await prisma.pizzaSize.findMany({ select: { id: true } })).map((s: { id: string }) => s.id));
    const validCrustIds = new Set((await prisma.crust.findMany({ select: { id: true } })).map((c: { id: string }) => c.id));
    const validToppingIds = new Set((await prisma.topping.findMany({ select: { id: true } })).map((t: { id: string }) => t.id));

    // Calculate Totals server-side
    let calculatedSubtotal = 0;
    for (const item of items) {
      let itemTotal = Number(item.unitPrice || 0) * Number(item.quantity || 1);
      if (item.toppings && Array.isArray(item.toppings)) {
        const toppingsCost = item.toppings.reduce((sum: number, t: any) => sum + Number(t.price || 0), 0);
        itemTotal += toppingsCost * Number(item.quantity || 1);
      }
      calculatedSubtotal += itemTotal;
    }

    const discountAmount = discountType === 'PERCENTAGE'
      ? (calculatedSubtotal * (discount || 0)) / 100
      : (discount || 0);

    const afterDiscount = Math.max(0, calculatedSubtotal - discountAmount);
    const taxAmount = (afterDiscount * (tax || 0)) / 100;
    const finalDeliveryFee = orderType === 'DELIVERY' ? Number(deliveryFee || 0) : 0;
    const grandTotal = Math.round(afterDiscount + taxAmount + finalDeliveryFee);

    const isUnpaid = isPendingPayment || explicitPaymentStatus === 'UNPAID' || (amountPaid !== undefined && amountPaid < grandTotal);
    const finalPaymentStatus = isUnpaid ? 'UNPAID' : 'PAID';
    const orderStatus = isUnpaid ? 'PENDING' : 'COMPLETED';
    const finalAmountPaid = isUnpaid ? (amountPaid || 0) : (amountPaid ?? grandTotal);
    const change = isUnpaid ? 0 : Math.max(0, finalAmountPaid - grandTotal);

    const salesDay = await prisma.salesDay.upsert({
      where: { dateKey: getLocalDateKey() },
      create: { dateKey: getLocalDateKey() },
      update: {},
    });

    const orderData = {
      invoiceNo,
      customerId: validCustomerId,
      riderId: validRiderId,
      riderName: finalRiderName,
      riderPhone: finalRiderPhone,
      tableId: validTableId,
      tableNo: finalTableNo,
      userId: validUserId,
      salesDayId: salesDay.id,
      orderType: orderType || (validTableId ? 'DINE_IN' : 'TAKEAWAY'),
      status: orderStatus,
      paymentStatus: finalPaymentStatus,
      subtotal: calculatedSubtotal,
      discount: discountAmount,
      discountType: discountType || 'FIXED',
      tax: taxAmount,
      deliveryFee: finalDeliveryFee,
      grandTotal,
      paymentMethod: paymentMethod || 'CASH',
      amountPaid: finalAmountPaid,
      change,
      notes: notes || null,
      items: {
        create: items.map((item: any) => {
          let pId = item.productId && isValidObjectId(item.productId) && validProductIds.has(item.productId)
            ? item.productId
            : null;
          if (!pId && item.isPizza && customPizzaProduct) {
            pId = customPizzaProduct.id;
          }

          const fId = item.flavorId && isValidObjectId(item.flavorId) && validFlavorIds.has(item.flavorId)
            ? item.flavorId
            : null;
          const sId = item.sizeId && isValidObjectId(item.sizeId) && validSizeIds.has(item.sizeId)
            ? item.sizeId
            : null;
          const cId = item.crustId && isValidObjectId(item.crustId) && validCrustIds.has(item.crustId)
            ? item.crustId
            : null;

          const itemToppings = Array.isArray(item.toppings)
            ? item.toppings.map((t: any) => {
                const tId = t.toppingId && isValidObjectId(t.toppingId) && validToppingIds.has(t.toppingId)
                  ? t.toppingId
                  : null;
                return {
                  toppingId: tId,
                  toppingName: t.name || 'Extra Topping',
                  price: Number(t.price || 0),
                };
              })
            : [];

          return {
            productId: pId,
            flavorId: fId,
            sizeId: sId,
            crustId: cId,
            productName: item.productName || 'Menu Item',
            flavorName: item.flavorName || null,
            sizeName: item.sizeName || null,
            crustName: item.crustName || null,
            quantity: Number(item.quantity || 1),
            unitPrice: Number(item.unitPrice || 0),
            discount: Number(item.itemDiscount || 0),
            total: Number(item.totalPrice || 0),
            specialInstructions: item.specialInstructions || null,
            toppings: {
              create: itemToppings,
            },
          };
        }),
      },
    };

    let newOrder;
    try {
      newOrder = await prisma.$transaction(async (tx: any) => {
        const ord = await tx.order.create({
          data: orderData,
          include: {
            table: true,
            rider: true,
            customer: true,
            items: {
              include: {
                toppings: true,
              },
            },
          },
        });

        // If Dine-In table was assigned, update table status
        if (validTableId) {
          await tx.restaurantTable.update({
            where: { id: validTableId },
            data: { status: isUnpaid ? 'OCCUPIED' : 'AVAILABLE' },
          });
        }

        return ord;
      });
    } catch {
      newOrder = await (prisma.order as any).create({
        data: orderData,
        include: {
          table: true,
          rider: true,
          customer: true,
          items: {
            include: {
              toppings: true,
            },
          },
        },
      });

      if (validTableId) {
        try {
          await prisma.restaurantTable.update({
            where: { id: validTableId },
            data: { status: isUnpaid ? 'OCCUPIED' : 'AVAILABLE' },
          });
        } catch {}
      }
    }

    // Auto decrement stock for products
    for (const item of items) {
      if (item.productId && isValidObjectId(item.productId) && validProductIds.has(item.productId)) {
        try {
          await prisma.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: Number(item.quantity || 1) } },
          });
        } catch {}
      }
    }

    // Create Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          userId: validUserId,
          userName: session.name || 'Staff User',
          action: 'CREATE_ORDER',
          details: `Created order ${invoiceNo} (${orderData.orderType}) for Rs. ${grandTotal} (${finalPaymentStatus})`,
        },
      });
    } catch {}

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to create order' }, { status: 500 });
  }
}
