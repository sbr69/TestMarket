import fs from 'fs';

const categories = [
  { name: 'Electronics', slug: 'electronics', iconUrl: 'Monitor' },
  { name: 'Grocery', slug: 'grocery', iconUrl: 'ShoppingBasket' },
  { name: 'Books', slug: 'books', iconUrl: 'Book' },
  { name: 'Fashion', slug: 'fashion', iconUrl: 'Shirt' },
  { name: 'Home & Kitchen', slug: 'home-kitchen', iconUrl: 'Home' },
  { name: 'Sports', slug: 'sports', iconUrl: 'Dumbbell' },
  { name: 'Beauty', slug: 'beauty', iconUrl: 'Sparkles' },
  { name: 'Toys', slug: 'toys', iconUrl: 'Gamepad2' },
];

const imagePool = {
  electronics: [
    '1498049794561-7780e7231661', '1505740420928-5e560c06d30e', '1526406915894-7bcd65f60845',
    '1546868871-7041f2a55e12', '1593642632823-8f785ba67e45', '1583394838336-acd977736f90',
    '1585060544812-6b45742d762f', '1611186871340-1b26bc6d2a45'
  ],
  grocery: [
    '1583258292688-d0213dc5a3a8', '1542838132-92c53300491e', '1608686207856-001b95cf60ca',
    '1574316074128-d89006de81fc', '1621245648508-0129037c6883', '1586201375761-83865001e31c',
    '1587049352847-4d45548ce4fb', '1550547660-d9450f859349'
  ],
  books: [
    '1544947950-fa07a98d237f', '1512820790803-83ca734da794', '1589829085413-56de8ae18c73',
    '1495446815901-a7297e633e8d', '1511108690759-001662ef4f1f', '1524578974084-c1acb98683cd'
  ],
  fashion: [
    '1434389678278-be4d41aa1d40', '1521572163474-6864f9cf17ab', '1515886657613-9f3515b0c78f',
    '1489987707023-af6f0e4b868e', '1529374255404-311a2a4f1fd9', '1485230895920-ee9ac3c8d132'
  ],
  'home-kitchen': [
    '1556910103-1c02745aae4d', '1584285458399-6f98c894fb21', '1581622558667-3419a8dc5f83',
    '1578683010236-d716f9a3f461', '1556911220-e15b29be8c8f', '1556912172-45b7eedd91fb'
  ],
  sports: [
    '1517836357463-d25dfeac3438', '1526506443360-ffdf2032069b', '1541534741688-6078c6bfb5c5',
    '1517649763962-0c623066013b', '1534438327276-14e5300c3a48', '1571019614242-c5c5dee9f50b'
  ],
  beauty: [
    '1596462502278-27bf85033e5a', '1617897903246-719242758050', '1556228578-0d85b1a4d571',
    '1571781926291-c477ebfd024b', '1599305090598-fe179d501227', '1611078449458-47963d7e828e'
  ],
  toys: [
    '1596461404969-9ae70f2830c1', '1566576912321-d58ddd7a6088', '1558066110-bf9b53164a66',
    '1611604548018-d56bbd85d681', '1585366119957-77ec9c7f66a2', '1605634599723-5e36928e0a6d'
  ]
};

const products = [];

const getImages = (cat, count = 4) => {
  const pool = imagePool[cat];
  const shuffled = pool.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map(id => `https://images.unsplash.com/photo-${id}?w=800&q=80`);
};

// 1. Electronics (20)
const electronicsNames = [
  "Acer Nitro 5 Gaming Laptop 15.6 inch", "boAt Airdopes 141 Bluetooth Earbuds", "Redmi Note 13 Pro 5G 128GB Midnight Black",
  "Apple iPhone 15 Pro Max 256GB Natural Titanium", "Samsung Galaxy S24 Ultra AI Smartphone", "Sony WH-1000XM5 Noise Canceling Headphones",
  "Dell XPS 13 Plus Touchscreen Laptop", "HP Pavilion 14 Core i5 12th Gen", "Lenovo Legion 5 Pro AMD Ryzen 7",
  "Asus ROG Strix G15 Gaming Laptop", "Apple MacBook Air M3 Chip 15-inch", "OnePlus 12 5G 256GB Flowy Emerald",
  "Samsung 55 inch 4K Smart Neo QLED TV", "LG 65 inch OLED Evo C3 4K Smart TV", "Sony PlayStation 5 Console 825GB",
  "Xbox Series X 1TB Console Black", "Logitech MX Master 3S Wireless Mouse", "Keychron K2 V2 Mechanical Keyboard",
  "Apple Watch Series 9 GPS 45mm", "Samsung Galaxy Watch 6 Classic"
];

const brandsMap = {
  "Acer Nitro 5": "Acer", "boAt Airdopes": "boAt", "Redmi Note 13": "Redmi", "Apple": "Apple",
  "Samsung": "Samsung", "Sony": "Sony", "Dell": "Dell", "HP": "HP", "Lenovo": "Lenovo",
  "Asus": "Asus", "OnePlus": "OnePlus", "LG": "LG", "Xbox": "Microsoft", "Logitech": "Logitech", "Keychron": "Keychron"
};

electronicsNames.forEach(name => {
  let brand = Object.keys(brandsMap).find(k => name.includes(k)) || "Generic";
  brand = brandsMap[brand] || brand;
  products.push({
    name, brand, category: 'electronics',
    desc: `Experience the pinnacle of technology with the ${name}. Engineered for peak performance, this device seamlessly integrates into your daily life. Whether you're working on intensive tasks, enjoying immersive entertainment, or staying connected with loved ones, it delivers exceptional speed, clarity, and reliability. Featuring a sleek, modern design that looks as good as it performs, and packed with advanced features that anticipate your needs.`,
    mrp: Math.floor(Math.random() * 2000) + 100,
    images: getImages('electronics', 4),
    specs: [ { key: 'Brand', value: brand }, { key: 'Model', value: '2024 Edition' }, { key: 'Warranty', value: '1 Year Manufacturer Warranty' }, { key: 'Color', value: 'Black' } ]
  });
});

// 2. Grocery (20)
const groceryNames = [
  "India Gate Classic Basmati Rice 5kg", "Tata Salt Lite Low Sodium 1kg", "Aashirvaad Whole Wheat Atta 10kg",
  "Fortune Sunlite Refined Sunflower Oil 5L", "Maggi 2-Minute Noodles Masala 12-Pack", "Nestle Everyday Dairy Whitener 1kg",
  "Britannia Good Day Cashew Cookies 600g", "Amul Pure Ghee 1L Pouch", "Patanjali Cow Ghee 1L",
  "Haldiram's Bhujia Sev 1kg", "Lipton Yellow Label Tea 500g", "Brooke Bond Red Label Tea 1kg",
  "Nescafe Classic Instant Coffee 200g", "Bru Gold Instant Coffee 100g", "Kellogg's Corn Flakes Original 875g",
  "Quaker Oats Multigrain 1.5kg", "Saffola Gold Blended Edible Oil 5L", "Dabur Honey 1kg",
  "Catch Garam Masala Powder 100g", "Everest Chicken Masala 100g"
];

groceryNames.forEach(name => {
  let brand = name.split(' ')[0];
  products.push({
    name, brand, category: 'grocery',
    desc: `Stock up your pantry with ${name}. Made from carefully selected ingredients, ensuring the highest quality and taste for your family. This essential grocery item is perfect for everyday cooking and brings authentic flavors to your meals. Packaged hygienically to retain freshness and nutritional value for longer.`,
    mrp: Math.floor(Math.random() * 30) + 2,
    images: getImages('grocery', 4),
    specs: [ { key: 'Brand', value: brand }, { key: 'Type', value: 'Vegetarian' }, { key: 'Shelf Life', value: '12 Months' }, { key: 'Packaging', value: 'Sealed Pack' } ]
  });
});

// 3. Books (15)
const bookNames = [
  "Atomic Habits by James Clear", "NCERT Mathematics Class 12", "The Psychology of Money by Morgan Housel",
  "Ikigai: The Japanese Secret to a Long and Happy Life", "Rich Dad Poor Dad by Robert Kiyosaki",
  "Sapiens: A Brief History of Humankind", "The Alchemist by Paulo Coelho", "Thinking, Fast and Slow",
  "Do Epic Shit by Ankur Warikoo", "Deep Work by Cal Newport", "The Power of Your Subconscious Mind",
  "Word Power Made Easy by Norman Lewis", "Concept of Physics by H.C. Verma", "Indian Polity by M. Laxmikanth",
  "Harry Potter and the Philosopher's Stone"
];

bookNames.forEach(name => {
  products.push({
    name, brand: "Penguin", category: 'books',
    desc: `Dive into the pages of ${name}. This compelling read has captivated audiences worldwide with its profound insights and engaging narrative. Whether you're looking to expand your knowledge, master a new skill, or simply escape into a beautifully crafted world, this book offers an unforgettable experience. A must-have addition to any avid reader's bookshelf.`,
    mrp: Math.floor(Math.random() * 40) + 10,
    images: getImages('books', 4),
    specs: [ { key: 'Format', value: 'Paperback' }, { key: 'Language', value: 'English' }, { key: 'Publisher', value: 'Random House' }, { key: 'Pages', value: '300+' } ]
  });
});

// 4. Fashion (20)
const fashionNames = [
  "Levi's 511 Slim Fit Jeans Men", "Biba Women Floral Printed Kurti", "Nike Air Max 270 Running Shoes",
  "Puma Smash v2 Leather Sneakers", "Adidas Core 18 Presentation Jacket", "Zara Men's Essential Basic T-Shirt",
  "H&M Women's Oversized Cotton Shirt", "FabIndia Men's Cotton Solid Kurta", "Raymond Formal Tailored Fit Suit",
  "Allen Solly Men's Polo Neck T-Shirt", "Bata Comfit Women's Sandals", "Woodland Men's Leather Trekking Shoes",
  "Fastrack Reflex 3.0 Smart Band", "Casio G-Shock Analog-Digital Watch", "Titan Neo Men's Leather Watch",
  "Fossil Gen 6 Smartwatch", "Vera Moda Women's A-Line Dress", "W for Woman Straight Kurta",
  "U.S. Polo Assn. Men's Chino Pants", "Tommy Hilfiger Men's Wallet"
];

fashionNames.forEach(name => {
  let brand = name.split(' ')[0];
  if(name.includes('U.S. Polo')) brand = 'U.S. Polo Assn.';
  products.push({
    name, brand, category: 'fashion',
    desc: `Elevate your style with the ${name}. Crafted from premium materials, it offers unmatched comfort without compromising on aesthetics. The contemporary design features precise detailing and a flattering fit, making it versatile enough for both casual outings and special occasions. Make a statement and step out in confidence.`,
    mrp: Math.floor(Math.random() * 150) + 15,
    images: getImages('fashion', 4),
    specs: [ { key: 'Brand', value: brand }, { key: 'Material', value: 'Premium Blend' }, { key: 'Care', value: 'Machine Wash' }, { key: 'Fit', value: 'Regular' } ]
  });
});

// 5. Home and Kitchen (15)
const homeNames = [
  "Prestige Aluminium Pressure Cooker 5L", "Amazon Basics Microfibre Bedsheet Set", "Pigeon by Stovekraft Induction Cooktop",
  "Milton Thermosteel Hot and Cold Flask 1L", "Bombay Dyeing Cotton Double Bedsheet", "Philips 1000W Dry Iron",
  "Bajaj 17L Microwave Oven", "Usha Room Heater 2000W", "Cello Opalware Dinner Set 33 Pieces",
  "Hawkins Contura Hard Anodised Cooker", "Wakefit Orthopedic Memory Foam Mattress", "Solimo Water Resistant Mattress Protector",
  "Home Centre Wooden Coffee Table", "Wipro 9W LED Smart Bulb", "Eureka Forbes Aquaguard Water Purifier"
];

homeNames.forEach(name => {
  let brand = name.split(' ')[0];
  products.push({
    name, brand, category: 'home-kitchen',
    desc: `Upgrade your living space with the ${name}. Designed to bring convenience and style to your home, this product combines durable construction with elegant aesthetics. It seamlessly blends into modern interiors while providing reliable everyday functionality. Experience the perfect harmony of utility and design.`,
    mrp: Math.floor(Math.random() * 200) + 20,
    images: getImages('home-kitchen', 4),
    specs: [ { key: 'Brand', value: brand }, { key: 'Material', value: 'Durable Construction' }, { key: 'Warranty', value: '1 Year' }, { key: 'Usage', value: 'Everyday' } ]
  });
});

// 6. Sports (10)
const sportsNames = [
  "SG Sunny Tonny Cricket Bat Size 6", "Boldfit Pro Gym Gloves", "Yonex Muscle Power 29 Badminton Racket",
  "Nivia Storm Football Size 5", "Cosco Light Tennis Ball Pack of 6", "Decathlon Kipsta Football Boots",
  "Nivia Pro Weight Lifting Belt", "Strauss Anti-Skid Yoga Mat 6mm", "Adidas Core Skipping Rope",
  "Kore PVC 10kg Home Gym Set"
];

sportsNames.forEach(name => {
  let brand = name.split(' ')[0];
  products.push({
    name, brand, category: 'sports',
    desc: `Achieve your fitness goals with the ${name}. Engineered for athletes and fitness enthusiasts, it delivers superior performance and durability. Whether you're training professionally or staying active at home, this equipment provides the reliability and comfort you need to push your limits.`,
    mrp: Math.floor(Math.random() * 100) + 10,
    images: getImages('sports', 4),
    specs: [ { key: 'Brand', value: brand }, { key: 'Sport', value: 'General Fitness' }, { key: 'Material', value: 'High Quality' }, { key: 'Skill Level', value: 'All Levels' } ]
  });
});

// 7. Beauty (10)
const beautyNames = [
  "Minimalist 10% Niacinamide Face Serum 30ml", "Mamaearth Onion Hair Oil 250ml", "Plum Green Tea Pore Cleansing Face Wash",
  "L'Oreal Paris Revitalift Hyaluronic Acid Serum", "Maybelline New York Fit Me Matte Foundation", "Lakme Sun Expert SPF 50 Sunscreen",
  "Nykaa Matte to Last Liquid Lipstick", "Biotique Bio Papaya Revitalizing Tan Removal Scrub", "Himalaya Purifying Neem Face Wash",
  "Dove Hair Fall Rescue Shampoo 1L"
];

beautyNames.forEach(name => {
  let brand = name.split(' ')[0];
  if(name.includes("L'Oreal")) brand = "L'Oreal Paris";
  if(name.includes("Maybelline")) brand = "Maybelline";
  products.push({
    name, brand, category: 'beauty',
    desc: `Pamper yourself with the ${name}. Formulated with carefully selected, skin-loving ingredients, it delivers visible results while being gentle on you. Incorporate it into your daily beauty regimen to nourish, protect, and enhance your natural glow. Experience luxury care every single day.`,
    mrp: Math.floor(Math.random() * 40) + 5,
    images: getImages('beauty', 4),
    specs: [ { key: 'Brand', value: brand }, { key: 'Skin/Hair Type', value: 'All Types' }, { key: 'Form', value: 'Liquid/Cream' }, { key: 'Cruelty Free', value: 'Yes' } ]
  });
});

// 8. Toys (10)
const toysNames = [
  "LEGO Classic Creative Bricks 500 Pieces", "Funskool Scrabble Junior", "Hot Wheels 5-Car Gift Pack",
  "Barbie Dreamhouse Playset", "Fisher-Price Rock-a-Stack", "Nerf N-Strike Elite Disruptor",
  "Play-Doh Modeling Compound 10-Pack", "Catan Board Game Base Game", "Monopoly Classic Family Board Game",
  "Rubik's Cube 3x3 Original"
];

toysNames.forEach(name => {
  let brand = name.split(' ')[0];
  products.push({
    name, brand, category: 'toys',
    desc: `Unleash hours of fun and imagination with the ${name}. Designed to entertain and educate, it encourages creativity and strategic thinking. Made from safe, non-toxic, and durable materials, it's the perfect gift to bring joy to children and families alike. Let the playtime adventures begin!`,
    mrp: Math.floor(Math.random() * 60) + 10,
    images: getImages('toys', 4),
    specs: [ { key: 'Brand', value: brand }, { key: 'Age Group', value: '5+ Years' }, { key: 'Material', value: 'Safe Plastic/Cardboard' }, { key: 'Batteries Required', value: 'No' } ]
  });
});

let output = `import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const categories = ${JSON.stringify(categories, null, 2)};
const productsData = ${JSON.stringify(products, null, 2)};

async function main() {
  console.log('Seeding Database...');
  
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.productSpec.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  
  // Create Test User
  const user = await prisma.user.create({
    data: {
      name: 'Test User',
      email: 'user@example.com',
      passwordHash: 'hashedpassword',
      phone: '9876543210'
    }
  });

  // Create Categories
  const categoryMap = {};
  for (const cat of categories) {
    const created = await prisma.category.create({ data: cat });
    categoryMap[cat.slug] = created.id;
  }

  // Insert Products
  for(let i = 0; i < productsData.length; i++) {
    const p = productsData[i];
    const catId = categoryMap[p.category];
    const mrp = p.mrp;
    const price = mrp * (1 - (Math.random() * 0.3 + 0.1)); // 10-40% discount
    const stock = Math.floor(Math.random() * 500);
    const rating = (Math.random() * (4.8 - 3.8) + 3.8);
    const reviewCount = Math.floor(Math.random() * 14800) + 200;

    const product = await prisma.product.create({
      data: {
        categoryId: catId,
        name: p.name,
        brand: p.brand,
        slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(7),
        description: p.desc,
        mrp: parseFloat(mrp.toFixed(2)),
        price: parseFloat(price.toFixed(2)),
        stock: stock,
        rating: parseFloat(rating.toFixed(1)),
        reviewCount: reviewCount,
        isActive: true
      }
    });

    for (let j = 0; j < p.images.length; j++) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: p.images[j],
          sortOrder: j
        }
      });
    }

    await prisma.productSpec.createMany({
      data: p.specs.map(spec => ({
        productId: product.id,
        key: spec.key,
        value: spec.value
      }))
    });
    
    // reviews
    await prisma.review.create({
      data: {
        productId: product.id,
        userId: user.id,
        rating: Math.floor(Math.random() * 2) + 4,
        title: "Excellent purchase",
        body: "Really happy with this product. It meets all expectations and works flawlessly.",
        verifiedPurchase: true
      }
    });
  }

  console.log(\`Seeded \${productsData.length} products.\`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
`;

fs.writeFileSync('seed_script.ts', output);
