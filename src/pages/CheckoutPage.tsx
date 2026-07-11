import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { ShieldCheck, Truck, CreditCard, CheckCircle2, ChevronRight, FileText, ShoppingBag } from 'lucide-react';

interface ProductDetail {
  id: string;
  name: string;
  price: number;
  images: { url: string }[];
}

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const { token, user } = useAuthStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [productsData, setProductsData] = useState<Record<string, ProductDetail>>({});
  
  // Form State
  const [address, setAddress] = useState({
    fullName: user?.name || '',
    phone: '',
    pincode: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    if (items.length === 0 && step !== 3) {
      navigate('/cart');
      return;
    }
    
    // Fetch product details for summary
    const fetchProducts = async () => {
      try {
        const productIds = items.map(i => i.id);
        const data: Record<string, ProductDetail> = {};
        for (const id of productIds) {
          const res = await fetch(`/api/products/${id}`);
          if (res.ok) {
            data[id] = await res.json();
          }
        }
        setProductsData(data);
      } catch (err) {
        console.error(err);
      }
    };
    
    if (step < 3) fetchProducts();
  }, [items, navigate, step]);

  const total = items.reduce((sum, item) => {
    const product = productsData[item.id];
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
  
  const shippingFee = total > 499 ? 0 : 49;
  const finalTotal = total + shippingFee;

  const handleAddressSubmit = (e: FormEvent) => {
    e.preventDefault();
    setStep(2);
    window.scrollTo(0, 0);
  };

  const handlePaymentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const fullAddress = `${address.addressLine1}, ${address.addressLine2}, ${address.city}, ${address.state} - ${address.pincode}`;
    
    try {
      if (token) {
        const checkoutRes = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            address: fullAddress,
            payment_method: paymentMethod
          })
        });
        if (checkoutRes.ok) {
          const data = await checkoutRes.json();
          setOrderId(data.order.id);
          clearCart();
          setStep(3);
        } else {
          addToast('Checkout failed. Please try again.', 'error');
        }
      } else {
        // Guest checkout simulation
        await new Promise(resolve => setTimeout(resolve, 1500));
        setOrderId('ORD-' + Math.random().toString(36).substring(2, 10).toUpperCase());
        clearCart();
        setStep(3);
      }
    } catch (err) {
      console.error(err);
      addToast('An error occurred during checkout.', 'error');
    } finally {
      setSubmitting(false);
      window.scrollTo(0, 0);
    }
  };

  if (step === 3) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-gray-200 shadow-sm text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 font-sans mb-4">Order Confirmed!</h1>
          <p className="text-gray-500 font-medium mb-2">Thank you for shopping with GrandMarket.</p>
          <p className="text-gray-500 font-medium mb-8">Your order ID is <span className="text-gray-900 font-bold font-mono">{orderId}</span></p>
          
          <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Delivery Details</h3>
            <p className="text-gray-700 font-medium">{address.fullName}</p>
            <p className="text-gray-600">{address.addressLine1}, {address.addressLine2}</p>
            <p className="text-gray-600">{address.city}, {address.state} - {address.pincode}</p>
            <p className="text-gray-600 mt-2">Estimated Delivery: <span className="font-bold text-gray-900">{new Date(Date.now() + 86400000*3).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span></p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/orders" className="py-3 px-6 bg-white border-2 border-[#1B1F5E] text-[#1B1F5E] font-bold rounded-xl hover:bg-gray-50 transition-colors">
              View Order Status
            </Link>
            <button className="py-3 px-6 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" />
              Download Invoice
            </button>
            <Link to="/" className="py-3 px-6 bg-[#F97316] text-white font-bold rounded-xl hover:bg-orange-600 transition-colors shadow-md">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* Checkout Progress Steps */}
      <div className="flex items-center justify-center mb-12">
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? 'bg-[#1B1F5E] text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
          <span className={`ml-2 font-bold ${step >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>Address</span>
          <div className={`w-16 h-1 mx-4 rounded-full ${step >= 2 ? 'bg-[#1B1F5E]' : 'bg-gray-200'}`}></div>
          
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? 'bg-[#1B1F5E] text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
          <span className={`ml-2 font-bold ${step >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>Payment</span>
          <div className={`w-16 h-1 mx-4 rounded-full ${step >= 3 ? 'bg-[#1B1F5E]' : 'bg-gray-200'}`}></div>
          
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 3 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
          <span className={`ml-2 font-bold ${step >= 3 ? 'text-gray-900' : 'text-gray-400'}`}>Done</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {step === 1 && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center">
                  <Truck className="w-5 h-5 text-[#1B1F5E]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 font-sans">Delivery Address</h2>
              </div>
              
              <form onSubmit={handleAddressSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Full Name</label>
                    <input required type="text" value={address.fullName} onChange={e => setAddress({...address, fullName: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#F97316] outline-none font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Phone Number</label>
                    <input required type="tel" value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#F97316] outline-none font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Pincode</label>
                    <input required type="text" value={address.pincode} onChange={e => setAddress({...address, pincode: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#F97316] outline-none font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Locality / Town</label>
                    <input required type="text" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#F97316] outline-none font-medium" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Address (House No, Building, Street, Area)</label>
                  <textarea required rows={2} value={address.addressLine1} onChange={e => setAddress({...address, addressLine1: e.target.value})} className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#F97316] outline-none font-medium resize-none"></textarea>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Landmark (Optional)</label>
                    <input type="text" value={address.addressLine2} onChange={e => setAddress({...address, addressLine2: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#F97316] outline-none font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">State</label>
                    <input required type="text" value={address.state} onChange={e => setAddress({...address, state: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#F97316] outline-none font-medium" />
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex justify-end">
                  <button type="submit" className="py-4 px-8 bg-[#F97316] text-white font-bold rounded-xl hover:bg-orange-600 active:scale-[0.98] transition-all flex items-center gap-2 shadow-md">
                    Deliver Here
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-[#1B1F5E]" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 font-sans">Payment Method</h2>
                </div>
                <button onClick={() => setStep(1)} className="text-[#F97316] font-bold text-sm hover:underline">Change Address</button>
              </div>
              
              <form onSubmit={handlePaymentSubmit} className="space-y-6">
                <div className="space-y-3">
                  <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === 'upi' ? 'border-[#F97316] bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="payment" value="upi" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} className="w-5 h-5 text-[#F97316] focus:ring-[#F97316]" />
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">UPI (GPay, PhonePe, Paytm)</p>
                      <p className="text-sm text-gray-500">Pay directly from your bank account.</p>
                    </div>
                  </label>
                  
                  <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === 'credit_card' ? 'border-[#F97316] bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="payment" value="credit_card" checked={paymentMethod === 'credit_card'} onChange={() => setPaymentMethod('credit_card')} className="w-5 h-5 text-[#F97316] focus:ring-[#F97316]" />
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">Credit / Debit Card</p>
                      <p className="text-sm text-gray-500">Visa, MasterCard, RuPay, Maestro.</p>
                    </div>
                  </label>
                  
                  {paymentMethod === 'credit_card' && (
                    <div className="pl-14 pr-4 py-2 space-y-4 animate-in slide-in-from-top-2">
                      <input required type="text" placeholder="Card Number" className="w-full h-12 px-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#F97316] outline-none font-mono" />
                      <div className="grid grid-cols-2 gap-4">
                        <input required type="text" placeholder="MM/YY" className="w-full h-12 px-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#F97316] outline-none font-mono" />
                        <input required type="text" placeholder="CVV" className="w-full h-12 px-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#F97316] outline-none font-mono" />
                      </div>
                    </div>
                  )}

                  <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === 'net_banking' ? 'border-[#F97316] bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="payment" value="net_banking" checked={paymentMethod === 'net_banking'} onChange={() => setPaymentMethod('net_banking')} className="w-5 h-5 text-[#F97316] focus:ring-[#F97316]" />
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">Net Banking</p>
                      <p className="text-sm text-gray-500">All major banks supported.</p>
                    </div>
                  </label>
                  
                  <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-[#F97316] bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-5 h-5 text-[#F97316] focus:ring-[#F97316]" />
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">Cash on Delivery</p>
                      <p className="text-sm text-gray-500">Pay at your doorstep.</p>
                    </div>
                  </label>
                </div>

                <div className="pt-6 border-t border-gray-100 flex justify-end">
                  <button type="submit" disabled={submitting} className="py-4 px-8 bg-[#F97316] text-white font-bold rounded-xl hover:bg-orange-600 active:scale-[0.98] transition-all flex items-center gap-2 shadow-md disabled:opacity-50">
                    <ShieldCheck className="w-5 h-5" />
                    {submitting ? 'Processing...' : `Pay $${finalTotal.toFixed(2)}`}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-24">
            <h3 className="font-bold text-gray-900 mb-4 font-sans">Order Summary</h3>
            
            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {items.map(item => {
                const product = productsData[item.id];
                if (!product) return null;
                return (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center p-1 shrink-0">
                       {product.images?.[0]?.url ? (
                        <img src={product.images[0].url} alt={product.name} className="w-full h-full object-contain" />
                       ) : (
                        <ShoppingBag className="w-6 h-6 text-gray-300" />
                       )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{product.name}</p>
                      <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                      <p className="text-sm font-bold text-gray-900 font-mono mt-1">${(product.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
            
            <div className="space-y-3 text-sm font-medium border-t border-gray-100 pt-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-mono">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span className="font-mono">{shippingFee === 0 ? <span className="text-green-600">Free</span> : `$${shippingFee.toFixed(2)}`}</span>
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-between font-bold text-gray-900 text-lg font-sans">
                <span>Total</span>
                <span className="font-mono">${finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
