import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Urban Spice Pizza & Restaurant database...');

  // 1. Clean all existing data
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

  // 2. Store Settings (Urban Spice Branding from Menu)
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

  // 3. Default Users (Admin & Cashier)
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

  // 4. Sample Customers
  await prisma.customer.create({
    data: {
      name: 'Ali Raza',
      phone: '03001234567',
      whatsapp: '03001234567',
      email: 'ali.raza@example.com',
      address: 'House 12, Millat Town',
      city: 'Faisalabad',
      notes: 'Extra dip sauce',
    },
  });

  // 5. Create Categories from Menu
  const catUrbanSpecialPizza = await prisma.category.create({
    data: { name: 'Urban Special Pizza', slug: 'urban-special-pizza', description: 'Specialty K&Ns Chicken Pizzas', sortOrder: 1 },
  });
  const catUrbanPizza = await prisma.category.create({
    data: { name: 'Urban Pizza', slug: 'urban-pizza', description: 'Classic Regular Flavor Pizzas', sortOrder: 2 },
  });
  const catUrbanStufferPizza = await prisma.category.create({
    data: { name: 'Urban Stuffer Pizza', slug: 'urban-stuffer-pizza', description: 'Loaded Stuffed Crust Pizzas', sortOrder: 3 },
  });
  const catUrbanSquarePizza = await prisma.category.create({
    data: { name: 'Urban Square Pizza', slug: 'urban-square-pizza', description: 'Special Square Shaped Pizzas', sortOrder: 4 },
  });
  const catSpecialPlatter = await prisma.category.create({
    data: { name: 'Urban Special Platter', slug: 'urban-special-platter', description: 'Spin Roll + Oven Wings + Fries Combo', sortOrder: 5 },
  });
  const catSandwichesBurgers = await prisma.category.create({
    data: { name: 'Sandwiches & Burgers', slug: 'sandwiches-burgers', description: 'Handcrafted Burgers & Sandwiches with Fries', sortOrder: 6 },
  });
  const catPasta = await prisma.category.create({
    data: { name: 'Pasta', slug: 'pasta', description: 'Urban Special, Crunchy & Creamy Pastas', sortOrder: 7 },
  });
  const catAppetizers = await prisma.category.create({
    data: { name: 'Appetizers', slug: 'appetizers', description: 'Wings, Nuggets & Loaded Fries', sortOrder: 8 },
  });
  const catSpinRolls = await prisma.category.create({
    data: { name: 'Spin Rolls', slug: 'spin-rolls', description: 'Crispy 4Pcs Specialty Spin Rolls', sortOrder: 9 },
  });
  const catBeverages = await prisma.category.create({
    data: { name: 'Beverages', slug: 'beverages', description: 'Cold Drinks & Mineral Water', sortOrder: 10 },
  });
  const catExtraToppings = await prisma.category.create({
    data: { name: 'Extra Toppings', slug: 'extra-toppings', description: 'Extra Cheese, Dip Sauce & Add-ons', sortOrder: 11 },
  });

  // 6. Create Pizza Sizes matching Menu
  const sizeSmall = await prisma.pizzaSize.create({ data: { name: 'Small (7")', code: 'S', sortOrder: 1 } });
  const sizeMedium = await prisma.pizzaSize.create({ data: { name: 'Medium (10")', code: 'M', sortOrder: 2 } });
  const sizeLarge = await prisma.pizzaSize.create({ data: { name: 'Large (13")', code: 'L', sortOrder: 3 } });
  const sizeXLarge = await prisma.pizzaSize.create({ data: { name: 'X.Large (17")', code: 'XL', sortOrder: 4 } });

  // 7. Create Pizza Flavors & Set Size Prices

  // --- Urban Special Pizza Flavors ---
  const specialFlavors = [
    {
      name: 'URBAN SPECIAL',
      description: 'Urban Special Sauce with K&Ns Chicken, Olives, Capsicum, Tomato, Mushroom, Sweet Corn',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80',
      prices: { [sizeSmall.id]: 500, [sizeMedium.id]: 1000, [sizeLarge.id]: 1450, [sizeXLarge.id]: 2200 },
    },
    {
      name: 'MALAI BOTI',
      description: 'White Sauce with K&Ns Malai Boti Chicken, Onion, Capsicum, Tomato, Olives, Jelapino, Sweet Corn',
      image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&q=80',
      prices: { [sizeSmall.id]: 500, [sizeMedium.id]: 1000, [sizeLarge.id]: 1450, [sizeXLarge.id]: 2200 },
    },
    {
      name: 'BEHARI KEBAB',
      description: 'Special Behari Kebab with onions, capsicum, and melted cheese',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80',
      prices: { [sizeMedium.id]: 1100, [sizeLarge.id]: 1600, [sizeXLarge.id]: 2350 },
    },
    {
      name: 'PERI PERI',
      description: 'Special Peri Peri Sauce with K&Ns Chicken, Onion, Capsicum, Tomato',
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&q=80',
      prices: { [sizeSmall.id]: 500, [sizeMedium.id]: 1000, [sizeLarge.id]: 1450, [sizeXLarge.id]: 2200 },
    },
  ];

  // --- Urban Pizza (Regular) Flavors ---
  const regularFlavors = [
    'CHICKEN TIKKA',
    'CHICKEN FAJITA',
    'CHICKEN SUPREME',
    'CHICKEN FAJITA SICILIAN',
    'CHEESE LOVER',
    'VEGGIE LOVER',
  ].map((name, index) => ({
    name,
    description: `${name} pizza with premium mozzarella and fresh toppings`,
    image: `https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500&q=80`,
    prices: { [sizeSmall.id]: 500, [sizeMedium.id]: 950, [sizeLarge.id]: 1400, [sizeXLarge.id]: 2150 },
  }));

  // --- Urban Stuffer Pizza Flavors ---
  const stufferFlavors = [
    { name: 'CHEESE STUFFER', description: 'Loaded cheese stuffed crust pizza' },
    { name: 'CHICKEN CHEESE STUFFER', description: 'Chicken and cheese stuffed crust pizza' },
    { name: 'KABAB STUFFER', description: 'Special Kabab stuffed crust pizza' },
  ].map((item) => ({
    name: item.name,
    description: item.description,
    image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=500&q=80',
    prices: { [sizeMedium.id]: 1300, [sizeLarge.id]: 1750, [sizeXLarge.id]: 2500 },
  }));

  // --- Urban Square Pizza Flavors ---
  const squareFlavors = [
    {
      name: 'URBAN SQUARE REGULAR',
      description: 'Square shaped regular pizza',
      image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=500&q=80',
      prices: { [sizeMedium.id]: 1300, [sizeLarge.id]: 1750 },
    },
    {
      name: 'URBAN SQUARE SPECIAL',
      description: 'Square shaped special loaded pizza',
      image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&q=80',
      prices: { [sizeMedium.id]: 1350, [sizeLarge.id]: 1800 },
    },
  ];

  const allFlavors = [...specialFlavors, ...regularFlavors, ...stufferFlavors, ...squareFlavors];

  let flavorSort = 1;
  for (const f of allFlavors) {
    const createdFlavor = await prisma.pizzaFlavor.create({
      data: {
        name: f.name,
        description: f.description,
        image: f.image,
        sortOrder: flavorSort++,
      },
    });

    for (const [sizeId, price] of Object.entries(f.prices)) {
      await prisma.pizzaFlavorPrice.create({
        data: {
          flavorId: createdFlavor.id,
          sizeId,
          price,
        },
      });
    }
  }

  // Base Pizza Product for POS selector
  await prisma.product.create({
    data: {
      name: 'Urban Custom Pizza',
      SKU: 'PZ-URBAN-001',
      description: 'Customizable pizza with selected size, flavor, crust & toppings',
      categoryId: catUrbanPizza.id,
      basePrice: 500,
      costPrice: 250,
      stock: 999,
      minStock: 50,
      isPizza: true,
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80',
    },
  });

  // 8. Crust Options
  await prisma.crust.create({ data: { name: 'Regular Crust', additionalPrice: 0 } });
  await prisma.crust.create({ data: { name: 'Cheese Stuffed Crust', additionalPrice: 250 } });
  await prisma.crust.create({ data: { name: 'Thin Crust', additionalPrice: 50 } });
  await prisma.crust.create({ data: { name: 'Double Cheese Crust', additionalPrice: 300 } });

  // 9. Extra Toppings & Dips (Topping inventory)
  await prisma.topping.create({ data: { name: 'Extra Topping Small', additionalPrice: 70, stock: 500 } });
  await prisma.topping.create({ data: { name: 'Extra Topping Medium', additionalPrice: 150, stock: 500 } });
  await prisma.topping.create({ data: { name: 'Extra Topping Large', additionalPrice: 200, stock: 500 } });
  await prisma.topping.create({ data: { name: 'Extra Topping X.Large', additionalPrice: 250, stock: 500 } });
  await prisma.topping.create({ data: { name: 'Dip Sauce', additionalPrice: 60, stock: 1000 } });

  // 10. Non-Pizza Products List (Matching Urban Spice Menu)
  const menuProducts = [
    // URBAN SPECIAL PLATTER
    { name: 'URBAN SPECIAL PLATTER', SKU: 'PLT-001', categoryId: catSpecialPlatter.id, basePrice: 850, costPrice: 450, stock: 50, minStock: 5, description: '4Pcs Spin Roll + 6Pcs Oven Baked Wings with Fries', isPizza: false, image: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?w=500&q=80' },

    // SANDWICHES & BURGERS
    { name: 'URBAN SPECIAL SANDWICH (WITH FRIES)', SKU: 'SND-001', categoryId: catSandwichesBurgers.id, basePrice: 800, costPrice: 400, stock: 40, minStock: 5, isPizza: false, image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&q=80' },
    { name: 'GRILLED SANDWICH (WITH FRIES)', SKU: 'SND-002', categoryId: catSandwichesBurgers.id, basePrice: 900, costPrice: 450, stock: 40, minStock: 5, isPizza: false, image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&q=80' },
    { name: 'MALAI BOTI SANDWICH (WITH FRIES)', SKU: 'SND-003', categoryId: catSandwichesBurgers.id, basePrice: 800, costPrice: 400, stock: 40, minStock: 5, isPizza: false, image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&q=80' },
    { name: 'CRUNCHY CRUNCH SANDWICH (WITH FRIES)', SKU: 'SND-004', categoryId: catSandwichesBurgers.id, basePrice: 850, costPrice: 420, stock: 40, minStock: 5, isPizza: false, image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&q=80' },
    { name: 'GRILLED BURGER (WITH FRIES)', SKU: 'BRG-001', categoryId: catSandwichesBurgers.id, basePrice: 450, costPrice: 220, stock: 50, minStock: 10, isPizza: false, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80' },
    { name: 'PETTY BURGER (WITH FRIES)', SKU: 'BRG-002', categoryId: catSandwichesBurgers.id, basePrice: 300, costPrice: 150, stock: 50, minStock: 10, isPizza: false, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80' },
    { name: 'URBAN SPECIAL BURGER (WITH FRIES)', SKU: 'BRG-003', categoryId: catSandwichesBurgers.id, basePrice: 450, costPrice: 220, stock: 50, minStock: 10, isPizza: false, image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&q=80' },
    { name: 'DOUBLE DECKER BURGER (WITH FRIES)', SKU: 'BRG-004', categoryId: catSandwichesBurgers.id, basePrice: 800, costPrice: 400, stock: 30, minStock: 5, isPizza: false, image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&q=80' },

    // PASTA
    { name: 'URBAN SPECIAL PASTA (HALF)', SKU: 'PST-001', categoryId: catPasta.id, basePrice: 450, costPrice: 220, stock: 30, minStock: 5, isPizza: false, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=80' },
    { name: 'URBAN SPECIAL PASTA (FULL)', SKU: 'PST-002', categoryId: catPasta.id, basePrice: 750, costPrice: 380, stock: 30, minStock: 5, isPizza: false, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=80' },
    { name: 'CRUNCHY PASTA (FULL)', SKU: 'PST-003', categoryId: catPasta.id, basePrice: 850, costPrice: 420, stock: 30, minStock: 5, isPizza: false, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=80' },
    { name: 'CREAMY PASTA (HALF)', SKU: 'PST-004', categoryId: catPasta.id, basePrice: 450, costPrice: 220, stock: 30, minStock: 5, isPizza: false, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=80' },
    { name: 'CREAMY PASTA (FULL)', SKU: 'PST-005', categoryId: catPasta.id, basePrice: 750, costPrice: 380, stock: 30, minStock: 5, isPizza: false, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=80' },

    // APPETIZERS
    { name: 'OVEN BAKED WINGS (6 PCS)', SKU: 'APP-001', categoryId: catAppetizers.id, basePrice: 400, costPrice: 200, stock: 60, minStock: 10, isPizza: false, image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500&q=80' },
    { name: 'OVEN BAKED WINGS (12 PCS)', SKU: 'APP-002', categoryId: catAppetizers.id, basePrice: 750, costPrice: 380, stock: 60, minStock: 10, isPizza: false, image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500&q=80' },
    { name: 'HOT WINGS (6 PCS)', SKU: 'APP-003', categoryId: catAppetizers.id, basePrice: 400, costPrice: 200, stock: 60, minStock: 10, isPizza: false, image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500&q=80' },
    { name: 'HOT WINGS (12 PCS)', SKU: 'APP-004', categoryId: catAppetizers.id, basePrice: 750, costPrice: 380, stock: 60, minStock: 10, isPizza: false, image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500&q=80' },
    { name: 'NUGGETS (6 PCS)', SKU: 'APP-005', categoryId: catAppetizers.id, basePrice: 350, costPrice: 170, stock: 80, minStock: 15, isPizza: false, image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=500&q=80' },
    { name: 'NUGGETS (12 PCS)', SKU: 'APP-006', categoryId: catAppetizers.id, basePrice: 650, costPrice: 320, stock: 80, minStock: 15, isPizza: false, image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=500&q=80' },
    { name: 'MAYO FRIES', SKU: 'APP-007', categoryId: catAppetizers.id, basePrice: 300, costPrice: 140, stock: 100, minStock: 20, isPizza: false, image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=500&q=80' },
    { name: 'LOADED FRIES', SKU: 'APP-008', categoryId: catAppetizers.id, basePrice: 800, costPrice: 400, stock: 50, minStock: 10, isPizza: false, image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=500&q=80' },
    { name: 'MAYO GARLIC FRIES', SKU: 'APP-009', categoryId: catAppetizers.id, basePrice: 350, costPrice: 160, stock: 80, minStock: 15, isPizza: false, image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=500&q=80' },

    // SPIN ROLLS
    { name: 'CHICKEN SPIN ROLL (4PCS)', SKU: 'ROL-001', categoryId: catSpinRolls.id, basePrice: 450, costPrice: 220, stock: 50, minStock: 10, isPizza: false, image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&q=80' },
    { name: 'BEHARI ROLL (4PCS)', SKU: 'ROL-002', categoryId: catSpinRolls.id, basePrice: 450, costPrice: 220, stock: 50, minStock: 10, isPizza: false, image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&q=80' },
    { name: 'MALAI BOTI ROLL (4PCS)', SKU: 'ROL-003', categoryId: catSpinRolls.id, basePrice: 450, costPrice: 220, stock: 50, minStock: 10, isPizza: false, image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&q=80' },
    { name: 'URBAN SPECIAL SPIN ROLL (4PCS)', SKU: 'ROL-004', categoryId: catSpinRolls.id, basePrice: 450, costPrice: 220, stock: 50, minStock: 10, isPizza: false, image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&q=80' },

    // BEVERAGES
    { name: 'CAN 250ML', SKU: 'DRK-001', categoryId: catBeverages.id, basePrice: 120, costPrice: 80, stock: 100, minStock: 20, isPizza: false, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80' },
    { name: 'BOTTLE 500ML', SKU: 'DRK-002', categoryId: catBeverages.id, basePrice: 120, costPrice: 85, stock: 100, minStock: 20, isPizza: false, image: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=500&q=80' },
    { name: 'BOTTLE 1 LTR', SKU: 'DRK-003', categoryId: catBeverages.id, basePrice: 180, costPrice: 130, stock: 80, minStock: 15, isPizza: false, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80' },
    { name: 'BOTTLE 1.5 LTR', SKU: 'DRK-004', categoryId: catBeverages.id, basePrice: 220, costPrice: 160, stock: 80, minStock: 15, isPizza: false, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80' },
    { name: 'SMALL WATER', SKU: 'DRK-005', categoryId: catBeverages.id, basePrice: 70, costPrice: 40, stock: 150, minStock: 30, isPizza: false, image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=500&q=80' },
    { name: 'LARGE WATER', SKU: 'DRK-006', categoryId: catBeverages.id, basePrice: 120, costPrice: 70, stock: 100, minStock: 20, isPizza: false, image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=500&q=80' },

    // EXTRA TOPPINGS & DIPS
    { name: 'EXTRA TOPPING SMALL', SKU: 'EXT-001', categoryId: catExtraToppings.id, basePrice: 70, costPrice: 35, stock: 500, minStock: 50, isPizza: false, image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500&q=80' },
    { name: 'EXTRA TOPPING MEDIUM', SKU: 'EXT-002', categoryId: catExtraToppings.id, basePrice: 150, costPrice: 70, stock: 500, minStock: 50, isPizza: false, image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500&q=80' },
    { name: 'EXTRA TOPPING LARGE', SKU: 'EXT-003', categoryId: catExtraToppings.id, basePrice: 200, costPrice: 100, stock: 500, minStock: 50, isPizza: false, image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500&q=80' },
    { name: 'EXTRA TOPPING X.LARGE', SKU: 'EXT-004', categoryId: catExtraToppings.id, basePrice: 250, costPrice: 120, stock: 500, minStock: 50, isPizza: false, image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500&q=80' },
    { name: 'DIP SAUCE', SKU: 'EXT-005', categoryId: catExtraToppings.id, basePrice: 60, costPrice: 25, stock: 1000, minStock: 100, isPizza: false, image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=500&q=80' },
  ];

  for (const item of menuProducts) {
    await prisma.product.create({ data: item });
  }

  // 11. Initial Raw Materials Inventory
  const rawMaterials = [
    { name: 'Pizza Flour (K&Ns grade)', SKU: 'INV-FLR-01', unit: 'kg', currentStock: 200.0, minStock: 40.0, costPerUnit: 190, supplier: 'Master Flour Mills' },
    { name: 'Mozzarella Cheese Blend', SKU: 'INV-CHS-01', unit: 'kg', currentStock: 100.0, minStock: 20.0, costPerUnit: 1250, supplier: 'Adams Foods' },
    { name: 'Urban Special Sauce', SKU: 'INV-AUC-01', unit: 'l', currentStock: 80.0, minStock: 15.0, costPerUnit: 500, supplier: 'In-house Prep' },
    { name: 'K&Ns Chicken Chunks', SKU: 'INV-CHK-01', unit: 'kg', currentStock: 100.0, minStock: 20.0, costPerUnit: 900, supplier: 'K&Ns Foods' },
    { name: 'Fries & Frozen Potato', SKU: 'INV-FRS-01', unit: 'kg', currentStock: 150.0, minStock: 30.0, costPerUnit: 300, supplier: 'Farm Fresh' },
  ];

  for (const item of rawMaterials) {
    const inv = await prisma.inventoryItem.create({ data: item });
    await prisma.inventoryTransaction.create({
      data: {
        inventoryItemId: inv.id,
        type: 'ADD',
        quantity: inv.currentStock,
        notes: 'Initial Urban Spice Menu Seeding',
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
      details: 'Urban Spice database populated with exact menu items, sizes, prices, and categories.',
    },
  });

  console.log('Urban Spice database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
