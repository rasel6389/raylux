import React, { useState } from 'react';
import { X, Check, CreditCard, Lock } from 'lucide-react';

export interface PaymentCardData {
  id: string;
  brand: string;
  last4: string;
  expiry: string;
  cardholder: string;
  isDefault: boolean;
}

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (card: PaymentCardData) => void;
}

export const AddPaymentModal: React.FC<AddPaymentModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardholder, setCardholder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardholder || !expiry) return;

    const cleaned = cardNumber.replace(/\s+/g, '');
    const last4 = cleaned.slice(-4) || '4242';
    const brand = cleaned.startsWith('5') ? 'Mastercard' : cleaned.startsWith('3') ? 'Amex' : 'Visa';

    onAdd({
      id: `card-${Date.now()}`,
      brand,
      last4,
      expiry,
      cardholder: cardholder.toUpperCase(),
      isDefault,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fadeIn">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 space-y-6 shadow-2xl relative border border-neutral-200 font-sans">
        
        <div className="flex justify-between items-center pb-4 border-b border-neutral-200">
          <div>
            <h3 className="font-nike text-2xl font-bold uppercase text-black">
              ADD PAYMENT METHOD
            </h3>
            <p className="text-xs text-neutral-500">Encrypted with 256-bit bank-grade SSL.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-500 hover:text-black rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div>
            <label className="block font-semibold uppercase text-neutral-700 mb-1">
              CARDHOLDER NAME
            </label>
            <input
              type="text"
              required
              placeholder="e.g. MARCUS VANCE"
              value={cardholder}
              onChange={(e) => setCardholder(e.target.value)}
              className="w-full border border-neutral-300 px-3 py-2.5 text-sm uppercase focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase text-neutral-700 mb-1">
              CARD NUMBER
            </label>
            <div className="relative">
              <input
                type="text"
                required
                maxLength={19}
                placeholder="4000 1234 5678 9010"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="w-full border border-neutral-300 px-3 py-2.5 pl-10 text-sm font-mono focus:outline-none focus:border-black"
              />
              <CreditCard size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold uppercase text-neutral-700 mb-1">
                EXPIRATION (MM/YY)
              </label>
              <input
                type="text"
                required
                placeholder="12/28"
                maxLength={5}
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="w-full border border-neutral-300 px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block font-semibold uppercase text-neutral-700 mb-1">
                CVV / CVC
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="•••"
                  maxLength={4}
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  className="w-full border border-neutral-300 px-3 py-2.5 pl-8 text-sm font-mono focus:outline-none focus:border-black"
                />
                <Lock size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-4 h-4 accent-black"
              />
              <span className="text-neutral-700 font-medium">Set as default payment card</span>
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-neutral-300 uppercase font-sans text-xs font-bold rounded-full hover:border-black"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-7 py-2.5 bg-black text-white uppercase font-sans text-xs font-bold rounded-full hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
            >
              <Check size={14} />
              <span>Save Card</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
