import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { Order } from '../types/product';
import {
  Truck,
  Package,
  Search,
  MapPin,
  Clock,
  Copy,
  Check,
  ArrowRight,
  LifeBuoy,
} from 'lucide-react';

export const TrackOrderPage: React.FC = () => {
  const { orders } = useStore();
  const { currentUser } = useAuth();
  const { trackingOrderNumber, setTrackingOrderNumber, goToSupport, goToShop } = useNavigation();

  const [searchInput, setSearchInput] = useState(trackingOrderNumber || '');
  const [copiedTracking, setCopiedTracking] = useState(false);

  // Sync if trackingOrderNumber changes from navigation
  useEffect(() => {
    if (trackingOrderNumber) {
      setSearchInput(trackingOrderNumber);
    } else if (orders.length > 0) {
      // Default to first order if none specified
      setSearchInput(orders[0].orderNumber);
    }
  }, [trackingOrderNumber, orders]);

  // Find matching order in active store database
  const activeOrder = useMemo<Order | null>(() => {
    const q = searchInput.trim().toUpperCase();
    if (!q) return orders[0] || null;

    // Search by exact or partial orderNumber, trackingNumber, or userEmail
    const found = orders.find(
      (o) =>
        o.orderNumber.toUpperCase() === q ||
        o.orderNumber.toUpperCase().includes(q) ||
        o.trackingNumber.toUpperCase() === q ||
        (o.userEmail && o.userEmail.toUpperCase() === q)
    );

    if (found) return found;

    // If customer entered a valid-looking RLX order number that isn't in default state (e.g. freshly tested), generate a live simulation
    if (q.startsWith('RLX-') || q.length >= 6) {
      return {
        id: `ord-sim-${q}`,
        orderNumber: q,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'IN TRANSIT',
        total: 195.0,
        currency: 'USD',
        trackingNumber: `1Z999${Math.floor(100000000000 + Math.random() * 900000000000)}`,
        carrier: 'DHL Express Worldwide Air',
        estimatedDelivery: 'Within 2 business days',
        shippingAddress: {
          fullName: currentUser?.name || 'Valued Client',
          street: '14 Kensington Church Street',
          city: 'London',
          state: 'Greater London',
          zip: 'W8 4EP',
          country: 'United Kingdom',
        },
        items: [
          {
            productName: 'Apex Storm // 3L GORE-TEX Pro',
            sku: 'RLX-02-APX',
            image: 'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?auto=format&fit=crop&w=400&q=80',
            price: 110.0,
            size: 'M/L (58-61CM)',
            color: 'Stealth Black',
            quantity: 1,
          },
          {
            productName: 'Cipher 04 // Ballistic Cordura Camp',
            sku: 'RLX-04-CPH',
            image: 'https://images.unsplash.com/photo-1534215754734-18e55d13e346?auto=format&fit=crop&w=400&q=80',
            price: 85.0,
            size: 'ADJUSTABLE',
            color: 'Charcoal Grey',
            quantity: 1,
          },
        ],
      };
    }

    return null;
  }, [orders, searchInput, currentUser]);

  const handleCopyWaybill = (waybill: string) => {
    try {
      navigator.clipboard.writeText(waybill);
      setCopiedTracking(true);
      setTimeout(() => setCopiedTracking(false), 2000);
    } catch {
      // ignore
    }
  };

  // Milestone Progress Stepper calculation
  const getStepProgress = (status: Order['status']) => {
    switch (status) {
      case 'PENDING':
        return 1;
      case 'PROCESSING':
        return 2;
      case 'IN TRANSIT':
        return 4;
      case 'DELIVERED':
        return 5;
      default:
        return 3;
    }
  };

  const currentStep = activeOrder ? getStepProgress(activeOrder.status) : 1;

  const STEPS = [
    { title: 'Order Confirmed', desc: 'Payment verified & order booked' },
    { title: 'Lab Inspection', desc: 'Laser seam check & sterile packaging' },
    { title: 'Courier Pickup', desc: 'Waybill sealed & handed to carrier' },
    { title: 'In Transit', desc: 'Moving through air logistics network' },
    { title: 'Delivered', desc: 'Direct doorstep signoff completed' },
  ];

  // Dynamic Telemetry Log
  const telemetryLogs = useMemo(() => {
    if (!activeOrder) return [];

    const isDelivered = activeOrder.status === 'DELIVERED';
    const isInTransit = activeOrder.status === 'IN TRANSIT';

    return [
      ...(isDelivered
        ? [
            {
              time: 'Today • 11:24 AM',
              location: `${activeOrder.shippingAddress.city}, ${activeOrder.shippingAddress.country}`,
              event: 'Package delivered. Signed by recipient.',
              highlight: true,
            },
            {
              time: 'Today • 08:15 AM',
              location: 'Regional Distribution Facility',
              event: 'Out for delivery with courier driver.',
              highlight: false,
            },
          ]
        : []),
      ...(isInTransit || isDelivered
        ? [
            {
              time: 'Oct 06, 2026 • 02:40 PM',
              location: 'London Heathrow Air Hub (LHR)',
              event: `Departed international gateway facility via ${activeOrder.carrier}.`,
              highlight: !isDelivered,
            },
            {
              time: 'Oct 05, 2026 • 19:15 PM',
              location: 'Rayluxx Atelier Dispatch Terminal (London)',
              event: 'Package sorted and scanned into carrier cage.',
              highlight: false,
            },
          ]
        : []),
      {
        time: 'Oct 05, 2026 • 14:10 PM',
        location: 'Rayluxx Quality Lab (London)',
        event: 'Textile inspection approved (Hydrostatic & seam tape verification).',
        highlight: false,
      },
      {
        time: `${activeOrder.date} • 10:04 AM`,
        location: 'Online Storefront (rayluxx.com)',
        event: `Order ${activeOrder.orderNumber} authorized and payment cleared.`,
        highlight: false,
      },
    ];
  }, [activeOrder]);

  return (
    <div className="w-full min-h-screen bg-white font-sans text-black select-none">
      
      {/* Top Banner (Nike Style) */}
      <div className="border-b border-neutral-200 bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="text-xs text-neutral-500 uppercase tracking-widest font-semibold flex items-center gap-2">
            <span>RAYLUXX</span>
            <span>/</span>
            <span>CLIENT SERVICES</span>
            <span>/</span>
            <span className="text-black font-bold">PACKAGE TRACKING & TELEMETRY</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-nike text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-black">
                LIVE DISPATCH TRACKING
              </h1>
              <p className="font-sans text-neutral-600 text-sm sm:text-base max-w-2xl mt-2 leading-relaxed">
                Track real-time carrier telemetry, transit waybills, packaging manifests, and estimated arrival windows for your technical headwear.
              </p>
            </div>

            {/* Carrier Network Badge */}
            <div className="flex items-center gap-3 border border-neutral-200 rounded-2xl p-3 bg-neutral-50/70 text-xs">
              <Truck size={22} className="text-black" />
              <div>
                <span className="font-bold text-black uppercase block">OFFICIAL CARRIER TELEMETRY</span>
                <span className="text-neutral-500 text-[11px]">DHL Express • FedEx Priority • Royal Mail Special</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        
        {/* Search Bar & Order Switcher */}
        <div className="bg-neutral-50 border border-neutral-200 p-6 rounded-3xl space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-black">
              Enter Order Number or Waybill Code
            </label>
            <span className="text-[11px] text-neutral-500">
              Format: RLX-XXXX-XX or Courier Waybill
            </span>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setTrackingOrderNumber(searchInput.trim());
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="e.g. RLX-8921-EU or 1Z999..."
                className="w-full bg-white border border-neutral-300 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-mono font-bold text-black uppercase focus:outline-none focus:border-black transition-all"
              />
            </div>

            <button
              type="submit"
              className="px-8 py-3.5 bg-black hover:bg-neutral-800 text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98"
            >
              <span>Inspect Tracking</span>
              <ArrowRight size={14} />
            </button>
          </form>

          {/* Quick Demo Selector Chips */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-neutral-500 font-bold uppercase text-[10px]">Sample Orders:</span>
            {orders.slice(0, 4).map((ord) => (
              <button
                key={ord.id}
                onClick={() => {
                  setSearchInput(ord.orderNumber);
                  setTrackingOrderNumber(ord.orderNumber);
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase border transition-all cursor-pointer ${
                  activeOrder?.orderNumber === ord.orderNumber
                    ? 'bg-black text-white border-black'
                    : 'bg-white border-neutral-300 text-neutral-700 hover:border-black'
                }`}
              >
                <span>{ord.orderNumber}</span>
                <span className="ml-1 opacity-70">({ord.status})</span>
              </button>
            ))}
          </div>
        </div>

        {/* ORDER DETAILS & MILESTONES */}
        {activeOrder ? (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Top Status Banner */}
            <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-neutral-400">
                    MANIFEST REFERENCE:
                  </span>
                  <span className="font-mono text-lg font-black text-black">
                    {activeOrder.orderNumber}
                  </span>
                  <span className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    activeOrder.status === 'DELIVERED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : activeOrder.status === 'IN TRANSIT'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {activeOrder.status}
                  </span>
                </div>

                <div className="text-xs text-neutral-500 flex flex-wrap gap-4 pt-1">
                  <span>Carrier: <strong className="text-black">{activeOrder.carrier}</strong></span>
                  <span>•</span>
                  <span>Estimated Arrival: <strong className="text-black">{activeOrder.estimatedDelivery}</strong></span>
                  <span>•</span>
                  <span>Destination: <strong className="text-black">{activeOrder.shippingAddress.city}, {activeOrder.shippingAddress.country}</strong></span>
                </div>
              </div>

              {/* Waybill Copy Pill */}
              <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-2xl p-3 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase font-bold block">
                    WAYBILL TRACKING NUMBER
                  </span>
                  <span className="font-bold text-black">{activeOrder.trackingNumber}</span>
                </div>
                <button
                  onClick={() => handleCopyWaybill(activeOrder.trackingNumber)}
                  className="p-2 text-neutral-500 hover:text-black rounded-lg hover:bg-neutral-200 transition-colors cursor-pointer ml-2"
                  title="Copy Waybill"
                >
                  {copiedTracking ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            {/* 5-Step Visual Stepper (Nike Style) */}
            <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-10 shadow-xs">
              <h3 className="font-nike text-xl font-black uppercase text-black mb-8">
                SHIPMENT DISPATCH MILESTONES
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
                {STEPS.map((step, idx) => {
                  const stepNum = idx + 1;
                  const isDone = currentStep > stepNum;
                  const isCurrent = currentStep === stepNum;

                  return (
                    <div key={idx} className="flex flex-col items-start space-y-2 relative">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                            isDone
                              ? 'bg-black text-white'
                              : isCurrent
                              ? 'bg-blue-600 text-white ring-4 ring-blue-100 animate-pulse'
                              : 'bg-neutral-100 text-neutral-400 border border-neutral-300'
                          }`}
                        >
                          {isDone ? <Check size={16} /> : stepNum}
                        </div>
                        <span className={`text-xs font-bold uppercase tracking-tight ${
                          isCurrent ? 'text-black font-black' : isDone ? 'text-neutral-800' : 'text-neutral-400'
                        }`}>
                          {step.title}
                        </span>
                      </div>

                      <p className="text-[11px] text-neutral-500 leading-snug pl-12 md:pl-0 pt-1">
                        {step.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2-Column: Live Telemetry Logs + Items Manifest */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Live Event Checkpoints */}
              <div className="lg:col-span-7 bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-black" />
                    <h4 className="font-nike text-lg font-black uppercase text-black">
                      TRANSIT TELEMETRY LOG
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    GPS Time-Synced
                  </span>
                </div>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-neutral-200">
                  {telemetryLogs.map((log, idx) => (
                    <div key={idx} className="relative space-y-1">
                      <div className={`absolute -left-[27px] top-1 w-3 h-3 rounded-full border-2 border-white ${
                        log.highlight ? 'bg-blue-600 ring-2 ring-blue-300' : 'bg-neutral-400'
                      }`} />

                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="font-mono text-xs font-bold text-black">{log.time}</span>
                        <span className="text-xs text-neutral-400 font-medium">• {log.location}</span>
                      </div>
                      <p className="text-xs text-neutral-600 font-medium">
                        {log.event}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Items in Parcel & Destination Details */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Parcel Items Manifest */}
                <div className="bg-white border border-neutral-200 rounded-3xl p-6 space-y-4 shadow-xs">
                  <h4 className="font-nike text-lg font-black uppercase text-black pb-2 border-b border-neutral-200">
                    HEADWEAR IN SHIPMENT ({activeOrder.items.length})
                  </h4>

                  <div className="divide-y divide-neutral-100">
                    {activeOrder.items.map((item, idx) => (
                      <div key={idx} className="py-3 flex items-center gap-4">
                        <div className="w-14 h-14 bg-neutral-100 rounded-xl overflow-hidden border border-neutral-200 flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-nike text-sm font-bold uppercase text-black truncate">
                            {item.productName}
                          </h5>
                          <p className="text-[11px] text-neutral-500 font-medium">
                            {item.color} • Size {item.size} • Qty {item.quantity}
                          </p>
                          <span className="text-xs font-bold text-black">
                            ${item.price.toFixed(2)} USD
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Destination Address */}
                <div className="bg-neutral-50 border border-neutral-200 rounded-3xl p-6 space-y-3 text-xs">
                  <div className="flex items-center gap-2 font-bold uppercase text-black">
                    <MapPin size={16} />
                    <span>DELIVERY DESTINATION</span>
                  </div>
                  <div className="text-neutral-600 font-medium leading-relaxed">
                    <p className="font-bold text-black">{activeOrder.shippingAddress.fullName}</p>
                    <p>{activeOrder.shippingAddress.street}</p>
                    <p>{activeOrder.shippingAddress.city}, {activeOrder.shippingAddress.state} {activeOrder.shippingAddress.zip}</p>
                    <p>{activeOrder.shippingAddress.country}</p>
                  </div>
                </div>

                {/* Need Assistance Card */}
                <div className="bg-black text-white rounded-3xl p-6 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
                    <LifeBuoy size={14} />
                    <span>ISSUE WITH DISPATCH?</span>
                  </div>
                  <h5 className="font-nike text-lg font-bold uppercase">
                    OPEN A DEDICATED SUPPORT TICKET
                  </h5>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    If you require an address change, notice a delay, or need custom delivery instructions, our concierge is standing by.
                  </p>
                  <button
                    onClick={() => goToSupport()}
                    className="w-full py-3 bg-white text-black hover:bg-neutral-200 rounded-full text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer font-sans"
                  >
                    <span>Contact Support for this Order</span>
                    <ArrowRight size={13} />
                  </button>
                </div>

              </div>

            </div>

          </div>
        ) : (
          <div className="text-center py-20 border border-neutral-200 rounded-3xl p-8 space-y-4 bg-white">
            <Package size={40} className="text-neutral-300 mx-auto" />
            <h3 className="font-nike text-2xl font-black uppercase text-black">
              ORDER NOT FOUND
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              We couldn't locate any shipment under "{searchInput}". Please double-check your order number or check your confirmation email.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => goToSupport()}
                className="px-6 py-2.5 bg-black text-white text-xs font-bold uppercase rounded-full hover:bg-neutral-800 transition-colors"
              >
                Inquire with Support
              </button>
              <button
                onClick={() => goToShop()}
                className="px-6 py-2.5 border border-neutral-300 text-xs font-bold uppercase rounded-full hover:border-black transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
