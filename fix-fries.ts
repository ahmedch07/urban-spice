import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixFriesImage() {
  const updated = await prisma.product.updateMany({
    where: {
      name: { contains: 'Fries' },
    },
    data: {
      image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=500&q=80',
    },
  });

  console.log(`Updated ${updated.count} fries products image URL.`);
}

fixFriesImage()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
