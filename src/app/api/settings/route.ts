import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const settingsList = await prisma.storeSetting.findMany();
    const settingsMap: Record<string, string> = {};
    for (const item of settingsList) {
      settingsMap[item.key] = item.value;
    }
    return NextResponse.json({ settings: settingsMap });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json(); // Record<string, string>

    for (const [key, value] of Object.entries(body)) {
      await prisma.storeSetting.upsert({
        where: { key },
        create: { key, value: String(value) },
        update: { value: String(value) },
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.name,
        action: 'UPDATE_STORE_SETTINGS',
        details: `Updated store operational settings and tax/currency parameters.`,
      },
    });

    return NextResponse.json({ success: true, message: 'Settings saved successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
