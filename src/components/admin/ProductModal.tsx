import React, { useState, useEffect } from 'react';
import { InventoryItem, CapCategory } from '../../types/product';
import { X, Check, Image as ImageIcon, Edit3, Plus } from 'lucide-react';

export interface ProductModalPayload {
  name: string;
  sku: string;
  category: CapCategory;
  material: string;
  price: number;
  stock: number;
  reorderPoint: number;
  status: 'IN STOCK' | 'LOW STOCK';
  images: string[];
  profile: string;
  description?: string;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: ProductModalPayload) => void;
  initialData?: (InventoryItem & { images?: string[]; profile?: string; description?: string }) | null;
}

const PRESET_IMAGES = [
  { label: 'Black High Crown', url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80' },
  { label: 'Slate GORE-TEX', url: 'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?auto=format&fit=crop&w=800&q=80' },
  { label: 'Bone Minimalist', url: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=800&q=80' },
  { label: 'Cordura Camp', url: 'https://images.unsplash.com/photo-1534215754734-18e55d13e346?auto=format&fit=crop&w=800&q=80' },
];

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState<CapCategory>('STRUCTURED');
  const [profile, setProfile] = useState('6-PANEL HIGH');
  const [material, setMaterial] = useState('HEAVY TWILL');
  const [price, setPrice] = useState('85');
  const [stock, setStock] = useState('30');
  const [reorderPoint, setReorderPoint] = useState('15');
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);
  const [description, setDescription] = useState('');

  const isEditMode = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setSku(initialData.sku || '');
      setCategory(initialData.category || 'STRUCTURED');
      setProfile(initialData.profile || '6-PANEL HIGH');
      setMaterial(initialData.material || 'HEAVY TWILL');
      setPrice(initialData.price?.toString() || '85');
      setStock(initialData.stock?.toString() || '30');
      setReorderPoint(initialData.reorderPoint?.toString() || '15');
      setImageUrl(initialData.images?.[0] || PRESET_IMAGES[0].url);
      setDescription(initialData.description || '');
    } else {
      setName('');
      setSku('');
      setCategory('STRUCTURED');
      setProfile('6-PANEL HIGH');
      setMaterial('HEAVY TWILL');
      setPrice('85');
      setStock('30');
      setReorderPoint('15');
      setImageUrl(PRESET_IMAGES[0].url);
      setDescription('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim()) return;

    const parsedPrice = parseFloat(price) || 85;
    const parsedStock = parseInt(stock, 10) || 25;
    const parsedReorder = parseInt(reorderPoint, 10) || 12;

    onSave({
      name: name.toUpperCase().trim(),
      sku: sku.toUpperCase().trim(),
      category,
      material: material.toUpperCase().trim(),
      price: parsedPrice,
      stock: parsedStock,
      reorderPoint: parsedReorder,
      status: parsedStock <= parsedReorder ? 'LOW STOCK' : 'IN STOCK',
      images: [imageUrl, imageUrl],
      profile,
      description: description.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn font-sans">
      <div className="w-full max-w-xl bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b border-neutral-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                DEPOT MATRIX CATALOG
              </span>
              <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                isEditMode ? 'bg-amber-100 text-amber-800' : 'bg-neutral-100 text-neutral-800'
              }`}>
                {isEditMode ? 'EDIT MODE' : 'NEW SPEC'}
              </span>
            </div>

            <h3 className="font-nike text-2xl sm:text-3xl font-black uppercase text-black leading-tight flex items-center gap-2">
              {isEditMode ? (
                <>
                  <Edit3 size={24} className="text-black" />
                  <span>EDIT SPEC // {initialData?.sku}</span>
                </>
              ) : (
                <>
                  <Plus size={24} className="text-black" />
                  <span>REGISTER NEW HEADWEAR SPEC</span>
                </>
              )}
            </h3>
            <p className="text-xs text-neutral-500">
              {isEditMode
                ? 'Update catalog parameters, textile materials, stock allocation, and pricing.'
                : 'Create product specification with synchronized Tokyo & Berlin warehouse allocation.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-black rounded-full hover:bg-neutral-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs font-sans">
          
          {/* Name & SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold uppercase text-neutral-700 mb-1">
                PRODUCT SILHOUETTE NAME
              </label>
              <input
                type="text"
                required
                placeholder="e.g. MONOLITH 04 // GRAPHITE"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-neutral-300 rounded-xl px-3.5 py-2.5 uppercase font-medium text-xs focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block font-semibold uppercase text-neutral-700 mb-1">
                SKU IDENTIFIER SPEC
              </label>
              <input
                type="text"
                required
                placeholder="e.g. RLX-SPEC-240"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full border border-neutral-300 rounded-xl px-3.5 py-2.5 font-mono text-xs uppercase focus:outline-none focus:border-black"
              />
            </div>
          </div>

          {/* Category & Silhouette Profile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold uppercase text-neutral-700 mb-1">
                CATEGORY CLASSIFICATION
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CapCategory)}
                className="w-full border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs uppercase font-medium focus:outline-none focus:border-black bg-white"
              >
                <option value="STRUCTURED">STRUCTURED 6-PANEL</option>
                <option value="TECHNICAL">TECHNICAL GORE-TEX</option>
                <option value="CAMP_CAP">CORDURA 5-PANEL CAMP</option>
                <option value="RUNNER">AERORUNNER SPEED</option>
                <option value="COLLABORATION">COLLABORATION SPECIAL</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold uppercase text-neutral-700 mb-1">
                SILHOUETTE CROWN
              </label>
              <select
                value={profile}
                onChange={(e) => setProfile(e.target.value)}
                className="w-full border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs uppercase font-medium focus:outline-none focus:border-black bg-white"
              >
                <option value="6-PANEL HIGH">6-PANEL HIGH CROWN</option>
                <option value="5-PANEL LOW">5-PANEL LOW PROFILE</option>
                <option value="UNSTRUCTURED RUNNER">UNSTRUCTURED RUNNER</option>
              </select>
            </div>
          </div>

          {/* Pricing & Stock Numbers */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold uppercase text-neutral-700 mb-1">
                PRICE ($ USD)
              </label>
              <input
                type="number"
                required
                min="10"
                step="5"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full border border-neutral-300 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block font-semibold uppercase text-neutral-700 mb-1">
                {isEditMode ? 'CURRENT STOCK' : 'INITIAL UNITS'}
              </label>
              <input
                type="number"
                required
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full border border-neutral-300 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block font-semibold uppercase text-neutral-700 mb-1">
                REORDER POINT
              </label>
              <input
                type="number"
                required
                min="1"
                value={reorderPoint}
                onChange={(e) => setReorderPoint(e.target.value)}
                className="w-full border border-neutral-300 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-black"
              />
            </div>
          </div>

          {/* Textile Material */}
          <div>
            <label className="block font-semibold uppercase text-neutral-700 mb-1">
              PRIMARY TEXTILE SPECIFICATION
            </label>
            <input
              type="text"
              required
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              placeholder="e.g. GORE-TEX 3L PRO"
              className="w-full border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs uppercase font-medium focus:outline-none focus:border-black"
            />
          </div>

          {/* Imagery selection */}
          <div className="space-y-2">
            <label className="block font-semibold uppercase text-neutral-700">
              STUDIO CATALOG IMAGE
            </label>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_IMAGES.map((preset) => {
                const isSelected = imageUrl === preset.url;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setImageUrl(preset.url)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 relative transition-all ${
                      isSelected ? 'border-black ring-2 ring-black' : 'border-neutral-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-1 right-1 text-[9px] font-bold text-center bg-black/75 text-white truncate px-1 rounded">
                      {preset.label.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="relative pt-1">
              <input
                type="url"
                placeholder="Or paste custom image URL..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full border border-neutral-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-black pl-8"
              />
              <ImageIcon size={14} className="absolute left-2.5 top-3.5 text-neutral-400" />
            </div>
          </div>

          <div>
            <label className="block font-semibold uppercase text-neutral-700 mb-1">
              EDITORIAL DESCRIPTION (OPTIONAL)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Engineered structural cap crafted from waterproof materials..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-neutral-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-black font-sans"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex justify-end gap-3 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-neutral-300 rounded-full uppercase font-sans text-xs font-bold text-neutral-700 hover:border-black hover:text-black transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-black text-white rounded-full uppercase font-sans text-xs font-bold hover:bg-neutral-800 transition-all shadow-md flex items-center gap-2"
            >
              <Check size={14} />
              <span>{isEditMode ? 'Update & Save Spec' : 'Save & Publish Spec'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
