'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, ArrowLeft, CheckCircle2, ShieldCheck, Truck, CreditCard, Check, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { createOrder } from '@/lib/supabase';

const PAKISTAN_CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan',
  'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 'Hyderabad', 'Abbottabad'
];

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: 'Karachi',
    paymentMethod: 'cod' as 'cod' | 'bank_transfer'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  const deliveryCharges = cartTotal > 5000 ? 0 : 250;
  const finalGrandTotal = cartTotal + deliveryCharges;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address) {
      alert('Please fill in Name, Phone number and Shipping Address.');
      return;
    }

    setIsSubmitting(true);

    const orderPayload = {
      customer_name: formData.name,
      customer_phone: formData.phone,
      customer_email: formData.email,
      address: formData.address,
      city: formData.city,
      payment_method: formData.paymentMethod,
      total_amount: finalGrandTotal,
      items: cart.map(item => ({
        product_id: item.product.id,
        title: item.product.title,
        price: item.product.price,
        quantity: item.quantity,
        selected_size: item.selectedSize,
        image: item.product.images[0],
        custom_measurements: item.customMeasurements
      }))
    };

    const res = await createOrder(orderPayload);
    setIsSubmitting(false);

    if (res.success) {
      setPlacedOrderId(res.orderId);
      clearCart();
    }
  };

  // SUCCESS CONFIRMATION SCREEN
  if (placedOrderId) {
    return (
      <div className="bg-[#FAF9F6] min-h-screen py-16 text-[#18181B]">
        <div className="max-w-2xl mx-auto px-4 text-center space-y-6">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#C7A76C] mx-auto shadow-xl bg-white p-1">
            <Image 
              src="/logo.png" 
              alt="ZEHRA STUDIO" 
              width={80} 
              height={80} 
              className="w-full h-full object-cover rounded-full" 
            />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#6B1D2F] uppercase tracking-[0.25em]">ORDER CONFIRMED &bull; ZEHRA STUDIO</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#18181B]">Shukriya, {formData.name}!</h1>
            <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
              Aap ka order <strong className="text-[#881337] font-mono">{placedOrderId}</strong> successfully record ho chuka hai. Hamari team dispatch update ke liye aap se contact karegi.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 p-6 text-left max-w-md mx-auto space-y-3 text-xs shadow-md">
            <div className="flex justify-between border-b border-stone-100 pb-2">
              <span className="text-stone-500 font-medium">Order ID:</span>
              <span className="font-mono font-bold text-[#18181B]">{placedOrderId}</span>
            </div>
            <div className="flex justify-between border-b border-stone-100 pb-2">
              <span className="text-stone-500 font-medium">Delivery Address:</span>
              <span className="font-semibold text-[#18181B]">{formData.city}, Pakistan</span>
            </div>
            <div className="flex justify-between border-b border-stone-100 pb-2">
              <span className="text-stone-500 font-medium">Payment Mode:</span>
              <span className="font-semibold text-[#18181B]">{formData.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Direct Bank Transfer'}</span>
            </div>
            <div className="flex justify-between pt-1 text-sm font-black">
              <span>Total Payable Amount:</span>
              <span className="text-[#881337]">RS. {finalGrandTotal.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Link href="/shop" className="btn-luxury-gold text-xs font-black uppercase tracking-widest px-8 py-4 rounded-full transition-all shadow-xl">
              Continue Shopping
            </Link>
            <Link href="/admin" className="btn-luxury-outline text-xs font-black uppercase tracking-widest px-8 py-4 rounded-full transition-all shadow-xs">
              View Order in Admin Panel
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // EMPTY CART SCREEN
  if (cart.length === 0) {
    return (
      <div className="bg-[#FAF9F6] min-h-screen py-24 text-[#18181B]">
        <div className="max-w-md mx-auto px-4 text-center space-y-4">
          <ShoppingBag className="w-14 h-14 text-[#6B1D2F] mx-auto opacity-75" />
          <h2 className="text-2xl font-bold text-[#18181B]">Your Bag is Empty</h2>
          <p className="text-xs text-stone-600">Add luxury pret designs to your shopping cart to proceed to checkout.</p>
          <Link href="/shop" className="inline-block btn-luxury-gold text-xs font-black uppercase tracking-widest px-8 py-3.5 rounded-full transition-all shadow-xl">
            Explore Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF9F6] text-[#18181B] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Link href="/shop" className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-[#881337] font-bold">
          <ArrowLeft className="w-4 h-4" /> Back to Shop Catalog
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Shipping & Payment Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-6 shadow-md">
            <div>
              <span className="text-[10px] font-bold text-[#6B1D2F] uppercase tracking-[0.25em]">EXPRESS SHIPPING PAKISTAN</span>
              <h1 className="text-2xl font-bold text-[#18181B] mt-1">Delivery &amp; Billing Details</h1>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-[#18181B] uppercase tracking-wider mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ayesha Khan"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#FAF9F6] border border-stone-300 rounded-xl px-4 py-3.5 text-xs text-[#18181B] focus:outline-none focus:border-[#C7A76C]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-[#18181B] uppercase tracking-wider mb-1.5">Mobile Phone (WhatsApp) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="0300 1234567"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#FAF9F6] border border-stone-300 rounded-xl px-4 py-3.5 text-xs text-[#18181B] focus:outline-none focus:border-[#C7A76C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-[#18181B] uppercase tracking-wider mb-1.5">Email Address (Optional)</label>
                  <input
                    type="email"
                    placeholder="ayesha@example.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#FAF9F6] border border-stone-300 rounded-xl px-4 py-3.5 text-xs text-[#18181B] focus:outline-none focus:border-[#C7A76C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-[#18181B] uppercase tracking-wider mb-1.5">City *</label>
                  <select
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-[#FAF9F6] border border-stone-300 rounded-xl px-4 py-3.5 text-xs text-[#18181B] focus:outline-none focus:border-[#C7A76C]"
                  >
                    {PAKISTAN_CITIES.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-[#18181B] uppercase tracking-wider mb-1.5">Complete House Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="House #, Street, Block / Phase"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-[#FAF9F6] border border-stone-300 rounded-xl px-4 py-3.5 text-xs text-[#18181B] focus:outline-none focus:border-[#C7A76C]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200 space-y-3">
              <label className="block text-xs font-black text-[#18181B] uppercase tracking-wider">Select Payment Method *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label 
                  className={`p-4 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all ${
                    formData.paymentMethod === 'cod' ? 'border-[#881337] bg-rose-50/50 shadow-xs' : 'border-stone-200 bg-white hover:bg-stone-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                    className="text-[#881337] focus:ring-[#881337]"
                  />
                  <div>
                    <div className="text-xs font-bold text-[#18181B] flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-[#881337]" /> Cash on Delivery (COD)
                    </div>
                    <div className="text-[10px] text-stone-500">Pay cash upon rider arrival</div>
                  </div>
                </label>

                <label 
                  className={`p-4 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all ${
                    formData.paymentMethod === 'bank_transfer' ? 'border-[#881337] bg-rose-50/50 shadow-xs' : 'border-stone-200 bg-white hover:bg-stone-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={formData.paymentMethod === 'bank_transfer'}
                    onChange={() => setFormData({ ...formData, paymentMethod: 'bank_transfer' })}
                    className="text-[#881337] focus:ring-[#881337]"
                  />
                  <div>
                    <div className="text-xs font-bold text-[#18181B] flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-[#881337]" /> Bank Transfer
                    </div>
                    <div className="text-[10px] text-stone-500">Meezan / HBL / JazzCash</div>
                  </div>
                </label>
              </div>
            </div>

            {/* THE FINAL ORDER COMPLETION BUTTON */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-luxury-gold py-4.5 rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  <span>RECORDING ORDER &amp; DISPATCHING...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 fill-current" />
                  <span>COMPLETE ORDER NOW &bull; RS. {finalGrandTotal.toLocaleString()}</span>
                </>
              )}
            </button>
          </form>

          {/* Order Items Summary Column */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-stone-200 p-6 space-y-6 shadow-md">
            <h2 className="text-base font-bold text-[#18181B] pb-3 border-b border-stone-200 uppercase tracking-wider">
              Order Summary ({cart.length} Items)
            </h2>

            <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
              {cart.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 border-b border-stone-100 pb-3">
                  <div className="w-14 h-16 bg-[#FAF7F2] rounded-xl overflow-hidden relative flex-shrink-0 border border-stone-200">
                    <img src={item.product.images[0]} alt={item.product.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 text-xs space-y-0.5">
                    <div className="font-extrabold text-[#18181B] line-clamp-1">{item.product.title}</div>
                    <div className="text-stone-500 text-[10px]">
                      Size: <strong className="text-[#881337]">{item.selectedSize}</strong> &bull; Qty: {item.quantity}
                    </div>
                    <div className="font-black text-[#18181B]">RS. {item.product.price.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-xs pt-3 border-t border-stone-200">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="font-bold text-[#18181B]">RS. {cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Express Delivery (Pakistan)</span>
                <span className="font-bold text-[#18181B]">
                  {deliveryCharges === 0 ? <strong className="text-emerald-700 font-bold">FREE</strong> : `RS. ${deliveryCharges}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#18181B] pt-2 border-t border-stone-200">
                <span>Total Payable Amount</span>
                <span className="text-[#881337]">RS. {finalGrandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
