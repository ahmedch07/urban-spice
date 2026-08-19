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

async function syncPizzaFlavorAndPrices(
  name: string,
  description: string | null,
  image: string | null,
  sizePrices: { small?: number; medium?: number; large?: number; xlarge?: number }
) {
  try {
    const sizes = await prisma.pizzaSize.findMany({ orderBy: { sortOrder: 'asc' } });

    let smallSize = sizes.find((s) => s.code === 'S');
    let mediumSize = sizes.find((s) => s.code === 'M');
    let largeSize = sizes.find((s) => s.code === 'L');
    let xlargeSize = sizes.find((s) => s.code === 'XL');

    if (!smallSize) smallSize = await prisma.pizzaSize.create({ data: { name: 'Small (7")', code: 'S', sortOrder: 1 } });
    if (!mediumSize) mediumSize = await prisma.pizzaSize.create({ data: { name: 'Medium (10")', code: 'M', sortOrder: 2 } });
    if (!largeSize) largeSize = await prisma.pizzaSize.create({ data: { name: 'Large (13")', code: 'L', sortOrder: 3 } });
    if (!xlargeSize) xlargeSize = await prisma.pizzaSize.create({ data: { name: 'X.Large (17")', code: 'XL', sortOrder: 4 } });

    let flavor = await prisma.pizzaFlavor.findFirst({ where: { name } });
    if (!flavor) {
      flavor = await prisma.pizzaFlavor.create({
        data: { name, description, image },
      });
    } else {
      flavor = await prisma.pizzaFlavor.update({
        where: { id: flavor.id },
        data: { description, image },
      });
    }

    const priceMap: { sizeId: string; price: number }[] = [];
    if (sizePrices.small !== undefined && smallSize) priceMap.push({ sizeId: smallSize.id, price: sizePrices.small });
    if (sizePrices.medium !== undefined && mediumSize) priceMap.push({ sizeId: mediumSize.id, price: sizePrices.medium });
    if (sizePrices.large !== undefined && largeSize) priceMap.push({ sizeId: largeSize.id, price: sizePrices.large });
    if (sizePrices.xlarge !== undefined && xlargeSize) priceMap.push({ sizeId: xlargeSize.id, price: sizePrices.xlarge });

    for (const item of priceMap) {
      await prisma.pizzaFlavorPrice.upsert({
        where: {
          flavorId_sizeId: {
            flavorId: flavor.id,
            sizeId: item.sizeId,
          },
        },
        create: {
          flavorId: flavor.id,
          sizeId: item.sizeId,
          price: item.price,
        },
        update: {
          price: item.price,
        },
      });
    }
  } catch (err) {
    console.error('Failed to sync pizza flavor and prices:', err);
  }
}

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
    const {
      name,
      SKU,
      categoryId,
      basePrice,
      costPrice,
      stock,
      minStock,
      description,
      image,
      isPizza,
      smallPrice,
      mediumPrice,
      largePrice,
      xlargePrice,
    } = body;

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

    if (isPizza) {
      await syncPizzaFlavorAndPrices(newProduct.name, newProduct.description, newProduct.image, {
        small: smallPrice ? parseFloat(smallPrice) : parseFloat(basePrice),
        medium: mediumPrice ? parseFloat(mediumPrice) : parseFloat(basePrice) * 1.8,
        large: largePrice ? parseFloat(largePrice) : parseFloat(basePrice) * 2.5,
        xlarge: xlargePrice ? parseFloat(xlargePrice) : parseFloat(basePrice) * 3.2,
      });
    }

    await createSafeAuditLog(
      session.userId,
      session.name,
      'CREATE_PRODUCT',
      `Created product ${newProduct.name} (${newProduct.SKU})`
    );

    return NextResponse.json({ success: true, product: newProduct });

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
    const {
      id,
      name,
      SKU,
      categoryId,
      basePrice,
      costPrice,
      stock,
      minStock,
      description,
      image,
      active,
      isPizza,
      smallPrice,
      mediumPrice,
      largePrice,
      xlargePrice,
    } = body;

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
        isPizza: isPizza !== undefined ? Boolean(isPizza) : undefined,
      },
      include: { category: true },
    });

    if (updated.isPizza) {
      await syncPizzaFlavorAndPrices(updated.name, updated.description, updated.image, {
        small: smallPrice ? parseFloat(smallPrice) : undefined,
        medium: mediumPrice ? parseFloat(mediumPrice) : undefined,
        large: largePrice ? parseFloat(largePrice) : undefined,
        xlarge: xlargePrice ? parseFloat(xlargePrice) : undefined,
      });
    }

    await createSafeAuditLog(
      session.userId,
      session.name,
      'UPDATE_PRODUCT',
      `Updated product ${updated.name} (${updated.SKU})`
    );

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    console.error('Product update error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update product' }, { status: 500 });
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

    await createSafeAuditLog(
      session.userId,
      session.name,
      'DELETE_PRODUCT',
      `Deleted product ${deleted.name} (${deleted.SKU})`
    );

    return NextResponse.json({ success: true, message: 'Product deleted' });

    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
