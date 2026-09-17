import React from 'react';
import { useCurrency, CurrencyCode } from '../../context/CurrencyContext';
import { Globe, Check, X, ShieldCheck } from 'lucide-react';

interface CurrencyOption {
  code: CurrencyCode;
  name: string;
  region: string;
  flag: string;
  symbol: string;
  badge: string;
  description: string;
}

const REGION_OPTIONS: CurrencyOption[] = [
  {
    code: 'USD',
    name: 'US Dollar',
    region: 'United States & Global',
    flag: '🇺🇸',
    symbol: '$',
    badge: 'GLOBAL HUB',
    description: 'Direct air dispatch from US and Tokyo fulfillment hubs. Standard domestic & global logistics.',
  },
  {
    code: 'GBP',
    name: 'British Pound',
    region: 'United Kingdom',
    flag: '🇬🇧',
    symbol: '£',
    badge: 'UK TERMINAL',
    description: 'Priority courier dispatch from London terminal. Import duty & Royal Mail integration included.',
  },
  {
    code: 'EUR',
    name: 'Eurozone Euro',
    region: 'European Union',
    flag: '🇪🇺',
    symbol: '€',
    badge: 'BERLIN CENTRAL',
    description: 'Fast overland transit via DHL Express & DPD across all Schengen territories. All taxes covered.',
  },
];

export const CurrencyModal: React.FC = () => {
  const { isCurrencyModalOpen, closeCurrencyModal, currency, setCurrency, formatPrice } = useCurrency();

  if (!isCurrencyModalOpen) return null;

  const handleSelect = (code: CurrencyCode) => {
    setCurrency(code);
    closeCurrencyModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn font-sans">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Subtle Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-black via-neutral-600 to-black" />

        {/* Close Button */}
        <button
          onClick={closeCurrencyModal}
          className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-black rounded-full hover:bg-neutral-100 transition-colors"
          aria-label="Close currency modal"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="space-y-1.5 pr-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-100 rounded-full text-[11px] font-bold text-neutral-700 tracking-wider uppercase">
            <Globe size={13} className="text-black" />
            <span>GLOBAL REGIONAL SELECTION</span>
          </div>
          <h2 className="font-nike text-2xl sm:text-3xl font-black uppercase text-black tracking-tight leading-tight">
            SELECT YOUR CURRENCY & REGION
          </h2>
          <p className="text-xs text-neutral-500 font-sans leading-relaxed">
            Personalize prices, live conversion rates, and localized courier fulfillment for your market.
          </p>
        </div>

        {/* Currency Options Cards */}
        <div className="mt-6 space-y-3">
          {REGION_OPTIONS.map((opt) => {
            const isSelected = currency === opt.code;
            return (
              <button
                key={opt.code}
                onClick={() => handleSelect(opt.code)}
                className={`w-full text-left p-4 sm:p-4.5 rounded-2xl border-2 transition-all flex items-start gap-4 relative group ${
                  isSelected
                    ? 'border-black bg-neutral-50 shadow-md ring-2 ring-black/10'
                    : 'border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50/50 bg-white'
                }`}
              >
                {/* Flag / Icon */}
                <div className="text-2xl sm:text-3xl flex-shrink-0 select-none pt-0.5">
                  {opt.flag}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-sm text-black tracking-tight uppercase">
                      {opt.region}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-neutral-200 text-neutral-800 rounded-full">
                      {opt.badge}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-nike text-xl font-black text-black">
                      {opt.code} ({opt.symbol})
                    </span>
                    <span className="text-xs text-neutral-400 font-sans">
                      • e.g. {formatPrice(85, opt.code)}
                    </span>
                  </div>

                  <p className="text-[11px] text-neutral-500 mt-1 leading-snug font-sans">
                    {opt.description}
                  </p>
                </div>

                {/* Selected Checkmark */}
                <div className="flex-shrink-0 pt-1">
                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center shadow-xs">
                      <Check size={14} strokeWidth={3} />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border border-neutral-300 group-hover:border-black transition-colors" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Notes & Action */}
        <div className="mt-6 pt-4 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500 font-sans">
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>You can change this anytime in your account or header.</span>
          </div>

          <button
            onClick={closeCurrencyModal}
            className="w-full sm:w-auto px-6 py-2.5 bg-black text-white hover:bg-neutral-800 font-bold uppercase text-xs rounded-full transition-all tracking-wider shadow-sm"
          >
            Continue in {currency}
          </button>
        </div>

      </div>
    </div>
  );
};
