import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Pizza Store database...');

  // 1. Clean existing data
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

  // 2. Store Settings
  const settings = [
    { key: 'storeName', value: 'Slice & Spice Pizza POS' },
    { key: 'storeLogo', value: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&q=80' },
    { key: 'storeAddress', value: '123 Main Commercial Area, Gulberg III, Lahore, Pakistan' },
    { key: 'storePhone', value: '+92 300 1234567' },
    { key: 'whatsappNumber', value: '+92 300 1234567' },
    { key: 'storeEmail', value: 'orders@sliceandspice.com' },
    { key: 'currency', value: 'Rs.' },
    { key: 'taxRate', value: '5' },
    { key: 'taxEnabled', value: 'true' },
    { key: 'invoicePrefix', value: 'INV-2026' },
    { key: 'invoiceFooter', value: 'Thank you for ordering from Slice & Spice Pizza! Have a delicious day!' },
    { key: 'openingTime', value: '11:00 AM' },
    { key: 'closingTime', value: '02:00 AM' },
    { key: 'defaultDeliveryFee', value: '150' },
    { key: 'socialMedia', value: '@sliceandspicepizza' },
    { key: 'receiptSize', value: '80mm' },
  ];

  for (const setting of settings) {
    await prisma.storeSetting.create({ data: setting });
  }

  // 3. Users (Admin & Cashier)
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);
  const hashedCashierPassword = await bcrypt.hash('cashier123', 10);

  const adminUser = await prisma.user.create({
    data: {
      name: 'Store Manager',
      email: 'admin@pizzastore.com',
      phone: '03000000001',
      password: hashedAdminPassword,
      role: 'ADMIN',
      active: true,
    },
  });

  const cashierUser = await prisma.user.create({
    data: {
      name: 'Main Cashier',
      email: 'cashier@pizzastore.com',
      phone: '03000000002',
      password: hashedCashierPassword,
      role: 'CASHIER',
      active: true,
    },
  });

  // 4. Customers
  const customer1 = await prisma.customer.create({
    data: {
      name: 'Ali Khan',
      phone: '03001234567',
      whatsapp: '03001234567',
      email: 'ali.khan@example.com',
      address: 'House 45, Block H, DHA Phase 5',
      city: 'Lahore',
      notes: 'Prefers extra spicy sauce',
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: 'Sara Ahmed',
      phone: '03219876543',
      whatsapp: '03219876543',
      email: 'sara.a@example.com',
      address: 'Flat 3B, Regency Heights, Gulberg III',
      city: 'Lahore',
      notes: 'No onion preferred',
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      name: 'Hamza Malik',
      phone: '03335557788',
      whatsapp: '03335557788',
      email: 'hamza.malik@example.com',
      address: 'Shop 12, Commercial Market, Johar Town',
      city: 'Lahore',
    },
  });

  // 5. Categories
  const catPizza = await prisma.category.create({
    data: { name: 'Pizza', slug: 'pizza', description: 'Oven-baked pizzas', sortOrder: 1 },
  });
  const catBurgers = await prisma.category.create({
    data: { name: 'Burger', slug: 'burgers', description: 'Handcrafted burgers', sortOrder: 2 },
  });
  const catFries = await prisma.category.create({
    data: { name: 'Fries', slug: 'fries', description: 'Crispy potato fries', sortOrder: 3 },
  });
  const catSandwich = await prisma.category.create({
    data: { name: 'Sandwich', slug: 'sandwich', description: 'Grilled and club sandwiches', sortOrder: 4 },
  });
  const catShawarma = await prisma.category.create({
    data: { name: 'Shawarma', slug: 'shawarma', description: 'Arabic chicken and beef shawarmas', sortOrder: 5 },
  });
  const catDrinks = await prisma.category.create({
    data: { name: 'Drinks', slug: 'drinks', description: 'Chilled beverages', sortOrder: 6 },
  });
  const catDeals = await prisma.category.create({
    data: { name: 'Deals', slug: 'deals', description: 'Special value meal combos', sortOrder: 7 },
  });
  const catDesserts = await prisma.category.create({
    data: { name: 'Desserts', slug: 'desserts', description: 'Sweet cakes and desserts', sortOrder: 8 },
  });
  const catOther = await prisma.category.create({
    data: { name: 'Other', slug: 'other', description: 'Dips and add-ons', sortOrder: 9 },
  });

  // 6. Pizza Sizes
  const sizeSmall = await prisma.pizzaSize.create({ data: { name: 'Small (8")', code: 'S', sortOrder: 1 } });
  const sizeMedium = await prisma.pizzaSize.create({ data: { name: 'Medium (10")', code: 'M', sortOrder: 2 } });
  const sizeLarge = await prisma.pizzaSize.create({ data: { name: 'Large (12")', code: 'L', sortOrder: 3 } });
  const sizeFamily = await prisma.pizzaSize.create({ data: { name: 'Family (14")', code: 'XL', sortOrder: 4 } });

  // 7. Pizza Flavors
  const flavorsData = [
    { name: 'Chicken Tikka', description: 'Spicy marinated chicken tikka chunks with onions and green peppers', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80', sortOrder: 1 },
    { name: 'Chicken Fajita', description: 'Juicy fajita chicken, onions, capsicum, and melted mozzarella', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80', sortOrder: 2 },
    { name: 'BBQ Chicken', description: 'Smokey BBQ chicken topped with caramelized onions and fresh cilantro', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&q=80', sortOrder: 3 },
    { name: 'Malai Boti', description: 'Creamy rich malai boti chicken chunks with extra cheese blend', image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&q=80', sortOrder: 4 },
    { name: 'Cheese Lover', description: 'Loaded 4-cheese blend: Mozzarella, Cheddar, Gouda, and Parmesan', image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500&q=80', sortOrder: 5 },
    { name: 'Pepperoni', description: 'Classic spicy beef pepperoni slices with mozzarella cheese', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&q=80', sortOrder: 6 },
    { name: 'Vegetarian', description: 'Fresh bell peppers, mushrooms, black olives, onions, and sweet corn', image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=500&q=80', sortOrder: 7 },
    { name: 'Special Pizza', description: 'Chef special Loaded pizza with stuffed crust, chicken, and extra toppings', image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=500&q=80', sortOrder: 8 },
  ];

  for (const f of flavorsData) {
    const flavor = await prisma.pizzaFlavor.create({ data: f });
    const isSpecial = f.name === 'Special Pizza' || f.name === 'Malai Boti';
    const prices = {
      [sizeSmall.id]: isSpecial ? 750 : 700,
      [sizeMedium.id]: isSpecial ? 1100 : 1000,
      [sizeLarge.id]: isSpecial ? 1500 : 1400,
      [sizeFamily.id]: isSpecial ? 1950 : 1800,
    };

    for (const [sizeId, price] of Object.entries(prices)) {
      await prisma.pizzaFlavorPrice.create({
        data: { flavorId: flavor.id, sizeId, price },
      });
    }
  }

  // Base Pizza Product
  const basePizzaProduct = await prisma.product.create({
    data: {
      name: 'Custom Pizza',
      SKU: 'PZ-CUSTOM-001',
      description: 'Customizable pizza with selected size, flavor, crust & toppings',
      categoryId: catPizza.id,
      basePrice: 700,
      costPrice: 350,
      stock: 999,
      minStock: 50,
      isPizza: true,
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80',
    },
  });

  // Crusts
  await prisma.crust.create({ data: { name: 'Regular Crust', additionalPrice: 0 } });
  await prisma.crust.create({ data: { name: 'Cheese Stuffed Crust', additionalPrice: 250 } });
  await prisma.crust.create({ data: { name: 'Thin Crust', additionalPrice: 50 } });
  await prisma.crust.create({ data: { name: 'Garlic Butter Crust', additionalPrice: 150 } });

  // Toppings
  await prisma.topping.create({ data: { name: 'Extra Cheese', additionalPrice: 150, stock: 500 } });
  await prisma.topping.create({ data: { name: 'Black Olives', additionalPrice: 80, stock: 400 } });
  await prisma.topping.create({ data: { name: 'Mushrooms', additionalPrice: 100, stock: 350 } });
  await prisma.topping.create({ data: { name: 'Jalapenos', additionalPrice: 80, stock: 300 } });
  await prisma.topping.create({ data: { name: 'Grilled Chicken Chunks', additionalPrice: 200, stock: 250 } });
  await prisma.topping.create({ data: { name: 'Beef Pepperoni', additionalPrice: 200, stock: 250 } });
  await prisma.topping.create({ data: { name: 'Capsicum & Onions', additionalPrice: 60, stock: 500 } });

  // Non-Pizza Products
  const productsData = [
    { name: 'Crispy Zinger Burger', SKU: 'BRG-001', categoryId: catBurgers.id, basePrice: 450, costPrice: 250, stock: 45, minStock: 10, isPizza: false, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80' },
    { name: 'Double Beef Jalapeno Burger', SKU: 'BRG-002', categoryId: catBurgers.id, basePrice: 650, costPrice: 380, stock: 30, minStock: 5, isPizza: false, image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&q=80' },
    { name: 'Loaded Cheese Fries', SKU: 'FRS-001', categoryId: catFries.id, basePrice: 350, costPrice: 180, stock: 80, minStock: 15, isPizza: false, image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=500&q=80' },
    { name: 'Plain Salted Fries', SKU: 'FRS-002', categoryId: catFries.id, basePrice: 220, costPrice: 100, stock: 100, minStock: 20, isPizza: false, image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=500&q=80' },
    { name: 'Grilled Chicken Club Sandwich', SKU: 'SND-001', categoryId: catSandwich.id, basePrice: 420, costPrice: 210, stock: 40, minStock: 10, isPizza: false, image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&q=80' },
    { name: 'Special Cheese Chicken Shawarma', SKU: 'SHW-001', categoryId: catShawarma.id, basePrice: 260, costPrice: 130, stock: 60, minStock: 15, isPizza: false, image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=500&q=80' },
    { name: 'Coca-Cola 1.5L', SKU: 'DRK-001', categoryId: catDrinks.id, basePrice: 180, costPrice: 130, stock: 60, minStock: 10, isPizza: false, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80' },
    { name: 'Sprite 500ml', SKU: 'DRK-002', categoryId: catDrinks.id, basePrice: 90, costPrice: 65, stock: 120, minStock: 20, isPizza: false, image: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=500&q=80' },
    { name: 'Chocolate Lava Cake', SKU: 'DES-001', categoryId: catDesserts.id, basePrice: 380, costPrice: 180, stock: 25, minStock: 5, isPizza: false, image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80' },
    { name: 'Mega Family Deal (2 Large Pizzas + 1.5L Drink + Fries)', SKU: 'DL-001', categoryId: catDeals.id, basePrice: 2890, costPrice: 1600, stock: 20, minStock: 5, isPizza: false, image: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?w=500&q=80' },
  ];

  for (const p of productsData) {
    await prisma.product.create({ data: p });
  }

  // Inventory Raw Materials
  const rawMaterials = [
    { name: 'Pizza Flour', SKU: 'INV-FLR-01', unit: 'kg', currentStock: 150.0, minStock: 30.0, costPerUnit: 180, supplier: 'National Mills' },
    { name: 'Mozzarella Cheese', SKU: 'INV-CHS-01', unit: 'kg', currentStock: 80.0, minStock: 15.0, costPerUnit: 1200, supplier: 'Adams Dairy' },
    { name: 'Special Tomato Pizza Sauce', SKU: 'INV-AUC-01', unit: 'l', currentStock: 60.0, minStock: 10.0, costPerUnit: 450, supplier: 'Knorr Foodservice' },
    { name: 'Fresh Chicken Breast', SKU: 'INV-CHK-01', unit: 'kg', currentStock: 75.0, minStock: 15.0, costPerUnit: 850, supplier: 'K&Ns Poultry' },
    { name: 'Sliced Beef Pepperoni', SKU: 'INV-PEP-01', unit: 'kg', currentStock: 25.0, minStock: 5.0, costPerUnit: 1500, supplier: 'Gourmet Meats' },
    { name: 'Pizza Boxes (Large 12")', SKU: 'INV-BOX-L', unit: 'pcs', currentStock: 450.0, minStock: 50.0, costPerUnit: 35, supplier: 'Packaging World' },
  ];

  for (const item of rawMaterials) {
    const inv = await prisma.inventoryItem.create({ data: item });
    await prisma.inventoryTransaction.create({
      data: {
        inventoryItemId: inv.id,
        type: 'ADD',
        quantity: inv.currentStock,
        notes: 'Initial seed stock inventory check',
        createdBy: adminUser.name,
      },
    });
  }

  // Audit Logs
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      userName: adminUser.name,
      action: 'SYSTEM_SEED',
      details: 'System database successfully initialized and seeded.',
    },
  });

  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
