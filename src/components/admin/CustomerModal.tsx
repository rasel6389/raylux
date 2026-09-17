import React, { useState, useEffect } from 'react';
import { User } from '../../types/product';
import { X, Check, User as UserIcon, Edit3 } from 'lucide-react';

export interface CustomerModalPayload {
  name: string;
  email: string;
  phone?: string;
  status: 'ACTIVE' | 'VIP' | 'SUSPENDED';
  sizePreference?: string;
  address?: string;
  notes?: string;
  provider: 'email' | 'google';
}

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: CustomerModalPayload) => void;
  initialData?: User | null;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'VIP' | 'SUSPENDED'>('ACTIVE');
  const [sizePreference, setSizePreference] = useState('L/XL (58-61CM)');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [provider, setProvider] = useState<'email' | 'google'>('email');

  const isEditMode = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setEmail(initialData.email || '');
      setPhone(initialData.phone || '');
      setStatus(initialData.status || 'ACTIVE');
      setSizePreference(initialData.sizePreference || 'L/XL (58-61CM)');
      setAddress(initialData.address || '');
      setNotes(initialData.notes || '');
      setProvider(initialData.provider || 'email');
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setStatus('ACTIVE');
      setSizePreference('L/XL (58-61CM)');
      setAddress('');
      setNotes('');
      setProvider('email');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    onSave({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() || undefined,
      status,
      sizePreference,
      address: address.trim() || undefined,
      notes: notes.trim() || undefined,
      provider,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-neutral-200 shadow-2xl relative max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header (Clean Nike Style) */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-neutral-100 bg-[#fafafa]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold">
              {isEditMode ? <Edit3 size={18} /> : <UserIcon size={18} />}
            </div>
            <div>
              <h3 className="text-base font-bold text-black tracking-tight">
                {isEditMode ? `Edit Client Profile — ${initialData?.name}` : 'Register New Client'}
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                {isEditMode ? 'Update member record, loyalty tier, and delivery details.' : 'Add client to the customer directory and order routing.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-black rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          
          {/* Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="customer-name-input"
                type="text"
                required
                placeholder="e.g. Marcus Vance"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:border-black font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                id="customer-email-input"
                type="email"
                required
                placeholder="client@raylux.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:border-black font-medium"
              />
            </div>
          </div>

          {/* Phone & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Contact Phone
              </label>
              <input
                id="customer-phone-input"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:border-black font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Membership Tier
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'VIP' | 'SUSPENDED')}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-black font-medium"
              >
                <option value="ACTIVE">ACTIVE MEMBER</option>
                <option value="VIP">VIP CONCIERGE</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </select>
            </div>
          </div>

          {/* Size Preference & Auth Provider */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Fitted Cap Size Preference
              </label>
              <select
                value={sizePreference}
                onChange={(e) => setSizePreference(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-black font-medium"
              >
                <option value="L/XL (58-61CM)">L/XL (58-61CM)</option>
                <option value="S/M (54-57CM)">S/M (54-57CM)</option>
                <option value="ADJUSTABLE">ADJUSTABLE STRAPBACK</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Authentication Channel
              </label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as 'email' | 'google')}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-black font-medium"
              >
                <option value="email">Email & Passcode</option>
                <option value="google">Google OAuth Verified</option>
              </select>
            </div>
          </div>

          {/* Shipping Address */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Default Destination Address
            </label>
            <input
              id="customer-address-input"
              type="text"
              placeholder="e.g. 450 West 33rd Street, Fl 14, New York, NY 10001, USA"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:border-black font-medium"
            />
          </div>

          {/* Internal VIP Notes */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Internal Concierge Notes (Admin Only)
            </label>
            <textarea
              id="customer-notes-input"
              rows={2}
              placeholder="e.g. Client requests custom monogramming; prefers GORE-TEX waterproof models..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:border-black"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex justify-end gap-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-neutral-200 text-neutral-600 hover:text-black hover:bg-neutral-50 font-bold text-xs transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="submit-customer-modal-btn"
              type="submit"
              className="px-6 py-2.5 bg-black text-white rounded-full font-bold text-xs hover:bg-neutral-800 transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Check size={14} />
              <span>{isEditMode ? 'Save Client Updates' : 'Add Client to Roster'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
