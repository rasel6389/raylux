import React, { createContext, useContext, useState, useEffect } from 'react';

export type CurrencyCode = 'USD' | 'GBP' | 'EUR';

interface CurrencyRates {
  GBP: number; // 1 USD = X GBP
  EUR: number; // 1 USD = X EUR
}

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  exchangeRate: number; // Defaults to GBP rate for backwards compatibility
  exchangeRates: CurrencyRates;
  setExchangeRates: (rates: Partial<CurrencyRates>) => void;
  currencySymbol: string;
  isCurrencyModalOpen: boolean;
  openCurrencyModal: () => void;
  closeCurrencyModal: () => void;
  formatPrice: (amountInUSD: number, forceCurrency?: CurrencyCode) => string;
  convertPrice: (amountInUSD: number, forceCurrency?: CurrencyCode) => number;
}

const CURRENCY_STORAGE_KEY = 'raylux_currency_v3';
const RATES_STORAGE_KEY = 'raylux_rates_v3';
const MODAL_DISMISSED_KEY = 'raylux_region_selected_v3';

const DEFAULT_RATES: CurrencyRates = {
  GBP: 0.79, // 1 USD = 0.79 GBP
  EUR: 0.92, // 1 USD = 0.92 EUR
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    try {
      const saved = localStorage.getItem(CURRENCY_STORAGE_KEY);
      if (saved === 'GBP' || saved === 'USD' || saved === 'EUR') return saved;
    } catch {
      // ignore
    }
    return 'USD';
  });

  const [exchangeRates, setExchangeRatesState] = useState<CurrencyRates>(() => {
    try {
      const saved = localStorage.getItem(RATES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          GBP: typeof parsed.GBP === 'number' && parsed.GBP > 0 ? parsed.GBP : DEFAULT_RATES.GBP,
          EUR: typeof parsed.EUR === 'number' && parsed.EUR > 0 ? parsed.EUR : DEFAULT_RATES.EUR,
        };
      }
    } catch {
      // ignore
    }
    return DEFAULT_RATES;
  });

  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);

  // Automatically check if user should see the region & currency welcome modal
  useEffect(() => {
    try {
      const isDismissed = localStorage.getItem(MODAL_DISMISSED_KEY);
      const isCurrentAdmin = window.location.pathname.startsWith('/admin');
      if (!isDismissed && !isCurrentAdmin) {
        // Show after a brief delay for a polished welcome feeling
        const timer = setTimeout(() => {
          setIsCurrencyModalOpen(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
    } catch {
      // ignore
    }
  }, [currency]);

  useEffect(() => {
    try {
      localStorage.setItem(RATES_STORAGE_KEY, JSON.stringify(exchangeRates));
    } catch {
      // ignore
    }
  }, [exchangeRates]);

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    try {
      localStorage.setItem(MODAL_DISMISSED_KEY, 'true');
    } catch {
      // ignore
    }
  };

  const setExchangeRates = (rates: Partial<CurrencyRates>) => {
    setExchangeRatesState((prev) => ({
      GBP: typeof rates.GBP === 'number' && rates.GBP > 0 ? rates.GBP : prev.GBP,
      EUR: typeof rates.EUR === 'number' && rates.EUR > 0 ? rates.EUR : prev.EUR,
    }));
  };

  const openCurrencyModal = () => setIsCurrencyModalOpen(true);
  const closeCurrencyModal = () => {
    setIsCurrencyModalOpen(false);
    try {
      localStorage.setItem(MODAL_DISMISSED_KEY, 'true');
    } catch {
      // ignore
    }
  };

  const currencySymbol = currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : '$';

  const convertPrice = (amountInUSD: number, forceCurrency?: CurrencyCode): number => {
    const targetCurrency = forceCurrency || currency;
    if (targetCurrency === 'GBP') {
      return Math.round(amountInUSD * exchangeRates.GBP * 100) / 100;
    }
    if (targetCurrency === 'EUR') {
      return Math.round(amountInUSD * exchangeRates.EUR * 100) / 100;
    }
    return amountInUSD;
  };

  const formatPrice = (amountInUSD: number, forceCurrency?: CurrencyCode): string => {
    const targetCurrency = forceCurrency || currency;
    const symbol = targetCurrency === 'GBP' ? '£' : targetCurrency === 'EUR' ? '€' : '$';
    const converted = convertPrice(amountInUSD, targetCurrency);
    return `${symbol}${converted.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        exchangeRate: exchangeRates.GBP,
        exchangeRates,
        setExchangeRates,
        currencySymbol,
        isCurrencyModalOpen,
        openCurrencyModal,
        closeCurrencyModal,
        formatPrice,
        convertPrice,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
