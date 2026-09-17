import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

export interface AddressData {
  id: string;
  title: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

interface AddAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (address: AddressData) => void;
}

export const AddAddressModal: React.FC<AddAddressModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [title, setTitle] = useState('HOME');
  const [fullName, setFullName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('United States');
  const [isDefault, setIsDefault] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !street || !city || !zip) return;

    onAdd({
      id: `addr-${Date.now()}`,
      title: title.toUpperCase(),
      fullName,
      street,
      city,
      state,
      zip,
      country,
      isDefault,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fadeIn">
      <div className="w-full max-w-lg bg-white p-6 sm:p-8 space-y-6 shadow-2xl relative border border-neutral-200 font-sans">
        
        <div className="flex justify-between items-center pb-4 border-b border-neutral-200">
          <div>
            <h3 className="font-nike text-2xl font-bold uppercase text-black">
              ADD NEW DELIVERY ADDRESS
            </h3>
            <p className="text-xs text-neutral-500">Ensure precise courier dispatch details.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-500 hover:text-black rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold uppercase text-neutral-700 mb-1">
                ADDRESS LABEL
              </label>
              <select
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-neutral-300 px-3 py-2.5 text-sm focus:outline-none focus:border-black bg-white"
              >
                <option value="HOME">HOME</option>
                <option value="STUDIO / WORK">STUDIO / WORK</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold uppercase text-neutral-700 mb-1">
                RECIPIENT FULL NAME
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Marcus Vance"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border border-neutral-300 px-3 py-2.5 text-sm focus:outline-none focus:border-black"
              >
              </input>
            </div>
          </div>

          <div>
            <label className="block font-semibold uppercase text-neutral-700 mb-1">
              STREET ADDRESS
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 450 West 33rd Street, Fl 14"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className="w-full border border-neutral-300 px-3 py-2.5 text-sm focus:outline-none focus:border-black"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold uppercase text-neutral-700 mb-1">
                CITY
              </label>
              <input
                type="text"
                required
                placeholder="New York"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border border-neutral-300 px-3 py-2.5 text-sm focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block font-semibold uppercase text-neutral-700 mb-1">
                STATE / REGION
              </label>
              <input
                type="text"
                required
                placeholder="NY"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full border border-neutral-300 px-3 py-2.5 text-sm focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block font-semibold uppercase text-neutral-700 mb-1">
                POSTAL CODE
              </label>
              <input
                type="text"
                required
                placeholder="10001"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                className="w-full border border-neutral-300 px-3 py-2.5 text-sm focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold uppercase text-neutral-700 mb-1">
              COUNTRY
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full border border-neutral-300 px-3 py-2.5 text-sm focus:outline-none focus:border-black bg-white"
            >
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Germany">Germany</option>
              <option value="Japan">Japan</option>
              <option value="Canada">Canada</option>
            </select>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-4 h-4 accent-black"
              />
              <span className="text-neutral-700 font-medium">Set as default delivery address</span>
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
              <span>Save Address</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
