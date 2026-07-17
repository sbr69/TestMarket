import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { Trash2, ShoppingBag, Store } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import AuthModal from '../components/AuthModal';
import { fetchPublicJson } from '../utils/apiCache';

interface ProductImage {
  id: string;
  url: string;
}

interface ProductDetail {
  id: string;
  name: string;
  brand: string;
  price: number;
  mrp: number;
  stock: number;
  images: ProductImage[];
}

const CartSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
    <div className="lg:col-span-2 space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
      {[1, 2].map(i => (
        <div key={i} className="flex gap-6 p-6 bg-white rounded-2xl border border-gray-200">
          <div className="w-24 h-24 bg-gray-200 rounded-xl"></div>
          <div className="flex-1 space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      ))}
    </div>
    <div className="lg:col-span-1">
      <div className="bg-white rounded-2xl border border-gray-200 p-6 h-64"></div>
    </div>
  </div>
);

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCartStore();
  const [productsData, setProductsData] = useState<Record<string, ProductDetail>>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (user && showAuthModal) {
      setShowAuthModal(false);
      navigate('/checkout');
    }
  }, [user, showAuthModal, navigate]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (items.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const productIds = items.map(i => i.id);
        const products = await fetchPublicJson<ProductDetail[]>(`/api/products/batch?ids=${productIds.join(',')}`);
        const data: Record<string, ProductDetail> = {};
        for (const p of products) {
          data[p.id] = p;
        }
        setProductsData(data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch cart products', err);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [items]);

  const total = items.reduce((sum, item) => {
    const product = productsData[item.id];
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  const mrpTotal = items.reduce((sum, item) => {
    const product = productsData[item.id];
    return sum + (product ? product.mrp * item.quantity : 0);
  }, 0);

  const totalDiscount = mrpTotal - total;
  const shippingFee = total > 499 ? 0 : 50;
  const finalTotal = total + shippingFee;
  const upsellProducts = Object.values(productsData) as ProductDetail[];

  if (loading) return <CartSkeleton />;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 bg-white rounded-2xl border border-gray-200 shadow-sm max-w-3xl mx-auto mt-8">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-2 font-sans">Your cart is empty</h2>
        <p className="text-gray-500 mb-8 text-center max-w-sm font-medium">Looks like you haven't added anything to your cart yet. Explore our top categories!</p>
        <Link to="/" className="inline-flex py-3 px-8 bg-[#1B1F5E] text-white font-bold rounded-xl hover:bg-indigo-900 transition-colors shadow-md">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-end justify-between border-b border-gray-200 pb-4">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 font-sans">Shopping Cart</h1>
            <span className="text-gray-500 font-bold">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <ul className="divide-y divide-gray-100">
              {items.map(item => {
                const product = productsData[item.id];
                if (!product) return null;

                const imageUrl = product.images?.[0]?.url;

                return (
                  <li key={item.id} className="p-6 flex flex-col sm:flex-row sm:items-start gap-6 hover:bg-gray-50 transition-colors">
                    <Link to={`/product/${product.id}`} className="w-24 h-24 sm:w-32 sm:h-32 bg-white border border-gray-200 rounded-xl shrink-0 overflow-hidden relative flex items-center justify-center p-2 group">
                      {imageUrl ? (
                        <img src={imageUrl} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform" loading="lazy" decoding="async" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <ShoppingBag className="w-8 h-8" />
                        </div>
                      )}
                    </Link>

                    <div className="grow flex flex-col h-full">
                      <div className="flex justify-between items-start mb-1 gap-4">
                        <Link to={`/product/${product.id}`} className="hover:text-[#F97316] transition-colors">
                          <h3 className="font-bold text-gray-900 text-lg leading-snug font-sans">{product.name}</h3>
                        </Link>
                        <div className="text-right">
                          <p className="text-gray-900 font-bold font-mono tracking-tight text-lg">XLM {product.price.toFixed(2)}</p>
                          {product.mrp > product.price && (
                            <p className="text-gray-400 line-through font-mono text-sm">XLM {product.mrp.toFixed(2)}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{product.brand}</p>
                        <span className="text-gray-300">•</span>
                        <div className="flex items-center gap-1 text-xs font-medium text-gray-500">
                          <Store className="w-3 h-3" />
                          Sold by SuperMart
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-lg border border-gray-300 shadow-sm">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="text-gray-500 hover:text-[#F97316] w-6 h-6 flex items-center justify-center font-bold text-lg"
                          >−</button>
                          <span className="w-8 text-center font-bold text-sm text-gray-900">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, Math.min(product.stock, item.quantity + 1))}
                            className="text-gray-500 hover:text-[#F97316] w-6 h-6 flex items-center justify-center font-bold text-lg"
                          >+</button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="flex items-center gap-1.5 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-bold"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 sticky top-24 shadow-sm space-y-6">
            <h2 className="text-xl font-bold tracking-tight text-gray-900 border-b border-gray-100 pb-4 font-sans">Order Summary</h2>

            <div className="space-y-4 text-sm font-medium">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-mono">XLM {mrpTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span className="font-mono">-XLM {totalDiscount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Charges</span>
                <span className="font-mono">{shippingFee === 0 ? <span className="text-green-600">Free</span> : `XLM ${shippingFee.toFixed(2)}`}</span>
              </div>
              {shippingFee > 0 && (
                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-100">
                  Add <span className="font-bold text-gray-900 font-mono">XLM {(500 - total).toFixed(2)}</span> more to your cart for FREE delivery!
                </div>
              )}
              <div className="pt-4 border-t border-gray-200 flex justify-between font-bold text-gray-900 text-xl font-sans">
                <span>Total Amount</span>
                <span className="font-mono">XLM {finalTotal.toFixed(2)}</span>
              </div>
              <p className="text-green-600 text-xs font-bold pt-1 bg-green-50 p-2 rounded border border-green-100">
                You will save XLM {totalDiscount.toFixed(2)} on this order
              </p>
            </div>

            <button
              onClick={() => {
                if (!user) {
                  setShowAuthModal(true);
                } else {
                  navigate('/checkout');
                }
              }}
              className="w-full py-4 px-4 bg-[#F97316] text-white font-bold rounded-xl hover:bg-orange-600 active:scale-[0.98] transition-all flex justify-center items-center gap-2 shadow-md hover:shadow-lg text-lg"
            >
              Proceed to Checkout
            </button>
            <p className="text-xs text-center text-gray-400 mt-4 flex items-center justify-center gap-1.5 font-bold">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secure Checkout
            </p>
          </div>
        </div>
      </div>

      {/* Upsell Section */}
      <section className="pt-8 border-t border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 font-sans">Customers also bought</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {upsellProducts.slice(0, 4).map(product => (
            <div key={product.id + 'upsell'} className="group relative flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
              <Link to={`/product/${product.id}`} className="aspect-square bg-gray-50 p-4 flex items-center justify-center">
                {product.images?.[0]?.url ? (
                  <img src={product.images[0].url} alt={product.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform" loading="lazy" decoding="async" />
                ) : (
                  <ShoppingBag className="w-8 h-8 text-gray-300" />
                )}
              </Link>
              <div className="p-4 flex flex-col grow">
                <Link to={`/product/${product.id}`} className="hover:text-[#F97316] transition-colors">
                  <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 text-sm">{product.name}</h3>
                </Link>
                <div className="flex items-baseline gap-2 mt-auto pt-2">
                  <span className="text-lg font-bold text-gray-900 font-mono">XLM {product.price.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
