import fs from 'fs';

const imageMap = {
  electronics: [
    'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    'https://images.unsplash.com/photo-1526406915894-7bcd65f60845?w=800&q=80',
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80',
    'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80'
  ],
  grocery: [
    'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=800&q=80',
    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
    'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=800&q=80',
    'https://images.unsplash.com/photo-1574316074128-d89006de81fc?w=800&q=80',
    'https://images.unsplash.com/photo-1621245648508-0129037c6883?w=800&q=80'
  ],
  books: [
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80',
    'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&q=80',
    'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&q=80'
  ],
  fashion: [
    'https://images.unsplash.com/photo-1434389678278-be4d41aa1d40?w=800&q=80',
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
    'https://images.unsplash.com/photo-1489987707023-af6f0e4b868e?w=800&q=80'
  ],
  'home-kitchen': [
    'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80',
    'https://images.unsplash.com/photo-1584285458399-6f98c894fb21?w=800&q=80',
    'https://images.unsplash.com/photo-1581622558667-3419a8dc5f83?w=800&q=80',
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80'
  ],
  sports: [
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
    'https://images.unsplash.com/photo-1526506443360-ffdf2032069b?w=800&q=80',
    'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&q=80',
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80'
  ],
  beauty: [
    'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=800&q=80',
    'https://images.unsplash.com/photo-1617897903246-719242758050?w=800&q=80',
    'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80',
    'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&q=80'
  ],
  toys: [
    'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&q=80',
    'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&q=80',
    'https://images.unsplash.com/photo-1558066110-bf9b53164a66?w=800&q=80',
    'https://images.unsplash.com/photo-1611604548018-d56bbd85d681?w=800&q=80'
  ]
};

let seedContent = fs.readFileSync("seed_script.ts", "utf8");
// Replace getMockImages function
const replacement = `
const imageMap = ${JSON.stringify(imageMap, null, 2)};
const getMockImages = (keywords, count, i, catSlug) => {
  const images = [];
  const catImages = imageMap[catSlug] || imageMap.electronics;
  for(let j = 0; j < count; j++) {
    images.push(catImages[(i + j) % catImages.length]);
  }
  return images;
}
`;

seedContent = seedContent.replace(/const getMockImages = \([\s\S]*?return images;\n}/m, replacement);
seedContent = seedContent.replace("const images = getMockImages(template.imageKeywords, Math.floor(Math.random() * 3) + 3, productCount);", "const images = getMockImages(template.imageKeywords, Math.floor(Math.random() * 3) + 3, productCount, catSlug);");
fs.writeFileSync("seed_script.ts", seedContent);
