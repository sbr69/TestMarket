BEGIN;

-- Delete existing data
DELETE FROM "OrderItem";
DELETE FROM "Order";
DELETE FROM "CartItem";
DELETE FROM "Cart";
DELETE FROM "Product";
DELETE FROM "Seller";
DELETE FROM "OAuthToken";
DELETE FROM "User";

-- Insert users
INSERT INTO "User" (id, email, "passwordHash", "createdAt") VALUES 
('u1', 'techhaven@marketsim.local', 'hashed_password', NOW()),
('u2', 'styleboutique@marketsim.local', 'hashed_password', NOW()),
('u3', 'homeliving@marketsim.local', 'hashed_password', NOW());

-- Insert sellers
INSERT INTO "Seller" (id, "userId", "businessName", rating, "createdAt") VALUES 
('s1', 'u1', 'Tech Haven', 4.8, NOW()),
('s2', 'u2', 'Style Boutique', 4.6, NOW()),
('s3', 'u3', 'Home Living', 4.9, NOW());

-- Insert products
INSERT INTO "Product" (id, "sellerId", name, "imageUrl", description, price, stock, category, rating, "createdAt", "updatedAt") VALUES 
('p1', 's1', 'Sony WH-1000XM5 Wireless Headphones', 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80', 'Industry-leading noise cancellation. Two processors control 8 microphones for unprecedented noise cancellation.', 348.00, 45, 'electronics', 4.8, NOW(), NOW()),
('p2', 's1', 'Keychron K2 Wireless Mechanical Keyboard', 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80', 'A 75% layout (84-key) RGB backlight compact Bluetooth mechanical keyboard.', 79.99, 120, 'electronics', 4.6, NOW(), NOW()),
('p3', 's1', 'Apple MacBook Air M2', 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&q=80', 'Supercharged by M2. 13.6-inch Liquid Retina display, 8GB RAM, 256GB SSD Storage.', 1099.00, 30, 'electronics', 4.9, NOW(), NOW()),
('p4', 's1', 'Samsung 49" Odyssey G9 Gaming Monitor', 'https://images.unsplash.com/photo-1527443195645-1133f7f28990?w=800&q=80', '49 inch 1000R Curved Gaming Monitor, 240Hz, 1ms, G-Sync & FreeSync Premium Pro.', 1299.99, 15, 'electronics', 4.7, NOW(), NOW()),
('p5', 's2', 'Men''s Minimalist Canvas Sneakers', 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80', 'Classic canvas low-top sneakers. Features a durable rubber outsole and a breathable canvas upper.', 49.99, 250, 'clothing', 4.5, NOW(), NOW()),
('p6', 's2', 'Classic Denim Jacket', 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80', 'A timeless staple. This classic denim jacket features a button-front closure, two chest pockets, and a regular fit.', 89.50, 85, 'clothing', 4.7, NOW(), NOW()),
('p7', 's2', 'Leather Crossbody Bag', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80', 'Handcrafted full-grain leather crossbody bag. Features adjustable straps and solid brass hardware.', 145.00, 40, 'clothing', 4.8, NOW(), NOW()),
('p8', 's3', 'Ceramic Pour-Over Coffee Maker', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80', 'Enjoy a rich, handcrafted cup of coffee with this elegant ceramic pour-over dripper.', 24.99, 150, 'home', 4.6, NOW(), NOW()),
('p9', 's3', 'Minimalist Desk Lamp', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80', 'Modern minimalist desk lamp with adjustable brightness and color temperature.', 59.99, 60, 'home', 4.5, NOW(), NOW()),
('p10', 's3', 'Linen Duvet Cover Set', 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80', '100% French flax linen duvet cover set. Breathable, durable, and gets softer with every wash.', 189.00, 80, 'home', 4.9, NOW(), NOW());

COMMIT;
