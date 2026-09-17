import React, { createContext, useContext, useState, useEffect } from 'react';

export type CurrencyCode = 'USD' | 'GBP';

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  exchangeRate: number; // 1 USD = X GBP
  setExchangeRate: (rate: number) => void;
  currencySymbol: string;
  formatPrice: (amountInUSD: number, forceCurrency?: CurrencyCode) => string;
  convertPrice: (amountInUSD: number, forceCurrency?: CurrencyCode) => number;
}

const CURRENCY_STORAGE_KEY = 'raylux_currency_v2';
const EXCHANGE_RATE_STORAGE_KEY = 'raylux_gbp_rate_v2';
const DEFAULT_GBP_RATE = 0.79; // 1 USD = 0.79 GBP

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    try {
      const saved = localStorage.getItem(CURRENCY_STORAGE_KEY);
      if (saved === 'GBP' || saved === 'USD') return saved;
    } catch {
      // ignore
    }
    return 'USD';
  });

  const [exchangeRate, setExchangeRateState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(EXCHANGE_RATE_STORAGE_KEY);
      if (saved) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_GBP_RATE;
  });

  useEffect(() => {
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
    } catch {
      // ignore
    }
  }, [currency]);

  useEffect(() => {
    try {
      localStorage.setItem(EXCHANGE_RATE_STORAGE_KEY, exchangeRate.toString());
    } catch {
      // ignore
    }
  }, [exchangeRate]);

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
  };

  const setExchangeRate = (rate: number) => {
    if (rate > 0) {
      setExchangeRateState(rate);
    }
  };

  const currencySymbol = currency === 'GBP' ? '£' : '$';

  const convertPrice = (amountInUSD: number, forceCurrency?: CurrencyCode): number => {
    const targetCurrency = forceCurrency || currency;
    if (targetCurrency === 'GBP') {
      return Math.round(amountInUSD * exchangeRate * 100) / 100;
    }
    return amountInUSD;
  };

  const formatPrice = (amountInUSD: number, forceCurrency?: CurrencyCode): string => {
    const targetCurrency = forceCurrency || currency;
    const symbol = targetCurrency === 'GBP' ? '£' : '$';
    const converted = convertPrice(amountInUSD, targetCurrency);
    return `${symbol}${converted.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        exchangeRate,
        setExchangeRate,
        currencySymbol,
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
