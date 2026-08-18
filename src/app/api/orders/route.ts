import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { generateInvoiceNumber } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get('range') || 'today';
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const whereClause: any = {};

    // Date range filter
    const now = new Date();
    if (dateRange === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      whereClause.createdAt = { gte: startOfDay };
    } else if (dateRange === 'yesterday') {
      const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      whereClause.createdAt = { gte: startOfYesterday, lt: endOfYesterday };
    } else if (dateRange === 'week') {
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      startOfWeek.setHours(0, 0, 0, 0);
      whereClause.createdAt = { gte: startOfWeek };
    } else if (dateRange === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      whereClause.createdAt = { gte: startOfMonth };
    }

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { invoiceNo: { contains: search } },
        { customer: { name: { contains: search } } },
        { customer: { phone: { contains: search } } },
        { user: { name: { contains: search } } },
      ];
    }

    const totalCount = await prisma.order.count({ where: whereClause });
    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
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
      orderType,
      tableNo,
      items,
      discount,
      discountType,
      tax,
      deliveryFee,
      paymentMethod,
      amountPaid,
      notes,
      isPendingPayment,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart cannot be empty' }, { status: 400 });
    }

    // Get Invoice prefix and settings
    const prefixSetting = await prisma.storeSetting.findUnique({ where: { key: 'invoicePrefix' } });
    const prefix = prefixSetting?.value || 'INV-2026';

    const orderCount = await prisma.order.count();
    const invoiceNo = generateInvoiceNumber(prefix, orderCount + 1);

    // Validate customer ID if provided
    let validCustomerId = null;
    if (customerId) {
      const existingCustomer = await prisma.customer.findUnique({ where: { id: customerId } });
      if (existingCustomer) validCustomerId = customerId;
    }

    // Validate User ID in DB to prevent foreign key errors if session token is stale
    let validUserId = session.userId;
    const existingUser = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!existingUser) {
      const fallbackUser = await prisma.user.findFirst();
      if (fallbackUser) {
        validUserId = fallbackUser.id;
      }
    }

    // Lookup base custom pizza product ID if needed
    const customPizzaProduct = await prisma.product.findFirst({ where: { isPizza: true } });

    // Pre-fetch DB valid IDs to prevent foreign key errors
    const validProductIds = new Set((await prisma.product.findMany({ select: { id: true } })).map((p) => p.id));
    const validFlavorIds = new Set((await prisma.pizzaFlavor.findMany({ select: { id: true } })).map((f) => f.id));
    const validSizeIds = new Set((await prisma.pizzaSize.findMany({ select: { id: true } })).map((s) => s.id));
    const validCrustIds = new Set((await prisma.crust.findMany({ select: { id: true } })).map((c) => c.id));
    const validToppingIds = new Set((await prisma.topping.findMany({ select: { id: true } })).map((t) => t.id));

    // Calculate Totals server-side
    let calculatedSubtotal = 0;
    for (const item of items) {
      let itemTotal = item.unitPrice * item.quantity;
      if (item.toppings && Array.isArray(item.toppings)) {
        const toppingsCost = item.toppings.reduce((sum: number, t: any) => sum + (t.price || 0), 0);
        itemTotal += toppingsCost * item.quantity;
      }
      calculatedSubtotal += itemTotal;
    }

    const discountAmount = discountType === 'PERCENTAGE'
      ? (calculatedSubtotal * (discount || 0)) / 100
      : (discount || 0);

    const afterDiscount = Math.max(0, calculatedSubtotal - discountAmount);
    const taxAmount = (afterDiscount * (tax || 0)) / 100;
    const grandTotal = Math.round(afterDiscount + taxAmount + (deliveryFee || 0));
    const change = Math.max(0, (amountPaid || 0) - grandTotal);

    const orderStatus = isPendingPayment ? 'PENDING' : 'COMPLETED';
    const finalAmountPaid = isPendingPayment ? (amountPaid || 0) : amountPaid;

    if (!isPendingPayment && finalAmountPaid < grandTotal) {
      return NextResponse.json(
        { error: `Payment amount (${finalAmountPaid}) is less than total amount (${grandTotal})` },
        { status: 400 }
      );
    }

    // Execute Relational Transaction
    const newOrder = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          invoiceNo,
          customerId: validCustomerId,
          userId: validUserId,
          orderType: orderType || 'DINE_IN',
          tableNo: tableNo || null,
          status: orderStatus,
          subtotal: calculatedSubtotal,
          discount: discountAmount,
          discountType: discountType || 'FIXED',
          tax: taxAmount,
          deliveryFee: deliveryFee || 0,
          grandTotal,
          paymentMethod: paymentMethod || 'CASH',
          amountPaid: finalAmountPaid,
          change: isPendingPayment ? 0 : change,
          notes: notes || null,
          items: {
            create: items.map((item: any) => {
              // Resolve safe Product ID
              let pId = item.productId && validProductIds.has(item.productId) ? item.productId : null;
              if (!pId && item.isPizza && customPizzaProduct) {
                pId = customPizzaProduct.id;
              }

              const fId = item.flavorId && validFlavorIds.has(item.flavorId) ? item.flavorId : null;
              const sId = item.sizeId && validSizeIds.has(item.sizeId) ? item.sizeId : null;
              const cId = item.crustId && validCrustIds.has(item.crustId) ? item.crustId : null;

              return {
                productId: pId,
                flavorId: fId,
                sizeId: sId,
                crustId: cId,
                productName: item.productName,
                flavorName: item.flavorName || null,
                sizeName: item.sizeName || null,
                crustName: item.crustName || null,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                discount: item.itemDiscount || 0,
                total: item.totalPrice,
                specialInstructions: item.specialInstructions || null,
                toppings: {
                  create: (item.toppings || []).map((t: any) => ({
                    toppingId: t.toppingId && validToppingIds.has(t.toppingId) ? t.toppingId : null,
                    toppingName: t.name || t.toppingName,
                    price: t.price,
                  })),
                },
              };
            }),
          },
        },
        include: {
          customer: true,
          user: { select: { name: true, email: true } },
          items: {
            include: { toppings: true },
          },
        },
      });

      // Deduct stock for non-pizza products
      for (const item of items) {
        if (item.productId && !item.isPizza && validProductIds.has(item.productId)) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      // Log Audit (Safely)
      try {
        await tx.auditLog.create({
          data: {
            userId: validUserId,
            userName: session.name || 'Staff',
            action: 'CREATE_ORDER',
            details: `Created Order ${createdOrder.invoiceNo} for ${grandTotal} PKR via ${paymentMethod}`,
          },
        });
      } catch (auditErr) {
        console.warn('Audit log write skipped:', auditErr);
      }

      return createdOrder;
    });

    return NextResponse.json({ success: true, order: newOrder });
  } catch (error: any) {
    console.error('Create order error details:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
