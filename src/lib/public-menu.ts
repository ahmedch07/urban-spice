import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { MenuData } from "@/components/landing/types";

export const getPublicMenu = unstable_cache(
  async (): Promise<MenuData> => {
    const [categories, products, flavors, sizes, crusts, toppings, settings] =
      await Promise.all([
        prisma.category.findMany({
          where: { active: true },
          select: { id: true, name: true, slug: true, sortOrder: true },
          orderBy: { sortOrder: "asc" },
        }),
        prisma.product.findMany({
          where: {
            active: true,
            stock: { gt: 0 },
            category: { active: true },
          },
          select: {
            id: true,
            name: true,
            basePrice: true,
            description: true,
            image: true,
            isPizza: true,
            categoryId: true,
            category: { select: { name: true } },
          },
          orderBy: { name: "asc" },
        }),
        prisma.pizzaFlavor.findMany({
          where: { active: true },
          select: {
            id: true,
            name: true,
            flavorPrices: { select: { sizeId: true, price: true } },
          },
          orderBy: { sortOrder: "asc" },
        }),
        prisma.pizzaSize.findMany({
          select: { id: true, name: true },
          orderBy: { sortOrder: "asc" },
        }),
        prisma.crust.findMany({
          where: { active: true },
          select: { id: true, name: true, additionalPrice: true },
          orderBy: { name: "asc" },
        }),
        prisma.topping.findMany({
          where: { active: true, stock: { gt: 0 } },
          select: { id: true, name: true, additionalPrice: true },
          orderBy: { name: "asc" },
        }),
        prisma.storeSetting.findMany({
          where: {
            key: {
              in: ["storeName", "storeLogo", "defaultDeliveryFee", "storePhone"],
            },
          },
          select: { key: true, value: true },
        }),
      ]);

    return {
      categories,
      products,
      flavors,
      sizes,
      crusts,
      toppings,
      settings: Object.fromEntries(settings.map((setting) => [setting.key, setting.value])),
    };
  },
  ["public-menu"],
  { revalidate: 60, tags: ["public-menu"] },
);
