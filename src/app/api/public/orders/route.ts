import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateInvoiceNumber, getLocalDateKey, isValidObjectId } from '@/lib/utils';

const clean = (value: unknown) => typeof value === 'string' ? value.trim() : '';
const quantityOf = (value: unknown) => Math.floor(Number(value));

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const customerInput = body.customer || {};
    const name = clean(customerInput.name);
    const phone = clean(customerInput.phone);
    const address = clean(customerInput.address);
    const orderType = body.orderType === 'DELIVERY' ? 'DELIVERY' : 'TAKEAWAY';
    const paymentMethod = ['CASH', 'CARD', 'ONLINE'].includes(body.paymentMethod) ? body.paymentMethod : 'CASH';
    const items = Array.isArray(body.items) ? body.items : [];

    if (name.length < 2 || phone.length < 5) return NextResponse.json({ error: 'Please enter a valid name and contact number.' }, { status: 400 });
    if (orderType === 'DELIVERY' && address.length < 5) return NextResponse.json({ error: 'A delivery address is required for delivery orders.' }, { status: 400 });
    if (!items.length || items.length > 30) return NextResponse.json({ error: 'Your cart is empty or contains too many items.' }, { status: 400 });

    const idsFrom = (key: string): string[] => [...new Set<string>(
      items.map((item: any) => item[key]).filter((id: unknown): id is string => typeof id === 'string' && isValidObjectId(id)),
    )];
    const productIds = idsFrom('productId');
    const flavorIds = idsFrom('flavorId');
    const sizeIds = idsFrom('sizeId');
    const crustIds = idsFrom('crustId');
    const toppingIds: string[] = [...new Set<string>((items as any[]).flatMap((item): string[] => Array.isArray(item.toppingIds)
      ? item.toppingIds.filter((id: unknown): id is string => typeof id === 'string' && isValidObjectId(id))
      : []))];

    const [staffUser, products, flavors, sizes, crusts, toppings, feeSetting, prefixSetting] = await Promise.all([
      prisma.user.findFirst({ where: { active: true }, orderBy: { createdAt: 'asc' }, select: { id: true } }),
      prisma.product.findMany({ where: { id: { in: productIds }, active: true, stock: { gt: 0 } }, select: { id: true, name: true, basePrice: true, isPizza: true, stock: true } }),
      prisma.pizzaFlavor.findMany({ where: { id: { in: flavorIds }, active: true }, select: { id: true, name: true, flavorPrices: { select: { sizeId: true, price: true } } } }),
      prisma.pizzaSize.findMany({ where: { id: { in: sizeIds } }, select: { id: true, name: true } }),
      prisma.crust.findMany({ where: { id: { in: crustIds }, active: true }, select: { id: true, name: true, additionalPrice: true } }),
      prisma.topping.findMany({ where: { id: { in: toppingIds }, active: true, stock: { gt: 0 } }, select: { id: true, name: true, additionalPrice: true } }),
      prisma.storeSetting.findUnique({ where: { key: 'defaultDeliveryFee' } }),
      prisma.storeSetting.findUnique({ where: { key: 'invoicePrefix' } }),
    ]);
    if (!staffUser) return NextResponse.json({ error: 'Online ordering is not configured with a staff account yet.' }, { status: 503 });
    const productById = new Map(products.map((p) => [p.id, p]));
    const flavorById = new Map(flavors.map((f) => [f.id, f]));
    const sizeById = new Map(sizes.map((s) => [s.id, s]));
    const crustById = new Map(crusts.map((c) => [c.id, c]));
    const toppingById = new Map(toppings.map((t) => [t.id, t]));

    let subtotal = 0;
    const normalizedItems: Array<{
      product: any;
      flavor: any;
      size: any;
      crust: any;
      quantity: number;
      unitPrice: number;
      total: number;
      toppings: Array<{ id: string; name: string; additionalPrice: number }>;
      note: string;
    }> = [];
    const productQuantity = new Map<string, number>();
    for (const raw of items) {
      const quantity = quantityOf(raw.quantity);
      const product = productById.get(raw.productId);
      if (!product || !Number.isFinite(quantity) || quantity < 1 || quantity > 20) return NextResponse.json({ error: 'One or more menu items are no longer available.' }, { status: 400 });
      const runningQuantity = (productQuantity.get(product.id) || 0) + quantity;
      if (runningQuantity > product.stock) return NextResponse.json({ error: `${product.name} does not have enough stock.` }, { status: 400 });
      productQuantity.set(product.id, runningQuantity);

      let unitPrice = product.basePrice;
      let flavor: any = null; let size: any = null; let crust: any = null;
      if (product.isPizza) {
        flavor = flavorById.get(raw.flavorId); size = sizeById.get(raw.sizeId);
        if (!flavor || !size) return NextResponse.json({ error: `Please choose a flavor and size for ${product.name}.` }, { status: 400 });
        const listedPrice = (flavor.flavorPrices as Array<{ sizeId: string; price: number }>).find((p: { sizeId: string; price: number }) => p.sizeId === size.id);
        if (!listedPrice) return NextResponse.json({ error: 'This pizza combination is unavailable.' }, { status: 400 });
        unitPrice = listedPrice.price;
        if (raw.crustId) {
          crust = crustById.get(raw.crustId);
          if (!crust) return NextResponse.json({ error: 'Selected crust is unavailable.' }, { status: 400 });
          unitPrice += crust.additionalPrice;
        }
      }
      const requestedToppings: string[] = Array.isArray(raw.toppingIds)
        ? ([...new Set(
            raw.toppingIds
              .filter((id: unknown): id is string => typeof id === 'string')
          )] as string[]).slice(0, 10)
        : [];
      const itemToppings = requestedToppings
        .map((id: string) => toppingById.get(id) as { id: string; name: string; additionalPrice: number } | undefined)
        .filter((topping): topping is { id: string; name: string; additionalPrice: number } => Boolean(topping));
      if (itemToppings.length !== requestedToppings.length) return NextResponse.json({ error: 'A selected topping is unavailable.' }, { status: 400 });
      const toppingsPrice = itemToppings.reduce((sum, topping) => sum + Number(topping.additionalPrice || 0), 0);
      const total = (unitPrice + toppingsPrice) * quantity;
      subtotal += total;
      normalizedItems.push({ product, flavor, size, crust, quantity, unitPrice, total, toppings: itemToppings, note: clean(raw.specialInstructions).slice(0, 300) });
    }
    const deliveryFee = orderType === 'DELIVERY' ? Math.max(0, Number(feeSetting?.value || 0) || 0) : 0;
    const grandTotal = Math.round(subtotal + deliveryFee);
    const [orderCount, salesDay, customer] = await Promise.all([
      prisma.order.count(),
      prisma.salesDay.upsert({ where: { dateKey: getLocalDateKey() }, create: { dateKey: getLocalDateKey() }, update: {} }),
      prisma.customer.upsert({ where: { phone }, create: { name, phone, address: address || null }, update: { name, ...(address ? { address } : {}) } }),
    ]);
    const invoiceNo = generateInvoiceNumber(prefixSetting?.value || 'INV-2026', orderCount + 1);
    const order = await (prisma as any).order.create({
      data: { invoiceNo, customerId: customer.id, userId: staffUser.id, salesDayId: salesDay.id, orderType, source: 'ONLINE', status: 'PENDING', paymentStatus: 'UNPAID', subtotal, deliveryFee, grandTotal, paymentMethod, notes: clean(body.notes).slice(0, 300) || null,
        items: { create: normalizedItems.map((item) => ({ productId: item.product.id, productName: item.product.name, flavorId: item.flavor?.id || null, flavorName: item.flavor?.name || null, sizeId: item.size?.id || null, sizeName: item.size?.name || null, crustId: item.crust?.id || null, crustName: item.crust?.name || null, quantity: item.quantity, unitPrice: item.unitPrice, total: item.total, specialInstructions: item.note || null, toppings: { create: item.toppings.map((topping: { id: string; name: string; additionalPrice: number }) => ({ toppingId: topping.id, toppingName: topping.name, price: topping.additionalPrice })) } })) } },
      select: { id: true, invoiceNo: true, status: true, grandTotal: true },
    });
    await Promise.all([...productQuantity].map(([id, quantity]) => prisma.product.update({ where: { id }, data: { stock: { decrement: quantity } } })));
    return NextResponse.json({ success: true, order: { id: order.id, invoiceNo: order.invoiceNo, status: order.status, grandTotal: order.grandTotal } }, { status: 201 });
  } catch (error: any) {
    console.error('Online order error:', error);
    return NextResponse.json({ error: error?.message || 'Unable to place your order.' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const invoiceNo = clean(searchParams.get('invoiceNo'));
  const phone = clean(searchParams.get('phone'));
  const scope = clean(searchParams.get('scope'));
  if (!phone) return NextResponse.json({ error: 'Phone number is required.' }, { status: 400 });
  if (!invoiceNo) {
    const completedStatuses = ['COMPLETED', 'CANCELLED', 'REFUNDED'];
    const orders = await (prisma as any).order.findMany({ where: { source: 'ONLINE', customer: { is: { phone } }, status: scope === 'history' ? { in: completedStatuses } : { notIn: completedStatuses } }, select: { invoiceNo: true, status: true, orderType: true, grandTotal: true, createdAt: true, items: { select: { productName: true, quantity: true } } }, orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ orders });
  }
  const order: any = await (prisma as any).order.findFirst({ where: { invoiceNo, source: 'ONLINE', customer: { is: { phone } } }, select: { invoiceNo: true, status: true, paymentStatus: true, orderType: true, grandTotal: true, createdAt: true } });
  if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  return NextResponse.json({ order });
}
