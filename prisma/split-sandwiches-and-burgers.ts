import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const sandwiches = await prisma.category.upsert({
    where: { slug: 'sandwiches' },
    update: { name: 'Sandwiches', sortOrder: 6, active: true },
    create: { name: 'Sandwiches', slug: 'sandwiches', sortOrder: 6 },
  });
  const burgers = await prisma.category.upsert({
    where: { slug: 'burgers' },
    update: { name: 'Burgers', sortOrder: 7, active: true },
    create: { name: 'Burgers', slug: 'burgers', sortOrder: 7 },
  });
  const sandwichResult = await prisma.product.updateMany({
    where: { SKU: { startsWith: 'SAND-' } },
    data: { categoryId: sandwiches.id },
  });
  const burgerResult = await prisma.product.updateMany({
    where: { SKU: { startsWith: 'BURG-' } },
    data: { categoryId: burgers.id },
  });
  const oldCategory = await prisma.category.findUnique({
    where: { slug: 'sandwiches-burgers' },
    include: { _count: { select: { products: true } } },
  });
  if (oldCategory && oldCategory._count.products === 0) {
    await prisma.category.delete({ where: { id: oldCategory.id } });
  }
  console.log(`Moved ${sandwichResult.count} sandwiches and ${burgerResult.count} burgers into separate categories.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
