import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { findActiveSalesDay } from '@/lib/sales-day';

function getDateRange(period: string, now = new Date()) {
  const startDate = new Date(now);
  startDate.setHours(0, 0, 0, 0);

  if (period === 'today') return startDate;
  if (period === 'week') {
    startDate.setDate(startDate.getDate() - startDate.getDay());
    return startDate;
  }
  if (period === 'year') {
    startDate.setMonth(0, 1);
    return startDate;
  }

  startDate.setDate(1);
  return startDate;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month'; // today, week, month, year

    const startDate = getDateRange(period);
    const activeSalesDay = period === 'today' ? await findActiveSalesDay() : null;
    const orderWhere: any = {
      paymentStatus: 'PAID',
      status: { notIn: ['CANCELLED', 'REFUNDED'] },
    };

    // “Today” means the manually-opened sales day—not midnight to midnight.
    if (period === 'today') {
      orderWhere.salesDayId = activeSalesDay?.id || '__no-open-sales-day__';
    } else {
      orderWhere.createdAt = { gte: startDate };
    }

    // 1. Total Orders & Sales (Only settled & paid orders)
    const orders = await prisma.order.findMany({
      where: orderWhere,
      include: {
        table: true,
        customer: { select: { name: true, phone: true } },
        items: {
          include: {
            product: { select: { costPrice: true } },
            toppings: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const totalOrders = orders.length;
    const totalSales = orders.reduce((sum, o) => sum + o.grandTotal, 0);
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Calculate Estimated Cost & Profit
    let estimatedCost = 0;
    for (const order of orders) {
      for (const item of order.items) {
        const itemCost = (item.product?.costPrice || item.unitPrice * 0.4) * item.quantity;
        estimatedCost += itemCost;
      }
    }
    const estimatedProfit = Math.max(0, totalSales - estimatedCost);

    // 2. Sales Trend Breakdown (Daily aggregation)
    const salesByDayMap: Record<string, { date: string; sales: number; orders: number }> = {};
    for (const order of orders) {
      const dayKey = order.createdAt.toISOString().split('T')[0];
      if (!salesByDayMap[dayKey]) {
        salesByDayMap[dayKey] = { date: dayKey, sales: 0, orders: 0 };
      }
      salesByDayMap[dayKey].sales += order.grandTotal;
      salesByDayMap[dayKey].orders += 1;
    }
    const salesTrend = Object.values(salesByDayMap);

    // 3. Payment Method Distribution
    const paymentMap: Record<string, number> = { CASH: 0, CARD: 0, BANK: 0, ONLINE: 0 };
    for (const order of orders) {
      paymentMap[order.paymentMethod] = (paymentMap[order.paymentMethod] || 0) + order.grandTotal;
    }
    const paymentDistribution = Object.entries(paymentMap).map(([method, amount]) => ({
      method,
      amount,
    }));

    // 4. Best Selling Products
    const productSalesMap: Record<string, { name: string; quantity: number; total: number }> = {};
    for (const order of orders) {
      for (const item of order.items) {
        const name = item.productName;
        if (!productSalesMap[name]) {
          productSalesMap[name] = { name, quantity: 0, total: 0 };
        }
        productSalesMap[name].quantity += item.quantity;
        productSalesMap[name].total += item.total;
      }
    }
    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // 5. Total Customers count
    const totalCustomers = await prisma.customer.count();

    // 6. Low stock products
    const lowStockProducts = await prisma.product.findMany({
      where: {
        active: true,
        stock: { lte: prisma.product.fields.minStock },
      },
      select: { id: true, name: true, stock: true, minStock: true, SKU: true },
    });

    return NextResponse.json({
      metrics: {
        totalSales,
        totalRevenue: totalSales,
        totalOrders,
        averageOrderValue,
        estimatedProfit,
        totalCustomers,
        lowStockCount: lowStockProducts.length,
      },
      salesTrend,
      paymentDistribution,
      topProducts,
      lowStockProducts,
      activeSalesDay: activeSalesDay
        ? { id: activeSalesDay.id, dateKey: activeSalesDay.dateKey, openedAt: activeSalesDay.openedAt || activeSalesDay.createdAt }
        : null,
      salesOrders: orders.map((order) => ({
        id: order.id,
        invoiceNo: order.invoiceNo,
        createdAt: order.createdAt,
        status: order.status,
        paymentStatus: order.paymentStatus,
        orderType: order.orderType,
        tableNo: order.tableNo,
        table: order.table,
        paymentMethod: order.paymentMethod,
        grandTotal: order.grandTotal,
        customer: order.customer,
        items: order.items,
      })),
    });
  } catch (error) {
    console.error('Reports API error:', error);
    return NextResponse.json({ error: 'Failed to generate reports' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const session = await getCurrentUser();
    if (!session || !['ADMIN', 'MANAGER'].includes(session.role)) {
      return NextResponse.json({ error: 'Only Admin or Manager can close a sales day' }, { status: 403 });
    }

    const activeSalesDay = await findActiveSalesDay();
    if (!activeSalesDay) {
      return NextResponse.json({ error: 'There is no open sales day to close.' }, { status: 400 });
    }

    const salesDay = await prisma.salesDay.update({
      where: { id: activeSalesDay.id },
      data: { status: 'CLOSED', closedAt: new Date() },
    });

    return NextResponse.json({ success: true, salesDay, message: 'Sales day closed. The next order will start a new sales day.' });
  } catch (error) {
    console.error('Close sales day error:', error);
    return NextResponse.json({ error: 'Failed to close sales day' }, { status: 500 });
  }
}
