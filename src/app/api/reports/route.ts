import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

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

    // 1. Total Orders & Sales
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { notIn: ['CANCELLED', 'REFUNDED'] },
      },
      include: {
        customer: { select: { name: true, phone: true } },
        items: {
          include: {
            product: { select: { costPrice: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const totalOrders = orders.length;
    const totalSales = orders.reduce((sum, o) => sum + o.grandTotal, 0);

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
        totalOrders,
        estimatedProfit,
        totalCustomers,
        lowStockCount: lowStockProducts.length,
      },
      salesTrend,
      paymentDistribution,
      topProducts,
      lowStockProducts,
      salesOrders: orders.map((order) => ({
        id: order.id,
        invoiceNo: order.invoiceNo,
        createdAt: order.createdAt,
        status: order.status,
        orderType: order.orderType,
        paymentMethod: order.paymentMethod,
        grandTotal: order.grandTotal,
        customer: order.customer,
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
      return NextResponse.json({ error: 'Only Admin or Manager can start a sales day' }, { status: 403 });
    }

    const salesDay = await prisma.salesDay.upsert({
      where: { dateKey: getLocalDateKey() },
      create: { dateKey: getLocalDateKey() },
      update: {},
    });

    return NextResponse.json({ success: true, salesDay });
  } catch (error) {
    console.error('Start sales day error:', error);
    return NextResponse.json({ error: 'Failed to start sales day' }, { status: 500 });
  }
}
