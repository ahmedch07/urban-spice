import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

function getDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;

  if (process.env.VERCEL) {
    try {
      const tmpDbPath = '/tmp/dev.db';
      const candidate1 = path.join(process.cwd(), 'prisma', 'dev.db');
      const candidate2 = path.join(process.cwd(), 'dev.db');

      if (fs.existsSync(candidate1)) {
        fs.copyFileSync(candidate1, tmpDbPath);
        return 'file:/tmp/dev.db';
      } else if (fs.existsSync(candidate2)) {
        fs.copyFileSync(candidate2, tmpDbPath);
        return 'file:/tmp/dev.db';
      }

      if (fs.existsSync(tmpDbPath)) {
        return 'file:/tmp/dev.db';
      }
    } catch (e) {
      console.error('Failed to copy SQLite database to /tmp:', e);
    }
  }

  if (envUrl) {
    return envUrl;
  }

  const defaultDbPath = path.join(process.cwd(), 'prisma', 'dev.db');
  if (fs.existsSync(defaultDbPath)) {
    return `file:${defaultDbPath}`;
  }

  return 'file:./prisma/dev.db';
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const dbUrl = getDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: dbUrl ? { db: { url: dbUrl } } : undefined,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
