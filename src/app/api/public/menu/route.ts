import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Deliberately limited public projection; management data stays behind staff APIs.
export async function GET() {
  try {
    const [categories, products, flavors, sizes, crusts, toppings, settings] = await Promise.all([
      prisma.category.findMany({ where: { active: true }, orderBy: { sortOrder: 'asc' } }),
      prisma.product.findMany({ where: { active: true, stock: { gt: 0 }, category: { active: true } }, include: { category: { select: { id: true, name: true, slug: true } } }, orderBy: { name: 'asc' } }),
      prisma.pizzaFlavor.findMany({ where: { active: true }, include: { flavorPrices: { select: { sizeId: true, price: true } } }, orderBy: { sortOrder: 'asc' } }),
      prisma.pizzaSize.findMany({ orderBy: { sortOrder: 'asc' } }),
      prisma.crust.findMany({ where: { active: true }, orderBy: { name: 'asc' } }),
      prisma.topping.findMany({ where: { active: true, stock: { gt: 0 } }, orderBy: { name: 'asc' } }),
      prisma.storeSetting.findMany({ where: { key: { in: ['storeName', 'storeLogo', 'defaultDeliveryFee', 'storePhone'] } } }),
    ]);
    return NextResponse.json({ categories, products, flavors, sizes, crusts, toppings, settings: Object.fromEntries(settings.map((s) => [s.key, s.value])) });
  } catch (error) {
    console.error('Public menu error:', error);
    return NextResponse.json({ error: 'Unable to load menu' }, { status: 500 });
  }
}
