import { prisma } from '@/lib/prisma';
import { getLocalDateKey } from '@/lib/utils';

/** Returns the manually-opened sales day, without opening a new one. */
export async function findActiveSalesDay() {
  return prisma.salesDay.findFirst({
    where: { status: 'OPEN' },
    orderBy: { createdAt: 'desc' },
  });
}

/** Opens a new sales day only when an order is placed after Close Day. */
export async function getOrCreateActiveSalesDay() {
  const activeSalesDay = await findActiveSalesDay();
  if (activeSalesDay) return activeSalesDay;

  return prisma.salesDay.create({
    data: { dateKey: getLocalDateKey(), status: 'OPEN', openedAt: new Date() },
  });
}
