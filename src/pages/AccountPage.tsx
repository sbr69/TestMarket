import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Package, Heart, User as UserIcon, MapPin, CheckCircle, Clock, Truck, Settings, Lock, Bot } from 'lucide-react';

interface OrderItem {
  id: string;
  quantity: number;
  priceAtPurchase: number;
  product: { id: string; name: string; brand: string; images: { url: string }[] };
}

interface Order {
  id: string;
  createdAt: string;
  status: string;
  total: number;
  items: OrderItem[];
}

export default function AccountPage() {
  const { user, token, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'profile' | 'addresses' | 'agent'>('orders');
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (token && activeTab === 'orders') {
      setLoadingOrders(true);
      fetch('/api/orders', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => { setOrders(data); setLoadingOrders(false); })
        .catch(() => setLoadingOrders(false));
    }
  }, [token, activeTab]);

  if (!token || !user) {
    return (
      <div className="text-center py-20 px-4 bg-white rounded-2xl border border-gray-200 max-w-3xl mx-auto mt-8 shadow-sm">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300 mb-6">
          <UserIcon className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 font-sans mb-2">My Account</h2>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto">Sign in to view your orders, wishlist, and manage your profile.</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'orders':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 font-sans">My Orders</h2>
            {loadingOrders ? (
              <div className="animate-pulse space-y-4">
                <div className="h-32 bg-gray-200 rounded-2xl"></div>
                <div className="h-32 bg-gray-200 rounded-2xl"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-200">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-bold text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-500 mb-6">When you buy something, it will appear here.</p>
                <Link to="/" className="inline-flex py-3 px-6 bg-[#F97316] text-white font-bold rounded-xl hover:bg-orange-600 transition-colors">
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map(order => (
                  <div key={order.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-wrap gap-8 justify-between items-center text-sm">
                      <div className="flex gap-8">
                        <div>
                          <p className="text-gray-500 font-bold uppercase tracking-wider text-xs">Order Placed</p>
                          <p className="font-medium text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 font-bold uppercase tracking-wider text-xs">Total</p>
                          <p className="font-bold text-gray-900 font-mono">${order.total.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-500 font-bold uppercase tracking-wider text-xs">Order # {order.id.slice(-8).toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        {order.status.toLowerCase() === 'delivered' ? (
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        ) : order.status.toLowerCase() === 'shipped' ? (
                          <Truck className="w-6 h-6 text-blue-500" />
                        ) : (
                          <Clock className="w-6 h-6 text-[#F97316]" />
                        )}
                        <span className="font-bold text-gray-900 capitalize text-lg">{order.status}</span>
                      </div>
                      <div className="space-y-6">
                        {order.items.map(item => (
                          <div key={item.id} className="flex gap-6 items-start">
                            <Link to={`/product/${item.product.id}`} className="w-20 h-20 bg-gray-50 border border-gray-100 rounded-xl flex-shrink-0 flex items-center justify-center p-2 hover:border-[#F97316]">
                              {item.product.images?.[0]?.url ? (
                                <img src={item.product.images[0].url} alt={item.product.name} className="w-full h-full object-contain" />
                              ) : (
                                <Package className="w-8 h-8 text-gray-300" />
                              )}
                            </Link>
                            <div className="flex-grow pt-1">
                              <Link to={`/product/${item.product.id}`}>
                                <h3 className="font-bold text-[#1B1F5E] hover:text-[#F97316] text-base leading-snug mb-1">{item.product.name}</h3>
                              </Link>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span>Qty: <span className="font-bold text-gray-900">{item.quantity}</span></span>
                                <span className="font-bold text-gray-900 font-mono">${item.priceAtPurchase.toFixed(2)}</span>
                              </div>
                            </div>
                            <div className="hidden sm:block">
                              <Link to={`/product/${item.product.id}`} className="py-2 px-4 bg-[#F97316] text-white text-sm font-bold rounded-lg hover:bg-orange-600 transition-colors">
                                Buy again
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'wishlist':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 font-sans mb-6">My Wishlist</h2>
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-200">
              <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">Your wishlist is empty</h3>
              <p className="text-gray-500">Save items you love to view them later.</p>
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="space-y-8 max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-900 font-sans">Profile Settings</h2>
            
            <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-indigo-100 text-[#1B1F5E] rounded-full flex items-center justify-center text-3xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{user.name}</h3>
                  <p className="text-gray-500">{user.email}</p>
                </div>
              </div>
              
              <form className="space-y-4 pt-4 border-t border-gray-100">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                  <input type="text" defaultValue={user.name} className="w-full h-11 px-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#F97316] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                  <input type="email" defaultValue={user.email} disabled className="w-full h-11 px-4 rounded-xl border border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
                  <input type="tel" defaultValue={user.phone || ''} className="w-full h-11 px-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#F97316] outline-none" />
                </div>
                <div className="pt-4">
                  <button type="button" className="py-3 px-6 bg-[#1B1F5E] text-white font-bold rounded-xl hover:bg-indigo-900 transition-colors">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      case 'addresses':
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 font-sans">Saved Addresses</h2>
              <button className="py-2 px-4 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50">Add New</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-2 border-[#1B1F5E] rounded-xl p-6 relative">
                <span className="absolute top-4 right-4 bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded">Default</span>
                <p className="font-bold text-gray-900 mb-2">{user.name}</p>
                <p className="text-gray-600 text-sm mb-1">123 Tech Lane, Software Park</p>
                <p className="text-gray-600 text-sm mb-3">Silicon City, CA - 94016</p>
                <p className="text-gray-600 text-sm font-medium">Phone: {user.phone || '+1 234 567 8900'}</p>
                <div className="flex gap-4 mt-4 text-sm font-bold">
                  <button className="text-[#1B1F5E] hover:underline">Edit</button>
                  <button className="text-red-500 hover:underline">Remove</button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'agent':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 font-sans mb-6">Agent Access</h2>
            <div className="bg-indigo-50 border border-indigo-100 p-8 rounded-2xl text-center">
              <Bot className="w-16 h-16 text-[#1B1F5E] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[#1B1F5E] mb-2">Automated Agent Services</h3>
              <p className="text-indigo-800 max-w-md mx-auto mb-6">Grant secure, scoped access to AI agents to manage your shopping cart, re-order favorites, and track deliveries on your behalf.</p>
              <button className="py-3 px-6 bg-[#1B1F5E] text-white font-bold rounded-xl shadow-md hover:bg-indigo-900 flex items-center gap-2 mx-auto">
                <Lock className="w-5 h-5" />
                Configure Agent Access
              </button>
            </div>
          </div>
        );
    }
  };

  const navItems = [
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'wishlist', label: 'My Wishlist', icon: Heart },
    { id: 'profile', label: 'Profile Settings', icon: Settings },
    { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
    { id: 'agent', label: 'Agent Access', icon: Bot },
  ];

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden sticky top-24">
            <div className="p-6 border-b border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 text-[#1B1F5E] rounded-full flex items-center justify-center text-xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Hello,</p>
                <p className="font-bold text-gray-900">{user.name}</p>
              </div>
            </div>
            <nav className="p-2">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${
                      isActive ? 'bg-[#1B1F5E] text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                );
              })}
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-600 hover:bg-red-50 mt-4 border-t border-gray-100 rounded-t-none"
              >
                Log Out
              </button>
            </nav>
          </div>
        </aside>
        
        <main className="flex-1 min-w-0">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
