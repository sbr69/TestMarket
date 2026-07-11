import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const imageUpdates: Record<string, string> = {
  'Camping Tent 4-Person': 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=800&q=80',
  'Cycling Helmet Aerodynamic': 'https://images.unsplash.com/photo-1590487988256-9ed24133863e?w=800&q=80',
  'Vitamin C Serum': 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800&q=80',
  'Nintendo Switch OLED': 'https://images.unsplash.com/photo-1578306869408-da9204fb5b45?w=800&q=80',
  'Dune': 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800&q=80',
  'The Great Gatsby': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80',
  'Non-Stick Cookware Set 10-Piece': 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&q=80',
  'Set of 4 Wine Glasses': 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80',
  'Electric Kettle 1.7L': 'https://images.unsplash.com/photo-1594222080274-3a5ddca998b2?w=800&q=80',
  'Cast Iron Skillet 12-Inch': 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=800&q=80',
  'Bamboo Cutting Board': 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=800&q=80',
  'Eyeshadow Palette 18 Colors': 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=800&q=80',
  'Volumizing Mascara': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80',
  'Rosewater Facial Toner': 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=800&q=80',
  'SPF 50 Sunscreen Lotion': 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80',
  'Exfoliating Body Scrub': 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=800&q=80',
  'Board Game Strategy': 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffaed?w=800&q=80',
  'Dollhouse with Furniture': 'https://images.unsplash.com/photo-1558066551-7890f545a0de?w=800&q=80',
  'Water Gun Super Soaker': 'https://images.unsplash.com/photo-1533512396116-2b47f48b1115?w=800&q=80',
  'To Kill a Mockingbird': 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800&q=80',
  'Organic Honey 500g': 'https://images.unsplash.com/photo-1587049352847-4d45548ce4fb?w=800&q=80',
  'Extra Virgin Olive Oil 1L': 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=800&q=80',
  'Almond Butter 16oz': 'https://images.unsplash.com/photo-1595122245592-26627f371813?w=800&q=80',
  'Himalayan Pink Salt 1lb': 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=800&q=80',
  'GoPro HERO11 Black': 'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=800&q=80',
  'Maple Syrup Grade A 32oz': 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=800&q=80',
  "Men's Oxford Button-Down Shirt": 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80',
  'Ceramic Pour-Over Coffee Maker': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
  'Foam Roller for Muscle Massage': 'https://images.unsplash.com/photo-1600881333168-2ef49b341f30?w=800&q=80',
  'Jump Rope with Counter': 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80',
  'Electric Train Set': 'https://images.unsplash.com/photo-1515488042361-404e9250afef?w=800&q=80'
};

async function main() {
  console.log('Starting product image patch...');

  // 1. Update active Database
  for (const [name, url] of Object.entries(imageUpdates)) {
    const product = await prisma.product.findFirst({
      where: { name: name }
    });

    if (product) {
      // Find the first image or update all images for this product
      const imageCount = await prisma.productImage.count({
        where: { productId: product.id }
      });

      if (imageCount > 0) {
        await prisma.productImage.updateMany({
          where: { productId: product.id },
          data: { url: url }
        });
        console.log(`Updated database image for product: "${name}"`);
      } else {
        await prisma.productImage.create({
          data: {
            productId: product.id,
            url: url,
            sortOrder: 0
          }
        });
        console.log(`Created database image for product: "${name}"`);
      }
    } else {
      console.warn(`Product not found in DB: "${name}"`);
    }
  }

  // 2. Update prisma/seed.ts
  const seedPath = path.join('prisma', 'seed.ts');
  if (fs.existsSync(seedPath)) {
    let seedContent = fs.readFileSync(seedPath, 'utf8');
    let replacedCount = 0;

    for (const [name, url] of Object.entries(imageUpdates)) {
      // We search for the product definition block in seed.ts:
      // name: `PRODUCT_NAME`,
      // or name: 'PRODUCT_NAME',
      // followed by other fields and images: { create: [{ url: 'OLD_URL', ... }] }
      
      // Let's escape names for regex
      const escapedName = name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      
      // Match the block with name: [escapedName] and capture the url value
      // Regex matches `name: \`Name\`, ... images: { create: [{ url: 'URL'`
      const regexStr = `name:\\s*[\`']${escapedName}[\`'],[\\s\\S]*?url:\\s*['\`](\\S+?)['\`]`;
      const regex = new RegExp(regexStr, 'g');

      if (regex.test(seedContent)) {
        seedContent = seedContent.replace(regex, (match, oldUrl) => {
          // Replace only the oldUrl within match
          replacedCount++;
          return match.replace(oldUrl, url);
        });
      }
    }

    fs.writeFileSync(seedPath, seedContent, 'utf8');
    console.log(`Successfully updated ${replacedCount} image references in prisma/seed.ts`);
  } else {
    console.warn(`prisma/seed.ts not found at: ${seedPath}`);
  }

  console.log('Product image patch completed!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
