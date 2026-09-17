import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { ArrowLeft, CheckCircle2, CreditCard, ShieldCheck, Lock, Truck, ArrowRight, Package } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { cart, subtotal, discountAmount, promoCode, applyPromoCode, removePromoCode, finalTotal, clearCart } = useCart();
  const { goToHome, goToShop, goToDashboard } = useNavigation();
  const { currentUser, openAuthModal } = useAuth();
  const { placeOrder } = useStore();

  const nameParts = currentUser ? currentUser.name.split(' ') : ['Marcus', 'Vance'];

  // Form states
  const [email, setEmail] = useState(currentUser?.email || 'marcus.vance@studio.com');
  const [firstName, setFirstName] = useState(nameParts[0] || 'Marcus');
  const [lastName, setLastName] = useState(nameParts.slice(1).join(' ') || 'Vance');
  const [address, setAddress] = useState('450 West 33rd Street, Fl 14');
  const [city, setCity] = useState('New York');
  const [state, setState] = useState('NY');
  const [zip, setZip] = useState('10001');
  const [country, setCountry] = useState('United States');
  const [shippingSpeed, setShippingSpeed] = useState<'standard' | 'express' | 'priority'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple' | 'klarna'>('card');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvc, setCardCvc] = useState('884');

  const [promoInput, setPromoInput] = useState('');
  const [promoFeedback, setPromoFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [placedOrderNumber, setPlacedOrderNumber] = useState('');

  useEffect(() => {
    if (currentUser) {
      setEmail(currentUser.email);
      const parts = currentUser.name.split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
    }
  }, [currentUser]);

  // Shipping rates
  const shippingCost = shippingSpeed === 'standard' ? (subtotal >= 150 ? 0 : 12) : shippingSpeed === 'express' ? 18 : 28;
  const estimatedTax = (finalTotal * 0.088);
  const grandTotal = finalTotal + shippingCost + estimatedTax;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput) return;
    const result = applyPromoCode(promoInput);
    setPromoFeedback(result);
    if (result.success) setPromoInput('');
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      const carrierName = shippingSpeed === 'priority' ? 'FedEx Next-Day Air' : shippingSpeed === 'express' ? 'DHL Express Air' : 'DHL Express Ground';
      const estDelivery = shippingSpeed === 'priority' ? 'Tomorrow by 10:30 AM' : shippingSpeed === 'express' ? 'Within 2 business days' : 'Within 3-5 business days';

      const placed = placeOrder({
        userId: currentUser?.id,
        userEmail: email,
        status: 'PROCESSING',
        total: grandTotal,
        trackingNumber: `1Z999${Math.floor(100000000000 + Math.random() * 900000000000)}`,
        carrier: carrierName,
        estimatedDelivery: estDelivery,
        shippingAddress: {
          fullName: `${firstName} ${lastName}`.trim(),
          street: address,
          city,
          state,
          zip,
          country,
        },
        items: cart.map((item) => ({
          productName: item.product.name,
          sku: item.product.sku,
          image: item.product.images[0],
          price: item.product.price,
          size: item.selectedSize,
          color: item.selectedColor,
          quantity: item.quantity,
        })),
      });

      setPlacedOrderNumber(placed.orderNumber);
      setIsProcessing(false);
      setIsOrderPlaced(true);
      clearCart();
    }, 1100);
  };

  if (isOrderPlaced) {
    return (
      <div className="min-h-screen bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center space-y-8 animate-fadeIn">
          
          <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center mx-auto shadow-xl">
            <CheckCircle2 size={40} className="text-white" />
          </div>

          <div className="space-y-3">
            <span className="font-sans text-xs font-bold uppercase text-neutral-500 tracking-wider">
              ORDER CONFIRMED // DISPATCH SCHEDULED
            </span>
            <h1 className="font-nike text-4xl sm:text-5xl font-black uppercase text-black">
              THANK YOU FOR YOUR ORDER
            </h1>
            <p className="font-sans text-neutral-600 text-sm max-w-md mx-auto">
              Order confirmation and electronic tracking waybill have been sent to <strong>{email}</strong>.
            </p>
          </div>

          {/* Order Details Card */}
          <div className="p-6 bg-neutral-50 border border-neutral-200 text-left font-sans space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-neutral-200">
              <div>
                <span className="text-xs text-neutral-500 uppercase">ORDER REFERENCE</span>
                <p className="font-mono text-base font-bold text-black">{placedOrderNumber}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-neutral-500 uppercase">TOTAL BILLED</span>
                <p className="font-sans text-base font-bold text-black">${grandTotal.toFixed(2)} USD</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-neutral-500 uppercase block mb-1">SHIPPING DESTINATION</span>
                <p className="font-medium text-black">{firstName} {lastName}</p>
                <p className="text-neutral-600">{address}</p>
                <p className="text-neutral-600">{city}, {state} {zip}</p>
              </div>
              <div>
                <span className="text-neutral-500 uppercase block mb-1">COURIER METHOD</span>
                <p className="font-medium text-black uppercase">
                  {shippingSpeed === 'standard' ? 'Standard Ground (3-5 Days)' : shippingSpeed === 'express' ? 'Express 2-Day Air' : 'Priority Next-Day Air'}
                </p>
                <p className="text-neutral-600">DHL Express Direct Telemetry</p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => goToDashboard('orders')}
              className="px-8 py-4 bg-black text-white font-sans text-sm font-bold uppercase tracking-wider rounded-full hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <Package size={16} />
              <span>TRACK IN MEMBER DASHBOARD</span>
            </button>
            <button
              onClick={goToHome}
              className="px-8 py-4 border border-neutral-300 font-sans text-sm font-bold uppercase tracking-wider rounded-full hover:border-black transition-colors"
            >
              RETURN TO STOREFRONT
            </button>
            <button
              onClick={() => goToShop()}
              className="px-8 py-4 border border-neutral-300 font-sans text-sm font-bold uppercase tracking-wider rounded-full hover:border-black transition-colors"
            >
              CONTINUE SHOPPING
            </button>
          </div>


        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      
      {/* Top Header */}
      <div className="border-b border-neutral-200 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => goToShop()}
            className="inline-flex items-center gap-2 font-sans text-xs font-semibold uppercase text-neutral-600 hover:text-black transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to Bag</span>
          </button>
          <span className="font-nike text-3xl font-black tracking-tighter text-black">
            RAYLUX
          </span>
          <div className="flex items-center gap-1.5 text-xs font-sans text-neutral-500">
            <Lock size={13} />
            <span className="hidden sm:inline">256-Bit SSL Encryption</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Checkout Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        
        {cart.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <h2 className="font-nike text-3xl font-black uppercase">YOUR BAG IS EMPTY</h2>
            <p className="font-sans text-sm text-neutral-600">Add caps to your bag to proceed through express checkout.</p>
            <button
              onClick={() => goToShop()}
              className="px-8 py-3.5 bg-black text-white font-sans text-xs font-bold uppercase tracking-wider rounded-full hover:bg-neutral-800"
            >
              BROWSE CATALOG
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* LEFT COLUMN: CHECKOUT FORMS */}
            <div className="lg:col-span-7 space-y-10">
              
              {/* 1. EXPRESS CHECKOUT BUTTONS (Nike style) */}
              <div className="space-y-3 pb-8 border-b border-neutral-200">
                <span className="font-sans text-xs font-bold uppercase text-neutral-500 tracking-wider block">
                  EXPRESS CHECKOUT
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => alert('Apple Pay express session initialized.')}
                    className="py-3.5 bg-black text-white font-sans text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors rounded-lg"
                  >
                    <span>Pay</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => alert('Google Pay express session initialized.')}
                    className="py-3.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-black font-sans text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors rounded-lg"
                  >
                    <span>G Pay</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => alert('PayPal express session initialized.')}
                    className="py-3.5 bg-[#ffc439] hover:bg-[#f4b82d] text-blue-900 font-sans text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors rounded-lg"
                  >
                    <span>PayPal</span>
                  </button>
                </div>
                <div className="relative flex items-center justify-center pt-3">
                  <div className="border-t border-neutral-200 w-full"></div>
                  <span className="bg-white px-3 font-sans text-xs font-semibold text-neutral-400 uppercase absolute">
                    OR PAY WITH CARD
                  </span>
                </div>
              </div>

              {/* 2. SHIPPING & CONTACT INFORMATION */}
              <form onSubmit={handleSubmitOrder} className="space-y-8">
                
                {/* Contact */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-nike text-2xl font-bold uppercase text-black">
                      1. CONTACT INFORMATION
                    </h3>
                    {!currentUser ? (
                      <span className="font-sans text-xs text-neutral-500">
                        Already a Member?{' '}
                        <button
                          type="button"
                          onClick={() => openAuthModal('signin')}
                          className="text-black font-bold underline hover:opacity-75 cursor-pointer"
                        >
                          Sign In
                        </button>
                      </span>
                    ) : (
                      <span className="font-sans text-xs text-neutral-500">
                        Signed in as <strong className="text-black">{currentUser.name}</strong>
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block font-sans text-xs font-semibold text-neutral-700 uppercase mb-1">
                      EMAIL ADDRESS
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-neutral-300 px-4 py-3 text-sm font-sans focus:outline-none focus:border-black transition-colors rounded-sm"
                    />
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="space-y-4 pt-6 border-t border-neutral-200">
                  <h3 className="font-nike text-2xl font-bold uppercase text-black">
                    2. DELIVERY ADDRESS
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-sans text-xs font-semibold text-neutral-700 uppercase mb-1">
                        FIRST NAME
                      </label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full border border-neutral-300 px-4 py-3 text-sm font-sans focus:outline-none focus:border-black rounded-sm"
                      />
                    </div>
                    <div>
                      <label className="block font-sans text-xs font-semibold text-neutral-700 uppercase mb-1">
                        LAST NAME
                      </label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full border border-neutral-300 px-4 py-3 text-sm font-sans focus:outline-none focus:border-black rounded-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-sans text-xs font-semibold text-neutral-700 uppercase mb-1">
                      STREET ADDRESS
                    </label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full border border-neutral-300 px-4 py-3 text-sm font-sans focus:outline-none focus:border-black rounded-sm"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block font-sans text-xs font-semibold text-neutral-700 uppercase mb-1">
                        CITY
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full border border-neutral-300 px-4 py-3 text-sm font-sans focus:outline-none focus:border-black rounded-sm"
                      />
                    </div>
                    <div>
                      <label className="block font-sans text-xs font-semibold text-neutral-700 uppercase mb-1">
                        STATE / REGION
                      </label>
                      <input
                        type="text"
                        required
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full border border-neutral-300 px-4 py-3 text-sm font-sans focus:outline-none focus:border-black rounded-sm"
                      />
                    </div>
                    <div>
                      <label className="block font-sans text-xs font-semibold text-neutral-700 uppercase mb-1">
                        POSTAL CODE
                      </label>
                      <input
                        type="text"
                        required
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        className="w-full border border-neutral-300 px-4 py-3 text-sm font-sans focus:outline-none focus:border-black rounded-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-sans text-xs font-semibold text-neutral-700 uppercase mb-1">
                      COUNTRY
                    </label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full border border-neutral-300 px-4 py-3 text-sm font-sans focus:outline-none focus:border-black bg-white rounded-sm"
                    >
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Germany">Germany</option>
                      <option value="Japan">Japan</option>
                      <option value="Canada">Canada</option>
                    </select>
                  </div>
                </div>

                {/* Shipping Speed Selector */}
                <div className="space-y-4 pt-6 border-t border-neutral-200">
                  <h3 className="font-nike text-2xl font-bold uppercase text-black">
                    3. DELIVERY METHOD
                  </h3>
                  
                  <div className="space-y-3 font-sans text-sm">
                    <label
                      onClick={() => setShippingSpeed('standard')}
                      className={`flex items-center justify-between p-4 border cursor-pointer transition-all ${
                        shippingSpeed === 'standard' ? 'border-black bg-neutral-50 font-semibold' : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shippingSpeed"
                          checked={shippingSpeed === 'standard'}
                          onChange={() => setShippingSpeed('standard')}
                          className="accent-black w-4 h-4"
                        />
                        <div>
                          <p className="text-black">Standard Ground Delivery (3-5 Business Days)</p>
                          <p className="text-xs text-neutral-500 font-normal">Complimentary on orders over $150</p>
                        </div>
                      </div>
                      <span className="font-bold text-black">
                        {subtotal >= 150 ? 'FREE' : '$12.00'}
                      </span>
                    </label>

                    <label
                      onClick={() => setShippingSpeed('express')}
                      className={`flex items-center justify-between p-4 border cursor-pointer transition-all ${
                        shippingSpeed === 'express' ? 'border-black bg-neutral-50 font-semibold' : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shippingSpeed"
                          checked={shippingSpeed === 'express'}
                          onChange={() => setShippingSpeed('express')}
                          className="accent-black w-4 h-4"
                        />
                        <div>
                          <p className="text-black">Express 2-Day Air Delivery</p>
                          <p className="text-xs text-neutral-500 font-normal">Tracked priority via DHL Express</p>
                        </div>
                      </div>
                      <span className="font-bold text-black">$18.00</span>
                    </label>

                    <label
                      onClick={() => setShippingSpeed('priority')}
                      className={`flex items-center justify-between p-4 border cursor-pointer transition-all ${
                        shippingSpeed === 'priority' ? 'border-black bg-neutral-50 font-semibold' : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shippingSpeed"
                          checked={shippingSpeed === 'priority'}
                          onChange={() => setShippingSpeed('priority')}
                          className="accent-black w-4 h-4"
                        />
                        <div>
                          <p className="text-black">Next-Day Morning Dispatch</p>
                          <p className="text-xs text-neutral-500 font-normal">Guaranteed delivery by 10:30 AM</p>
                        </div>
                      </div>
                      <span className="font-bold text-black">$28.00</span>
                    </label>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="space-y-4 pt-6 border-t border-neutral-200">
                  <h3 className="font-nike text-2xl font-bold uppercase text-black">
                    4. PAYMENT METHOD
                  </h3>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`flex-1 py-3 px-4 border text-xs font-sans font-bold uppercase flex items-center justify-center gap-2 ${
                        paymentMethod === 'card' ? 'border-black bg-black text-white' : 'border-neutral-200 text-neutral-700'
                      }`}
                    >
                      <CreditCard size={15} />
                      <span>Credit Card</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('klarna')}
                      className={`flex-1 py-3 px-4 border text-xs font-sans font-bold uppercase flex items-center justify-center gap-2 ${
                        paymentMethod === 'klarna' ? 'border-black bg-black text-white' : 'border-neutral-200 text-neutral-700'
                      }`}
                    >
                      <span>Klarna 4x</span>
                    </button>
                  </div>

                  {paymentMethod === 'card' ? (
                    <div className="space-y-4 p-4 bg-neutral-50 border border-neutral-200 rounded-sm">
                      <div>
                        <label className="block font-sans text-xs font-semibold text-neutral-700 uppercase mb-1">
                          CARD NUMBER
                        </label>
                        <input
                          type="text"
                          required
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full border border-neutral-300 px-4 py-3 text-sm font-sans focus:outline-none focus:border-black bg-white rounded-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block font-sans text-xs font-semibold text-neutral-700 uppercase mb-1">
                            EXPIRATION
                          </label>
                          <input
                            type="text"
                            required
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full border border-neutral-300 px-4 py-3 text-sm font-sans focus:outline-none focus:border-black bg-white rounded-sm"
                          />
                        </div>
                        <div>
                          <label className="block font-sans text-xs font-semibold text-neutral-700 uppercase mb-1">
                            SECURITY CODE (CVV)
                          </label>
                          <input
                            type="text"
                            required
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            className="w-full border border-neutral-300 px-4 py-3 text-sm font-sans focus:outline-none focus:border-black bg-white rounded-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-pink-50 border border-pink-200 font-sans text-xs text-neutral-700 space-y-1">
                      <p className="font-bold text-black">4 Interest-Free Installments of ${(grandTotal / 4).toFixed(2)}</p>
                      <p className="text-neutral-600">No interest. No fees when paid on time via Klarna.</p>
                    </div>
                  )}

                </div>

                {/* Submit Order Action Button */}
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-5 bg-black text-white font-sans text-sm font-bold uppercase tracking-wider rounded-full hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 shadow-xl active:scale-[0.99] disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <span>PROCESSING DISPATCH ORDER...</span>
                    ) : (
                      <>
                        <span>PLACE ORDER // ${grandTotal.toFixed(2)} USD</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                  <p className="font-sans text-[11px] text-neutral-500 text-center mt-3">
                    By clicking Place Order, you confirm acceptance of RAYLUX Terms of Sale & Privacy Policy.
                  </p>
                </div>

              </form>

            </div>

            {/* RIGHT COLUMN: ORDER SUMMARY SIDEBAR */}
            <div className="lg:col-span-5 bg-neutral-50 p-6 sm:p-8 border border-neutral-200 sticky top-28 space-y-6">
              
              <div className="flex justify-between items-baseline pb-4 border-b border-neutral-200">
                <h3 className="font-nike text-xl font-bold uppercase text-black">
                  IN YOUR BAG
                </h3>
                <span className="font-sans text-xs font-semibold text-neutral-500">
                  {cart.length} {cart.length === 1 ? 'ITEM' : 'ITEMS'}
                </span>
              </div>

              {/* Items List */}
              <div className="divide-y divide-neutral-200 max-h-80 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="py-4 flex gap-4 items-center">
                    <div className="w-16 h-16 bg-white border border-neutral-200 overflow-hidden flex-shrink-0">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 font-sans text-xs">
                      <h4 className="font-bold text-black uppercase leading-tight">
                        {item.product.name}
                      </h4>
                      <p className="text-neutral-500 text-[11px] mt-0.5">
                        Qty: {item.quantity} • Size: {item.selectedSize.split(' ')[0]}
                      </p>
                      <p className="text-neutral-500 text-[11px]">
                        Color: {item.selectedColor}
                      </p>
                    </div>
                    <div className="font-sans font-bold text-sm text-black">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code Input */}
              <div className="pt-4 border-t border-neutral-200">
                <form onSubmit={handleApplyPromo} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="PROMO CODE (e.g. RAYLUX10)"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className="flex-1 bg-white border border-neutral-300 px-3 py-2.5 text-xs font-mono uppercase focus:outline-none focus:border-black rounded-sm"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-black text-white font-sans text-xs font-bold uppercase rounded-sm hover:bg-neutral-800 transition-colors"
                    >
                      APPLY
                    </button>
                  </div>
                  {promoFeedback && (
                    <p className={`font-sans text-[11px] font-medium ${promoFeedback.success ? 'text-emerald-600' : 'text-red-600'}`}>
                      {promoFeedback.message}
                    </p>
                  )}
                  {promoCode && (
                    <div className="flex justify-between items-center bg-white p-2 border border-emerald-300 text-xs font-sans">
                      <span className="text-emerald-700 font-bold">✓ {promoCode} (ACTIVE)</span>
                      <button onClick={removePromoCode} className="text-red-600 font-semibold underline text-[10px]">
                        REMOVE
                      </button>
                    </div>
                  )}
                </form>
              </div>

              {/* Financial Breakdown */}
              <div className="pt-4 border-t border-neutral-200 space-y-2 font-sans text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-black">${subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Archive Member Discount</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-600">
                  <span>Estimated Shipping</span>
                  <span className="font-semibold text-black">
                    {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Estimated Tax</span>
                  <span className="font-semibold text-black">${estimatedTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-black pt-3 border-t border-neutral-200">
                  <span>Total</span>
                  <span>${grandTotal.toFixed(2)} USD</span>
                </div>
              </div>

              {/* Guarantees */}
              <div className="pt-4 border-t border-neutral-200 space-y-2 font-sans text-[11px] text-neutral-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-black" />
                  <span>Complimentary Returns within 30 days</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck size={14} className="text-black" />
                  <span>Insured courier dispatch with tracking</span>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
};
