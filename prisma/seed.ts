import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning and initializing Urban Spice database...');

  // 1. Clean all existing data completely
  await prisma.auditLog.deleteMany();
  await prisma.orderItemTopping.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.recipeIngredient.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.inventoryTransaction.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.pizzaFlavorPrice.deleteMany();
  await prisma.topping.deleteMany();
  await prisma.crust.deleteMany();
  await prisma.pizzaSize.deleteMany();
  await prisma.pizzaFlavor.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.storeSetting.deleteMany();

  // 2. Store Settings (Urban Spice Branding)
  const settings = [
    { key: 'storeName', value: 'Urban Spice' },
    { key: 'storeLogo', value: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&q=80' },
    { key: 'storeAddress', value: '180 F, Near Klash Park, Millat Town, Faisalabad' },
    { key: 'storePhone', value: '0300-5225898' },
    { key: 'whatsappNumber', value: '0300-5225898' },
    { key: 'storeEmail', value: 'orders@urbanspice.com' },
    { key: 'currency', value: 'Rs.' },
    { key: 'taxRate', value: '5' },
    { key: 'taxEnabled', value: 'true' },
    { key: 'invoicePrefix', value: 'INV-2026' },
    { key: 'invoiceFooter', value: 'Thank you for ordering from Urban Spice! Ultimate Taste In Every Bite!' },
    { key: 'openingTime', value: '11:00 AM' },
    { key: 'closingTime', value: '02:00 AM' },
    { key: 'defaultDeliveryFee', value: '150' },
    { key: 'socialMedia', value: '@urbanspicefaisalabad' },
    { key: 'receiptSize', value: '80mm' },
  ];

  for (const setting of settings) {
    await prisma.storeSetting.create({ data: setting });
  }

  // 3. Store User Accounts (Admin & Cashier)
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);
  const hashedCashierPassword = await bcrypt.hash('cashier123', 10);

  const adminUser = await prisma.user.create({
    data: {
      name: 'Urban Spice Admin',
      email: 'admin@urbanspice.com',
      phone: '03005225898',
      password: hashedAdminPassword,
      role: 'ADMIN',
      active: true,
    },
  });

  await prisma.user.create({
    data: {
      name: 'Main Cashier',
      email: 'cashier@urbanspice.com',
      phone: '03005225899',
      password: hashedCashierPassword,
      role: 'CASHIER',
      active: true,
    },
  });

  // Audit Logs
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      userName: adminUser.name,
      action: 'SYSTEM_INITIALIZATION',
      details: 'Cleaned database. Ready for manual product and category creation.',
    },
  });

  console.log('Urban Spice database reset complete! 0 products & 0 categories remaining.');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
