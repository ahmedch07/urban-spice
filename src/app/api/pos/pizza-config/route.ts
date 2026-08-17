import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [flavors, sizes, crusts, toppings] = await Promise.all([
      prisma.pizzaFlavor.findMany({
        where: { active: true },
        include: {
          flavorPrices: {
            select: {
              sizeId: true,
              price: true,
            },
          },
        },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.pizzaSize.findMany({
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.crust.findMany({
        where: { active: true },
        orderBy: { name: 'asc' },
      }),
      prisma.topping.findMany({
        where: { active: true },
        orderBy: { name: 'asc' },
      }),
    ]);

    return NextResponse.json({
      flavors,
      sizes,
      crusts,
      toppings,
    });
  } catch (error) {
    console.error('Pizza config error:', error);
    return NextResponse.json({ error: 'Failed to fetch pizza configuration' }, { status: 500 });
  }
}
