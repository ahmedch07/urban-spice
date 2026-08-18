import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

function getDatabaseUrl(): string {
  if (process.env.VERCEL) {
    try {
      const tmpDbPath = '/tmp/dev.db';
      if (!fs.existsSync(/*turbopackIgnore: true*/ tmpDbPath)) {
        const candidates = [
          path.join(process.cwd(), 'prisma', 'dev.db'),
          path.join(process.cwd(), 'dev.db'),
        ];
        for (const candidate of candidates) {
          if (fs.existsSync(/*turbopackIgnore: true*/ candidate)) {
            fs.copyFileSync(candidate, tmpDbPath);
            break;
          }
        }
      }
      if (fs.existsSync(/*turbopackIgnore: true*/ tmpDbPath)) {
        return 'file:/tmp/dev.db';
      }
    } catch (e) {
      console.error('Failed to copy SQLite database to /tmp on Vercel:', e);
    }
  }

  const envUrl = process.env.DATABASE_URL;
  if (envUrl) {
    return envUrl;
  }

  const defaultDbPath = path.join(process.cwd(), 'prisma', 'dev.db');
  if (fs.existsSync(/*turbopackIgnore: true*/ defaultDbPath)) {
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
