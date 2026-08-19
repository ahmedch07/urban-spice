import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';
    const riders = await prisma.rider.findMany({
      where: all ? undefined : { active: true },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ riders }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Fetch riders error:', error);
    return NextResponse.json({ error: 'Failed to fetch riders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, phone, vehicleNo } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: 'Rider name and phone are required' }, { status: 400 });
    }

    const existingPhone = await prisma.rider.findUnique({ where: { phone: phone.trim() } });
    if (existingPhone) {
      return NextResponse.json({ error: 'A rider with this phone number already exists' }, { status: 400 });
    }

    const rider = await prisma.rider.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        vehicleNo: vehicleNo ? vehicleNo.trim() : null,
        active: true,
      },
    });

    return NextResponse.json({ success: true, rider });
  } catch (error: any) {
    console.error('Create rider error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to create rider' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, phone, vehicleNo, active } = body;

    if (!id) {
      return NextResponse.json({ error: 'Rider ID required' }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (transaction) => {
      const rider = await transaction.rider.update({
        where: { id },
        data: {
          name: name !== undefined ? name.trim() : undefined,
          phone: phone !== undefined ? phone.trim() : undefined,
          vehicleNo: vehicleNo !== undefined ? vehicleNo.trim() : undefined,
          active: active !== undefined ? Boolean(active) : undefined,
        },
      });

      await transaction.order.updateMany({
        where: { riderId: id },
        data: { riderName: rider.name, riderPhone: rider.phone },
      });

      return rider;
    });

    return NextResponse.json({ success: true, rider: updated });
  } catch (error: any) {
    console.error('Update rider error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update rider' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Rider ID required' }, { status: 400 });
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.order.updateMany({
        where: { riderId: id },
        data: { riderId: null, riderName: null, riderPhone: null },
      });
      await transaction.rider.delete({ where: { id } });
    });

    return NextResponse.json({ success: true, message: 'Rider deleted' });
  } catch (error: any) {
    console.error('Delete rider error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to delete rider' }, { status: 500 });
  }
}
