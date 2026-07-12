import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Truck, Shield, RotateCcw, Heart, ShoppingBag, MapPin, Store } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useAuthStore } from '../store/authStore';

interface ProductSpec {
  id: string;
  key: string;
  value: string;
}

interface ProductImage {
  id: string;
  url: string;
}

interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  mrp: number;
  discount_percent: number;
  stock: number;
  rating: number;
  reviewCount: number;
  category: { name: string };
  specs: ProductSpec[];
  images: ProductImage[];
  estimated_delivery: string;
}

interface Review {
  id: string;
  reviewer: string;
  rating: number;
  title: string;
  body: string;
  verified: boolean;
  date: string;
}

const ProductDetailSkeleton = () => (
  <div className="max-w-6xl mx-auto animate-pulse">
    <div className="h-4 w-32 bg-gray-200 rounded mb-8"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      <div>
        <div className="aspect-square bg-gray-200 rounded-2xl mb-4"></div>
        <div className="flex gap-4"><div className="w-20 h-20 bg-gray-200 rounded-lg"></div><div className="w-20 h-20 bg-gray-200 rounded-lg"></div></div>
      </div>
      <div className="space-y-4">
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
        <div className="h-10 w-3/4 bg-gray-200 rounded"></div>
        <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
        <div className="h-12 w-1/2 bg-gray-200 rounded"></div>
        <div className="h-32 w-full bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>
);

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore(state => state.addItem);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string>('');
  const { token } = useAuthStore();
  const { items: wishlistItems, toggleWishlist, fetchWishlist } = useWishlistStore();
  const isWishlisted = product ? wishlistItems.some(w => w.productId === product.id) : false;
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');
  const [reviews, setReviews] = useState<Review[]>([]);

  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', body: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const fetchReviews = () => {
    fetch(`/api/products/${id}/reviews`)
      .then(res => res.json())
      .then(data => setReviews(data))
      .catch(err => console.error('Failed to fetch reviews', err));
  };

  useEffect(() => {
    if (token) fetchWishlist(token);
  }, [token, fetchWishlist]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        if (data.images && data.images.length > 0) {
          setActiveImage(data.images[0].url);
        }

        // Fetch similar products
        if (data.category?.id || data.categoryId) {
          const catId = data.category?.id || data.categoryId;
          fetch(`/api/products/search?limit=6`) // Mock similar
            .then(r => r.json())
            .then(simData => {
              const items = Array.isArray(simData.products) ? simData.products : Array.isArray(simData) ? simData : [];
              setSimilarProducts(items.filter((p: any) => p.id !== data.id));
            });
        }

        // Fetch reviews
        fetchReviews();

        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch product', err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <ProductDetailSkeleton />;
  if (!product) {
    return (
      <div className="text-center py-24 bg-white rounded-2xl border border-gray-200 shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 mb-2 font-sans">Product not found</h3>
        <button onClick={() => navigate('/')} className="text-[#F97316] hover:underline font-medium">Return to shopping</button>
      </div>
    );
  }

  const handleBuyNow = () => {
    addItem(product.id, quantity);
    navigate('/checkout');
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      alert('Please sign in to submit a review');
      return;
    }
    setIsSubmittingReview(true);
    try {
      const res = await fetch(`/api/products/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(reviewForm)
      });
      if (res.ok) {
        setReviewForm({ rating: 5, title: '', body: '' });
        setShowReviewForm(false);
        fetchReviews();
        // Option: refresh product data to update rating?
      } else {
        alert('Failed to submit review');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to results
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Product Image Gallery */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm group">
            {activeImage ? (
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-contain transition-transform duration-500 ease-in-out group-hover:scale-125 origin-center cursor-zoom-in"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">No Image Available</div>
            )}
            <button
              onClick={() => { if (token && product) toggleWishlist(product.id, token); else alert('Please sign in'); }}
              className="absolute top-4 right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
            >
              <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
            </button>
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(img.url)}
                  className={`w-20 h-20 rounded-xl border-2 overflow-hidden shrink-0 bg-white transition-colors ${activeImage === img.url ? 'border-[#F97316]' : 'border-transparent hover:border-gray-300 shadow-sm'
                    }`}
                >
                  <img src={img.url} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="mb-2">
            <Link to={`/?q=${product.brand}`} className="text-[#1B1F5E] font-bold tracking-wider uppercase text-sm hover:underline">
              {product.brand}
            </Link>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-4 font-sans leading-tight">
            {product.name}
          </h1>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1 cursor-pointer hover:underline" onClick={() => setActiveTab('reviews')}>
              <div className="flex text-yellow-400">
                {'★'.repeat(Math.floor(product.rating))}
                {'☆'.repeat(5 - Math.floor(product.rating))}
              </div>
              <span className="font-bold text-gray-900 ml-1">{product.rating.toFixed(1)}</span>
              <span className="text-blue-600 font-bold text-sm ml-1">
                ({product.reviewCount?.toLocaleString() || 0} reviews)
              </span>
            </div>
          </div>

          <div className="flex flex-col mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-200">
            <div className="flex items-end gap-3 mb-2">
              <span className="text-4xl font-bold text-gray-900 font-mono tracking-tighter">
                XLM {product.price.toFixed(2)}
              </span>
              {product.mrp > product.price && (
                <>
                  <span className="text-lg text-gray-400 line-through font-mono mb-1">
                    XLM {product.mrp.toFixed(2)}
                  </span>
                  <span className="text-sm font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded mb-1.5">
                    {product.discount_percent || Math.round((1 - product.price / product.mrp) * 100)}% OFF
                  </span>
                </>
              )}
            </div>
            <p className="text-sm font-medium text-gray-500">Inclusive of all taxes</p>
          </div>

          <div className="border-t border-gray-200 pt-6 mt-auto">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <span className={`text-lg font-bold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
                {product.stock > 0 && product.stock < 10 && (
                  <span className="text-red-500 font-bold text-sm ml-2">Only {product.stock} left!</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                <Store className="w-4 h-4" />
                Sold by: <span className="text-[#1B1F5E]">SuperMart Express</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch gap-4 mb-8">
              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden bg-white shrink-0">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-900 transition-colors font-bold text-xl"
                >
                  -
                </button>
                <span className="w-16 text-center font-bold text-lg text-gray-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-900 transition-colors font-bold text-xl"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => addItem(product.id, quantity)}
                disabled={product.stock === 0}
                className="flex-1 py-4 px-6 bg-[#F97316] text-white font-bold rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                Add to Cart
              </button>

              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="flex-1 py-4 px-6 bg-white border-2 border-[#1B1F5E] text-[#1B1F5E] font-bold rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-[0.98] flex items-center justify-center gap-2"
              >
                Buy Now
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-gray-200">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-gray-900">Delivery Options</p>
                  <p className="text-sm font-medium text-gray-500">Delivery by {new Date(product.estimated_delivery || Date.now() + 86400000 * 3).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-gray-900">1 Year Warranty</p>
                  <p className="text-sm font-medium text-gray-500">10 Days Replacement Policy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('description')}
            className={`flex-1 py-4 text-center font-bold font-sans transition-colors ${activeTab === 'description' ? 'text-[#F97316] border-b-2 border-[#F97316]' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`flex-1 py-4 text-center font-bold font-sans transition-colors ${activeTab === 'specs' ? 'text-[#F97316] border-b-2 border-[#F97316]' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Specifications
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 py-4 text-center font-bold font-sans transition-colors ${activeTab === 'reviews' ? 'text-[#F97316] border-b-2 border-[#F97316]' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            Reviews
          </button>
        </div>

        <div className="p-8">
          {activeTab === 'description' && (
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed font-medium">{product.description}</p>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
              {product.specs && product.specs.length > 0 ? (
                product.specs.map(spec => (
                  <div key={spec.id} className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100 last:border-0">
                    <span className="text-gray-500 font-bold">{spec.key}</span>
                    <span className="text-gray-900 font-medium col-span-2">{spec.value}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 col-span-2">No specifications available for this product.</p>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="md:col-span-1">
                <h3 className="text-xl font-bold text-gray-900 mb-4 font-sans">Customer Reviews</h3>
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-5xl font-bold text-gray-900 font-mono tracking-tighter">{product.rating.toFixed(1)}</div>
                  <div>
                    <div className="flex text-yellow-400 text-xl">
                      {'★'.repeat(Math.floor(product.rating))}
                      {'☆'.repeat(5 - Math.floor(product.rating))}
                    </div>
                    <p className="text-sm font-medium text-gray-500 mt-1">Based on {product.reviewCount || 0} reviews</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map(star => {
                    const pct = star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 5 : 5;
                    return (
                      <div key={star} className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-600 w-12">{star} stars</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-400" style={{ width: `${pct}%` }}></div>
                        </div>
                        <span className="text-xs font-bold text-gray-400 w-8 text-right">{pct}%</span>
                      </div>
                    )
                  })}
                </div>

                {token ? (
                  <button onClick={() => setShowReviewForm(!showReviewForm)} className="mt-8 w-full py-3 px-4 bg-white border-2 border-gray-200 text-gray-900 font-bold rounded-xl hover:border-gray-300 transition-colors">
                    {showReviewForm ? 'Cancel Review' : 'Write a Review'}
                  </button>
                ) : (
                  <p className="mt-8 text-sm text-gray-500 font-medium text-center">Please sign in to write a review</p>
                )}
              </div>
              <div className="md:col-span-2 space-y-6">
                {showReviewForm && (
                  <form onSubmit={submitReview} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 mb-8 animate-in slide-in-from-top-2">
                    <h4 className="font-bold text-gray-900 mb-4">Write your review</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Rating</label>
                        <select value={reviewForm.rating} onChange={e => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })} className="w-full h-10 px-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#F97316] outline-none bg-white">
                          <option value={5}>5 - Excellent</option>
                          <option value={4}>4 - Good</option>
                          <option value={3}>3 - Average</option>
                          <option value={2}>2 - Poor</option>
                          <option value={1}>1 - Terrible</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Review Title</label>
                        <input required type="text" value={reviewForm.title} onChange={e => setReviewForm({ ...reviewForm, title: e.target.value })} className="w-full h-10 px-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#F97316] outline-none" placeholder="Summarize your experience" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Review Details</label>
                        <textarea required value={reviewForm.body} onChange={e => setReviewForm({ ...reviewForm, body: e.target.value })} className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#F97316] outline-none resize-none h-24" placeholder="What did you like or dislike?"></textarea>
                      </div>
                      <button type="submit" disabled={isSubmittingReview} className="py-3 px-6 bg-[#1B1F5E] text-white font-bold rounded-xl hover:bg-indigo-900 transition-colors disabled:opacity-50">
                        {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </div>
                  </form>
                )}

                {reviews.length > 0 ? reviews.map(review => (
                  <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500">
                          {review.reviewer.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{review.reviewer}</p>
                          <div className="flex text-yellow-400 text-xs">
                            {'★'.repeat(Math.floor(review.rating))}
                            {'☆'.repeat(5 - Math.floor(review.rating))}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-gray-400">{new Date(review.date).toLocaleDateString()}</span>
                    </div>
                    <h4 className="font-bold text-gray-900 mt-2 mb-1">{review.title}</h4>
                    <p className="text-gray-700 font-medium">"{review.body}"</p>
                    {review.verified && (
                      <span className="inline-block mt-2 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">Verified Purchase</span>
                    )}
                  </div>
                )) : (
                  <p className="text-gray-500 font-medium py-8 text-center bg-gray-50 rounded-xl border border-gray-100">No reviews yet. Be the first to review this product!</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <section className="pt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 font-sans">Similar Products</h2>
          <div className="flex overflow-x-auto pb-4 -mx-2 px-2 snap-x gap-6 hide-scrollbar">
            {similarProducts.map(product => (
              <div key={product.id} className="min-w-60 max-w-60 snap-start bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all group">
                <Link to={`/product/${product.id}`} className="block relative aspect-square bg-gray-50 p-4">
                  {(product as any).image_url || (product.images && product.images[0]) ? (
                    <img src={(product as any).image_url || product.images[0].url} alt={product.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 font-medium">No Image</div>
                  )}
                </Link>
                <div className="p-4">
                  <Link to={`/product/${product.id}`} className="hover:text-[#F97316] transition-colors">
                    <p className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">{product.brand}</p>
                    <h3 className="font-medium text-gray-900 line-clamp-2 text-sm leading-tight">{product.name}</h3>
                  </Link>
                  <div className="flex items-baseline gap-2 mt-3">
                    <span className="text-lg font-bold text-gray-900 font-mono">XLM {product.price.toFixed(2)}</span>
                    {product.mrp > product.price && (
                      <span className="text-xs text-gray-400 line-through font-mono">XLM {product.mrp.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
