import { PrismaClient } from '@prisma/client';

// MongoDB does not materialize Prisma defaults on documents that already exist.
// Mark historical records explicitly so POS/ONLINE filters include them.
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$runCommandRaw({
    update: 'Order',
    updates: [{ q: { source: { $exists: false } }, u: { $set: { source: 'POS' } }, multi: true }],
  });
  console.log('Order-source backfill complete:', result);
}

main().finally(() => prisma.$disconnect());
