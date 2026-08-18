import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning and initializing Urban Spice database with complete menu...');

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

  // 2. Store Settings (Urban Spice Official Details)
  const settings = [
    { key: 'storeName', value: 'Urban Spice' },
    { key: 'storeLogo', value: '/logo.png' },
    { key: 'storeAddress', value: '180 F, Near Klash Park, Millat Town, Faisalabad' },
    { key: 'storePhone', value: '0300-5225898' },
    { key: 'whatsappNumber', value: '0300-5225898' },
    { key: 'storeEmail', value: 'orders@urbanspice.com' },
    { key: 'currency', value: 'Rs.' },
    { key: 'taxRate', value: '0' },
    { key: 'taxEnabled', value: 'false' },
    { key: 'invoicePrefix', value: 'INV' },
    { key: 'invoiceFooter', value: 'Thank you for ordering from Urban Spice! Ultimate Taste In Every Bite!' },
    { key: 'openingTime', value: '11:00 AM' },
    { key: 'closingTime', value: '02:00 AM' },
    { key: 'defaultDeliveryFee', value: '100' },
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

  // 4. Pizza Sizes
  const sizeSmall = await prisma.pizzaSize.create({ data: { name: 'Small (7")', code: 'S', sortOrder: 1 } });
  const sizeMedium = await prisma.pizzaSize.create({ data: { name: 'Medium (10")', code: 'M', sortOrder: 2 } });
  const sizeLarge = await prisma.pizzaSize.create({ data: { name: 'Large (13")', code: 'L', sortOrder: 3 } });
  const sizeXL = await prisma.pizzaSize.create({ data: { name: 'X.Large (17")', code: 'XL', sortOrder: 4 } });

  // 5. Crusts
  await prisma.crust.createMany({
    data: [
      { name: 'Regular Pan Crust', additionalPrice: 0 },
      { name: 'Thin Crust', additionalPrice: 0 },
      { name: 'Cheese Stuffed Crust', additionalPrice: 150 },
    ],
  });

  // 6. Toppings
  await prisma.topping.createMany({
    data: [
      { name: 'Extra Topping Small', additionalPrice: 70 },
      { name: 'Extra Topping Medium', additionalPrice: 150 },
      { name: 'Extra Topping Large', additionalPrice: 200 },
      { name: 'Extra Topping X.Large', additionalPrice: 250 },
      { name: 'Dip Sauce', additionalPrice: 60 },
    ],
  });

  // 7. Categories
  const catUrbanPizza = await prisma.category.create({ data: { name: 'Urban Pizza', slug: 'urban-pizza', sortOrder: 1 } });
  const catUrbanSpecialPizza = await prisma.category.create({ data: { name: 'Urban Special Pizza', slug: 'urban-special-pizza', sortOrder: 2 } });
  const catUrbanStufferPizza = await prisma.category.create({ data: { name: 'Urban Stuffer Pizza', slug: 'urban-stuffer-pizza', sortOrder: 3 } });
  const catUrbanSquarePizza = await prisma.category.create({ data: { name: 'Urban Square Pizza', slug: 'urban-square-pizza', sortOrder: 4 } });
  const catPlatter = await prisma.category.create({ data: { name: 'Urban Special Platter', slug: 'urban-special-platter', sortOrder: 5 } });
  const catSandwichesBurgers = await prisma.category.create({ data: { name: 'Sandwiches & Burgers', slug: 'sandwiches-burgers', sortOrder: 6 } });
  const catPasta = await prisma.category.create({ data: { name: 'Pasta', slug: 'pasta', sortOrder: 7 } });
  const catAppetizers = await prisma.category.create({ data: { name: 'Appetizers', slug: 'appetizers', sortOrder: 8 } });
  const catSpinRolls = await prisma.category.create({ data: { name: 'Spin Rolls', slug: 'spin-rolls', sortOrder: 9 } });
  const catBeverages = await prisma.category.create({ data: { name: 'Beverages', slug: 'beverages', sortOrder: 10 } });

  // Helper to create pizza flavor and its prices
  const createPizzaFlavorWithPrices = async (
    name: string,
    description: string,
    prices: { S?: number; M?: number; L?: number; XL?: number },
    categoryId: string
  ) => {
    const flavor = await prisma.pizzaFlavor.create({
      data: { name, description },
    });

    const priceList = [];
    if (prices.S) priceList.push({ flavorId: flavor.id, sizeId: sizeSmall.id, price: prices.S });
    if (prices.M) priceList.push({ flavorId: flavor.id, sizeId: sizeMedium.id, price: prices.M });
    if (prices.L) priceList.push({ flavorId: flavor.id, sizeId: sizeLarge.id, price: prices.L });
    if (prices.XL) priceList.push({ flavorId: flavor.id, sizeId: sizeXL.id, price: prices.XL });

    await prisma.pizzaFlavorPrice.createMany({ data: priceList });

    // Also register as a product in catalog for POS product selection
    const basePrice = prices.S || prices.M || prices.L || 500;
    await prisma.product.create({
      data: {
        name,
        SKU: `PZ-${name.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
        description,
        categoryId,
        basePrice,
        isPizza: true,
      },
    });
  };

  // --- URBAN PIZZA (S: 500, M: 950, L: 1400, XL: 2150) ---
  const standardPizzaPrices = { S: 500, M: 950, L: 1400, XL: 2150 };
  await createPizzaFlavorWithPrices('Chicken Tikka', 'Tender chicken tikka chunks with onions & cheese', standardPizzaPrices, catUrbanPizza.id);
  await createPizzaFlavorWithPrices('Chicken Fajita', 'Fajita chicken, onions, capsicum & mozzarella', standardPizzaPrices, catUrbanPizza.id);
  await createPizzaFlavorWithPrices('Chicken Supreme', 'Loaded chicken, olives, mushrooms, capsicum & onions', standardPizzaPrices, catUrbanPizza.id);
  await createPizzaFlavorWithPrices('Chicken Fajita Sicilian', 'Spicy fajita chicken, jalapeños, onions & capsicum', standardPizzaPrices, catUrbanPizza.id);
  await createPizzaFlavorWithPrices('Cheese Lover', 'Rich double layer of premium mozzarella cheese', standardPizzaPrices, catUrbanPizza.id);
  await createPizzaFlavorWithPrices('Veggie Lover', 'Onions, capsicum, tomatoes, mushrooms, olives & sweet corn', standardPizzaPrices, catUrbanPizza.id);

  // --- URBAN SPECIAL PIZZA ---
  const specialPizzaPrices = { S: 500, M: 1000, L: 1450, XL: 2200 };
  await createPizzaFlavorWithPrices('Urban Special', 'Urban Special Sauce with K&Ns Chicken, Olives, Capsicum, Tomato, Mushroom, Sweet Corn', specialPizzaPrices, catUrbanSpecialPizza.id);
  await createPizzaFlavorWithPrices('Malai Boti', 'White Sauce with K&Ns Malai Boti Chicken, Onion, Capsicum, Tomato, Olives, Jalapeno, Sweet Corn', specialPizzaPrices, catUrbanSpecialPizza.id);
  
  // Behari Kebab & Peri Peri (M: 1100, L: 1600, XL: 2350)
  const behariPeriPrices = { M: 1100, L: 1600, XL: 2350 };
  await createPizzaFlavorWithPrices('Behari Kebab', 'Special Behari Kebab chunks with onions & capsicum', behariPeriPrices, catUrbanSpecialPizza.id);
  await createPizzaFlavorWithPrices('Peri Peri', 'Special Peri Peri Sauce with K&Ns Chicken, Onion, Capsicum, Tomato', behariPeriPrices, catUrbanSpecialPizza.id);

  // --- URBAN STUFFER PIZZA (M: 1300, L: 1750, XL: 2500) ---
  const stufferPrices = { M: 1300, L: 1750, XL: 2500 };
  await createPizzaFlavorWithPrices('Cheese Stuffer', 'Heavy cheese stuffed crust pizza', stufferPrices, catUrbanStufferPizza.id);
  await createPizzaFlavorWithPrices('Chicken Cheese Stuffer', 'Chicken and cheese stuffed crust pizza', stufferPrices, catUrbanStufferPizza.id);
  await createPizzaFlavorWithPrices('Kabab Stuffer', 'Juicy kabab stuffed crust pizza', stufferPrices, catUrbanStufferPizza.id);

  // --- URBAN SQUARE PIZZA ---
  await createPizzaFlavorWithPrices('Square Regular', 'Regular urban square pizza', { M: 1300, L: 1750 }, catUrbanSquarePizza.id);
  await createPizzaFlavorWithPrices('Square Urban Special', 'Urban special sauce square pizza', { M: 1350, L: 1800 }, catUrbanSquarePizza.id);

  // --- SANDWICHES & BURGERS (All with Fries) ---
  const sandwichBurgers = [
    { name: 'Urban Special Sandwich (with Fries)', price: 800, sku: 'SAND-001' },
    { name: 'Grilled Sandwich (with Fries)', price: 900, sku: 'SAND-002' },
    { name: 'Malai Boti Sandwich (with Fries)', price: 800, sku: 'SAND-003' },
    { name: 'Crunchy Crunch Sandwich (with Fries)', price: 850, sku: 'SAND-004' },
    { name: 'Grilled Burger (with Fries)', price: 450, sku: 'BURG-001' },
    { name: 'Petty Burger (with Fries)', price: 300, sku: 'BURG-002' },
    { name: 'Urban Special Burger (with Fries)', price: 450, sku: 'BURG-003' },
    { name: 'Double Decker Burger (with Fries)', price: 800, sku: 'BURG-004' },
  ];

  for (const item of sandwichBurgers) {
    await prisma.product.create({
      data: {
        name: item.name,
        SKU: item.sku,
        categoryId: catSandwichesBurgers.id,
        basePrice: item.price,
        isPizza: false,
      },
    });
  }

  // --- PASTA ---
  const pastas = [
    { name: 'Urban Special Pasta (Half)', price: 450, sku: 'PAST-001' },
    { name: 'Urban Special Pasta (Full)', price: 750, sku: 'PAST-002' },
    { name: 'Crunchy Pasta (Full)', price: 850, sku: 'PAST-003' },
    { name: 'Creamy Pasta (Half)', price: 450, sku: 'PAST-004' },
    { name: 'Creamy Pasta (Full)', price: 750, sku: 'PAST-005' },
  ];

  for (const p of pastas) {
    await prisma.product.create({
      data: {
        name: p.name,
        SKU: p.sku,
        categoryId: catPasta.id,
        basePrice: p.price,
        isPizza: false,
      },
    });
  }

  // --- APPETIZERS ---
  const appetizers = [
    { name: 'Oven Baked Wings (6 Pcs)', price: 400, sku: 'WING-001' },
    { name: 'Oven Baked Wings (12 Pcs)', price: 750, sku: 'WING-002' },
    { name: 'Hot Wings (6 Pcs)', price: 400, sku: 'WING-003' },
    { name: 'Hot Wings (12 Pcs)', price: 750, sku: 'WING-004' },
    { name: 'Nuggets (6 Pcs)', price: 350, sku: 'NUGG-001' },
    { name: 'Nuggets (12 Pcs)', price: 650, sku: 'NUGG-002' },
    { name: 'Mayo Fries', price: 300, sku: 'FRIE-001' },
    { name: 'Loaded Fries', price: 800, sku: 'FRIE-002' },
    { name: 'Mayo Garlic Fries', price: 350, sku: 'FRIE-003' },
  ];

  for (const app of appetizers) {
    await prisma.product.create({
      data: {
        name: app.name,
        SKU: app.sku,
        categoryId: catAppetizers.id,
        basePrice: app.price,
        isPizza: false,
      },
    });
  }

  // --- SPIN ROLLS ---
  const spinRolls = [
    { name: 'Chicken Spin Roll (4Pcs)', price: 450, sku: 'ROLL-001' },
    { name: 'Behari Roll (4Pcs)', price: 450, sku: 'ROLL-002' },
    { name: 'Malai Boti Roll (4Pcs)', price: 450, sku: 'ROLL-003' },
    { name: 'Urban Special Spin Roll (4Pcs)', price: 450, sku: 'ROLL-004' },
  ];

  for (const r of spinRolls) {
    await prisma.product.create({
      data: {
        name: r.name,
        SKU: r.sku,
        categoryId: catSpinRolls.id,
        basePrice: r.price,
        isPizza: false,
      },
    });
  }

  // --- URBAN SPECIAL PLATTER ---
  await prisma.product.create({
    data: {
      name: 'Urban Special Platter',
      description: '4Pcs Spin Roll + 6Pcs Oven Baked Wings with Fries',
      SKU: 'PLAT-001',
      categoryId: catPlatter.id,
      basePrice: 850,
      isPizza: false,
    },
  });

  // --- BEVERAGES ---
  const beverages = [
    { name: 'Can 250ml', price: 120, sku: 'BEV-001' },
    { name: 'Bottle 500ml', price: 120, sku: 'BEV-002' },
    { name: 'Bottle 1 Ltr', price: 180, sku: 'BEV-003' },
    { name: 'Bottle 1.5 Ltr', price: 220, sku: 'BEV-004' },
    { name: 'Small Water', price: 70, sku: 'BEV-005' },
    { name: 'Large Water', price: 120, sku: 'BEV-006' },
  ];

  for (const b of beverages) {
    await prisma.product.create({
      data: {
        name: b.name,
        SKU: b.sku,
        categoryId: catBeverages.id,
        basePrice: b.price,
        isPizza: false,
      },
    });
  }

  // Audit Logs
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      userName: adminUser.name,
      action: 'SYSTEM_INITIALIZATION',
      details: 'Populated database with official Urban Spice Menu items and multi-size pizza prices.',
    },
  });

  console.log('Urban Spice official menu database initialization complete!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
