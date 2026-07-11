import { useState } from 'react';
import type { FormEvent } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingCart, Store, User as UserIcon, Search, ChevronDown } from 'lucide-react';

import { useCartStore } from './store/cartStore';
import { useAuthStore } from './store/authStore';

import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';
import AccountPage from './pages/AccountPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import ToastContainer from './components/ToastContainer';
import AuthModal from './components/AuthModal';

function SearchBar() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = formData.get('q') as string;
    if (q) {
      navigate(`/?q=${encodeURIComponent(q)}`);
    } else {
      navigate('/');
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-4 sm:mx-8 relative">
      <div className="relative flex items-center w-full h-11 rounded-md focus-within:ring-2 focus-within:ring-[#F97316] bg-gray-100 overflow-hidden border border-transparent focus-within:border-[#F97316] shadow-inner">
        <div className="grid place-items-center h-full w-12 text-gray-500 bg-gray-200 border-r border-gray-300">
          <Search className="w-5 h-5 text-gray-600" />
        </div>
        <input
          className="peer h-full w-full outline-none text-sm text-gray-900 px-3 bg-white font-medium"
          type="text"
          name="q"
          id="search"
          placeholder="Search for products, brands and more..."
          defaultValue={searchParams.get('q') || ''}
        />
        <button type="submit" className="h-full px-6 bg-[#F97316] text-white font-bold hover:bg-orange-600 transition-colors hidden sm:block">
          Search
        </button>
      </div>
    </form>
  );
}

function Navigation({ onOpenAuth }: { onOpenAuth: () => void }) {
  const cartItems = useCartStore(state => state.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const { user } = useAuthStore();
  
  return (
    <>
      <div className="bg-[#EAB308] text-gray-900 text-xs font-bold text-center py-1.5 px-4 shadow-sm relative z-50">
        ⚠️ DEMO STORE: This website is created for testing purposes only. No actual orders or transactions are processed.
      </div>
      <header className="sticky top-0 z-50 bg-[#1B1F5E] border-b border-indigo-900 text-white shadow-md">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold tracking-tight text-2xl text-white hover:text-gray-200 transition-colors">
          <div className="flex items-center justify-center bg-[#F97316] rounded-xl p-1.5 shadow-md">
            <Store className="w-5 h-5 text-white" />
          </div>
          <span className="hidden sm:inline font-sans">TestMarket</span>
        </Link>
        
        <SearchBar />
        
        <nav className="flex items-center gap-4 sm:gap-6 shrink-0">
          {user ? (
            <Link to="/account" className="flex items-center gap-1.5 text-sm font-bold text-gray-200 hover:text-white transition-colors">
              <UserIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Hi, {user.name.split(' ')[0]}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </Link>
          ) : (
            <button onClick={onOpenAuth} className="flex items-center gap-1.5 text-sm font-bold text-gray-200 hover:text-white transition-colors">
              <UserIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}

          <Link to="/cart" className="relative group p-2 -m-2 flex items-center gap-1.5 text-sm font-bold text-gray-200 hover:text-white transition-colors">
            <div className="relative">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#F97316] text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-[#1B1F5E]">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline">Cart</span>
          </Link>
        </nav>
      </div>
    </header>
    </>
  );
}

export default function App() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-[#F3F4F6] text-[#111827] font-sans selection:bg-[#F97316] selection:text-white flex flex-col">
        <Navigation onOpenAuth={() => setIsAuthOpen(true)} />
        <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/account" element={<AccountPage />} />
          </Routes>
        </main>
        
        {/* Footer */}
        <footer className="bg-gray-900 text-gray-400 py-12 mt-auto">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 font-bold tracking-tight text-xl text-white mb-4">
                <div className="flex items-center justify-center bg-[#F97316] rounded-lg p-1.5">
                  <Store className="w-4 h-4 text-white" />
                </div>
                <span className="font-sans">TestMarket</span>
              </div>
              <p className="text-sm text-[#EAB308] font-bold">⚠️ DEMO ONLY: This is a non-production test website. No real orders will be processed.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/?category=electronics" className="hover:text-white transition-colors">Electronics</Link></li>
                <li><Link to="/?category=fashion" className="hover:text-white transition-colors">Fashion</Link></li>
                <li><Link to="/?category=home-kitchen" className="hover:text-white transition-colors">Home & Kitchen</Link></li>
                <li><Link to="/?category=grocery" className="hover:text-white transition-colors">Grocery</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Customer Service</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/account" className="hover:text-white transition-colors">My Account</Link></li>
                <li><Link to="/account" className="hover:text-white transition-colors">Track Order</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">Returns & Refunds</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Contact Info</h4>
              <ul className="space-y-2 text-sm">
                <li>support@testmarket.com</li>
                <li>1-800-GRAND-MKT</li>
                <li>123 Market St, San Francisco, CA 94105</li>
              </ul>
            </div>
          </div>
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-800 text-sm text-center">
            &copy; {new Date().getFullYear()} TestMarket. All rights reserved.
          </div>
        </footer>

        <ToastContainer />
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      </div>
    </Router>
  );
}
