import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

function getDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;

  // If external non-sqlite DATABASE_URL is set (e.g. Postgres / Supabase)
  if (envUrl && !envUrl.startsWith('file:')) {
    return envUrl;
  }

  if (process.env.VERCEL) {
    try {
      const tmpDbPath = '/tmp/dev.db';

      if (!fs.existsSync(tmpDbPath)) {
        const candidate1 = path.join(process.cwd(), 'prisma', 'dev.db');
        const candidate2 = path.join(process.cwd(), 'dev.db');
        const srcPath = fs.existsSync(candidate1) ? candidate1 : (fs.existsSync(candidate2) ? candidate2 : null);

        if (srcPath) {
          try {
            fs.copyFileSync(srcPath, tmpDbPath);
          } catch (copyErr) {
            // Ignore race condition if another worker copied it simultaneously
          }
        }
      }

      if (fs.existsSync(tmpDbPath)) {
        return 'file:/tmp/dev.db';
      }
    } catch (e) {
      console.error('SQLite Vercel setup notice:', e);
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
