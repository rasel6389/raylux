import React, { useState, useEffect } from 'react';
import { InventoryItem, CapCategory } from '../../types/product';
import { X, Check, Image as ImageIcon, Edit3, Package } from 'lucide-react';

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
  const [profile, setProfile] = useState('6-Panel High Crown');
  const [material, setMaterial] = useState('Heavy Twill');
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
      setProfile(initialData.profile || '6-Panel High Crown');
      setMaterial(initialData.material || 'Heavy Twill');
      setPrice(initialData.price?.toString() || '85');
      setStock(initialData.stock?.toString() || '30');
      setReorderPoint(initialData.reorderPoint?.toString() || '15');
      setImageUrl(initialData.images?.[0] || PRESET_IMAGES[0].url);
      setDescription(initialData.description || '');
    } else {
      setName('');
      setSku('');
      setCategory('STRUCTURED');
      setProfile('6-Panel High Crown');
      setMaterial('Heavy Twill');
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
      name: name.trim(),
      sku: sku.toUpperCase().trim(),
      category,
      material: material.trim(),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-white rounded-2xl border border-slate-200/80 shadow-2xl relative max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isEditMode ? 'bg-amber-100 text-amber-700' : 'bg-slate-900 text-white'
            }`}>
              {isEditMode ? <Edit3 size={18} /> : <Package size={18} />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                {isEditMode ? `Edit Product — ${initialData?.sku}` : 'Add New Product'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEditMode
                  ? 'Update product details, pricing, inventory stock, and textile specifications.'
                  : 'Register a new headwear silhouette to the active store catalog.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* Name & SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Product Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Monolith 04 Hat"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                SKU Identifier <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. RLX-SPEC-240"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all uppercase font-medium"
              />
            </div>
          </div>

          {/* Category & Crown Profile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CapCategory)}
                className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-medium"
              >
                <option value="STRUCTURED">Structured 6-Panel</option>
                <option value="TECHNICAL">Technical GORE-TEX</option>
                <option value="CAMP_CAP">Cordura 5-Panel Camp</option>
                <option value="RUNNER">AeroRunner Speed</option>
                <option value="COLLABORATION">Special Collaboration</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Fit & Crown Profile
              </label>
              <select
                value={profile}
                onChange={(e) => setProfile(e.target.value)}
                className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-medium"
              >
                <option value="6-Panel High Crown">6-Panel High Crown</option>
                <option value="5-Panel Low Profile">5-Panel Low Profile</option>
                <option value="Unstructured Runner">Unstructured Runner</option>
              </select>
            </div>
          </div>

          {/* Pricing, Stock & Reorder */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Price ($ USD) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-sm">$</span>
                <input
                  type="number"
                  required
                  min="5"
                  step="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-slate-50/60 border border-slate-200 rounded-xl pl-7 pr-3 py-2.5 text-sm text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {isEditMode ? 'Current Stock' : 'Stock Units'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Reorder Alert At
              </label>
              <input
                type="number"
                required
                min="1"
                value={reorderPoint}
                onChange={(e) => setReorderPoint(e.target.value)}
                className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
              />
            </div>
          </div>

          {/* Textile / Material */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Fabric & Material Specification <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              placeholder="e.g. GORE-TEX 3L Pro / 100% Heavy Twill"
              className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all font-medium"
            />
          </div>

          {/* Product Image */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Product Image Preview
            </label>
            <div className="grid grid-cols-4 gap-2.5">
              {PRESET_IMAGES.map((preset) => {
                const isSelected = imageUrl === preset.url;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setImageUrl(preset.url)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 relative transition-all group ${
                      isSelected ? 'border-slate-900 ring-2 ring-slate-900/20' : 'border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-400'
                    }`}
                  >
                    <img src={preset.url} alt={preset.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <span className="absolute bottom-1 left-1 right-1 text-[10px] font-medium text-center bg-slate-950/80 text-white truncate px-1 py-0.5 rounded backdrop-blur-xs">
                      {preset.label}
                    </span>
                    {isSelected && (
                      <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">
                        ✓
                      </span>
                    )}
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
                className="w-full bg-slate-50/60 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
              />
              <ImageIcon size={16} className="absolute left-3 top-3.5 text-slate-400" />
            </div>
          </div>

          {/* Product Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Product Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Crafted from premium water-repellent materials with custom hardware..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-semibold text-xs transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-semibold text-xs hover:bg-slate-800 transition-all shadow-sm hover:shadow flex items-center gap-2"
            >
              <Check size={14} />
              <span>{isEditMode ? 'Update Product' : 'Publish Product'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
