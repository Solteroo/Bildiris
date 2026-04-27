import { db, categoriesTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const CATEGORIES = [
  { slug: "ulaglar", nameTk: "Ulaglar", icon: "Car" },
  { slug: "gozgalmayan-emlak", nameTk: "Gozgalmaýan emläk", icon: "Home" },
  { slug: "elektronika", nameTk: "Elektronika", icon: "Smartphone" },
  { slug: "oy-uchin", nameTk: "Öý üçin", icon: "Sofa" },
  { slug: "esik", nameTk: "Eşik", icon: "Shirt" },
  { slug: "is", nameTk: "Iş", icon: "Briefcase" },
  { slug: "hyzmatlar", nameTk: "Hyzmatlar", icon: "Wrench" },
  { slug: "haywanlar", nameTk: "Haýwanlar", icon: "PawPrint" },
  { slug: "chagalar", nameTk: "Çagalar", icon: "Baby" },
  { slug: "sport", nameTk: "Sport we dynç alyş", icon: "Dumbbell" },
  { slug: "saz-gurallary", nameTk: "Saz gurallary", icon: "Music" },
  { slug: "kitaplar", nameTk: "Kitaplar", icon: "BookOpen" },
  { slug: "is-gurallary", nameTk: "Iş gurallary", icon: "Hammer" },
  { slug: "beylekiler", nameTk: "Beýlekiler", icon: "Package" },
];

async function main() {
  for (let i = 0; i < CATEGORIES.length; i++) {
    const c = CATEGORIES[i];
    await db
      .insert(categoriesTable)
      .values({ slug: c.slug, nameTk: c.nameTk, icon: c.icon, sortOrder: i })
      .onConflictDoUpdate({
        target: categoriesTable.slug,
        set: { nameTk: c.nameTk, icon: c.icon, sortOrder: i },
      });
  }
  console.log(`Seeded ${CATEGORIES.length} categories`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
