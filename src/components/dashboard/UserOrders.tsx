import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { Order } from '../../types/product';
import { Truck, CheckCircle2, ChevronRight, ExternalLink, MapPin, Package } from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';

export const UserOrders: React.FC = () => {
  const { orders } = useStore();
  const { currentUser } = useAuth();
  const { goToShop } = useNavigation();

  // Filter orders for active user or show all orders with relevant match
  const userOrders = useMemo(() => {
    if (!currentUser) return orders;
    const matched = orders.filter(
      (o) =>
        o.userEmail?.toLowerCase() === currentUser.email.toLowerCase() ||
        o.shippingAddress.fullName.toLowerCase().includes(currentUser.name.toLowerCase().split(' ')[0]) ||
        (currentUser.email === 'marcus.vance@studio.com' && o.shippingAddress.fullName.includes('Marcus'))
    );
    return matched.length > 0 ? matched : orders;
  }, [orders, currentUser]);

  const [selectedOrder, setSelectedOrder] = useState<Order>(userOrders[0] || orders[0]);

  // Keep selected order in sync with userOrders
  useEffect(() => {
    if (userOrders.length > 0) {
      const found = userOrders.find((o) => o.id === selectedOrder?.id);
      setSelectedOrder(found || userOrders[0]);
    }
  }, [userOrders]);

  return (
    <div className="space-y-8 font-sans">
      
      {/* Overview header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <span className="font-sans text-xs text-neutral-500 uppercase tracking-widest font-semibold block">
            AUTHENTICATED CLIENT ARCHIVE
          </span>
          <h2 className="font-nike text-3xl font-black uppercase tracking-tight text-black">
            ORDER HISTORY & REAL-TIME DISPATCH
          </h2>
        </div>
        <button
          onClick={() => goToShop()}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white font-sans text-xs font-bold uppercase tracking-wider rounded-full hover:bg-neutral-800 transition-colors self-start sm:self-auto"
        >
          <span>BROWSE NEW DROPS</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Orders Master/Detail Grid */}
      {userOrders.length === 0 ? (
        <div className="text-center py-20 border border-neutral-200 rounded-xl space-y-4">
          <Package size={40} className="text-neutral-300 mx-auto" />
          <h3 className="font-nike text-2xl font-bold uppercase text-neutral-800">NO ORDERS RECORDED YET</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Once you place an order in express checkout, your packages and real-time tracking will appear here.
          </p>
          <button
            onClick={() => goToShop()}
            className="px-6 py-3 bg-black text-white text-xs font-bold uppercase rounded-full hover:bg-neutral-800"
          >
            START SHOPPING
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Order List Cards */}
          <div className="lg:col-span-5 space-y-3">
            <span className="font-sans text-xs font-bold text-neutral-500 uppercase tracking-wider block">
              HISTORICAL ORDERS ({userOrders.length})
            </span>

            {userOrders.map((order) => {
              const isSelected = selectedOrder?.id === order.id;
              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`p-5 border cursor-pointer transition-all rounded-xl ${
                    isSelected
                      ? 'border-black bg-neutral-50 shadow-sm'
                      : 'border-neutral-200 bg-white hover:border-neutral-400'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-xs font-bold text-black block">
                        {order.orderNumber}
                      </span>
                      <span className="font-sans text-xs text-neutral-500">
                        Date: {order.date}
                      </span>
                    </div>
                    <span
                      className={`font-sans text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                        order.status === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'IN TRANSIT'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between font-sans text-xs pt-3 border-t border-dashed border-neutral-200">
                    <span className="text-neutral-500">
                      {order.items.length} {order.items.length === 1 ? 'Cap' : 'Caps'}
                    </span>
                    <span className="font-bold text-black">
                      {order.currency === 'GBP' ? '£' : '$'}{order.total.toFixed(2)} {order.currency || 'USD'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Selected Order Inspection Details */}
          {selectedOrder && (
            <div className="lg:col-span-7 bg-white border border-neutral-200 p-6 sm:p-8 space-y-6 rounded-2xl shadow-sm">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-200 gap-2">
                <div>
                  <span className="font-sans text-xs text-neutral-500 uppercase tracking-wider block">
                    SELECTED SHIPMENT MANIFEST
                  </span>
                  <h3 className="font-nike text-2xl font-bold uppercase text-black">
                    {selectedOrder.orderNumber}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="font-sans text-xl font-extrabold text-black">
                    {selectedOrder.currency === 'GBP' ? '£' : '$'}{selectedOrder.total.toFixed(2)} {selectedOrder.currency || 'USD'}
                  </span>
                  <span className="font-sans text-[11px] text-neutral-500 block">PAID VIA STRIPE SECURE</span>
                </div>
              </div>

              {/* Tracking Status Timeline Banner */}
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2 font-sans text-xs">
                <div className="flex items-center gap-2 text-black font-bold">
                  {selectedOrder.status === 'DELIVERED' ? (
                    <CheckCircle2 size={16} className="text-emerald-600" />
                  ) : (
                    <Truck size={16} className="text-black" />
                  )}
                  <span className="uppercase">{selectedOrder.status} • {selectedOrder.carrier}</span>
                </div>
                <div className="flex justify-between text-neutral-600 text-[11px] font-mono">
                  <span>WAYBILL: {selectedOrder.trackingNumber}</span>
                  <span>{selectedOrder.estimatedDelivery}</span>
                </div>
              </div>

              {/* Order Items Breakdown */}
              <div className="space-y-4">
                <span className="font-sans text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                  HEADWEAR ITEMS IN PACKAGE
                </span>
                <div className="divide-y divide-neutral-200 border-y border-neutral-200">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="py-4 flex gap-4 items-center">
                      <div className="w-16 h-16 bg-neutral-50 border border-neutral-200 rounded-lg flex-shrink-0 overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-nike text-base font-bold uppercase text-black">
                          {item.productName}
                        </h4>
                        <div className="font-sans text-xs text-neutral-500 mt-0.5 space-x-3">
                          <span>Size: {item.size}</span>
                          <span>Color: {item.color}</span>
                          <span>Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <div className="font-sans text-sm font-bold text-black">
                        {selectedOrder.currency === 'GBP' ? '£' : '$'}{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Destination */}
              <div className="pt-2 font-sans text-xs space-y-2">
                <span className="text-neutral-500 font-semibold uppercase tracking-wider block flex items-center gap-1.5">
                  <MapPin size={14} />
                  <span>DISPATCH RECIPIENT</span>
                </span>
                <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-800 text-xs leading-relaxed">
                  <p className="font-bold text-black">{selectedOrder.shippingAddress.fullName}</p>
                  <p>{selectedOrder.shippingAddress.street}</p>
                  <p>
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}{' '}
                    {selectedOrder.shippingAddress.zip}
                  </p>
                  <p className="text-neutral-500">{selectedOrder.shippingAddress.country}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => alert(`Electronic PDF invoice generated for ${selectedOrder.orderNumber}`)}
                  className="px-5 py-2.5 bg-black text-white font-sans text-xs font-bold uppercase tracking-wider rounded-full hover:bg-neutral-800 transition-colors inline-flex items-center gap-2 shadow"
                >
                  <span>DOWNLOAD INVOICE</span>
                  <ExternalLink size={13} />
                </button>
                <button
                  onClick={() => alert(`Tracking telemetry active for waybill: ${selectedOrder.trackingNumber}`)}
                  className="px-5 py-2.5 border border-neutral-300 font-sans text-xs font-bold uppercase tracking-wider rounded-full hover:border-black transition-colors"
                >
                  LIVE TELEMETRY
                </button>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
};
