import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, SKU, categoryId, basePrice, costPrice, stock, minStock, description, image, isPizza } = body;

    if (!name || !SKU || !categoryId || basePrice === undefined) {
      return NextResponse.json({ error: 'Name, SKU, category, and base price are required' }, { status: 400 });
    }

    const existingSKU = await prisma.product.findUnique({ where: { SKU: SKU.trim() } });
    if (existingSKU) {
      return NextResponse.json({ error: 'SKU already exists' }, { status: 400 });
    }

    const newProduct = await prisma.product.create({
      data: {
        name: name.trim(),
        SKU: SKU.trim(),
        categoryId,
        basePrice: parseFloat(basePrice),
        costPrice: parseFloat(costPrice || 0),
        stock: parseInt(stock || 100),
        minStock: parseInt(minStock || 10),
        description: description ? description.trim() : null,
        image: image ? image.trim() : null,
        isPizza: Boolean(isPizza),
      },
      include: { category: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.name,
        action: 'CREATE_PRODUCT',
        details: `Created product ${newProduct.name} (${newProduct.SKU})`,
      },
    });

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    console.error('Product create error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, SKU, categoryId, basePrice, costPrice, stock, minStock, description, image, active } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: name?.trim(),
        SKU: SKU?.trim(),
        categoryId,
        basePrice: basePrice !== undefined ? parseFloat(basePrice) : undefined,
        costPrice: costPrice !== undefined ? parseFloat(costPrice) : undefined,
        stock: stock !== undefined ? parseInt(stock) : undefined,
        minStock: minStock !== undefined ? parseInt(minStock) : undefined,
        description: description !== undefined ? description?.trim() : undefined,
        image: image !== undefined ? image?.trim() : undefined,
        active: active !== undefined ? Boolean(active) : undefined,
      },
      include: { category: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.name,
        action: 'UPDATE_PRODUCT',
        details: `Updated product ${updated.name} (${updated.SKU})`,
      },
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
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
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const deleted = await prisma.product.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.name,
        action: 'DELETE_PRODUCT',
        details: `Deleted product ${deleted.name} (${deleted.SKU})`,
      },
    });

    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
