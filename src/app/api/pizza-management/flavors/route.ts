import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

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
    const { name, description, image, prices } = body; // prices = [{ sizeId: '...', price: 1000 }]

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

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.name,
        action: 'CREATE_PIZZA_FLAVOR',
        details: `Created pizza flavor ${newFlavor.name}`,
      },
    });

    return NextResponse.json({ success: true, flavor: newFlavor });
  } catch (error) {
    console.error('Flavor create error:', error);
    return NextResponse.json({ error: 'Failed to create pizza flavor' }, { status: 500 });
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

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.name,
        action: 'UPDATE_PIZZA_FLAVOR',
        details: `Updated pizza flavor ${updated.name}`,
      },
    });

    return NextResponse.json({ success: true, flavor: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update pizza flavor' }, { status: 500 });
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

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.name,
        action: 'DELETE_PIZZA_FLAVOR',
        details: `Deleted pizza flavor ${deleted.name}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete pizza flavor' }, { status: 500 });
  }
}
