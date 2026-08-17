import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    const whereClause: any = {};
    if (query) {
      whereClause.OR = [
        { name: { contains: query } },
        { phone: { contains: query } },
        { email: { contains: query } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where: whereClause,
      include: {
        _count: { select: { orders: true } },
        orders: {
          select: { grandTotal: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });

    const formatted = customers.map((c) => {
      const totalSpent = c.orders.reduce((sum, o) => sum + o.grandTotal, 0);
      const lastOrder = c.orders[0]?.createdAt || null;
      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        whatsapp: c.whatsapp,
        email: c.email,
        address: c.address,
        city: c.city,
        notes: c.notes,
        totalOrders: c._count.orders,
        totalSpent,
        lastOrder,
      };
    });

    return NextResponse.json({ customers: formatted });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to search customers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, whatsapp, email, address, city, notes } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Customer name and phone number are required' },
        { status: 400 }
      );
    }

    const existing = await prisma.customer.findUnique({
      where: { phone: phone.trim() },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Customer with this phone number already exists', customer: existing },
        { status: 409 }
      );
    }

    const newCustomer = await prisma.customer.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp ? whatsapp.trim() : null,
        email: email ? email.trim() : null,
        address: address ? address.trim() : null,
        city: city ? city.trim() : 'Lahore',
        notes: notes ? notes.trim() : null,
      },
    });

    return NextResponse.json({ success: true, customer: newCustomer });
  } catch (error) {
    console.error('Customer create error:', error);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}
