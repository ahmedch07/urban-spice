import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function upsertCategory(name: string, slug: string, sortOrder: number) {
  return prisma.category.upsert({
    where: { slug },
    update: { name, sortOrder, active: true },
    create: { name, slug, sortOrder },
  });
}

async function main() {
  const [wings, nuggets, fries] = await Promise.all([
    upsertCategory('Wings', 'wings', 8),
    upsertCategory('Nuggets', 'nuggets', 9),
    upsertCategory('Fries', 'fries', 10),
  ]);

  const [wingsResult, nuggetsResult, friesResult, simpleFries] = await Promise.all([
    prisma.product.updateMany({ where: { SKU: { startsWith: 'WING-' } }, data: { categoryId: wings.id } }),
    prisma.product.updateMany({ where: { SKU: { startsWith: 'NUGG-' } }, data: { categoryId: nuggets.id } }),
    prisma.product.updateMany({
      where: { SKU: { startsWith: 'FRIE-' } },
      data: { categoryId: fries.id },
    }),
    prisma.product.upsert({
      where: { SKU: 'FRIE-001' },
      update: { name: 'Simple Fries', basePrice: 300, categoryId: fries.id, isPizza: false, active: true },
      create: { name: 'Simple Fries', SKU: 'FRIE-001', basePrice: 300, categoryId: fries.id, isPizza: false },
    }),
  ]);

  const oldCategory = await prisma.category.findUnique({
    where: { slug: 'appetizers' },
    include: { _count: { select: { products: true } } },
  });
  if (oldCategory && oldCategory._count.products === 0) {
    await prisma.category.delete({ where: { id: oldCategory.id } });
  }

  console.log(`Moved ${wingsResult.count} wings, ${nuggetsResult.count} nuggets, and ${friesResult.count} fries. Restored Simple Fries and removed Mayo Fries.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
