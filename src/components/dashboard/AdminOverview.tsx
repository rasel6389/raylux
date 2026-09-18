import React, { useState } from 'react';
import { MOCK_INVENTORY, MOCK_KPIS, MOCK_ORDERS } from '../../data/dashboard';
import { InventoryItem, Order } from '../../types/product';
import { ProductModal } from '../admin/ProductModal';
import { TrendingUp, AlertTriangle, Layers, ArrowUpRight, Plus, RefreshCw, Check } from 'lucide-react';

export const AdminOverview: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_INVENTORY);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [restockedId, setRestockedId] = useState<string | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const handleRestock = (id: string) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newStock = item.stock + 25;
          return {
            ...item,
            stock: newStock,
            status: 'IN STOCK',
          };
        }
        return item;
      })
    );
    setRestockedId(id);
    setTimeout(() => setRestockedId(null), 1500);
  };

  const handleAddProduct = (newProductData: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = {
      ...newProductData,
      id: `inv-${Date.now()}`
    };
    setInventory((prev) => [newItem, ...prev]);
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
    );
  };

  return (
    <div className="space-y-10">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest block">
            RAYLUXX INTERNAL LOGISTICS // PRIVILEGED CONSOLE
          </span>
          <h2 className="font-nike text-3xl font-black uppercase tracking-tight text-black">
            OPERATIONS & INVENTORY MATRIX
          </h2>
        </div>
        <div className="flex items-center gap-2 bg-neutral-50 px-3 py-1.5 border border-neutral-200">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-mono text-xs text-black font-bold uppercase">
            LIVE TELEMETRY ACTIVE
          </span>
        </div>
      </div>

      {/* 4 KPI METRIC CARDS (Nike bold font style) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 */}
        <div className="p-5 bg-white border border-neutral-200 space-y-2">
          <div className="flex justify-between items-center text-neutral-500">
            <span className="font-sans text-xs font-semibold uppercase">Gross Revenue</span>
            <TrendingUp size={15} />
          </div>
          <div className="font-nike text-3xl sm:text-4xl font-black text-black">
            ${MOCK_KPIS.grossRevenue.toLocaleString()}
          </div>
          <div className="font-sans text-xs text-emerald-600 font-medium flex items-center gap-1">
            <ArrowUpRight size={12} />
            <span>+18.4% vs last cycle</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-5 bg-white border border-neutral-200 space-y-2">
          <div className="flex justify-between items-center text-neutral-500">
            <span className="font-sans text-xs font-semibold uppercase">Dispatches</span>
            <Layers size={15} />
          </div>
          <div className="font-nike text-3xl sm:text-4xl font-black text-black">
            {orders.length} ACTIVE
          </div>
          <div className="font-sans text-xs text-neutral-500">
            Carriers on schedule
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-5 bg-white border border-neutral-200 space-y-2">
          <div className="flex justify-between items-center text-neutral-500">
            <span className="font-sans text-xs font-semibold uppercase">Units Sold</span>
            <TrendingUp size={15} />
          </div>
          <div className="font-nike text-3xl sm:text-4xl font-black text-black">
            {MOCK_KPIS.unitsSold}
          </div>
          <div className="font-sans text-xs text-emerald-600 font-medium flex items-center gap-1">
            <ArrowUpRight size={12} />
            <span>Top: Monolith 01</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-5 bg-white border border-neutral-200 space-y-2">
          <div className="flex justify-between items-center text-neutral-500">
            <span className="font-sans text-xs font-semibold uppercase">Low Stock Alert</span>
            <AlertTriangle size={15} className="text-amber-500" />
          </div>
          <div className="font-nike text-3xl sm:text-4xl font-black text-black">
            {inventory.filter(i => i.status !== 'IN STOCK').length} SKUS
          </div>
          <div className="font-sans text-xs text-amber-700 font-medium">
            Attention recommended
          </div>
        </div>

      </div>

      {/* 1. REAL-TIME ORDER FULFILLMENT DISPATCHER */}
      <div className="bg-white border border-neutral-200 space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-neutral-200">
          <div>
            <h3 className="font-nike text-2xl font-bold uppercase text-black">
              ORDER FULFILLMENT & DISPATCH QUEUE
            </h3>
            <p className="font-sans text-xs text-neutral-500">
              Live customer orders pending courier assignment and status updating.
            </p>
          </div>
          <span className="font-mono text-xs bg-neutral-100 px-3 py-1 uppercase font-bold text-neutral-700">
            {orders.length} QUEUED SHIPMENTS
          </span>
        </div>

        <div className="divide-y divide-neutral-200">
          {orders.map((ord) => (
            <div key={ord.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-black">{ord.orderNumber}</span>
                  <span className="font-sans text-xs text-neutral-500">({ord.date})</span>
                  <span
                    className={`font-sans text-[11px] font-bold uppercase px-2 py-0.5 rounded-sm ${
                      ord.status === 'DELIVERED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ord.status === 'IN TRANSIT'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {ord.status}
                  </span>
                </div>
                <p className="font-sans text-xs text-neutral-600">
                  Recipient: <strong className="text-black">{ord.shippingAddress.fullName}</strong> • Courier: {ord.carrier}
                </p>
                <p className="font-mono text-[11px] text-neutral-400">
                  Waybill: {ord.trackingNumber} • {ord.items.length} cap style(s)
                </p>
              </div>

              {/* Status Action Switcher */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdateOrderStatus(ord.id, 'PROCESSING')}
                  className={`px-3 py-1.5 border text-xs font-sans font-semibold uppercase rounded-sm transition-colors ${
                    ord.status === 'PROCESSING' ? 'bg-black text-white border-black' : 'border-neutral-200 hover:border-neutral-400'
                  }`}
                >
                  Processing
                </button>
                <button
                  onClick={() => handleUpdateOrderStatus(ord.id, 'IN TRANSIT')}
                  className={`px-3 py-1.5 border text-xs font-sans font-semibold uppercase rounded-sm transition-colors ${
                    ord.status === 'IN TRANSIT' ? 'bg-black text-white border-black' : 'border-neutral-200 hover:border-neutral-400'
                  }`}
                >
                  In Transit
                </button>
                <button
                  onClick={() => handleUpdateOrderStatus(ord.id, 'DELIVERED')}
                  className={`px-3 py-1.5 border text-xs font-sans font-semibold uppercase rounded-sm transition-colors ${
                    ord.status === 'DELIVERED' ? 'bg-black text-white border-black' : 'border-neutral-200 hover:border-neutral-400'
                  }`}
                >
                  Delivered
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. INVENTORY MANAGEMENT TABLE */}
      <div className="bg-white border border-neutral-200">
        <div className="p-5 border-b border-neutral-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="font-nike text-2xl font-bold uppercase tracking-tight text-black">
              STOCK MANAGEMENT & BATCH ALLOCATION
            </h3>
            <p className="font-sans text-xs text-neutral-500">
              Audited inventory with Japan & Portugal manufacturing partner depots.
            </p>
          </div>
          <button
            onClick={() => setIsProductModalOpen(true)}
            className="px-4 py-2.5 bg-black text-white font-sans text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-neutral-800 transition-colors rounded-full"
          >
            <Plus size={14} />
            <span>NEW PRODUCT SPEC</span>
          </button>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">ITEM / SILHOUETTE</th>
                <th className="py-3.5 px-4 font-mono">SKU SPEC</th>
                <th className="py-3.5 px-4">TEXTILE</th>
                <th className="py-3.5 px-4">PRICE</th>
                <th className="py-3.5 px-4">CURRENT STOCK</th>
                <th className="py-3.5 px-4">STATUS</th>
                <th className="py-3.5 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {inventory.map((item) => {
                const isRestocked = restockedId === item.id;
                return (
                  <tr key={item.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-black">
                      {item.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-neutral-500">
                      {item.sku}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-600">
                      {item.material}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-black font-mono">
                      ${item.price.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`font-bold font-mono ${item.stock <= item.reorderPoint ? 'text-amber-600' : 'text-black'}`}>
                        {item.stock} UNITS
                      </span>
                      <span className="text-[10px] text-neutral-400 block font-mono">
                        THRESHOLD: {item.reorderPoint}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] uppercase font-bold rounded-sm ${
                          item.status === 'IN STOCK'
                            ? 'bg-neutral-100 text-neutral-800'
                            : item.status === 'LOW STOCK'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-black text-white'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleRestock(item.id)}
                        className="px-3 py-1 border border-neutral-300 text-xs font-semibold text-black uppercase hover:border-black hover:bg-black hover:text-white transition-all inline-flex items-center gap-1 rounded-sm"
                      >
                        {isRestocked ? (
                          <>
                            <Check size={12} className="text-emerald-400" />
                            <span>+25 ADDED</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw size={12} />
                            <span>RESTOCK +25</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Registration Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={handleAddProduct}
      />

    </div>
  );
};
