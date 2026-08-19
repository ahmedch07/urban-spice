import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

async function createSafeAuditLog(userId: string | undefined, userName: string | undefined, action: string, details: string) {
  try {
    const userExists = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
    await prisma.auditLog.create({
      data: {
        userId: userExists ? userId : null,
        userName: userName || 'Admin',
        action,
        details,
      },
    });
  } catch (err) {
    console.warn('Audit log skipped:', err);
  }
}

export async function GET() {
  try {
    const flavors = await prisma.pizzaFlavor.findMany({
      include: {
        flavorPrices: {
          include: { size: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({ flavors });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch flavors' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, image, prices } = body;

    if (!name) {
      return NextResponse.json({ error: 'Flavor name is required' }, { status: 400 });
    }

    const newFlavor = await prisma.pizzaFlavor.create({
      data: {
        name: name.trim(),
        description: description ? description.trim() : null,
        image: image ? image.trim() : null,
      },
    });

    if (prices && Array.isArray(prices)) {
      for (const p of prices) {
        if (p.sizeId && p.price !== undefined) {
          await prisma.pizzaFlavorPrice.create({
            data: {
              flavorId: newFlavor.id,
              sizeId: p.sizeId,
              price: parseFloat(p.price),
            },
          });
        }
      }
    }

    await createSafeAuditLog(
      session.userId,
      session.name,
      'CREATE_PIZZA_FLAVOR',
      `Created pizza flavor ${newFlavor.name}`
    );

    return NextResponse.json({ success: true, flavor: newFlavor });
  } catch (error: any) {
    console.error('Flavor create error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to create pizza flavor' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, description, image, active, prices } = body;

    if (!id) {
      return NextResponse.json({ error: 'Flavor ID required' }, { status: 400 });
    }

    const updated = await prisma.pizzaFlavor.update({
      where: { id },
      data: {
        name: name?.trim(),
        description: description !== undefined ? description?.trim() : undefined,
        image: image !== undefined ? image?.trim() : undefined,
        active: active !== undefined ? Boolean(active) : undefined,
      },
    });

    if (prices && Array.isArray(prices)) {
      for (const p of prices) {
        if (p.sizeId && p.price !== undefined) {
          await prisma.pizzaFlavorPrice.upsert({
            where: {
              flavorId_sizeId: {
                flavorId: id,
                sizeId: p.sizeId,
              },
            },
            create: {
              flavorId: id,
              sizeId: p.sizeId,
              price: parseFloat(p.price),
            },
            update: {
              price: parseFloat(p.price),
            },
          });
        }
      }
    }

    await createSafeAuditLog(
      session.userId,
      session.name,
      'UPDATE_PIZZA_FLAVOR',
      `Updated pizza flavor ${updated.name}`
    );

    return NextResponse.json({ success: true, flavor: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update pizza flavor' }, { status: 500 });
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

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const deleted = await prisma.pizzaFlavor.delete({ where: { id } });

    await createSafeAuditLog(
      session.userId,
      session.name,
      'DELETE_PIZZA_FLAVOR',
      `Deleted pizza flavor ${deleted.name}`
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to delete pizza flavor' }, { status: 500 });
  }
}
