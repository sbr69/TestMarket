import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const categories = [
  {
    "name": "Electronics",
    "slug": "electronics",
    "iconUrl": "Monitor"
  },
  {
    "name": "Grocery",
    "slug": "grocery",
    "iconUrl": "ShoppingBasket"
  },
  {
    "name": "Books",
    "slug": "books",
    "iconUrl": "Book"
  },
  {
    "name": "Fashion",
    "slug": "fashion",
    "iconUrl": "Shirt"
  },
  {
    "name": "Home & Kitchen",
    "slug": "home-kitchen",
    "iconUrl": "Home"
  },
  {
    "name": "Sports",
    "slug": "sports",
    "iconUrl": "Dumbbell"
  },
  {
    "name": "Beauty",
    "slug": "beauty",
    "iconUrl": "Sparkles"
  },
  {
    "name": "Toys",
    "slug": "toys",
    "iconUrl": "Gamepad2"
  }
];
const productsData = [
  {
    "name": "Acer Nitro 5 Gaming Laptop 15.6 inch",
    "brand": "Acer",
    "category": "electronics",
    "desc": "Experience the pinnacle of technology with the Acer Nitro 5 Gaming Laptop 15.6 inch. Engineered for peak performance, this device seamlessly integrates into your daily life. Whether you're working on intensive tasks, enjoying immersive entertainment, or staying connected with loved ones, it delivers exceptional speed, clarity, and reliability. Featuring a sleek, modern design that looks as good as it performs, and packed with advanced features that anticipate your needs.",
    "mrp": 1823,
    "images": [
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80",
      "https://images.unsplash.com/photo-1611186871340-1b26bc6d2a45?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Acer"
      },
      {
        "key": "Model",
        "value": "2024 Edition"
      },
      {
        "key": "Warranty",
        "value": "1 Year Manufacturer Warranty"
      },
      {
        "key": "Color",
        "value": "Black"
      }
    ]
  },
  {
    "name": "boAt Airdopes 141 Bluetooth Earbuds",
    "brand": "boAt",
    "category": "electronics",
    "desc": "Experience the pinnacle of technology with the boAt Airdopes 141 Bluetooth Earbuds. Engineered for peak performance, this device seamlessly integrates into your daily life. Whether you're working on intensive tasks, enjoying immersive entertainment, or staying connected with loved ones, it delivers exceptional speed, clarity, and reliability. Featuring a sleek, modern design that looks as good as it performs, and packed with advanced features that anticipate your needs.",
    "mrp": 1419,
    "images": [
      "https://images.unsplash.com/photo-1611186871340-1b26bc6d2a45?w=800&q=80",
      "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800&q=80",
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80",
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "boAt"
      },
      {
        "key": "Model",
        "value": "2024 Edition"
      },
      {
        "key": "Warranty",
        "value": "1 Year Manufacturer Warranty"
      },
      {
        "key": "Color",
        "value": "Black"
      }
    ]
  },
  {
    "name": "Redmi Note 13 Pro 5G 128GB Midnight Black",
    "brand": "Redmi",
    "category": "electronics",
    "desc": "Experience the pinnacle of technology with the Redmi Note 13 Pro 5G 128GB Midnight Black. Engineered for peak performance, this device seamlessly integrates into your daily life. Whether you're working on intensive tasks, enjoying immersive entertainment, or staying connected with loved ones, it delivers exceptional speed, clarity, and reliability. Featuring a sleek, modern design that looks as good as it performs, and packed with advanced features that anticipate your needs.",
    "mrp": 1231,
    "images": [
      "https://images.unsplash.com/photo-1611186871340-1b26bc6d2a45?w=800&q=80",
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80",
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80",
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Redmi"
      },
      {
        "key": "Model",
        "value": "2024 Edition"
      },
      {
        "key": "Warranty",
        "value": "1 Year Manufacturer Warranty"
      },
      {
        "key": "Color",
        "value": "Black"
      }
    ]
  },
  {
    "name": "Apple iPhone 15 Pro Max 256GB Natural Titanium",
    "brand": "Apple",
    "category": "electronics",
    "desc": "Experience the pinnacle of technology with the Apple iPhone 15 Pro Max 256GB Natural Titanium. Engineered for peak performance, this device seamlessly integrates into your daily life. Whether you're working on intensive tasks, enjoying immersive entertainment, or staying connected with loved ones, it delivers exceptional speed, clarity, and reliability. Featuring a sleek, modern design that looks as good as it performs, and packed with advanced features that anticipate your needs.",
    "mrp": 1246,
    "images": [
      "https://images.unsplash.com/photo-1611186871340-1b26bc6d2a45?w=800&q=80",
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80",
      "https://images.unsplash.com/photo-1526406915894-7bcd65f60845?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Apple"
      },
      {
        "key": "Model",
        "value": "2024 Edition"
      },
      {
        "key": "Warranty",
        "value": "1 Year Manufacturer Warranty"
      },
      {
        "key": "Color",
        "value": "Black"
      }
    ]
  },
  {
    "name": "Samsung Galaxy S24 Ultra AI Smartphone",
    "brand": "Samsung",
    "category": "electronics",
    "desc": "Experience the pinnacle of technology with the Samsung Galaxy S24 Ultra AI Smartphone. Engineered for peak performance, this device seamlessly integrates into your daily life. Whether you're working on intensive tasks, enjoying immersive entertainment, or staying connected with loved ones, it delivers exceptional speed, clarity, and reliability. Featuring a sleek, modern design that looks as good as it performs, and packed with advanced features that anticipate your needs.",
    "mrp": 540,
    "images": [
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80",
      "https://images.unsplash.com/photo-1611186871340-1b26bc6d2a45?w=800&q=80",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
      "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Samsung"
      },
      {
        "key": "Model",
        "value": "2024 Edition"
      },
      {
        "key": "Warranty",
        "value": "1 Year Manufacturer Warranty"
      },
      {
        "key": "Color",
        "value": "Black"
      }
    ]
  },
  {
    "name": "Sony WH-1000XM5 Noise Canceling Headphones",
    "brand": "Sony",
    "category": "electronics",
    "desc": "Experience the pinnacle of technology with the Sony WH-1000XM5 Noise Canceling Headphones. Engineered for peak performance, this device seamlessly integrates into your daily life. Whether you're working on intensive tasks, enjoying immersive entertainment, or staying connected with loved ones, it delivers exceptional speed, clarity, and reliability. Featuring a sleek, modern design that looks as good as it performs, and packed with advanced features that anticipate your needs.",
    "mrp": 622,
    "images": [
      "https://images.unsplash.com/photo-1526406915894-7bcd65f60845?w=800&q=80",
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80",
      "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800&q=80",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Sony"
      },
      {
        "key": "Model",
        "value": "2024 Edition"
      },
      {
        "key": "Warranty",
        "value": "1 Year Manufacturer Warranty"
      },
      {
        "key": "Color",
        "value": "Black"
      }
    ]
  },
  {
    "name": "Dell XPS 13 Plus Touchscreen Laptop",
    "brand": "Dell",
    "category": "electronics",
    "desc": "Experience the pinnacle of technology with the Dell XPS 13 Plus Touchscreen Laptop. Engineered for peak performance, this device seamlessly integrates into your daily life. Whether you're working on intensive tasks, enjoying immersive entertainment, or staying connected with loved ones, it delivers exceptional speed, clarity, and reliability. Featuring a sleek, modern design that looks as good as it performs, and packed with advanced features that anticipate your needs.",
    "mrp": 1529,
    "images": [
      "https://images.unsplash.com/photo-1526406915894-7bcd65f60845?w=800&q=80",
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Dell"
      },
      {
        "key": "Model",
        "value": "2024 Edition"
      },
      {
        "key": "Warranty",
        "value": "1 Year Manufacturer Warranty"
      },
      {
        "key": "Color",
        "value": "Black"
      }
    ]
  },
  {
    "name": "HP Pavilion 14 Core i5 12th Gen",
    "brand": "HP",
    "category": "electronics",
    "desc": "Experience the pinnacle of technology with the HP Pavilion 14 Core i5 12th Gen. Engineered for peak performance, this device seamlessly integrates into your daily life. Whether you're working on intensive tasks, enjoying immersive entertainment, or staying connected with loved ones, it delivers exceptional speed, clarity, and reliability. Featuring a sleek, modern design that looks as good as it performs, and packed with advanced features that anticipate your needs.",
    "mrp": 1397,
    "images": [
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80",
      "https://images.unsplash.com/photo-1526406915894-7bcd65f60845?w=800&q=80",
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "HP"
      },
      {
        "key": "Model",
        "value": "2024 Edition"
      },
      {
        "key": "Warranty",
        "value": "1 Year Manufacturer Warranty"
      },
      {
        "key": "Color",
        "value": "Black"
      }
    ]
  },
  {
    "name": "Lenovo Legion 5 Pro AMD Ryzen 7",
    "brand": "Lenovo",
    "category": "electronics",
    "desc": "Experience the pinnacle of technology with the Lenovo Legion 5 Pro AMD Ryzen 7. Engineered for peak performance, this device seamlessly integrates into your daily life. Whether you're working on intensive tasks, enjoying immersive entertainment, or staying connected with loved ones, it delivers exceptional speed, clarity, and reliability. Featuring a sleek, modern design that looks as good as it performs, and packed with advanced features that anticipate your needs.",
    "mrp": 1687,
    "images": [
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80",
      "https://images.unsplash.com/photo-1611186871340-1b26bc6d2a45?w=800&q=80",
      "https://images.unsplash.com/photo-1526406915894-7bcd65f60845?w=800&q=80",
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Lenovo"
      },
      {
        "key": "Model",
        "value": "2024 Edition"
      },
      {
        "key": "Warranty",
        "value": "1 Year Manufacturer Warranty"
      },
      {
        "key": "Color",
        "value": "Black"
      }
    ]
  },
  {
    "name": "Asus ROG Strix G15 Gaming Laptop",
    "brand": "Asus",
    "category": "electronics",
    "desc": "Experience the pinnacle of technology with the Asus ROG Strix G15 Gaming Laptop. Engineered for peak performance, this device seamlessly integrates into your daily life. Whether you're working on intensive tasks, enjoying immersive entertainment, or staying connected with loved ones, it delivers exceptional speed, clarity, and reliability. Featuring a sleek, modern design that looks as good as it performs, and packed with advanced features that anticipate your needs.",
    "mrp": 2082,
    "images": [
      "https://images.unsplash.com/photo-1611186871340-1b26bc6d2a45?w=800&q=80",
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80",
      "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800&q=80",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Asus"
      },
      {
        "key": "Model",
        "value": "2024 Edition"
      },
      {
        "key": "Warranty",
        "value": "1 Year Manufacturer Warranty"
      },
      {
        "key": "Color",
        "value": "Black"
      }
    ]
  },
  {
    "name": "Apple MacBook Air M3 Chip 15-inch",
    "brand": "Apple",
    "category": "electronics",
    "desc": "Experience the pinnacle of technology with the Apple MacBook Air M3 Chip 15-inch. Engineered for peak performance, this device seamlessly integrates into your daily life. Whether you're working on intensive tasks, enjoying immersive entertainment, or staying connected with loved ones, it delivers exceptional speed, clarity, and reliability. Featuring a sleek, modern design that looks as good as it performs, and packed with advanced features that anticipate your needs.",
    "mrp": 1748,
    "images": [
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80",
      "https://images.unsplash.com/photo-1526406915894-7bcd65f60845?w=800&q=80",
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Apple"
      },
      {
        "key": "Model",
        "value": "2024 Edition"
      },
      {
        "key": "Warranty",
        "value": "1 Year Manufacturer Warranty"
      },
      {
        "key": "Color",
        "value": "Black"
      }
    ]
  },
  {
    "name": "OnePlus 12 5G 256GB Flowy Emerald",
    "brand": "OnePlus",
    "category": "electronics",
    "desc": "Experience the pinnacle of technology with the OnePlus 12 5G 256GB Flowy Emerald. Engineered for peak performance, this device seamlessly integrates into your daily life. Whether you're working on intensive tasks, enjoying immersive entertainment, or staying connected with loved ones, it delivers exceptional speed, clarity, and reliability. Featuring a sleek, modern design that looks as good as it performs, and packed with advanced features that anticipate your needs.",
    "mrp": 1592,
    "images": [
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
      "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800&q=80",
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "OnePlus"
      },
      {
        "key": "Model",
        "value": "2024 Edition"
      },
      {
        "key": "Warranty",
        "value": "1 Year Manufacturer Warranty"
      },
      {
        "key": "Color",
        "value": "Black"
      }
    ]
  },
  {
    "name": "Samsung 55 inch 4K Smart Neo QLED TV",
    "brand": "Samsung",
    "category": "electronics",
    "desc": "Experience the pinnacle of technology with the Samsung 55 inch 4K Smart Neo QLED TV. Engineered for peak performance, this device seamlessly integrates into your daily life. Whether you're working on intensive tasks, enjoying immersive entertainment, or staying connected with loved ones, it delivers exceptional speed, clarity, and reliability. Featuring a sleek, modern design that looks as good as it performs, and packed with advanced features that anticipate your needs.",
    "mrp": 2060,
    "images": [
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80",
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80",
      "https://images.unsplash.com/photo-1526406915894-7bcd65f60845?w=800&q=80",
      "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Samsung"
      },
      {
        "key": "Model",
        "value": "2024 Edition"
      },
      {
        "key": "Warranty",
        "value": "1 Year Manufacturer Warranty"
      },
      {
        "key": "Color",
        "value": "Black"
      }
    ]
  },
  {
    "name": "LG 65 inch OLED Evo C3 4K Smart TV",
    "brand": "LG",
    "category": "electronics",
    "desc": "Experience the pinnacle of technology with the LG 65 inch OLED Evo C3 4K Smart TV. Engineered for peak performance, this device seamlessly integrates into your daily life. Whether you're working on intensive tasks, enjoying immersive entertainment, or staying connected with loved ones, it delivers exceptional speed, clarity, and reliability. Featuring a sleek, modern design that looks as good as it performs, and packed with advanced features that anticipate your needs.",
    "mrp": 2024,
    "images": [
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80",
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "LG"
      },
      {
        "key": "Model",
        "value": "2024 Edition"
      },
      {
        "key": "Warranty",
        "value": "1 Year Manufacturer Warranty"
      },
      {
        "key": "Color",
        "value": "Black"
      }
    ]
  },
  {
    "name": "Sony PlayStation 5 Console 825GB",
    "brand": "Sony",
    "category": "electronics",
    "desc": "Experience the pinnacle of technology with the Sony PlayStation 5 Console 825GB. Engineered for peak performance, this device seamlessly integrates into your daily life. Whether you're working on intensive tasks, enjoying immersive entertainment, or staying connected with loved ones, it delivers exceptional speed, clarity, and reliability. Featuring a sleek, modern design that looks as good as it performs, and packed with advanced features that anticipate your needs.",
    "mrp": 1398,
    "images": [
      "https://images.unsplash.com/photo-1526406915894-7bcd65f60845?w=800&q=80",
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80",
      "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800&q=80",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Sony"
      },
      {
        "key": "Model",
        "value": "2024 Edition"
      },
      {
        "key": "Warranty",
        "value": "1 Year Manufacturer Warranty"
      },
      {
        "key": "Color",
        "value": "Black"
      }
    ]
  },
  {
    "name": "Xbox Series X 1TB Console Black",
    "brand": "Microsoft",
    "category": "electronics",
    "desc": "Experience the pinnacle of technology with the Xbox Series X 1TB Console Black. Engineered for peak performance, this device seamlessly integrates into your daily life. Whether you're working on intensive tasks, enjoying immersive entertainment, or staying connected with loved ones, it delivers exceptional speed, clarity, and reliability. Featuring a sleek, modern design that looks as good as it performs, and packed with advanced features that anticipate your needs.",
    "mrp": 1671,
    "images": [
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80",
      "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800&q=80",
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80",
      "https://images.unsplash.com/photo-1526406915894-7bcd65f60845?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Microsoft"
      },
      {
        "key": "Model",
        "value": "2024 Edition"
      },
      {
        "key": "Warranty",
        "value": "1 Year Manufacturer Warranty"
      },
      {
        "key": "Color",
        "value": "Black"
      }
    ]
  },
  {
    "name": "Logitech MX Master 3S Wireless Mouse",
    "brand": "Logitech",
    "category": "electronics",
    "desc": "Experience the pinnacle of technology with the Logitech MX Master 3S Wireless Mouse. Engineered for peak performance, this device seamlessly integrates into your daily life. Whether you're working on intensive tasks, enjoying immersive entertainment, or staying connected with loved ones, it delivers exceptional speed, clarity, and reliability. Featuring a sleek, modern design that looks as good as it performs, and packed with advanced features that anticipate your needs.",
    "mrp": 211,
    "images": [
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80",
      "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800&q=80",
      "https://images.unsplash.com/photo-1611186871340-1b26bc6d2a45?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Logitech"
      },
      {
        "key": "Model",
        "value": "2024 Edition"
      },
      {
        "key": "Warranty",
        "value": "1 Year Manufacturer Warranty"
      },
      {
        "key": "Color",
        "value": "Black"
      }
    ]
  },
  {
    "name": "Keychron K2 V2 Mechanical Keyboard",
    "brand": "Keychron",
    "category": "electronics",
    "desc": "Experience the pinnacle of technology with the Keychron K2 V2 Mechanical Keyboard. Engineered for peak performance, this device seamlessly integrates into your daily life. Whether you're working on intensive tasks, enjoying immersive entertainment, or staying connected with loved ones, it delivers exceptional speed, clarity, and reliability. Featuring a sleek, modern design that looks as good as it performs, and packed with advanced features that anticipate your needs.",
    "mrp": 600,
    "images": [
      "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800&q=80",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80",
      "https://images.unsplash.com/photo-1611186871340-1b26bc6d2a45?w=800&q=80",
      "https://images.unsplash.com/photo-1526406915894-7bcd65f60845?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Keychron"
      },
      {
        "key": "Model",
        "value": "2024 Edition"
      },
      {
        "key": "Warranty",
        "value": "1 Year Manufacturer Warranty"
      },
      {
        "key": "Color",
        "value": "Black"
      }
    ]
  },
  {
    "name": "Apple Watch Series 9 GPS 45mm",
    "brand": "Apple",
    "category": "electronics",
    "desc": "Experience the pinnacle of technology with the Apple Watch Series 9 GPS 45mm. Engineered for peak performance, this device seamlessly integrates into your daily life. Whether you're working on intensive tasks, enjoying immersive entertainment, or staying connected with loved ones, it delivers exceptional speed, clarity, and reliability. Featuring a sleek, modern design that looks as good as it performs, and packed with advanced features that anticipate your needs.",
    "mrp": 1436,
    "images": [
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80",
      "https://images.unsplash.com/photo-1611186871340-1b26bc6d2a45?w=800&q=80",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80",
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Apple"
      },
      {
        "key": "Model",
        "value": "2024 Edition"
      },
      {
        "key": "Warranty",
        "value": "1 Year Manufacturer Warranty"
      },
      {
        "key": "Color",
        "value": "Black"
      }
    ]
  },
  {
    "name": "Samsung Galaxy Watch 6 Classic",
    "brand": "Samsung",
    "category": "electronics",
    "desc": "Experience the pinnacle of technology with the Samsung Galaxy Watch 6 Classic. Engineered for peak performance, this device seamlessly integrates into your daily life. Whether you're working on intensive tasks, enjoying immersive entertainment, or staying connected with loved ones, it delivers exceptional speed, clarity, and reliability. Featuring a sleek, modern design that looks as good as it performs, and packed with advanced features that anticipate your needs.",
    "mrp": 1938,
    "images": [
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80",
      "https://images.unsplash.com/photo-1526406915894-7bcd65f60845?w=800&q=80",
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Samsung"
      },
      {
        "key": "Model",
        "value": "2024 Edition"
      },
      {
        "key": "Warranty",
        "value": "1 Year Manufacturer Warranty"
      },
      {
        "key": "Color",
        "value": "Black"
      }
    ]
  },
  {
    "name": "India Gate Classic Basmati Rice 5kg",
    "brand": "India",
    "category": "grocery",
    "desc": "Stock up your pantry with India Gate Classic Basmati Rice 5kg. Made from carefully selected ingredients, ensuring the highest quality and taste for your family. This essential grocery item is perfect for everyday cooking and brings authentic flavors to your meals. Packaged hygienically to retain freshness and nutritional value for longer.",
    "mrp": 11,
    "images": [
      "https://images.unsplash.com/photo-1587049352847-4d45548ce4fb?w=800&q=80",
      "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=800&q=80",
      "https://images.unsplash.com/photo-1574316074128-d89006de81fc?w=800&q=80",
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "India"
      },
      {
        "key": "Type",
        "value": "Vegetarian"
      },
      {
        "key": "Shelf Life",
        "value": "12 Months"
      },
      {
        "key": "Packaging",
        "value": "Sealed Pack"
      }
    ]
  },
  {
    "name": "Tata Salt Lite Low Sodium 1kg",
    "brand": "Tata",
    "category": "grocery",
    "desc": "Stock up your pantry with Tata Salt Lite Low Sodium 1kg. Made from carefully selected ingredients, ensuring the highest quality and taste for your family. This essential grocery item is perfect for everyday cooking and brings authentic flavors to your meals. Packaged hygienically to retain freshness and nutritional value for longer.",
    "mrp": 6,
    "images": [
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80",
      "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=800&q=80",
      "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=800&q=80",
      "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Tata"
      },
      {
        "key": "Type",
        "value": "Vegetarian"
      },
      {
        "key": "Shelf Life",
        "value": "12 Months"
      },
      {
        "key": "Packaging",
        "value": "Sealed Pack"
      }
    ]
  },
  {
    "name": "Aashirvaad Whole Wheat Atta 10kg",
    "brand": "Aashirvaad",
    "category": "grocery",
    "desc": "Stock up your pantry with Aashirvaad Whole Wheat Atta 10kg. Made from carefully selected ingredients, ensuring the highest quality and taste for your family. This essential grocery item is perfect for everyday cooking and brings authentic flavors to your meals. Packaged hygienically to retain freshness and nutritional value for longer.",
    "mrp": 21,
    "images": [
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80",
      "https://images.unsplash.com/photo-1574316074128-d89006de81fc?w=800&q=80",
      "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=800&q=80",
      "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Aashirvaad"
      },
      {
        "key": "Type",
        "value": "Vegetarian"
      },
      {
        "key": "Shelf Life",
        "value": "12 Months"
      },
      {
        "key": "Packaging",
        "value": "Sealed Pack"
      }
    ]
  },
  {
    "name": "Fortune Sunlite Refined Sunflower Oil 5L",
    "brand": "Fortune",
    "category": "grocery",
    "desc": "Stock up your pantry with Fortune Sunlite Refined Sunflower Oil 5L. Made from carefully selected ingredients, ensuring the highest quality and taste for your family. This essential grocery item is perfect for everyday cooking and brings authentic flavors to your meals. Packaged hygienically to retain freshness and nutritional value for longer.",
    "mrp": 23,
    "images": [
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80",
      "https://images.unsplash.com/photo-1587049352847-4d45548ce4fb?w=800&q=80",
      "https://images.unsplash.com/photo-1574316074128-d89006de81fc?w=800&q=80",
      "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Fortune"
      },
      {
        "key": "Type",
        "value": "Vegetarian"
      },
      {
        "key": "Shelf Life",
        "value": "12 Months"
      },
      {
        "key": "Packaging",
        "value": "Sealed Pack"
      }
    ]
  },
  {
    "name": "Maggi 2-Minute Noodles Masala 12-Pack",
    "brand": "Maggi",
    "category": "grocery",
    "desc": "Stock up your pantry with Maggi 2-Minute Noodles Masala 12-Pack. Made from carefully selected ingredients, ensuring the highest quality and taste for your family. This essential grocery item is perfect for everyday cooking and brings authentic flavors to your meals. Packaged hygienically to retain freshness and nutritional value for longer.",
    "mrp": 20,
    "images": [
      "https://images.unsplash.com/photo-1621245648508-0129037c6883?w=800&q=80",
      "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=800&q=80",
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Maggi"
      },
      {
        "key": "Type",
        "value": "Vegetarian"
      },
      {
        "key": "Shelf Life",
        "value": "12 Months"
      },
      {
        "key": "Packaging",
        "value": "Sealed Pack"
      }
    ]
  },
  {
    "name": "Nestle Everyday Dairy Whitener 1kg",
    "brand": "Nestle",
    "category": "grocery",
    "desc": "Stock up your pantry with Nestle Everyday Dairy Whitener 1kg. Made from carefully selected ingredients, ensuring the highest quality and taste for your family. This essential grocery item is perfect for everyday cooking and brings authentic flavors to your meals. Packaged hygienically to retain freshness and nutritional value for longer.",
    "mrp": 10,
    "images": [
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80",
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
      "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=800&q=80",
      "https://images.unsplash.com/photo-1587049352847-4d45548ce4fb?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Nestle"
      },
      {
        "key": "Type",
        "value": "Vegetarian"
      },
      {
        "key": "Shelf Life",
        "value": "12 Months"
      },
      {
        "key": "Packaging",
        "value": "Sealed Pack"
      }
    ]
  },
  {
    "name": "Britannia Good Day Cashew Cookies 600g",
    "brand": "Britannia",
    "category": "grocery",
    "desc": "Stock up your pantry with Britannia Good Day Cashew Cookies 600g. Made from carefully selected ingredients, ensuring the highest quality and taste for your family. This essential grocery item is perfect for everyday cooking and brings authentic flavors to your meals. Packaged hygienically to retain freshness and nutritional value for longer.",
    "mrp": 8,
    "images": [
      "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=800&q=80",
      "https://images.unsplash.com/photo-1587049352847-4d45548ce4fb?w=800&q=80",
      "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80",
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Britannia"
      },
      {
        "key": "Type",
        "value": "Vegetarian"
      },
      {
        "key": "Shelf Life",
        "value": "12 Months"
      },
      {
        "key": "Packaging",
        "value": "Sealed Pack"
      }
    ]
  },
  {
    "name": "Amul Pure Ghee 1L Pouch",
    "brand": "Amul",
    "category": "grocery",
    "desc": "Stock up your pantry with Amul Pure Ghee 1L Pouch. Made from carefully selected ingredients, ensuring the highest quality and taste for your family. This essential grocery item is perfect for everyday cooking and brings authentic flavors to your meals. Packaged hygienically to retain freshness and nutritional value for longer.",
    "mrp": 6,
    "images": [
      "https://images.unsplash.com/photo-1587049352847-4d45548ce4fb?w=800&q=80",
      "https://images.unsplash.com/photo-1574316074128-d89006de81fc?w=800&q=80",
      "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=800&q=80",
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Amul"
      },
      {
        "key": "Type",
        "value": "Vegetarian"
      },
      {
        "key": "Shelf Life",
        "value": "12 Months"
      },
      {
        "key": "Packaging",
        "value": "Sealed Pack"
      }
    ]
  },
  {
    "name": "Patanjali Cow Ghee 1L",
    "brand": "Patanjali",
    "category": "grocery",
    "desc": "Stock up your pantry with Patanjali Cow Ghee 1L. Made from carefully selected ingredients, ensuring the highest quality and taste for your family. This essential grocery item is perfect for everyday cooking and brings authentic flavors to your meals. Packaged hygienically to retain freshness and nutritional value for longer.",
    "mrp": 26,
    "images": [
      "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=800&q=80",
      "https://images.unsplash.com/photo-1574316074128-d89006de81fc?w=800&q=80",
      "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80",
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Patanjali"
      },
      {
        "key": "Type",
        "value": "Vegetarian"
      },
      {
        "key": "Shelf Life",
        "value": "12 Months"
      },
      {
        "key": "Packaging",
        "value": "Sealed Pack"
      }
    ]
  },
  {
    "name": "Haldiram's Bhujia Sev 1kg",
    "brand": "Haldiram's",
    "category": "grocery",
    "desc": "Stock up your pantry with Haldiram's Bhujia Sev 1kg. Made from carefully selected ingredients, ensuring the highest quality and taste for your family. This essential grocery item is perfect for everyday cooking and brings authentic flavors to your meals. Packaged hygienically to retain freshness and nutritional value for longer.",
    "mrp": 27,
    "images": [
      "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=800&q=80",
      "https://images.unsplash.com/photo-1574316074128-d89006de81fc?w=800&q=80",
      "https://images.unsplash.com/photo-1621245648508-0129037c6883?w=800&q=80",
      "https://images.unsplash.com/photo-1587049352847-4d45548ce4fb?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Haldiram's"
      },
      {
        "key": "Type",
        "value": "Vegetarian"
      },
      {
        "key": "Shelf Life",
        "value": "12 Months"
      },
      {
        "key": "Packaging",
        "value": "Sealed Pack"
      }
    ]
  },
  {
    "name": "Lipton Yellow Label Tea 500g",
    "brand": "Lipton",
    "category": "grocery",
    "desc": "Stock up your pantry with Lipton Yellow Label Tea 500g. Made from carefully selected ingredients, ensuring the highest quality and taste for your family. This essential grocery item is perfect for everyday cooking and brings authentic flavors to your meals. Packaged hygienically to retain freshness and nutritional value for longer.",
    "mrp": 25,
    "images": [
      "https://images.unsplash.com/photo-1574316074128-d89006de81fc?w=800&q=80",
      "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=800&q=80",
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80",
      "https://images.unsplash.com/photo-1621245648508-0129037c6883?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Lipton"
      },
      {
        "key": "Type",
        "value": "Vegetarian"
      },
      {
        "key": "Shelf Life",
        "value": "12 Months"
      },
      {
        "key": "Packaging",
        "value": "Sealed Pack"
      }
    ]
  },
  {
    "name": "Brooke Bond Red Label Tea 1kg",
    "brand": "Brooke",
    "category": "grocery",
    "desc": "Stock up your pantry with Brooke Bond Red Label Tea 1kg. Made from carefully selected ingredients, ensuring the highest quality and taste for your family. This essential grocery item is perfect for everyday cooking and brings authentic flavors to your meals. Packaged hygienically to retain freshness and nutritional value for longer.",
    "mrp": 24,
    "images": [
      "https://images.unsplash.com/photo-1587049352847-4d45548ce4fb?w=800&q=80",
      "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80",
      "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=800&q=80",
      "https://images.unsplash.com/photo-1574316074128-d89006de81fc?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Brooke"
      },
      {
        "key": "Type",
        "value": "Vegetarian"
      },
      {
        "key": "Shelf Life",
        "value": "12 Months"
      },
      {
        "key": "Packaging",
        "value": "Sealed Pack"
      }
    ]
  },
  {
    "name": "Nescafe Classic Instant Coffee 200g",
    "brand": "Nescafe",
    "category": "grocery",
    "desc": "Stock up your pantry with Nescafe Classic Instant Coffee 200g. Made from carefully selected ingredients, ensuring the highest quality and taste for your family. This essential grocery item is perfect for everyday cooking and brings authentic flavors to your meals. Packaged hygienically to retain freshness and nutritional value for longer.",
    "mrp": 15,
    "images": [
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80",
      "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=800&q=80",
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
      "https://images.unsplash.com/photo-1621245648508-0129037c6883?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Nescafe"
      },
      {
        "key": "Type",
        "value": "Vegetarian"
      },
      {
        "key": "Shelf Life",
        "value": "12 Months"
      },
      {
        "key": "Packaging",
        "value": "Sealed Pack"
      }
    ]
  },
  {
    "name": "Bru Gold Instant Coffee 100g",
    "brand": "Bru",
    "category": "grocery",
    "desc": "Stock up your pantry with Bru Gold Instant Coffee 100g. Made from carefully selected ingredients, ensuring the highest quality and taste for your family. This essential grocery item is perfect for everyday cooking and brings authentic flavors to your meals. Packaged hygienically to retain freshness and nutritional value for longer.",
    "mrp": 15,
    "images": [
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
      "https://images.unsplash.com/photo-1587049352847-4d45548ce4fb?w=800&q=80",
      "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80",
      "https://images.unsplash.com/photo-1621245648508-0129037c6883?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Bru"
      },
      {
        "key": "Type",
        "value": "Vegetarian"
      },
      {
        "key": "Shelf Life",
        "value": "12 Months"
      },
      {
        "key": "Packaging",
        "value": "Sealed Pack"
      }
    ]
  },
  {
    "name": "Kellogg's Corn Flakes Original 875g",
    "brand": "Kellogg's",
    "category": "grocery",
    "desc": "Stock up your pantry with Kellogg's Corn Flakes Original 875g. Made from carefully selected ingredients, ensuring the highest quality and taste for your family. This essential grocery item is perfect for everyday cooking and brings authentic flavors to your meals. Packaged hygienically to retain freshness and nutritional value for longer.",
    "mrp": 2,
    "images": [
      "https://images.unsplash.com/photo-1621245648508-0129037c6883?w=800&q=80",
      "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=800&q=80",
      "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80",
      "https://images.unsplash.com/photo-1587049352847-4d45548ce4fb?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Kellogg's"
      },
      {
        "key": "Type",
        "value": "Vegetarian"
      },
      {
        "key": "Shelf Life",
        "value": "12 Months"
      },
      {
        "key": "Packaging",
        "value": "Sealed Pack"
      }
    ]
  },
  {
    "name": "Quaker Oats Multigrain 1.5kg",
    "brand": "Quaker",
    "category": "grocery",
    "desc": "Stock up your pantry with Quaker Oats Multigrain 1.5kg. Made from carefully selected ingredients, ensuring the highest quality and taste for your family. This essential grocery item is perfect for everyday cooking and brings authentic flavors to your meals. Packaged hygienically to retain freshness and nutritional value for longer.",
    "mrp": 7,
    "images": [
      "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=800&q=80",
      "https://images.unsplash.com/photo-1621245648508-0129037c6883?w=800&q=80",
      "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=800&q=80",
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Quaker"
      },
      {
        "key": "Type",
        "value": "Vegetarian"
      },
      {
        "key": "Shelf Life",
        "value": "12 Months"
      },
      {
        "key": "Packaging",
        "value": "Sealed Pack"
      }
    ]
  },
  {
    "name": "Saffola Gold Blended Edible Oil 5L",
    "brand": "Saffola",
    "category": "grocery",
    "desc": "Stock up your pantry with Saffola Gold Blended Edible Oil 5L. Made from carefully selected ingredients, ensuring the highest quality and taste for your family. This essential grocery item is perfect for everyday cooking and brings authentic flavors to your meals. Packaged hygienically to retain freshness and nutritional value for longer.",
    "mrp": 9,
    "images": [
      "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=800&q=80",
      "https://images.unsplash.com/photo-1621245648508-0129037c6883?w=800&q=80",
      "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=800&q=80",
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Saffola"
      },
      {
        "key": "Type",
        "value": "Vegetarian"
      },
      {
        "key": "Shelf Life",
        "value": "12 Months"
      },
      {
        "key": "Packaging",
        "value": "Sealed Pack"
      }
    ]
  },
  {
    "name": "Dabur Honey 1kg",
    "brand": "Dabur",
    "category": "grocery",
    "desc": "Stock up your pantry with Dabur Honey 1kg. Made from carefully selected ingredients, ensuring the highest quality and taste for your family. This essential grocery item is perfect for everyday cooking and brings authentic flavors to your meals. Packaged hygienically to retain freshness and nutritional value for longer.",
    "mrp": 18,
    "images": [
      "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=800&q=80",
      "https://images.unsplash.com/photo-1621245648508-0129037c6883?w=800&q=80",
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80",
      "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Dabur"
      },
      {
        "key": "Type",
        "value": "Vegetarian"
      },
      {
        "key": "Shelf Life",
        "value": "12 Months"
      },
      {
        "key": "Packaging",
        "value": "Sealed Pack"
      }
    ]
  },
  {
    "name": "Catch Garam Masala Powder 100g",
    "brand": "Catch",
    "category": "grocery",
    "desc": "Stock up your pantry with Catch Garam Masala Powder 100g. Made from carefully selected ingredients, ensuring the highest quality and taste for your family. This essential grocery item is perfect for everyday cooking and brings authentic flavors to your meals. Packaged hygienically to retain freshness and nutritional value for longer.",
    "mrp": 18,
    "images": [
      "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=800&q=80",
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80",
      "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80",
      "https://images.unsplash.com/photo-1587049352847-4d45548ce4fb?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Catch"
      },
      {
        "key": "Type",
        "value": "Vegetarian"
      },
      {
        "key": "Shelf Life",
        "value": "12 Months"
      },
      {
        "key": "Packaging",
        "value": "Sealed Pack"
      }
    ]
  },
  {
    "name": "Everest Chicken Masala 100g",
    "brand": "Everest",
    "category": "grocery",
    "desc": "Stock up your pantry with Everest Chicken Masala 100g. Made from carefully selected ingredients, ensuring the highest quality and taste for your family. This essential grocery item is perfect for everyday cooking and brings authentic flavors to your meals. Packaged hygienically to retain freshness and nutritional value for longer.",
    "mrp": 12,
    "images": [
      "https://images.unsplash.com/photo-1621245648508-0129037c6883?w=800&q=80",
      "https://images.unsplash.com/photo-1574316074128-d89006de81fc?w=800&q=80",
      "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=800&q=80",
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Everest"
      },
      {
        "key": "Type",
        "value": "Vegetarian"
      },
      {
        "key": "Shelf Life",
        "value": "12 Months"
      },
      {
        "key": "Packaging",
        "value": "Sealed Pack"
      }
    ]
  },
  {
    "name": "Atomic Habits by James Clear",
    "brand": "Penguin",
    "category": "books",
    "desc": "Dive into the pages of Atomic Habits by James Clear. This compelling read has captivated audiences worldwide with its profound insights and engaging narrative. Whether you're looking to expand your knowledge, master a new skill, or simply escape into a beautifully crafted world, this book offers an unforgettable experience. A must-have addition to any avid reader's bookshelf.",
    "mrp": 36,
    "images": [
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80",
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80",
      "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&q=80",
      "https://images.unsplash.com/photo-1511108690759-001662ef4f1f?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Format",
        "value": "Paperback"
      },
      {
        "key": "Language",
        "value": "English"
      },
      {
        "key": "Publisher",
        "value": "Random House"
      },
      {
        "key": "Pages",
        "value": "300+"
      }
    ]
  },
  {
    "name": "NCERT Mathematics Class 12",
    "brand": "Penguin",
    "category": "books",
    "desc": "Dive into the pages of NCERT Mathematics Class 12. This compelling read has captivated audiences worldwide with its profound insights and engaging narrative. Whether you're looking to expand your knowledge, master a new skill, or simply escape into a beautifully crafted world, this book offers an unforgettable experience. A must-have addition to any avid reader's bookshelf.",
    "mrp": 17,
    "images": [
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80",
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&q=80",
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80",
      "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Format",
        "value": "Paperback"
      },
      {
        "key": "Language",
        "value": "English"
      },
      {
        "key": "Publisher",
        "value": "Random House"
      },
      {
        "key": "Pages",
        "value": "300+"
      }
    ]
  },
  {
    "name": "The Psychology of Money by Morgan Housel",
    "brand": "Penguin",
    "category": "books",
    "desc": "Dive into the pages of The Psychology of Money by Morgan Housel. This compelling read has captivated audiences worldwide with its profound insights and engaging narrative. Whether you're looking to expand your knowledge, master a new skill, or simply escape into a beautifully crafted world, this book offers an unforgettable experience. A must-have addition to any avid reader's bookshelf.",
    "mrp": 15,
    "images": [
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80",
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&q=80",
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80",
      "https://images.unsplash.com/photo-1524578974084-c1acb98683cd?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Format",
        "value": "Paperback"
      },
      {
        "key": "Language",
        "value": "English"
      },
      {
        "key": "Publisher",
        "value": "Random House"
      },
      {
        "key": "Pages",
        "value": "300+"
      }
    ]
  },
  {
    "name": "Ikigai: The Japanese Secret to a Long and Happy Life",
    "brand": "Penguin",
    "category": "books",
    "desc": "Dive into the pages of Ikigai: The Japanese Secret to a Long and Happy Life. This compelling read has captivated audiences worldwide with its profound insights and engaging narrative. Whether you're looking to expand your knowledge, master a new skill, or simply escape into a beautifully crafted world, this book offers an unforgettable experience. A must-have addition to any avid reader's bookshelf.",
    "mrp": 22,
    "images": [
      "https://images.unsplash.com/photo-1511108690759-001662ef4f1f?w=800&q=80",
      "https://images.unsplash.com/photo-1524578974084-c1acb98683cd?w=800&q=80",
      "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&q=80",
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Format",
        "value": "Paperback"
      },
      {
        "key": "Language",
        "value": "English"
      },
      {
        "key": "Publisher",
        "value": "Random House"
      },
      {
        "key": "Pages",
        "value": "300+"
      }
    ]
  },
  {
    "name": "Rich Dad Poor Dad by Robert Kiyosaki",
    "brand": "Penguin",
    "category": "books",
    "desc": "Dive into the pages of Rich Dad Poor Dad by Robert Kiyosaki. This compelling read has captivated audiences worldwide with its profound insights and engaging narrative. Whether you're looking to expand your knowledge, master a new skill, or simply escape into a beautifully crafted world, this book offers an unforgettable experience. A must-have addition to any avid reader's bookshelf.",
    "mrp": 16,
    "images": [
      "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&q=80",
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&q=80",
      "https://images.unsplash.com/photo-1511108690759-001662ef4f1f?w=800&q=80",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Format",
        "value": "Paperback"
      },
      {
        "key": "Language",
        "value": "English"
      },
      {
        "key": "Publisher",
        "value": "Random House"
      },
      {
        "key": "Pages",
        "value": "300+"
      }
    ]
  },
  {
    "name": "Sapiens: A Brief History of Humankind",
    "brand": "Penguin",
    "category": "books",
    "desc": "Dive into the pages of Sapiens: A Brief History of Humankind. This compelling read has captivated audiences worldwide with its profound insights and engaging narrative. Whether you're looking to expand your knowledge, master a new skill, or simply escape into a beautifully crafted world, this book offers an unforgettable experience. A must-have addition to any avid reader's bookshelf.",
    "mrp": 46,
    "images": [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80",
      "https://images.unsplash.com/photo-1524578974084-c1acb98683cd?w=800&q=80",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80",
      "https://images.unsplash.com/photo-1511108690759-001662ef4f1f?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Format",
        "value": "Paperback"
      },
      {
        "key": "Language",
        "value": "English"
      },
      {
        "key": "Publisher",
        "value": "Random House"
      },
      {
        "key": "Pages",
        "value": "300+"
      }
    ]
  },
  {
    "name": "The Alchemist by Paulo Coelho",
    "brand": "Penguin",
    "category": "books",
    "desc": "Dive into the pages of The Alchemist by Paulo Coelho. This compelling read has captivated audiences worldwide with its profound insights and engaging narrative. Whether you're looking to expand your knowledge, master a new skill, or simply escape into a beautifully crafted world, this book offers an unforgettable experience. A must-have addition to any avid reader's bookshelf.",
    "mrp": 21,
    "images": [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80",
      "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&q=80",
      "https://images.unsplash.com/photo-1524578974084-c1acb98683cd?w=800&q=80",
      "https://images.unsplash.com/photo-1511108690759-001662ef4f1f?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Format",
        "value": "Paperback"
      },
      {
        "key": "Language",
        "value": "English"
      },
      {
        "key": "Publisher",
        "value": "Random House"
      },
      {
        "key": "Pages",
        "value": "300+"
      }
    ]
  },
  {
    "name": "Thinking, Fast and Slow",
    "brand": "Penguin",
    "category": "books",
    "desc": "Dive into the pages of Thinking, Fast and Slow. This compelling read has captivated audiences worldwide with its profound insights and engaging narrative. Whether you're looking to expand your knowledge, master a new skill, or simply escape into a beautifully crafted world, this book offers an unforgettable experience. A must-have addition to any avid reader's bookshelf.",
    "mrp": 16,
    "images": [
      "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&q=80",
      "https://images.unsplash.com/photo-1511108690759-001662ef4f1f?w=800&q=80",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80",
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Format",
        "value": "Paperback"
      },
      {
        "key": "Language",
        "value": "English"
      },
      {
        "key": "Publisher",
        "value": "Random House"
      },
      {
        "key": "Pages",
        "value": "300+"
      }
    ]
  },
  {
    "name": "Do Epic Shit by Ankur Warikoo",
    "brand": "Penguin",
    "category": "books",
    "desc": "Dive into the pages of Do Epic Shit by Ankur Warikoo. This compelling read has captivated audiences worldwide with its profound insights and engaging narrative. Whether you're looking to expand your knowledge, master a new skill, or simply escape into a beautifully crafted world, this book offers an unforgettable experience. A must-have addition to any avid reader's bookshelf.",
    "mrp": 24,
    "images": [
      "https://images.unsplash.com/photo-1511108690759-001662ef4f1f?w=800&q=80",
      "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&q=80",
      "https://images.unsplash.com/photo-1524578974084-c1acb98683cd?w=800&q=80",
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Format",
        "value": "Paperback"
      },
      {
        "key": "Language",
        "value": "English"
      },
      {
        "key": "Publisher",
        "value": "Random House"
      },
      {
        "key": "Pages",
        "value": "300+"
      }
    ]
  },
  {
    "name": "Deep Work by Cal Newport",
    "brand": "Penguin",
    "category": "books",
    "desc": "Dive into the pages of Deep Work by Cal Newport. This compelling read has captivated audiences worldwide with its profound insights and engaging narrative. Whether you're looking to expand your knowledge, master a new skill, or simply escape into a beautifully crafted world, this book offers an unforgettable experience. A must-have addition to any avid reader's bookshelf.",
    "mrp": 22,
    "images": [
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&q=80",
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80",
      "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&q=80",
      "https://images.unsplash.com/photo-1511108690759-001662ef4f1f?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Format",
        "value": "Paperback"
      },
      {
        "key": "Language",
        "value": "English"
      },
      {
        "key": "Publisher",
        "value": "Random House"
      },
      {
        "key": "Pages",
        "value": "300+"
      }
    ]
  },
  {
    "name": "The Power of Your Subconscious Mind",
    "brand": "Penguin",
    "category": "books",
    "desc": "Dive into the pages of The Power of Your Subconscious Mind. This compelling read has captivated audiences worldwide with its profound insights and engaging narrative. Whether you're looking to expand your knowledge, master a new skill, or simply escape into a beautifully crafted world, this book offers an unforgettable experience. A must-have addition to any avid reader's bookshelf.",
    "mrp": 23,
    "images": [
      "https://images.unsplash.com/photo-1524578974084-c1acb98683cd?w=800&q=80",
      "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&q=80",
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80",
      "https://images.unsplash.com/photo-1511108690759-001662ef4f1f?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Format",
        "value": "Paperback"
      },
      {
        "key": "Language",
        "value": "English"
      },
      {
        "key": "Publisher",
        "value": "Random House"
      },
      {
        "key": "Pages",
        "value": "300+"
      }
    ]
  },
  {
    "name": "Word Power Made Easy by Norman Lewis",
    "brand": "Penguin",
    "category": "books",
    "desc": "Dive into the pages of Word Power Made Easy by Norman Lewis. This compelling read has captivated audiences worldwide with its profound insights and engaging narrative. Whether you're looking to expand your knowledge, master a new skill, or simply escape into a beautifully crafted world, this book offers an unforgettable experience. A must-have addition to any avid reader's bookshelf.",
    "mrp": 33,
    "images": [
      "https://images.unsplash.com/photo-1524578974084-c1acb98683cd?w=800&q=80",
      "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&q=80",
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80",
      "https://images.unsplash.com/photo-1511108690759-001662ef4f1f?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Format",
        "value": "Paperback"
      },
      {
        "key": "Language",
        "value": "English"
      },
      {
        "key": "Publisher",
        "value": "Random House"
      },
      {
        "key": "Pages",
        "value": "300+"
      }
    ]
  },
  {
    "name": "Concept of Physics by H.C. Verma",
    "brand": "Penguin",
    "category": "books",
    "desc": "Dive into the pages of Concept of Physics by H.C. Verma. This compelling read has captivated audiences worldwide with its profound insights and engaging narrative. Whether you're looking to expand your knowledge, master a new skill, or simply escape into a beautifully crafted world, this book offers an unforgettable experience. A must-have addition to any avid reader's bookshelf.",
    "mrp": 30,
    "images": [
      "https://images.unsplash.com/photo-1511108690759-001662ef4f1f?w=800&q=80",
      "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&q=80",
      "https://images.unsplash.com/photo-1524578974084-c1acb98683cd?w=800&q=80",
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Format",
        "value": "Paperback"
      },
      {
        "key": "Language",
        "value": "English"
      },
      {
        "key": "Publisher",
        "value": "Random House"
      },
      {
        "key": "Pages",
        "value": "300+"
      }
    ]
  },
  {
    "name": "Indian Polity by M. Laxmikanth",
    "brand": "Penguin",
    "category": "books",
    "desc": "Dive into the pages of Indian Polity by M. Laxmikanth. This compelling read has captivated audiences worldwide with its profound insights and engaging narrative. Whether you're looking to expand your knowledge, master a new skill, or simply escape into a beautifully crafted world, this book offers an unforgettable experience. A must-have addition to any avid reader's bookshelf.",
    "mrp": 43,
    "images": [
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&q=80",
      "https://images.unsplash.com/photo-1524578974084-c1acb98683cd?w=800&q=80",
      "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&q=80",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Format",
        "value": "Paperback"
      },
      {
        "key": "Language",
        "value": "English"
      },
      {
        "key": "Publisher",
        "value": "Random House"
      },
      {
        "key": "Pages",
        "value": "300+"
      }
    ]
  },
  {
    "name": "Harry Potter and the Philosopher's Stone",
    "brand": "Penguin",
    "category": "books",
    "desc": "Dive into the pages of Harry Potter and the Philosopher's Stone. This compelling read has captivated audiences worldwide with its profound insights and engaging narrative. Whether you're looking to expand your knowledge, master a new skill, or simply escape into a beautifully crafted world, this book offers an unforgettable experience. A must-have addition to any avid reader's bookshelf.",
    "mrp": 20,
    "images": [
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&q=80",
      "https://images.unsplash.com/photo-1524578974084-c1acb98683cd?w=800&q=80",
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80",
      "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Format",
        "value": "Paperback"
      },
      {
        "key": "Language",
        "value": "English"
      },
      {
        "key": "Publisher",
        "value": "Random House"
      },
      {
        "key": "Pages",
        "value": "300+"
      }
    ]
  },
  {
    "name": "Levi's 511 Slim Fit Jeans Men",
    "brand": "Levi's",
    "category": "fashion",
    "desc": "Elevate your style with the Levi's 511 Slim Fit Jeans Men. Crafted from premium materials, it offers unmatched comfort without compromising on aesthetics. The contemporary design features precise detailing and a flattering fit, making it versatile enough for both casual outings and special occasions. Make a statement and step out in confidence.",
    "mrp": 47,
    "images": [
      "https://images.unsplash.com/photo-1434389678278-be4d41aa1d40?w=800&q=80",
      "https://images.unsplash.com/photo-1489987707023-af6f0e4b868e?w=800&q=80",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
      "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Levi's"
      },
      {
        "key": "Material",
        "value": "Premium Blend"
      },
      {
        "key": "Care",
        "value": "Machine Wash"
      },
      {
        "key": "Fit",
        "value": "Regular"
      }
    ]
  },
  {
    "name": "Biba Women Floral Printed Kurti",
    "brand": "Biba",
    "category": "fashion",
    "desc": "Elevate your style with the Biba Women Floral Printed Kurti. Crafted from premium materials, it offers unmatched comfort without compromising on aesthetics. The contemporary design features precise detailing and a flattering fit, making it versatile enough for both casual outings and special occasions. Make a statement and step out in confidence.",
    "mrp": 127,
    "images": [
      "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&q=80",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
      "https://images.unsplash.com/photo-1489987707023-af6f0e4b868e?w=800&q=80",
      "https://images.unsplash.com/photo-1485230895920-ee9ac3c8d132?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Biba"
      },
      {
        "key": "Material",
        "value": "Premium Blend"
      },
      {
        "key": "Care",
        "value": "Machine Wash"
      },
      {
        "key": "Fit",
        "value": "Regular"
      }
    ]
  },
  {
    "name": "Nike Air Max 270 Running Shoes",
    "brand": "Nike",
    "category": "fashion",
    "desc": "Elevate your style with the Nike Air Max 270 Running Shoes. Crafted from premium materials, it offers unmatched comfort without compromising on aesthetics. The contemporary design features precise detailing and a flattering fit, making it versatile enough for both casual outings and special occasions. Make a statement and step out in confidence.",
    "mrp": 120,
    "images": [
      "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&q=80",
      "https://images.unsplash.com/photo-1485230895920-ee9ac3c8d132?w=800&q=80",
      "https://images.unsplash.com/photo-1434389678278-be4d41aa1d40?w=800&q=80",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Nike"
      },
      {
        "key": "Material",
        "value": "Premium Blend"
      },
      {
        "key": "Care",
        "value": "Machine Wash"
      },
      {
        "key": "Fit",
        "value": "Regular"
      }
    ]
  },
  {
    "name": "Puma Smash v2 Leather Sneakers",
    "brand": "Puma",
    "category": "fashion",
    "desc": "Elevate your style with the Puma Smash v2 Leather Sneakers. Crafted from premium materials, it offers unmatched comfort without compromising on aesthetics. The contemporary design features precise detailing and a flattering fit, making it versatile enough for both casual outings and special occasions. Make a statement and step out in confidence.",
    "mrp": 137,
    "images": [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
      "https://images.unsplash.com/photo-1489987707023-af6f0e4b868e?w=800&q=80",
      "https://images.unsplash.com/photo-1434389678278-be4d41aa1d40?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Puma"
      },
      {
        "key": "Material",
        "value": "Premium Blend"
      },
      {
        "key": "Care",
        "value": "Machine Wash"
      },
      {
        "key": "Fit",
        "value": "Regular"
      }
    ]
  },
  {
    "name": "Adidas Core 18 Presentation Jacket",
    "brand": "Adidas",
    "category": "fashion",
    "desc": "Elevate your style with the Adidas Core 18 Presentation Jacket. Crafted from premium materials, it offers unmatched comfort without compromising on aesthetics. The contemporary design features precise detailing and a flattering fit, making it versatile enough for both casual outings and special occasions. Make a statement and step out in confidence.",
    "mrp": 113,
    "images": [
      "https://images.unsplash.com/photo-1434389678278-be4d41aa1d40?w=800&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
      "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&q=80",
      "https://images.unsplash.com/photo-1485230895920-ee9ac3c8d132?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Adidas"
      },
      {
        "key": "Material",
        "value": "Premium Blend"
      },
      {
        "key": "Care",
        "value": "Machine Wash"
      },
      {
        "key": "Fit",
        "value": "Regular"
      }
    ]
  },
  {
    "name": "Zara Men's Essential Basic T-Shirt",
    "brand": "Zara",
    "category": "fashion",
    "desc": "Elevate your style with the Zara Men's Essential Basic T-Shirt. Crafted from premium materials, it offers unmatched comfort without compromising on aesthetics. The contemporary design features precise detailing and a flattering fit, making it versatile enough for both casual outings and special occasions. Make a statement and step out in confidence.",
    "mrp": 141,
    "images": [
      "https://images.unsplash.com/photo-1485230895920-ee9ac3c8d132?w=800&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
      "https://images.unsplash.com/photo-1489987707023-af6f0e4b868e?w=800&q=80",
      "https://images.unsplash.com/photo-1434389678278-be4d41aa1d40?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Zara"
      },
      {
        "key": "Material",
        "value": "Premium Blend"
      },
      {
        "key": "Care",
        "value": "Machine Wash"
      },
      {
        "key": "Fit",
        "value": "Regular"
      }
    ]
  },
  {
    "name": "H&M Women's Oversized Cotton Shirt",
    "brand": "H&M",
    "category": "fashion",
    "desc": "Elevate your style with the H&M Women's Oversized Cotton Shirt. Crafted from premium materials, it offers unmatched comfort without compromising on aesthetics. The contemporary design features precise detailing and a flattering fit, making it versatile enough for both casual outings and special occasions. Make a statement and step out in confidence.",
    "mrp": 48,
    "images": [
      "https://images.unsplash.com/photo-1485230895920-ee9ac3c8d132?w=800&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
      "https://images.unsplash.com/photo-1489987707023-af6f0e4b868e?w=800&q=80",
      "https://images.unsplash.com/photo-1434389678278-be4d41aa1d40?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "H&M"
      },
      {
        "key": "Material",
        "value": "Premium Blend"
      },
      {
        "key": "Care",
        "value": "Machine Wash"
      },
      {
        "key": "Fit",
        "value": "Regular"
      }
    ]
  },
  {
    "name": "FabIndia Men's Cotton Solid Kurta",
    "brand": "FabIndia",
    "category": "fashion",
    "desc": "Elevate your style with the FabIndia Men's Cotton Solid Kurta. Crafted from premium materials, it offers unmatched comfort without compromising on aesthetics. The contemporary design features precise detailing and a flattering fit, making it versatile enough for both casual outings and special occasions. Make a statement and step out in confidence.",
    "mrp": 123,
    "images": [
      "https://images.unsplash.com/photo-1434389678278-be4d41aa1d40?w=800&q=80",
      "https://images.unsplash.com/photo-1485230895920-ee9ac3c8d132?w=800&q=80",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
      "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "FabIndia"
      },
      {
        "key": "Material",
        "value": "Premium Blend"
      },
      {
        "key": "Care",
        "value": "Machine Wash"
      },
      {
        "key": "Fit",
        "value": "Regular"
      }
    ]
  },
  {
    "name": "Raymond Formal Tailored Fit Suit",
    "brand": "Raymond",
    "category": "fashion",
    "desc": "Elevate your style with the Raymond Formal Tailored Fit Suit. Crafted from premium materials, it offers unmatched comfort without compromising on aesthetics. The contemporary design features precise detailing and a flattering fit, making it versatile enough for both casual outings and special occasions. Make a statement and step out in confidence.",
    "mrp": 17,
    "images": [
      "https://images.unsplash.com/photo-1434389678278-be4d41aa1d40?w=800&q=80",
      "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&q=80",
      "https://images.unsplash.com/photo-1489987707023-af6f0e4b868e?w=800&q=80",
      "https://images.unsplash.com/photo-1485230895920-ee9ac3c8d132?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Raymond"
      },
      {
        "key": "Material",
        "value": "Premium Blend"
      },
      {
        "key": "Care",
        "value": "Machine Wash"
      },
      {
        "key": "Fit",
        "value": "Regular"
      }
    ]
  },
  {
    "name": "Allen Solly Men's Polo Neck T-Shirt",
    "brand": "Allen",
    "category": "fashion",
    "desc": "Elevate your style with the Allen Solly Men's Polo Neck T-Shirt. Crafted from premium materials, it offers unmatched comfort without compromising on aesthetics. The contemporary design features precise detailing and a flattering fit, making it versatile enough for both casual outings and special occasions. Make a statement and step out in confidence.",
    "mrp": 98,
    "images": [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
      "https://images.unsplash.com/photo-1485230895920-ee9ac3c8d132?w=800&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
      "https://images.unsplash.com/photo-1434389678278-be4d41aa1d40?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Allen"
      },
      {
        "key": "Material",
        "value": "Premium Blend"
      },
      {
        "key": "Care",
        "value": "Machine Wash"
      },
      {
        "key": "Fit",
        "value": "Regular"
      }
    ]
  },
  {
    "name": "Bata Comfit Women's Sandals",
    "brand": "Bata",
    "category": "fashion",
    "desc": "Elevate your style with the Bata Comfit Women's Sandals. Crafted from premium materials, it offers unmatched comfort without compromising on aesthetics. The contemporary design features precise detailing and a flattering fit, making it versatile enough for both casual outings and special occasions. Make a statement and step out in confidence.",
    "mrp": 53,
    "images": [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
      "https://images.unsplash.com/photo-1434389678278-be4d41aa1d40?w=800&q=80",
      "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Bata"
      },
      {
        "key": "Material",
        "value": "Premium Blend"
      },
      {
        "key": "Care",
        "value": "Machine Wash"
      },
      {
        "key": "Fit",
        "value": "Regular"
      }
    ]
  },
  {
    "name": "Woodland Men's Leather Trekking Shoes",
    "brand": "Woodland",
    "category": "fashion",
    "desc": "Elevate your style with the Woodland Men's Leather Trekking Shoes. Crafted from premium materials, it offers unmatched comfort without compromising on aesthetics. The contemporary design features precise detailing and a flattering fit, making it versatile enough for both casual outings and special occasions. Make a statement and step out in confidence.",
    "mrp": 89,
    "images": [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
      "https://images.unsplash.com/photo-1489987707023-af6f0e4b868e?w=800&q=80",
      "https://images.unsplash.com/photo-1485230895920-ee9ac3c8d132?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Woodland"
      },
      {
        "key": "Material",
        "value": "Premium Blend"
      },
      {
        "key": "Care",
        "value": "Machine Wash"
      },
      {
        "key": "Fit",
        "value": "Regular"
      }
    ]
  },
  {
    "name": "Fastrack Reflex 3.0 Smart Band",
    "brand": "Fastrack",
    "category": "fashion",
    "desc": "Elevate your style with the Fastrack Reflex 3.0 Smart Band. Crafted from premium materials, it offers unmatched comfort without compromising on aesthetics. The contemporary design features precise detailing and a flattering fit, making it versatile enough for both casual outings and special occasions. Make a statement and step out in confidence.",
    "mrp": 43,
    "images": [
      "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
      "https://images.unsplash.com/photo-1434389678278-be4d41aa1d40?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Fastrack"
      },
      {
        "key": "Material",
        "value": "Premium Blend"
      },
      {
        "key": "Care",
        "value": "Machine Wash"
      },
      {
        "key": "Fit",
        "value": "Regular"
      }
    ]
  },
  {
    "name": "Casio G-Shock Analog-Digital Watch",
    "brand": "Casio",
    "category": "fashion",
    "desc": "Elevate your style with the Casio G-Shock Analog-Digital Watch. Crafted from premium materials, it offers unmatched comfort without compromising on aesthetics. The contemporary design features precise detailing and a flattering fit, making it versatile enough for both casual outings and special occasions. Make a statement and step out in confidence.",
    "mrp": 28,
    "images": [
      "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
      "https://images.unsplash.com/photo-1489987707023-af6f0e4b868e?w=800&q=80",
      "https://images.unsplash.com/photo-1485230895920-ee9ac3c8d132?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Casio"
      },
      {
        "key": "Material",
        "value": "Premium Blend"
      },
      {
        "key": "Care",
        "value": "Machine Wash"
      },
      {
        "key": "Fit",
        "value": "Regular"
      }
    ]
  },
  {
    "name": "Titan Neo Men's Leather Watch",
    "brand": "Titan",
    "category": "fashion",
    "desc": "Elevate your style with the Titan Neo Men's Leather Watch. Crafted from premium materials, it offers unmatched comfort without compromising on aesthetics. The contemporary design features precise detailing and a flattering fit, making it versatile enough for both casual outings and special occasions. Make a statement and step out in confidence.",
    "mrp": 48,
    "images": [
      "https://images.unsplash.com/photo-1485230895920-ee9ac3c8d132?w=800&q=80",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
      "https://images.unsplash.com/photo-1489987707023-af6f0e4b868e?w=800&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Titan"
      },
      {
        "key": "Material",
        "value": "Premium Blend"
      },
      {
        "key": "Care",
        "value": "Machine Wash"
      },
      {
        "key": "Fit",
        "value": "Regular"
      }
    ]
  },
  {
    "name": "Fossil Gen 6 Smartwatch",
    "brand": "Fossil",
    "category": "fashion",
    "desc": "Elevate your style with the Fossil Gen 6 Smartwatch. Crafted from premium materials, it offers unmatched comfort without compromising on aesthetics. The contemporary design features precise detailing and a flattering fit, making it versatile enough for both casual outings and special occasions. Make a statement and step out in confidence.",
    "mrp": 38,
    "images": [
      "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
      "https://images.unsplash.com/photo-1485230895920-ee9ac3c8d132?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Fossil"
      },
      {
        "key": "Material",
        "value": "Premium Blend"
      },
      {
        "key": "Care",
        "value": "Machine Wash"
      },
      {
        "key": "Fit",
        "value": "Regular"
      }
    ]
  },
  {
    "name": "Vera Moda Women's A-Line Dress",
    "brand": "Vera",
    "category": "fashion",
    "desc": "Elevate your style with the Vera Moda Women's A-Line Dress. Crafted from premium materials, it offers unmatched comfort without compromising on aesthetics. The contemporary design features precise detailing and a flattering fit, making it versatile enough for both casual outings and special occasions. Make a statement and step out in confidence.",
    "mrp": 36,
    "images": [
      "https://images.unsplash.com/photo-1485230895920-ee9ac3c8d132?w=800&q=80",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
      "https://images.unsplash.com/photo-1489987707023-af6f0e4b868e?w=800&q=80",
      "https://images.unsplash.com/photo-1434389678278-be4d41aa1d40?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Vera"
      },
      {
        "key": "Material",
        "value": "Premium Blend"
      },
      {
        "key": "Care",
        "value": "Machine Wash"
      },
      {
        "key": "Fit",
        "value": "Regular"
      }
    ]
  },
  {
    "name": "W for Woman Straight Kurta",
    "brand": "W",
    "category": "fashion",
    "desc": "Elevate your style with the W for Woman Straight Kurta. Crafted from premium materials, it offers unmatched comfort without compromising on aesthetics. The contemporary design features precise detailing and a flattering fit, making it versatile enough for both casual outings and special occasions. Make a statement and step out in confidence.",
    "mrp": 26,
    "images": [
      "https://images.unsplash.com/photo-1485230895920-ee9ac3c8d132?w=800&q=80",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
      "https://images.unsplash.com/photo-1489987707023-af6f0e4b868e?w=800&q=80",
      "https://images.unsplash.com/photo-1434389678278-be4d41aa1d40?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "W"
      },
      {
        "key": "Material",
        "value": "Premium Blend"
      },
      {
        "key": "Care",
        "value": "Machine Wash"
      },
      {
        "key": "Fit",
        "value": "Regular"
      }
    ]
  },
  {
    "name": "U.S. Polo Assn. Men's Chino Pants",
    "brand": "U.S. Polo Assn.",
    "category": "fashion",
    "desc": "Elevate your style with the U.S. Polo Assn. Men's Chino Pants. Crafted from premium materials, it offers unmatched comfort without compromising on aesthetics. The contemporary design features precise detailing and a flattering fit, making it versatile enough for both casual outings and special occasions. Make a statement and step out in confidence.",
    "mrp": 76,
    "images": [
      "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
      "https://images.unsplash.com/photo-1434389678278-be4d41aa1d40?w=800&q=80",
      "https://images.unsplash.com/photo-1489987707023-af6f0e4b868e?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "U.S. Polo Assn."
      },
      {
        "key": "Material",
        "value": "Premium Blend"
      },
      {
        "key": "Care",
        "value": "Machine Wash"
      },
      {
        "key": "Fit",
        "value": "Regular"
      }
    ]
  },
  {
    "name": "Tommy Hilfiger Men's Wallet",
    "brand": "Tommy",
    "category": "fashion",
    "desc": "Elevate your style with the Tommy Hilfiger Men's Wallet. Crafted from premium materials, it offers unmatched comfort without compromising on aesthetics. The contemporary design features precise detailing and a flattering fit, making it versatile enough for both casual outings and special occasions. Make a statement and step out in confidence.",
    "mrp": 95,
    "images": [
      "https://images.unsplash.com/photo-1489987707023-af6f0e4b868e?w=800&q=80",
      "https://images.unsplash.com/photo-1434389678278-be4d41aa1d40?w=800&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
      "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Tommy"
      },
      {
        "key": "Material",
        "value": "Premium Blend"
      },
      {
        "key": "Care",
        "value": "Machine Wash"
      },
      {
        "key": "Fit",
        "value": "Regular"
      }
    ]
  },
  {
    "name": "Prestige Aluminium Pressure Cooker 5L",
    "brand": "Prestige",
    "category": "home-kitchen",
    "desc": "Upgrade your living space with the Prestige Aluminium Pressure Cooker 5L. Designed to bring convenience and style to your home, this product combines durable construction with elegant aesthetics. It seamlessly blends into modern interiors while providing reliable everyday functionality. Experience the perfect harmony of utility and design.",
    "mrp": 183,
    "images": [
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80",
      "https://images.unsplash.com/photo-1556912172-45b7eedd91fb?w=800&q=80",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80",
      "https://images.unsplash.com/photo-1581622558667-3419a8dc5f83?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Prestige"
      },
      {
        "key": "Material",
        "value": "Durable Construction"
      },
      {
        "key": "Warranty",
        "value": "1 Year"
      },
      {
        "key": "Usage",
        "value": "Everyday"
      }
    ]
  },
  {
    "name": "Amazon Basics Microfibre Bedsheet Set",
    "brand": "Amazon",
    "category": "home-kitchen",
    "desc": "Upgrade your living space with the Amazon Basics Microfibre Bedsheet Set. Designed to bring convenience and style to your home, this product combines durable construction with elegant aesthetics. It seamlessly blends into modern interiors while providing reliable everyday functionality. Experience the perfect harmony of utility and design.",
    "mrp": 80,
    "images": [
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80",
      "https://images.unsplash.com/photo-1556912172-45b7eedd91fb?w=800&q=80",
      "https://images.unsplash.com/photo-1581622558667-3419a8dc5f83?w=800&q=80",
      "https://images.unsplash.com/photo-1584285458399-6f98c894fb21?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Amazon"
      },
      {
        "key": "Material",
        "value": "Durable Construction"
      },
      {
        "key": "Warranty",
        "value": "1 Year"
      },
      {
        "key": "Usage",
        "value": "Everyday"
      }
    ]
  },
  {
    "name": "Pigeon by Stovekraft Induction Cooktop",
    "brand": "Pigeon",
    "category": "home-kitchen",
    "desc": "Upgrade your living space with the Pigeon by Stovekraft Induction Cooktop. Designed to bring convenience and style to your home, this product combines durable construction with elegant aesthetics. It seamlessly blends into modern interiors while providing reliable everyday functionality. Experience the perfect harmony of utility and design.",
    "mrp": 136,
    "images": [
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80",
      "https://images.unsplash.com/photo-1584285458399-6f98c894fb21?w=800&q=80",
      "https://images.unsplash.com/photo-1581622558667-3419a8dc5f83?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Pigeon"
      },
      {
        "key": "Material",
        "value": "Durable Construction"
      },
      {
        "key": "Warranty",
        "value": "1 Year"
      },
      {
        "key": "Usage",
        "value": "Everyday"
      }
    ]
  },
  {
    "name": "Milton Thermosteel Hot and Cold Flask 1L",
    "brand": "Milton",
    "category": "home-kitchen",
    "desc": "Upgrade your living space with the Milton Thermosteel Hot and Cold Flask 1L. Designed to bring convenience and style to your home, this product combines durable construction with elegant aesthetics. It seamlessly blends into modern interiors while providing reliable everyday functionality. Experience the perfect harmony of utility and design.",
    "mrp": 202,
    "images": [
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80",
      "https://images.unsplash.com/photo-1581622558667-3419a8dc5f83?w=800&q=80",
      "https://images.unsplash.com/photo-1584285458399-6f98c894fb21?w=800&q=80",
      "https://images.unsplash.com/photo-1556912172-45b7eedd91fb?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Milton"
      },
      {
        "key": "Material",
        "value": "Durable Construction"
      },
      {
        "key": "Warranty",
        "value": "1 Year"
      },
      {
        "key": "Usage",
        "value": "Everyday"
      }
    ]
  },
  {
    "name": "Bombay Dyeing Cotton Double Bedsheet",
    "brand": "Bombay",
    "category": "home-kitchen",
    "desc": "Upgrade your living space with the Bombay Dyeing Cotton Double Bedsheet. Designed to bring convenience and style to your home, this product combines durable construction with elegant aesthetics. It seamlessly blends into modern interiors while providing reliable everyday functionality. Experience the perfect harmony of utility and design.",
    "mrp": 57,
    "images": [
      "https://images.unsplash.com/photo-1584285458399-6f98c894fb21?w=800&q=80",
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80",
      "https://images.unsplash.com/photo-1581622558667-3419a8dc5f83?w=800&q=80",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Bombay"
      },
      {
        "key": "Material",
        "value": "Durable Construction"
      },
      {
        "key": "Warranty",
        "value": "1 Year"
      },
      {
        "key": "Usage",
        "value": "Everyday"
      }
    ]
  },
  {
    "name": "Philips 1000W Dry Iron",
    "brand": "Philips",
    "category": "home-kitchen",
    "desc": "Upgrade your living space with the Philips 1000W Dry Iron. Designed to bring convenience and style to your home, this product combines durable construction with elegant aesthetics. It seamlessly blends into modern interiors while providing reliable everyday functionality. Experience the perfect harmony of utility and design.",
    "mrp": 39,
    "images": [
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80",
      "https://images.unsplash.com/photo-1556912172-45b7eedd91fb?w=800&q=80",
      "https://images.unsplash.com/photo-1584285458399-6f98c894fb21?w=800&q=80",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Philips"
      },
      {
        "key": "Material",
        "value": "Durable Construction"
      },
      {
        "key": "Warranty",
        "value": "1 Year"
      },
      {
        "key": "Usage",
        "value": "Everyday"
      }
    ]
  },
  {
    "name": "Bajaj 17L Microwave Oven",
    "brand": "Bajaj",
    "category": "home-kitchen",
    "desc": "Upgrade your living space with the Bajaj 17L Microwave Oven. Designed to bring convenience and style to your home, this product combines durable construction with elegant aesthetics. It seamlessly blends into modern interiors while providing reliable everyday functionality. Experience the perfect harmony of utility and design.",
    "mrp": 91,
    "images": [
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80",
      "https://images.unsplash.com/photo-1556912172-45b7eedd91fb?w=800&q=80",
      "https://images.unsplash.com/photo-1581622558667-3419a8dc5f83?w=800&q=80",
      "https://images.unsplash.com/photo-1584285458399-6f98c894fb21?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Bajaj"
      },
      {
        "key": "Material",
        "value": "Durable Construction"
      },
      {
        "key": "Warranty",
        "value": "1 Year"
      },
      {
        "key": "Usage",
        "value": "Everyday"
      }
    ]
  },
  {
    "name": "Usha Room Heater 2000W",
    "brand": "Usha",
    "category": "home-kitchen",
    "desc": "Upgrade your living space with the Usha Room Heater 2000W. Designed to bring convenience and style to your home, this product combines durable construction with elegant aesthetics. It seamlessly blends into modern interiors while providing reliable everyday functionality. Experience the perfect harmony of utility and design.",
    "mrp": 189,
    "images": [
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80",
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80",
      "https://images.unsplash.com/photo-1556912172-45b7eedd91fb?w=800&q=80",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Usha"
      },
      {
        "key": "Material",
        "value": "Durable Construction"
      },
      {
        "key": "Warranty",
        "value": "1 Year"
      },
      {
        "key": "Usage",
        "value": "Everyday"
      }
    ]
  },
  {
    "name": "Cello Opalware Dinner Set 33 Pieces",
    "brand": "Cello",
    "category": "home-kitchen",
    "desc": "Upgrade your living space with the Cello Opalware Dinner Set 33 Pieces. Designed to bring convenience and style to your home, this product combines durable construction with elegant aesthetics. It seamlessly blends into modern interiors while providing reliable everyday functionality. Experience the perfect harmony of utility and design.",
    "mrp": 216,
    "images": [
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80",
      "https://images.unsplash.com/photo-1556912172-45b7eedd91fb?w=800&q=80",
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80",
      "https://images.unsplash.com/photo-1581622558667-3419a8dc5f83?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Cello"
      },
      {
        "key": "Material",
        "value": "Durable Construction"
      },
      {
        "key": "Warranty",
        "value": "1 Year"
      },
      {
        "key": "Usage",
        "value": "Everyday"
      }
    ]
  },
  {
    "name": "Hawkins Contura Hard Anodised Cooker",
    "brand": "Hawkins",
    "category": "home-kitchen",
    "desc": "Upgrade your living space with the Hawkins Contura Hard Anodised Cooker. Designed to bring convenience and style to your home, this product combines durable construction with elegant aesthetics. It seamlessly blends into modern interiors while providing reliable everyday functionality. Experience the perfect harmony of utility and design.",
    "mrp": 99,
    "images": [
      "https://images.unsplash.com/photo-1584285458399-6f98c894fb21?w=800&q=80",
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80",
      "https://images.unsplash.com/photo-1556912172-45b7eedd91fb?w=800&q=80",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Hawkins"
      },
      {
        "key": "Material",
        "value": "Durable Construction"
      },
      {
        "key": "Warranty",
        "value": "1 Year"
      },
      {
        "key": "Usage",
        "value": "Everyday"
      }
    ]
  },
  {
    "name": "Wakefit Orthopedic Memory Foam Mattress",
    "brand": "Wakefit",
    "category": "home-kitchen",
    "desc": "Upgrade your living space with the Wakefit Orthopedic Memory Foam Mattress. Designed to bring convenience and style to your home, this product combines durable construction with elegant aesthetics. It seamlessly blends into modern interiors while providing reliable everyday functionality. Experience the perfect harmony of utility and design.",
    "mrp": 71,
    "images": [
      "https://images.unsplash.com/photo-1584285458399-6f98c894fb21?w=800&q=80",
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80",
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Wakefit"
      },
      {
        "key": "Material",
        "value": "Durable Construction"
      },
      {
        "key": "Warranty",
        "value": "1 Year"
      },
      {
        "key": "Usage",
        "value": "Everyday"
      }
    ]
  },
  {
    "name": "Solimo Water Resistant Mattress Protector",
    "brand": "Solimo",
    "category": "home-kitchen",
    "desc": "Upgrade your living space with the Solimo Water Resistant Mattress Protector. Designed to bring convenience and style to your home, this product combines durable construction with elegant aesthetics. It seamlessly blends into modern interiors while providing reliable everyday functionality. Experience the perfect harmony of utility and design.",
    "mrp": 175,
    "images": [
      "https://images.unsplash.com/photo-1556912172-45b7eedd91fb?w=800&q=80",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80",
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80",
      "https://images.unsplash.com/photo-1581622558667-3419a8dc5f83?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Solimo"
      },
      {
        "key": "Material",
        "value": "Durable Construction"
      },
      {
        "key": "Warranty",
        "value": "1 Year"
      },
      {
        "key": "Usage",
        "value": "Everyday"
      }
    ]
  },
  {
    "name": "Home Centre Wooden Coffee Table",
    "brand": "Home",
    "category": "home-kitchen",
    "desc": "Upgrade your living space with the Home Centre Wooden Coffee Table. Designed to bring convenience and style to your home, this product combines durable construction with elegant aesthetics. It seamlessly blends into modern interiors while providing reliable everyday functionality. Experience the perfect harmony of utility and design.",
    "mrp": 201,
    "images": [
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80",
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80",
      "https://images.unsplash.com/photo-1581622558667-3419a8dc5f83?w=800&q=80",
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Home"
      },
      {
        "key": "Material",
        "value": "Durable Construction"
      },
      {
        "key": "Warranty",
        "value": "1 Year"
      },
      {
        "key": "Usage",
        "value": "Everyday"
      }
    ]
  },
  {
    "name": "Wipro 9W LED Smart Bulb",
    "brand": "Wipro",
    "category": "home-kitchen",
    "desc": "Upgrade your living space with the Wipro 9W LED Smart Bulb. Designed to bring convenience and style to your home, this product combines durable construction with elegant aesthetics. It seamlessly blends into modern interiors while providing reliable everyday functionality. Experience the perfect harmony of utility and design.",
    "mrp": 160,
    "images": [
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80",
      "https://images.unsplash.com/photo-1556912172-45b7eedd91fb?w=800&q=80",
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80",
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Wipro"
      },
      {
        "key": "Material",
        "value": "Durable Construction"
      },
      {
        "key": "Warranty",
        "value": "1 Year"
      },
      {
        "key": "Usage",
        "value": "Everyday"
      }
    ]
  },
  {
    "name": "Eureka Forbes Aquaguard Water Purifier",
    "brand": "Eureka",
    "category": "home-kitchen",
    "desc": "Upgrade your living space with the Eureka Forbes Aquaguard Water Purifier. Designed to bring convenience and style to your home, this product combines durable construction with elegant aesthetics. It seamlessly blends into modern interiors while providing reliable everyday functionality. Experience the perfect harmony of utility and design.",
    "mrp": 32,
    "images": [
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80",
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80",
      "https://images.unsplash.com/photo-1581622558667-3419a8dc5f83?w=800&q=80",
      "https://images.unsplash.com/photo-1584285458399-6f98c894fb21?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Eureka"
      },
      {
        "key": "Material",
        "value": "Durable Construction"
      },
      {
        "key": "Warranty",
        "value": "1 Year"
      },
      {
        "key": "Usage",
        "value": "Everyday"
      }
    ]
  },
  {
    "name": "SG Sunny Tonny Cricket Bat Size 6",
    "brand": "SG",
    "category": "sports",
    "desc": "Achieve your fitness goals with the SG Sunny Tonny Cricket Bat Size 6. Engineered for athletes and fitness enthusiasts, it delivers superior performance and durability. Whether you're training professionally or staying active at home, this equipment provides the reliability and comfort you need to push your limits.",
    "mrp": 78,
    "images": [
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
      "https://images.unsplash.com/photo-1526506443360-ffdf2032069b?w=800&q=80",
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80",
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "SG"
      },
      {
        "key": "Sport",
        "value": "General Fitness"
      },
      {
        "key": "Material",
        "value": "High Quality"
      },
      {
        "key": "Skill Level",
        "value": "All Levels"
      }
    ]
  },
  {
    "name": "Boldfit Pro Gym Gloves",
    "brand": "Boldfit",
    "category": "sports",
    "desc": "Achieve your fitness goals with the Boldfit Pro Gym Gloves. Engineered for athletes and fitness enthusiasts, it delivers superior performance and durability. Whether you're training professionally or staying active at home, this equipment provides the reliability and comfort you need to push your limits.",
    "mrp": 40,
    "images": [
      "https://images.unsplash.com/photo-1526506443360-ffdf2032069b?w=800&q=80",
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80",
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Boldfit"
      },
      {
        "key": "Sport",
        "value": "General Fitness"
      },
      {
        "key": "Material",
        "value": "High Quality"
      },
      {
        "key": "Skill Level",
        "value": "All Levels"
      }
    ]
  },
  {
    "name": "Yonex Muscle Power 29 Badminton Racket",
    "brand": "Yonex",
    "category": "sports",
    "desc": "Achieve your fitness goals with the Yonex Muscle Power 29 Badminton Racket. Engineered for athletes and fitness enthusiasts, it delivers superior performance and durability. Whether you're training professionally or staying active at home, this equipment provides the reliability and comfort you need to push your limits.",
    "mrp": 41,
    "images": [
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80",
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80",
      "https://images.unsplash.com/photo-1526506443360-ffdf2032069b?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Yonex"
      },
      {
        "key": "Sport",
        "value": "General Fitness"
      },
      {
        "key": "Material",
        "value": "High Quality"
      },
      {
        "key": "Skill Level",
        "value": "All Levels"
      }
    ]
  },
  {
    "name": "Nivia Storm Football Size 5",
    "brand": "Nivia",
    "category": "sports",
    "desc": "Achieve your fitness goals with the Nivia Storm Football Size 5. Engineered for athletes and fitness enthusiasts, it delivers superior performance and durability. Whether you're training professionally or staying active at home, this equipment provides the reliability and comfort you need to push your limits.",
    "mrp": 62,
    "images": [
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80",
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
      "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&q=80",
      "https://images.unsplash.com/photo-1526506443360-ffdf2032069b?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Nivia"
      },
      {
        "key": "Sport",
        "value": "General Fitness"
      },
      {
        "key": "Material",
        "value": "High Quality"
      },
      {
        "key": "Skill Level",
        "value": "All Levels"
      }
    ]
  },
  {
    "name": "Cosco Light Tennis Ball Pack of 6",
    "brand": "Cosco",
    "category": "sports",
    "desc": "Achieve your fitness goals with the Cosco Light Tennis Ball Pack of 6. Engineered for athletes and fitness enthusiasts, it delivers superior performance and durability. Whether you're training professionally or staying active at home, this equipment provides the reliability and comfort you need to push your limits.",
    "mrp": 81,
    "images": [
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80",
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
      "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&q=80",
      "https://images.unsplash.com/photo-1526506443360-ffdf2032069b?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Cosco"
      },
      {
        "key": "Sport",
        "value": "General Fitness"
      },
      {
        "key": "Material",
        "value": "High Quality"
      },
      {
        "key": "Skill Level",
        "value": "All Levels"
      }
    ]
  },
  {
    "name": "Decathlon Kipsta Football Boots",
    "brand": "Decathlon",
    "category": "sports",
    "desc": "Achieve your fitness goals with the Decathlon Kipsta Football Boots. Engineered for athletes and fitness enthusiasts, it delivers superior performance and durability. Whether you're training professionally or staying active at home, this equipment provides the reliability and comfort you need to push your limits.",
    "mrp": 90,
    "images": [
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80",
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80",
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
      "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Decathlon"
      },
      {
        "key": "Sport",
        "value": "General Fitness"
      },
      {
        "key": "Material",
        "value": "High Quality"
      },
      {
        "key": "Skill Level",
        "value": "All Levels"
      }
    ]
  },
  {
    "name": "Nivia Pro Weight Lifting Belt",
    "brand": "Nivia",
    "category": "sports",
    "desc": "Achieve your fitness goals with the Nivia Pro Weight Lifting Belt. Engineered for athletes and fitness enthusiasts, it delivers superior performance and durability. Whether you're training professionally or staying active at home, this equipment provides the reliability and comfort you need to push your limits.",
    "mrp": 35,
    "images": [
      "https://images.unsplash.com/photo-1526506443360-ffdf2032069b?w=800&q=80",
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80",
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Nivia"
      },
      {
        "key": "Sport",
        "value": "General Fitness"
      },
      {
        "key": "Material",
        "value": "High Quality"
      },
      {
        "key": "Skill Level",
        "value": "All Levels"
      }
    ]
  },
  {
    "name": "Strauss Anti-Skid Yoga Mat 6mm",
    "brand": "Strauss",
    "category": "sports",
    "desc": "Achieve your fitness goals with the Strauss Anti-Skid Yoga Mat 6mm. Engineered for athletes and fitness enthusiasts, it delivers superior performance and durability. Whether you're training professionally or staying active at home, this equipment provides the reliability and comfort you need to push your limits.",
    "mrp": 95,
    "images": [
      "https://images.unsplash.com/photo-1526506443360-ffdf2032069b?w=800&q=80",
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80",
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Strauss"
      },
      {
        "key": "Sport",
        "value": "General Fitness"
      },
      {
        "key": "Material",
        "value": "High Quality"
      },
      {
        "key": "Skill Level",
        "value": "All Levels"
      }
    ]
  },
  {
    "name": "Adidas Core Skipping Rope",
    "brand": "Adidas",
    "category": "sports",
    "desc": "Achieve your fitness goals with the Adidas Core Skipping Rope. Engineered for athletes and fitness enthusiasts, it delivers superior performance and durability. Whether you're training professionally or staying active at home, this equipment provides the reliability and comfort you need to push your limits.",
    "mrp": 49,
    "images": [
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80",
      "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&q=80",
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Adidas"
      },
      {
        "key": "Sport",
        "value": "General Fitness"
      },
      {
        "key": "Material",
        "value": "High Quality"
      },
      {
        "key": "Skill Level",
        "value": "All Levels"
      }
    ]
  },
  {
    "name": "Kore PVC 10kg Home Gym Set",
    "brand": "Kore",
    "category": "sports",
    "desc": "Achieve your fitness goals with the Kore PVC 10kg Home Gym Set. Engineered for athletes and fitness enthusiasts, it delivers superior performance and durability. Whether you're training professionally or staying active at home, this equipment provides the reliability and comfort you need to push your limits.",
    "mrp": 99,
    "images": [
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80",
      "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&q=80",
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80",
      "https://images.unsplash.com/photo-1526506443360-ffdf2032069b?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Kore"
      },
      {
        "key": "Sport",
        "value": "General Fitness"
      },
      {
        "key": "Material",
        "value": "High Quality"
      },
      {
        "key": "Skill Level",
        "value": "All Levels"
      }
    ]
  },
  {
    "name": "Minimalist 10% Niacinamide Face Serum 30ml",
    "brand": "Minimalist",
    "category": "beauty",
    "desc": "Pamper yourself with the Minimalist 10% Niacinamide Face Serum 30ml. Formulated with carefully selected, skin-loving ingredients, it delivers visible results while being gentle on you. Incorporate it into your daily beauty regimen to nourish, protect, and enhance your natural glow. Experience luxury care every single day.",
    "mrp": 23,
    "images": [
      "https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=800&q=80",
      "https://images.unsplash.com/photo-1617897903246-719242758050?w=800&q=80",
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&q=80",
      "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Minimalist"
      },
      {
        "key": "Skin/Hair Type",
        "value": "All Types"
      },
      {
        "key": "Form",
        "value": "Liquid/Cream"
      },
      {
        "key": "Cruelty Free",
        "value": "Yes"
      }
    ]
  },
  {
    "name": "Mamaearth Onion Hair Oil 250ml",
    "brand": "Mamaearth",
    "category": "beauty",
    "desc": "Pamper yourself with the Mamaearth Onion Hair Oil 250ml. Formulated with carefully selected, skin-loving ingredients, it delivers visible results while being gentle on you. Incorporate it into your daily beauty regimen to nourish, protect, and enhance your natural glow. Experience luxury care every single day.",
    "mrp": 36,
    "images": [
      "https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=800&q=80",
      "https://images.unsplash.com/photo-1611078449458-47963d7e828e?w=800&q=80",
      "https://images.unsplash.com/photo-1599305090598-fe179d501227?w=800&q=80",
      "https://images.unsplash.com/photo-1617897903246-719242758050?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Mamaearth"
      },
      {
        "key": "Skin/Hair Type",
        "value": "All Types"
      },
      {
        "key": "Form",
        "value": "Liquid/Cream"
      },
      {
        "key": "Cruelty Free",
        "value": "Yes"
      }
    ]
  },
  {
    "name": "Plum Green Tea Pore Cleansing Face Wash",
    "brand": "Plum",
    "category": "beauty",
    "desc": "Pamper yourself with the Plum Green Tea Pore Cleansing Face Wash. Formulated with carefully selected, skin-loving ingredients, it delivers visible results while being gentle on you. Incorporate it into your daily beauty regimen to nourish, protect, and enhance your natural glow. Experience luxury care every single day.",
    "mrp": 25,
    "images": [
      "https://images.unsplash.com/photo-1599305090598-fe179d501227?w=800&q=80",
      "https://images.unsplash.com/photo-1611078449458-47963d7e828e?w=800&q=80",
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&q=80",
      "https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Plum"
      },
      {
        "key": "Skin/Hair Type",
        "value": "All Types"
      },
      {
        "key": "Form",
        "value": "Liquid/Cream"
      },
      {
        "key": "Cruelty Free",
        "value": "Yes"
      }
    ]
  },
  {
    "name": "L'Oreal Paris Revitalift Hyaluronic Acid Serum",
    "brand": "L'Oreal Paris",
    "category": "beauty",
    "desc": "Pamper yourself with the L'Oreal Paris Revitalift Hyaluronic Acid Serum. Formulated with carefully selected, skin-loving ingredients, it delivers visible results while being gentle on you. Incorporate it into your daily beauty regimen to nourish, protect, and enhance your natural glow. Experience luxury care every single day.",
    "mrp": 32,
    "images": [
      "https://images.unsplash.com/photo-1599305090598-fe179d501227?w=800&q=80",
      "https://images.unsplash.com/photo-1611078449458-47963d7e828e?w=800&q=80",
      "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80",
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "L'Oreal Paris"
      },
      {
        "key": "Skin/Hair Type",
        "value": "All Types"
      },
      {
        "key": "Form",
        "value": "Liquid/Cream"
      },
      {
        "key": "Cruelty Free",
        "value": "Yes"
      }
    ]
  },
  {
    "name": "Maybelline New York Fit Me Matte Foundation",
    "brand": "Maybelline",
    "category": "beauty",
    "desc": "Pamper yourself with the Maybelline New York Fit Me Matte Foundation. Formulated with carefully selected, skin-loving ingredients, it delivers visible results while being gentle on you. Incorporate it into your daily beauty regimen to nourish, protect, and enhance your natural glow. Experience luxury care every single day.",
    "mrp": 20,
    "images": [
      "https://images.unsplash.com/photo-1599305090598-fe179d501227?w=800&q=80",
      "https://images.unsplash.com/photo-1611078449458-47963d7e828e?w=800&q=80",
      "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80",
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Maybelline"
      },
      {
        "key": "Skin/Hair Type",
        "value": "All Types"
      },
      {
        "key": "Form",
        "value": "Liquid/Cream"
      },
      {
        "key": "Cruelty Free",
        "value": "Yes"
      }
    ]
  },
  {
    "name": "Lakme Sun Expert SPF 50 Sunscreen",
    "brand": "Lakme",
    "category": "beauty",
    "desc": "Pamper yourself with the Lakme Sun Expert SPF 50 Sunscreen. Formulated with carefully selected, skin-loving ingredients, it delivers visible results while being gentle on you. Incorporate it into your daily beauty regimen to nourish, protect, and enhance your natural glow. Experience luxury care every single day.",
    "mrp": 34,
    "images": [
      "https://images.unsplash.com/photo-1599305090598-fe179d501227?w=800&q=80",
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&q=80",
      "https://images.unsplash.com/photo-1617897903246-719242758050?w=800&q=80",
      "https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Lakme"
      },
      {
        "key": "Skin/Hair Type",
        "value": "All Types"
      },
      {
        "key": "Form",
        "value": "Liquid/Cream"
      },
      {
        "key": "Cruelty Free",
        "value": "Yes"
      }
    ]
  },
  {
    "name": "Nykaa Matte to Last Liquid Lipstick",
    "brand": "Nykaa",
    "category": "beauty",
    "desc": "Pamper yourself with the Nykaa Matte to Last Liquid Lipstick. Formulated with carefully selected, skin-loving ingredients, it delivers visible results while being gentle on you. Incorporate it into your daily beauty regimen to nourish, protect, and enhance your natural glow. Experience luxury care every single day.",
    "mrp": 6,
    "images": [
      "https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=800&q=80",
      "https://images.unsplash.com/photo-1599305090598-fe179d501227?w=800&q=80",
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&q=80",
      "https://images.unsplash.com/photo-1611078449458-47963d7e828e?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Nykaa"
      },
      {
        "key": "Skin/Hair Type",
        "value": "All Types"
      },
      {
        "key": "Form",
        "value": "Liquid/Cream"
      },
      {
        "key": "Cruelty Free",
        "value": "Yes"
      }
    ]
  },
  {
    "name": "Biotique Bio Papaya Revitalizing Tan Removal Scrub",
    "brand": "Biotique",
    "category": "beauty",
    "desc": "Pamper yourself with the Biotique Bio Papaya Revitalizing Tan Removal Scrub. Formulated with carefully selected, skin-loving ingredients, it delivers visible results while being gentle on you. Incorporate it into your daily beauty regimen to nourish, protect, and enhance your natural glow. Experience luxury care every single day.",
    "mrp": 26,
    "images": [
      "https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=800&q=80",
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&q=80",
      "https://images.unsplash.com/photo-1599305090598-fe179d501227?w=800&q=80",
      "https://images.unsplash.com/photo-1617897903246-719242758050?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Biotique"
      },
      {
        "key": "Skin/Hair Type",
        "value": "All Types"
      },
      {
        "key": "Form",
        "value": "Liquid/Cream"
      },
      {
        "key": "Cruelty Free",
        "value": "Yes"
      }
    ]
  },
  {
    "name": "Himalaya Purifying Neem Face Wash",
    "brand": "Himalaya",
    "category": "beauty",
    "desc": "Pamper yourself with the Himalaya Purifying Neem Face Wash. Formulated with carefully selected, skin-loving ingredients, it delivers visible results while being gentle on you. Incorporate it into your daily beauty regimen to nourish, protect, and enhance your natural glow. Experience luxury care every single day.",
    "mrp": 21,
    "images": [
      "https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=800&q=80",
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&q=80",
      "https://images.unsplash.com/photo-1599305090598-fe179d501227?w=800&q=80",
      "https://images.unsplash.com/photo-1617897903246-719242758050?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Himalaya"
      },
      {
        "key": "Skin/Hair Type",
        "value": "All Types"
      },
      {
        "key": "Form",
        "value": "Liquid/Cream"
      },
      {
        "key": "Cruelty Free",
        "value": "Yes"
      }
    ]
  },
  {
    "name": "Dove Hair Fall Rescue Shampoo 1L",
    "brand": "Dove",
    "category": "beauty",
    "desc": "Pamper yourself with the Dove Hair Fall Rescue Shampoo 1L. Formulated with carefully selected, skin-loving ingredients, it delivers visible results while being gentle on you. Incorporate it into your daily beauty regimen to nourish, protect, and enhance your natural glow. Experience luxury care every single day.",
    "mrp": 35,
    "images": [
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&q=80",
      "https://images.unsplash.com/photo-1596462502278-27bf85033e5a?w=800&q=80",
      "https://images.unsplash.com/photo-1611078449458-47963d7e828e?w=800&q=80",
      "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Dove"
      },
      {
        "key": "Skin/Hair Type",
        "value": "All Types"
      },
      {
        "key": "Form",
        "value": "Liquid/Cream"
      },
      {
        "key": "Cruelty Free",
        "value": "Yes"
      }
    ]
  },
  {
    "name": "LEGO Classic Creative Bricks 500 Pieces",
    "brand": "LEGO",
    "category": "toys",
    "desc": "Unleash hours of fun and imagination with the LEGO Classic Creative Bricks 500 Pieces. Designed to entertain and educate, it encourages creativity and strategic thinking. Made from safe, non-toxic, and durable materials, it's the perfect gift to bring joy to children and families alike. Let the playtime adventures begin!",
    "mrp": 56,
    "images": [
      "https://images.unsplash.com/photo-1611604548018-d56bbd85d681?w=800&q=80",
      "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&q=80",
      "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&q=80",
      "https://images.unsplash.com/photo-1558066110-bf9b53164a66?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "LEGO"
      },
      {
        "key": "Age Group",
        "value": "5+ Years"
      },
      {
        "key": "Material",
        "value": "Safe Plastic/Cardboard"
      },
      {
        "key": "Batteries Required",
        "value": "No"
      }
    ]
  },
  {
    "name": "Funskool Scrabble Junior",
    "brand": "Funskool",
    "category": "toys",
    "desc": "Unleash hours of fun and imagination with the Funskool Scrabble Junior. Designed to entertain and educate, it encourages creativity and strategic thinking. Made from safe, non-toxic, and durable materials, it's the perfect gift to bring joy to children and families alike. Let the playtime adventures begin!",
    "mrp": 45,
    "images": [
      "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&q=80",
      "https://images.unsplash.com/photo-1585366119957-77ec9c7f66a2?w=800&q=80",
      "https://images.unsplash.com/photo-1605634599723-5e36928e0a6d?w=800&q=80",
      "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Funskool"
      },
      {
        "key": "Age Group",
        "value": "5+ Years"
      },
      {
        "key": "Material",
        "value": "Safe Plastic/Cardboard"
      },
      {
        "key": "Batteries Required",
        "value": "No"
      }
    ]
  },
  {
    "name": "Hot Wheels 5-Car Gift Pack",
    "brand": "Hot",
    "category": "toys",
    "desc": "Unleash hours of fun and imagination with the Hot Wheels 5-Car Gift Pack. Designed to entertain and educate, it encourages creativity and strategic thinking. Made from safe, non-toxic, and durable materials, it's the perfect gift to bring joy to children and families alike. Let the playtime adventures begin!",
    "mrp": 60,
    "images": [
      "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&q=80",
      "https://images.unsplash.com/photo-1585366119957-77ec9c7f66a2?w=800&q=80",
      "https://images.unsplash.com/photo-1558066110-bf9b53164a66?w=800&q=80",
      "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Hot"
      },
      {
        "key": "Age Group",
        "value": "5+ Years"
      },
      {
        "key": "Material",
        "value": "Safe Plastic/Cardboard"
      },
      {
        "key": "Batteries Required",
        "value": "No"
      }
    ]
  },
  {
    "name": "Barbie Dreamhouse Playset",
    "brand": "Barbie",
    "category": "toys",
    "desc": "Unleash hours of fun and imagination with the Barbie Dreamhouse Playset. Designed to entertain and educate, it encourages creativity and strategic thinking. Made from safe, non-toxic, and durable materials, it's the perfect gift to bring joy to children and families alike. Let the playtime adventures begin!",
    "mrp": 40,
    "images": [
      "https://images.unsplash.com/photo-1605634599723-5e36928e0a6d?w=800&q=80",
      "https://images.unsplash.com/photo-1611604548018-d56bbd85d681?w=800&q=80",
      "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&q=80",
      "https://images.unsplash.com/photo-1558066110-bf9b53164a66?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Barbie"
      },
      {
        "key": "Age Group",
        "value": "5+ Years"
      },
      {
        "key": "Material",
        "value": "Safe Plastic/Cardboard"
      },
      {
        "key": "Batteries Required",
        "value": "No"
      }
    ]
  },
  {
    "name": "Fisher-Price Rock-a-Stack",
    "brand": "Fisher-Price",
    "category": "toys",
    "desc": "Unleash hours of fun and imagination with the Fisher-Price Rock-a-Stack. Designed to entertain and educate, it encourages creativity and strategic thinking. Made from safe, non-toxic, and durable materials, it's the perfect gift to bring joy to children and families alike. Let the playtime adventures begin!",
    "mrp": 12,
    "images": [
      "https://images.unsplash.com/photo-1585366119957-77ec9c7f66a2?w=800&q=80",
      "https://images.unsplash.com/photo-1605634599723-5e36928e0a6d?w=800&q=80",
      "https://images.unsplash.com/photo-1558066110-bf9b53164a66?w=800&q=80",
      "https://images.unsplash.com/photo-1611604548018-d56bbd85d681?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Fisher-Price"
      },
      {
        "key": "Age Group",
        "value": "5+ Years"
      },
      {
        "key": "Material",
        "value": "Safe Plastic/Cardboard"
      },
      {
        "key": "Batteries Required",
        "value": "No"
      }
    ]
  },
  {
    "name": "Nerf N-Strike Elite Disruptor",
    "brand": "Nerf",
    "category": "toys",
    "desc": "Unleash hours of fun and imagination with the Nerf N-Strike Elite Disruptor. Designed to entertain and educate, it encourages creativity and strategic thinking. Made from safe, non-toxic, and durable materials, it's the perfect gift to bring joy to children and families alike. Let the playtime adventures begin!",
    "mrp": 12,
    "images": [
      "https://images.unsplash.com/photo-1611604548018-d56bbd85d681?w=800&q=80",
      "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&q=80",
      "https://images.unsplash.com/photo-1558066110-bf9b53164a66?w=800&q=80",
      "https://images.unsplash.com/photo-1605634599723-5e36928e0a6d?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Nerf"
      },
      {
        "key": "Age Group",
        "value": "5+ Years"
      },
      {
        "key": "Material",
        "value": "Safe Plastic/Cardboard"
      },
      {
        "key": "Batteries Required",
        "value": "No"
      }
    ]
  },
  {
    "name": "Play-Doh Modeling Compound 10-Pack",
    "brand": "Play-Doh",
    "category": "toys",
    "desc": "Unleash hours of fun and imagination with the Play-Doh Modeling Compound 10-Pack. Designed to entertain and educate, it encourages creativity and strategic thinking. Made from safe, non-toxic, and durable materials, it's the perfect gift to bring joy to children and families alike. Let the playtime adventures begin!",
    "mrp": 69,
    "images": [
      "https://images.unsplash.com/photo-1611604548018-d56bbd85d681?w=800&q=80",
      "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&q=80",
      "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&q=80",
      "https://images.unsplash.com/photo-1558066110-bf9b53164a66?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Play-Doh"
      },
      {
        "key": "Age Group",
        "value": "5+ Years"
      },
      {
        "key": "Material",
        "value": "Safe Plastic/Cardboard"
      },
      {
        "key": "Batteries Required",
        "value": "No"
      }
    ]
  },
  {
    "name": "Catan Board Game Base Game",
    "brand": "Catan",
    "category": "toys",
    "desc": "Unleash hours of fun and imagination with the Catan Board Game Base Game. Designed to entertain and educate, it encourages creativity and strategic thinking. Made from safe, non-toxic, and durable materials, it's the perfect gift to bring joy to children and families alike. Let the playtime adventures begin!",
    "mrp": 10,
    "images": [
      "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&q=80",
      "https://images.unsplash.com/photo-1558066110-bf9b53164a66?w=800&q=80",
      "https://images.unsplash.com/photo-1605634599723-5e36928e0a6d?w=800&q=80",
      "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Catan"
      },
      {
        "key": "Age Group",
        "value": "5+ Years"
      },
      {
        "key": "Material",
        "value": "Safe Plastic/Cardboard"
      },
      {
        "key": "Batteries Required",
        "value": "No"
      }
    ]
  },
  {
    "name": "Monopoly Classic Family Board Game",
    "brand": "Monopoly",
    "category": "toys",
    "desc": "Unleash hours of fun and imagination with the Monopoly Classic Family Board Game. Designed to entertain and educate, it encourages creativity and strategic thinking. Made from safe, non-toxic, and durable materials, it's the perfect gift to bring joy to children and families alike. Let the playtime adventures begin!",
    "mrp": 57,
    "images": [
      "https://images.unsplash.com/photo-1585366119957-77ec9c7f66a2?w=800&q=80",
      "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&q=80",
      "https://images.unsplash.com/photo-1605634599723-5e36928e0a6d?w=800&q=80",
      "https://images.unsplash.com/photo-1611604548018-d56bbd85d681?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Monopoly"
      },
      {
        "key": "Age Group",
        "value": "5+ Years"
      },
      {
        "key": "Material",
        "value": "Safe Plastic/Cardboard"
      },
      {
        "key": "Batteries Required",
        "value": "No"
      }
    ]
  },
  {
    "name": "Rubik's Cube 3x3 Original",
    "brand": "Rubik's",
    "category": "toys",
    "desc": "Unleash hours of fun and imagination with the Rubik's Cube 3x3 Original. Designed to entertain and educate, it encourages creativity and strategic thinking. Made from safe, non-toxic, and durable materials, it's the perfect gift to bring joy to children and families alike. Let the playtime adventures begin!",
    "mrp": 53,
    "images": [
      "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&q=80",
      "https://images.unsplash.com/photo-1611604548018-d56bbd85d681?w=800&q=80",
      "https://images.unsplash.com/photo-1585366119957-77ec9c7f66a2?w=800&q=80",
      "https://images.unsplash.com/photo-1558066110-bf9b53164a66?w=800&q=80"
    ],
    "specs": [
      {
        "key": "Brand",
        "value": "Rubik's"
      },
      {
        "key": "Age Group",
        "value": "5+ Years"
      },
      {
        "key": "Material",
        "value": "Safe Plastic/Cardboard"
      },
      {
        "key": "Batteries Required",
        "value": "No"
      }
    ]
  }
];

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

  console.log(`Seeded ${productsData.length} products.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
