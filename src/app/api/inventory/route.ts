import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const items = await prisma.inventoryItem.findMany({
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { actionType, inventoryItemId, name, SKU, unit, quantity, minStock, costPerUnit, supplier, notes } = body;

    // Create new raw ingredient item
    if (actionType === 'CREATE_ITEM') {
      if (!name || !SKU || !unit) {
        return NextResponse.json({ error: 'Name, SKU, and unit are required' }, { status: 400 });
      }

      const newItem = await prisma.inventoryItem.create({
        data: {
          name: name.trim(),
          SKU: SKU.trim(),
          unit: unit.trim(),
          currentStock: parseFloat(quantity || 0),
          minStock: parseFloat(minStock || 10),
          costPerUnit: parseFloat(costPerUnit || 0),
          supplier: supplier ? supplier.trim() : null,
        },
      });

      if (quantity > 0) {
        await prisma.inventoryTransaction.create({
          data: {
            inventoryItemId: newItem.id,
            type: 'ADD',
            quantity: parseFloat(quantity),
            notes: notes || 'Initial stock entry',
            createdBy: session.name,
          },
        });
      }

      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          userName: session.name,
          action: 'CREATE_INVENTORY_ITEM',
          details: `Created inventory item ${newItem.name} (${newItem.unit})`,
        },
      });

      return NextResponse.json({ success: true, item: newItem });
    }

    // Stock transaction (ADD, REMOVE, ADJUSTMENT, PURCHASE, WASTE, RETURN)
    if (actionType === 'STOCK_TRANSACTION') {
      if (!inventoryItemId || quantity === undefined) {
        return NextResponse.json({ error: 'Item ID and quantity required' }, { status: 400 });
      }

      const item = await prisma.inventoryItem.findUnique({ where: { id: inventoryItemId } });
      if (!item) {
        return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 });
      }

      const qty = parseFloat(quantity);
      const type = body.type || 'ADD'; // ADD, REMOVE, ADJUSTMENT, WASTE
      let newStock = item.currentStock;

      if (type === 'ADD' || type === 'PURCHASE' || type === 'RETURN') {
        newStock += qty;
      } else if (type === 'REMOVE' || type === 'WASTE') {
        newStock = Math.max(0, newStock - qty);
      } else if (type === 'ADJUSTMENT') {
        newStock = qty;
      }

      const updated = await prisma.$transaction([
        prisma.inventoryItem.update({
          where: { id: inventoryItemId },
          data: { currentStock: newStock },
        }),
        prisma.inventoryTransaction.create({
          data: {
            inventoryItemId,
            type,
            quantity: qty,
            notes: notes || null,
            createdBy: session.name,
          },
        }),
        prisma.auditLog.create({
          data: {
            userId: session.userId,
            userName: session.name,
            action: `INVENTORY_${type}`,
            details: `${type} ${qty} ${item.unit} for ${item.name}. New Stock: ${newStock}`,
          },
        }),
      ]);

      return NextResponse.json({ success: true, item: updated[0] });
    }

    return NextResponse.json({ error: 'Invalid action type' }, { status: 400 });
  } catch (error) {
    console.error('Inventory error:', error);
    return NextResponse.json({ error: 'Failed to process inventory request' }, { status: 500 });
  }
}
