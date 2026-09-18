import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { useTickets } from '../../context/TicketContext';
import { SupportTicket } from '../../types/ticket';
import { X, Send, LifeBuoy } from 'lucide-react';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultOrderNumber?: string;
}

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
  isOpen,
  onClose,
  defaultOrderNumber,
}) => {
  const { currentUser } = useAuth();
  const { orders } = useStore();
  const { createTicket } = useTickets();

  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<SupportTicket['category']>('ORDER_STATUS');
  const [priority, setPriority] = useState<SupportTicket['priority']>('MEDIUM');
  const [selectedOrder, setSelectedOrder] = useState(defaultOrderNumber || (orders[0]?.orderNumber || ''));
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setIsSubmitting(true);
    createTicket({
      customerName: currentUser?.name || 'Valued Member',
      customerEmail: currentUser?.email || 'guest@rayluxx.com',
      userId: currentUser?.id,
      orderNumber: selectedOrder || undefined,
      subject: subject.trim(),
      category,
      priority,
      initialMessage: message.trim(),
    });

    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn font-sans">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden relative max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
              <LifeBuoy size={20} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                CLIENT CONCIERGE
              </span>
              <h2 className="font-nike text-2xl font-black uppercase text-black leading-tight">
                OPEN SUPPORT TICKET
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-black rounded-full hover:bg-neutral-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          <div>
            <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1">
              Subject Summary
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Inquire about GORE-TEX S/M exchange or carrier update"
              className="w-full border border-neutral-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black bg-neutral-50 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SupportTicket['category'])}
                className="w-full border border-neutral-300 rounded-xl px-3 py-2.5 text-xs font-bold uppercase bg-white focus:outline-none focus:border-black cursor-pointer"
              >
                <option value="ORDER_STATUS">Order & Waybill Telemetry</option>
                <option value="RETURN_EXCHANGE">Return / Sizing Exchange</option>
                <option value="SIZING_HELP">Anatomical Sizing Help</option>
                <option value="PRODUCT_INQUIRY">Product Tech Inquiry</option>
                <option value="BILLING">Billing & Currency Inquiry</option>
                <option value="OTHER">General Concierge Inquiry</option>
              </select>
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Urgency Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as SupportTicket['priority'])}
                className="w-full border border-neutral-300 rounded-xl px-3 py-2.5 text-xs font-bold uppercase bg-white focus:outline-none focus:border-black cursor-pointer"
              >
                <option value="LOW">Low (Routine Inquiry)</option>
                <option value="MEDIUM">Medium (Standard 4h SLA)</option>
                <option value="HIGH">High (Urgent Dispatch)</option>
                <option value="URGENT">Urgent (Immediate Protocol)</option>
              </select>
            </div>
          </div>

          {/* Related Order Selector */}
          <div>
            <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1">
              Associated Order (Optional)
            </label>
            <select
              value={selectedOrder}
              onChange={(e) => setSelectedOrder(e.target.value)}
              className="w-full border border-neutral-300 rounded-xl px-3 py-2.5 text-xs font-mono uppercase bg-white focus:outline-none focus:border-black cursor-pointer"
            >
              <option value="">-- No specific order --</option>
              {orders.map((ord) => (
                <option key={ord.id} value={ord.orderNumber}>
                  {ord.orderNumber} • ${ord.total.toFixed(2)} ({ord.status})
                </option>
              ))}
            </select>
          </div>

          {/* Detailed Message */}
          <div>
            <label className="block font-bold uppercase tracking-wider text-neutral-700 mb-1">
              Detailed Description
            </label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your request or issue with full detail. Our operations team will respond promptly."
              className="w-full border border-neutral-300 rounded-xl p-3.5 text-xs focus:outline-none focus:border-black bg-neutral-50 transition-colors resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-black"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-black text-white hover:bg-neutral-800 rounded-full text-xs font-bold uppercase tracking-wider transition-all inline-flex items-center gap-2 shadow-sm active:scale-95"
            >
              <span>Submit Ticket</span>
              <Send size={13} />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
