import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

function getDatabaseUrl(): string | undefined {
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    try {
      const tmpDbPath = '/tmp/dev.db';
      if (!fs.existsSync(tmpDbPath)) {
        const sourceDbPath = path.join(process.cwd(), 'prisma', 'dev.db');
        if (fs.existsSync(sourceDbPath)) {
          fs.copyFileSync(sourceDbPath, tmpDbPath);
        }
      }
      if (fs.existsSync(tmpDbPath)) {
        return 'file:/tmp/dev.db';
      }
    } catch (e) {
      console.error('Failed to copy SQLite database to /tmp:', e);
    }
  }
  return process.env.DATABASE_URL;
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

