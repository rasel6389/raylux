import React, { useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/product/ProductCard';
import { ArrowLeft, Truck, RotateCcw, ChevronDown, ChevronUp, Heart } from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { selectedProductId, goToShop } = useNavigation();
  const { addToCart } = useCart();
  const { products, toggleWishlist, isInWishlist } = useStore();

  const product = products.find((p) => p.id === selectedProductId) || products[0];
  const isFavorited = isInWishlist(product.id);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'ONE SIZE');
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0]?.name || 'Standard');
  const [addedNotice, setAddedNotice] = useState(false);

  // Accordion open states
  const [accordionOpen, setAccordionOpen] = useState({
    materials: true,
    fit: false,
    shipping: false,
  });

  const toggleAccordion = (key: 'materials' | 'fit' | 'shipping') => {
    setAccordionOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  const relatedProducts = products.filter((p) => p.id !== product.id).slice(0, 3);


  return (
    <div className="w-full min-h-screen bg-white">
      
      {/* Top Breadcrumb */}
      <div className="border-b border-neutral-200 py-3.5 px-4 sm:px-6 lg:px-8 bg-neutral-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-sans">
          <button
            onClick={() => goToShop()}
            className="inline-flex items-center gap-1.5 text-neutral-600 hover:text-black uppercase font-medium transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Return to Catalog</span>
          </button>
          <div className="hidden sm:flex items-center gap-2 text-neutral-500 uppercase text-[11px]">
            <span>{product.category}</span>
            <span>/</span>
            <span className="text-black font-bold font-mono">{product.sku}</span>
          </div>
        </div>
      </div>

      {/* CORE REQUIREMENT: SPLIT-SCREEN LAYOUT (Nike Style) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* LEFT SIDE: LARGE HIGH-RES CAP IMAGE GALLERY */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Main Stage Image */}
            <div className="relative w-full aspect-square bg-[#f5f5f5] overflow-hidden group">
              {product.badge && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="font-sans text-xs font-bold uppercase tracking-wider text-black bg-white/95 px-3 py-1.5 shadow-sm">
                    {product.badge === 'NEW DROP' ? 'JUST IN' : product.badge}
                  </span>
                </div>
              )}

              <img
                src={product.images[activeImageIndex] || product.images[0]}
                alt={`${product.name} active display`}
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />

              <div className="absolute bottom-4 left-4 z-10 bg-black text-white px-3 py-1 font-mono text-[10px] uppercase">
                {product.specs.material.split(' ')[0]} • {product.specs.weightGsm}
              </div>
            </div>

            {/* Thumbnail Selectors */}
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`aspect-square bg-[#f5f5f5] border transition-all overflow-hidden relative ${
                    activeImageIndex === idx
                      ? 'border-black ring-1 ring-black'
                      : 'border-neutral-200 opacity-80 hover:opacity-100'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`Thumbnail view ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 right-1 font-mono text-[9px] bg-black/80 text-white px-1">
                    0{idx + 1}
                  </span>
                </button>
              ))}
            </div>

            <div className="p-4 bg-neutral-50 border border-neutral-200 font-sans text-xs text-neutral-600 flex items-center justify-between">
              <span>CRANIAL SPEC: 360° BALANCED CONTOUR</span>
              <span className="text-black font-semibold uppercase">{product.specs.origin}</span>
            </div>

          </div>

          {/* RIGHT SIDE: PRODUCT TITLE, LARGE PRICE, SIZE SQUARES, WIDE BLACK ADD TO CART */}
          <div className="lg:col-span-5 space-y-7 sticky top-28">
            
            {/* Header / Series / Sku */}
            <div className="space-y-2 border-b border-neutral-200 pb-6">
              <span className="font-sans text-xs font-bold text-[#b85d19] uppercase tracking-wide">
                {product.badge === 'NEW DROP' ? 'Just In' : 'Highly Rated'}
              </span>

              {/* Nike-Style Bold Title */}
              <h1 className="font-nike text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-black leading-none">
                {product.name}
              </h1>

              <p className="font-sans text-sm text-neutral-500 font-medium">
                {product.profile} • {product.material}
              </p>

              {/* Large Price Display */}
              <div className="pt-2 flex items-baseline gap-2 font-sans">
                <span className="text-2xl sm:text-3xl font-bold text-black">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-xs text-neutral-500 uppercase">
                  USD (Incl. all taxes)
                </span>
              </div>
            </div>

            {/* COLORWAY SELECTION */}
            <div className="space-y-2">
              <div className="flex justify-between font-sans text-xs">
                <span className="text-black font-bold uppercase">Color:</span>
                <span className="text-neutral-600 font-medium">{selectedColor}</span>
              </div>
              <div className="flex gap-2">
                {product.colors.map((color) => {
                  const isSelected = selectedColor === color.name;
                  return (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`flex items-center gap-2 px-3 py-2 border transition-all text-xs font-sans rounded-sm ${
                        isSelected
                          ? 'border-black bg-neutral-100 font-bold text-black'
                          : 'border-neutral-300 text-neutral-600 hover:border-neutral-500'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 border border-neutral-300"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span>{color.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SIZE SELECTION SQUARES */}
            <div className="space-y-2">
              <div className="flex justify-between font-sans text-xs">
                <span className="text-black font-bold uppercase">Select Size:</span>
                <button
                  onClick={() => alert('Sizing Guide: S/M fits circumferences 54-57cm. L/XL fits 58-61cm. Adjustable fits 54-62cm.')}
                  className="text-neutral-500 hover:text-black underline text-xs font-medium"
                >
                  Size Guide
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {product.sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 px-2 text-center border font-sans text-xs font-semibold uppercase transition-all rounded-sm ${
                        isSelected
                          ? 'bg-black text-white border-black font-bold'
                          : 'bg-white text-black border-neutral-300 hover:border-black'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* NIKE PILL BUTTONS: ADD TO BAG + FAVORITE */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleAddToCart}
                className="w-full py-5 px-6 bg-black text-white font-sans text-sm font-bold uppercase tracking-wider rounded-full hover:bg-neutral-800 transition-all shadow-lg active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <span>ADD TO BAG // ${product.price.toFixed(2)}</span>
              </button>

              <button
                onClick={() => toggleWishlist(product.id)}
                className={`w-full py-4 px-6 border font-sans text-xs font-bold uppercase tracking-wider rounded-full transition-all flex items-center justify-center gap-2 ${
                  isFavorited
                    ? 'border-red-600 text-red-600 bg-red-50'
                    : 'border-neutral-300 text-black hover:border-black'
                }`}
              >
                <Heart size={16} className={isFavorited ? 'fill-red-600 text-red-600' : ''} />
                <span>{isFavorited ? 'SAVED TO WISHLIST' : 'FAVORITE / WISHLIST'}</span>
              </button>


              {addedNotice && (
                <div className="p-3 bg-neutral-100 border border-neutral-300 font-sans text-xs font-semibold text-black text-center rounded-md animate-fadeIn">
                  ✓ {product.name} [{selectedSize}] Added to Bag
                </div>
              )}
            </div>

            {/* LOGISTICS GUARANTEES */}
            <div className="grid grid-cols-2 gap-3 pt-2 font-sans text-xs text-neutral-600">
              <div className="flex items-center gap-2 p-3 bg-neutral-50 border border-neutral-200">
                <Truck size={15} className="text-black" />
                <span>Free dispatch over $150</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-neutral-50 border border-neutral-200">
                <RotateCcw size={15} className="text-black" />
                <span>30-day return policy</span>
              </div>
            </div>

            {/* TECHNICAL SPECIFICATION ACCORDIONS */}
            <div className="border-t border-neutral-200 divide-y divide-neutral-200 font-sans text-xs pt-2">
              
              <div className="py-3.5">
                <button
                  onClick={() => toggleAccordion('materials')}
                  className="w-full flex items-center justify-between text-left font-bold uppercase text-black focus:outline-none"
                >
                  <span>Materials & Technical Composition</span>
                  {accordionOpen.materials ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {accordionOpen.materials && (
                  <div className="mt-3 space-y-2 text-xs text-neutral-600">
                    <div className="flex justify-between py-1 border-b border-neutral-100">
                      <span>Textile Fabric</span>
                      <span className="font-semibold text-black">{product.specs.material}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-100">
                      <span>Density Weight</span>
                      <span className="font-semibold text-black">{product.specs.weightGsm}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-100">
                      <span>Water Repellency</span>
                      <span className="font-semibold text-black">{product.specs.waterproofRating}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Closure System</span>
                      <span className="font-semibold text-black">{product.specs.closureSystem}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="py-3.5">
                <button
                  onClick={() => toggleAccordion('fit')}
                  className="w-full flex items-center justify-between text-left font-bold uppercase text-black focus:outline-none"
                >
                  <span>Size & Silhouette Fit</span>
                  {accordionOpen.fit ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {accordionOpen.fit && (
                  <div className="mt-3 space-y-2 text-xs text-neutral-600">
                    <div className="flex justify-between py-1 border-b border-neutral-100">
                      <span>Profile</span>
                      <span className="font-semibold text-black">{product.profile}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Visor Shape</span>
                      <span className="font-semibold text-black">{product.specs.brimStructure}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="py-3.5">
                <button
                  onClick={() => toggleAccordion('shipping')}
                  className="w-full flex items-center justify-between text-left font-bold uppercase text-black focus:outline-none"
                >
                  <span>Shipping & Returns</span>
                  {accordionOpen.shipping ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {accordionOpen.shipping && (
                  <div className="mt-3 space-y-2 text-xs text-neutral-600 leading-relaxed">
                    <p>
                      • Free standard shipping on orders of $150 or more for verified Members.
                    </p>
                    <p>
                      • Orders are dispatched same-day when placed before 2:00 PM EST.
                    </p>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>

        {/* RELATED CAPS */}
        <div className="mt-24 pt-12 border-t border-neutral-200">
          <div className="mb-8 flex justify-between items-end">
            <div>
              <span className="font-sans text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                RECOMMENDED FOR YOU
              </span>
              <h3 className="font-nike text-3xl font-black uppercase text-black">
                YOU MIGHT ALSO LIKE
              </h3>
            </div>
            <button
              onClick={() => goToShop()}
              className="font-sans text-xs uppercase font-bold text-black hover:underline"
            >
              Shop All Caps
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {relatedProducts.map((relProduct) => (
              <ProductCard key={relProduct.id} product={relProduct} />
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
