import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month'; // today, week, month, year

    const now = new Date();
    let startDate = new Date();

    if (period === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === 'week') {
      startDate = new Date(now.setDate(now.getDate() - 7));
    } else if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    // 1. Total Orders & Sales
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { notIn: ['CANCELLED', 'REFUNDED'] },
      },
      include: {
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
    });
  } catch (error) {
    console.error('Reports API error:', error);
    return NextResponse.json({ error: 'Failed to generate reports' }, { status: 500 });
  }
}
