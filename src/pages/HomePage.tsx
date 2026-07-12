import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { Monitor, ShoppingBasket, Book, Shirt, Home, Dumbbell, Sparkles, Gamepad2, ChevronRight, ChevronLeft, Clock, Zap, Heart } from 'lucide-react';
import { useWishlistStore } from '../store/wishlistStore';
import { useAuthStore } from '../store/authStore';

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  mrp: number;
  discount_percent: number;
  rating: number;
  review_count: number;
  stock: number;
  category: string;
  image_url: string | null;
}

const CATEGORIES = [
  { name: 'Electronics', slug: 'electronics', icon: Monitor, color: 'bg-blue-100 text-blue-600' },
  { name: 'Grocery', slug: 'grocery', icon: ShoppingBasket, color: 'bg-green-100 text-green-600' },
  { name: 'Books', slug: 'books', icon: Book, color: 'bg-yellow-100 text-yellow-600' },
  { name: 'Fashion', slug: 'fashion', icon: Shirt, color: 'bg-pink-100 text-pink-600' },
  { name: 'Home & Kitchen', slug: 'home-kitchen', icon: Home, color: 'bg-purple-100 text-purple-600' },
  { name: 'Sports', slug: 'sports', icon: Dumbbell, color: 'bg-orange-100 text-orange-600' },
  { name: 'Beauty', slug: 'beauty', icon: Sparkles, color: 'bg-rose-100 text-rose-600' },
  { name: 'Toys', slug: 'toys', icon: Gamepad2, color: 'bg-indigo-100 text-indigo-600' },
];

const CAROUSEL_SLIDES = [
  {
    title: 'The Grand Summer Sale',
    subtitle: 'Up to 60% off on premium electronics and fashion',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&q=80',
    cta: 'Shop Now',
    link: '/?category=electronics'
  },
  {
    title: 'Fresh Groceries Delivered',
    subtitle: 'Stock up your pantry with everyday essentials',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600&q=80',
    cta: 'Explore Groceries',
    link: '/?category=grocery'
  },
  {
    title: 'Upgrade Your Home',
    subtitle: 'Discover the finest furniture and kitchenware',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1600&q=80',
    cta: 'View Collection',
    link: '/?category=home-kitchen'
  }
];

const SkeletonCard = () => (
  <div className="flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm animate-pulse">
    <div className="aspect-4/5 bg-gray-200"></div>
    <div className="p-4 flex flex-col grow">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="mt-auto">
        <div className="h-10 bg-gray-200 rounded-xl w-full"></div>
      </div>
    </div>
  </div>
);

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';
  const inStock = searchParams.get('in_stock') === 'true';
  const ratingFilter = searchParams.get('rating') || '';

  const updateParams = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') newParams.delete(key);
      else newParams.set(key, value);
    });
    setSearchParams(newParams);
  };

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore(state => state.addItem);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 12, seconds: 39 });
  const { token } = useAuthStore();
  const { items: wishlistItems, toggleWishlist, fetchWishlist } = useWishlistStore();

  useEffect(() => {
    if (token) fetchWishlist(token);
  }, [token, fetchWishlist]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              hours = 4;
              minutes = 12;
              seconds = 39;
            }
          }
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    if (q || category) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [q, category]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (category) params.set('category', category);
    if (sort) params.set('sort', sort);
    if (minPrice) params.set('min_price', minPrice);
    if (maxPrice) params.set('max_price', maxPrice);
    if (inStock) params.set('in_stock', 'true');
    if (ratingFilter) params.set('rating', ratingFilter);

    // If on homepage without search/filter, load a mix of items
    const fetchUrl = (q || category || sort || minPrice || maxPrice || inStock || ratingFilter)
      ? `/api/products/search?${params.toString()}`
      : `/api/products/search?limit=12`;

    fetch(fetchUrl)
      .then(res => res.json())
      .then(data => {
        if (data.products && Array.isArray(data.products)) {
          setProducts(data.products);
        } else if (Array.isArray(data)) {
          setProducts(data);
        } else {
          console.error('Expected array of products, got:', data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch products', err);
        setLoading(false);
      });
  }, [q, category, sort, minPrice, maxPrice, inStock, ratingFilter]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);

  return (
    <div className="space-y-12 pb-16">
      {!q && !category && (
        <>
          {/* Hero Carousel */}
          <div className="relative rounded-2xl overflow-hidden shadow-lg min-h-100 sm:min-h-125 flex group">
            {CAROUSEL_SLIDES.map((slide, i) => (
              <div
                key={i}
                className={`absolute inset-0 transition-opacity duration-1000 ${i === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
              >
                <div className="absolute inset-0 bg-black/40 mix-blend-multiply z-10"></div>
                <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 z-20 flex flex-col justify-center items-start p-8 sm:p-16 max-w-3xl">
                  <span className="bg-[#F97316] text-white text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">Featured Promotion</span>
                  <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-4 text-white font-sans leading-tight shadow-sm">
                    {slide.title}
                  </h1>
                  <p className="text-gray-200 text-lg sm:text-2xl mb-8 font-medium shadow-sm">
                    {slide.subtitle}
                  </p>
                  <Link to={slide.link} className="py-3 px-8 bg-white text-[#1B1F5E] font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-md text-lg">
                    {slide.cta}
                  </Link>
                </div>
              </div>
            ))}

            {/* Carousel Controls */}
            <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors opacity-0 group-hover:opacity-100">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors opacity-0 group-hover:opacity-100">
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
              {CAROUSEL_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${i === currentSlide ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80'}`}
                />
              ))}
            </div>
          </div>

          {/* Categories Grid */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 font-sans">Shop by Category</h2>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
              {CATEGORIES.map(cat => {
                const Icon = cat.icon;
                return (
                  <Link key={cat.slug} to={`/?category=${cat.slug}`} className="flex flex-col items-center gap-3 group">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 group-hover:shadow-md ${cat.color}`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 text-center">{cat.name}</span>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Deals of the Day */}
          <section className="bg-linear-to-r from-red-50 to-orange-50 rounded-2xl p-6 border border-orange-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div className="flex items-center gap-2 text-red-600">
                <Zap className="w-6 h-6 fill-current" />
                <h2 className="text-2xl font-bold font-sans">Deals of the Day</h2>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-red-100 shadow-sm">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-bold text-gray-700">
                  Ends in:{' '}
                  <span className="text-red-600 font-mono">
                    {String(timeLeft.hours).padStart(2, '0')}:
                    {String(timeLeft.minutes).padStart(2, '0')}:
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                </span>
              </div>
            </div>

            {/* Horizontal Scroll for Deals */}
            <div className="flex overflow-x-auto pb-4 -mx-2 px-2 snap-x gap-4 hide-scrollbar">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <div key={i} className="min-w-70 snap-start"><SkeletonCard /></div>)
              ) : (
                products.slice(0, 5).map(product => (
                  <div key={product.id} className="min-w-70 max-w-70 snap-start bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                    <Link to={`/product/${product.id}`} className="block relative aspect-square bg-gray-50 p-4">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 font-medium">No Image</div>
                      )}
                      <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold tracking-wide">
                        {product.discount_percent}% OFF
                      </div>
                    </Link>
                    <button
                      onClick={(e) => { e.preventDefault(); if (token) toggleWishlist(product.id, token); else alert('Please sign in'); }}
                      className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
                    >
                      <Heart className={`w-4 h-4 ${wishlistItems.some(w => w.productId === product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                    </button>
                    <div className="p-4">
                      <Link to={`/product/${product.id}`} className="hover:text-red-600 transition-colors">
                        <h3 className="font-medium text-gray-900 line-clamp-1 text-sm">{product.name}</h3>
                      </Link>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-lg font-bold text-gray-900 font-mono">XLM {product.price.toFixed(2)}</span>
                        <span className="text-xs text-gray-400 line-through font-mono">XLM {product.mrp.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Featured Products */}
          <section>
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-2xl font-bold text-gray-900 font-sans">Featured Products</h2>
              <Link to="/?q=" className="text-[#F97316] font-bold text-sm hover:underline">View All</Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
              ) : (
                products.slice(0, 12).map(product => (
                  <div key={product.id} className="group relative flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                    <Link to={`/product/${product.id}`} className="aspect-4/5 bg-gray-50 p-4 flex items-center justify-center relative overflow-hidden">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <span className="font-medium text-sm capitalize">{product.category}</span>
                        </div>
                      )}
                      {product.discount_percent > 0 && (
                        <div className="absolute top-2 left-2 bg-[#F97316] text-white px-2 py-1 rounded text-xs font-bold tracking-wide shadow-sm">
                          {product.discount_percent}% OFF
                        </div>
                      )}
                    </Link>
                    <button
                      onClick={(e) => { e.preventDefault(); if (token) toggleWishlist(product.id, token); else alert('Please sign in'); }}
                      className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors z-10"
                    >
                      <Heart className={`w-5 h-5 ${wishlistItems.some(w => w.productId === product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                    </button>

                    <div className="p-4 flex flex-col grow">
                      <Link to={`/product/${product.id}`} className="hover:text-[#F97316] transition-colors">
                        <p className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">{product.brand}</p>
                        <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 text-sm leading-tight font-sans">{product.name}</h3>
                      </Link>

                      <div className="flex items-center gap-1 mb-2 mt-1">
                        <div className="flex text-yellow-400 text-xs">
                          {'★'.repeat(Math.floor(product.rating))}
                          {'☆'.repeat(5 - Math.floor(product.rating))}
                        </div>
                        <span className="text-xs text-gray-500 font-medium">({product.review_count.toLocaleString()})</span>
                      </div>
                      <div className="flex items-baseline gap-2 mt-auto pt-2">
                        <span className="text-lg font-bold text-gray-900 font-mono tracking-tight">XLM {product.price.toFixed(2)}</span>
                        {product.mrp > product.price && (
                          <span className="text-xs text-gray-400 line-through font-mono">XLM {product.mrp.toFixed(2)}</span>
                        )}
                      </div>

                      <button
                        onClick={() => addItem(product.id)}
                        className="mt-4 w-full py-2 px-4 bg-white border border-gray-300 text-gray-900 text-sm font-bold rounded-lg hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100 transition-colors flex justify-center items-center gap-2"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Shop by Brand Logo Strip */}
          <section className="py-12 border-t border-gray-200">
            <h2 className="text-center text-sm font-bold text-gray-400 uppercase tracking-widest mb-8">Trusted by Top Brands</h2>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all">
              <div className="text-2xl font-bold font-sans">Apple</div>
              <div className="text-2xl font-bold font-sans tracking-tight">SAMSUNG</div>
              <div className="text-2xl font-bold font-serif italic">Levi's</div>
              <div className="text-2xl font-bold font-sans tracking-widest">SONY</div>
              <div className="text-2xl font-bold font-mono">NIKE</div>
            </div>
          </section>

          {/* Second Promotional Banner */}
          <section className="relative rounded-2xl overflow-hidden min-h-62.5 flex items-center bg-gray-900">
            <div className="absolute inset-0 opacity-50">
              <img src="https://images.unsplash.com/photo-1555529771-835f59fc5efe?w=1600&q=80" alt="Tech Accessories" className="w-full h-full object-cover" />
            </div>
            <div className="relative z-10 p-8 sm:p-12 md:w-1/2">
              <h2 className="text-3xl font-bold text-white mb-4">Premium Accessories for Modern Life</h2>
              <p className="text-gray-300 mb-6">Upgrade your workspace with our curated selection of high-end tech accessories.</p>
              <Link to="/?category=fashion" className="inline-block py-3 px-6 bg-white text-gray-900 font-bold rounded-lg hover:bg-gray-100 transition-colors">
                Shop Accessories
              </Link>
            </div>
          </section>
        </>
      )}

      {/* Search / Category Results */}
      {(q || category) && (
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Sidebar Filters */}
          <aside className="w-full md:w-64 shrink-0 space-y-8 sticky top-24">
            <div>
              <h3 className="font-bold text-gray-900 mb-4 font-sans border-b border-gray-200 pb-2">Filters</h3>

              <div className="space-y-6">
                {/* Price Range */}
                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-3">Price Range</h4>
                  <div className="flex items-center gap-2">
                    <input type="number" value={minPrice} onChange={e => updateParams({ min_price: e.target.value })} placeholder="Min" className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-[#F97316] outline-none" />
                    <span className="text-gray-500">-</span>
                    <input type="number" value={maxPrice} onChange={e => updateParams({ max_price: e.target.value })} placeholder="Max" className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-[#F97316] outline-none" />
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-3">Customer Rating</h4>
                  <div className="space-y-2">
                    {[4, 3, 2].map(rating => (
                      <label key={rating} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="rating" checked={ratingFilter === String(rating)} onChange={() => updateParams({ rating: String(rating) })} className="text-[#F97316] focus:ring-[#F97316] w-4 h-4 border-gray-300" />
                        <div className="flex items-center text-yellow-400 text-sm">
                          {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
                          <span className="text-gray-600 ml-1">& Up</span>
                        </div>
                      </label>
                    ))}
                    <button onClick={() => updateParams({ rating: null })} className="text-xs text-gray-500 hover:underline mt-2">Clear rating</button>
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-3">Availability</h4>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={inStock} onChange={e => updateParams({ in_stock: e.target.checked ? 'true' : null })} className="rounded text-[#F97316] focus:ring-[#F97316] w-4 h-4 border-gray-300" />
                    <span className="text-sm text-gray-700">In Stock Only</span>
                  </label>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-sans">
                  {q ? `Search results for "${q}"` : `Category: ${category}`}
                </h1>
                <p className="text-gray-500 text-sm mt-1">{products.length} products found</p>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Sort by:</label>
                <select value={sort} onChange={e => updateParams({ sort: e.target.value })} className="h-10 px-3 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-[#F97316] outline-none bg-white">
                  <option value="">Relevance</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Customer Rating</option>
                </select>
              </div>
            </header>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-2 font-sans">No products found</h3>
                <p className="text-gray-500">Try adjusting your search or filters to find what you're looking for.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map(product => (
                  <div key={product.id} className="group relative flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                    <Link to={`/product/${product.id}`} className="aspect-4/5 bg-gray-50 p-4 flex items-center justify-center relative overflow-hidden">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                          <span className="font-medium text-sm capitalize">{product.category}</span>
                        </div>
                      )}
                      {product.discount_percent > 0 && (
                        <div className="absolute top-2 left-2 bg-[#F97316] text-white px-2 py-1 rounded text-xs font-bold tracking-wide shadow-sm">
                          {product.discount_percent}% OFF
                        </div>
                      )}
                    </Link>
                    <button
                      onClick={(e) => { e.preventDefault(); if (token) toggleWishlist(product.id, token); else alert('Please sign in'); }}
                      className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors z-10"
                    >
                      <Heart className={`w-5 h-5 ${wishlistItems.some(w => w.productId === product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                    </button>

                    <div className="p-4 flex flex-col grow">
                      <Link to={`/product/${product.id}`} className="hover:text-[#F97316] transition-colors">
                        <p className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">{product.brand}</p>
                        <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 text-sm leading-tight font-sans">{product.name}</h3>
                      </Link>

                      <div className="flex items-center gap-1 mb-2 mt-1">
                        <div className="flex text-yellow-400 text-xs">
                          {'★'.repeat(Math.floor(product.rating))}
                          {'☆'.repeat(5 - Math.floor(product.rating))}
                        </div>
                        <span className="text-xs text-gray-500 font-medium">({product.review_count.toLocaleString()})</span>
                      </div>
                      <div className="flex items-baseline gap-2 mt-auto pt-2">
                        <span className="text-lg font-bold text-gray-900 font-mono tracking-tight">XLM {product.price.toFixed(2)}</span>
                        {product.mrp > product.price && (
                          <span className="text-xs text-gray-400 line-through font-mono">XLM {product.mrp.toFixed(2)}</span>
                        )}
                      </div>

                      <button
                        onClick={() => addItem(product.id)}
                        className="mt-4 w-full py-2 px-4 bg-white border border-gray-300 text-gray-900 text-sm font-bold rounded-lg hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100 transition-colors flex justify-center items-center gap-2"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
