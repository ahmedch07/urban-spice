import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { isValidObjectId } from '@/lib/utils';

const db: any = prisma;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    const whereClause: any = {};
    if (!all) {
      whereClause.active = true;
    }

    const riders = await db.rider.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ riders });
  } catch (error) {
    console.error('Fetch riders error:', error);
    return NextResponse.json({ error: 'Failed to fetch delivery riders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { name, phone, vehicleNo } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
    }

    const existingRider = await db.rider.findUnique({
      where: { phone: phone.trim() },
    });

    if (existingRider) {
      return NextResponse.json({ error: 'A rider with this phone number already exists' }, { status: 400 });
    }

    const rider = await db.rider.create({
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
    return NextResponse.json({ error: error?.message || 'Failed to create delivery rider' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, phone, vehicleNo, active } = body;

    if (!id || !isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid rider ID' }, { status: 400 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone.trim();
    if (vehicleNo !== undefined) updateData.vehicleNo = vehicleNo ? vehicleNo.trim() : null;
    if (active !== undefined) updateData.active = Boolean(active);

    const rider = await db.rider.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, rider });
  } catch (error: any) {
    console.error('Update rider error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update delivery rider' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only Admin can delete delivery riders' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || !isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid rider ID' }, { status: 400 });
    }

    await db.rider.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Delivery rider deleted successfully' });
  } catch (error: any) {
    console.error('Delete rider error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to delete delivery rider' }, { status: 500 });
  }
}
