import React from 'react';
import { LOOKBOOK_ITEMS } from '../data/lookbook';
import { useStore } from '../context/StoreContext';
import { useNavigation } from '../context/NavigationContext';
import { useCart } from '../context/CartContext';
import { ArrowRight, ShoppingBag, Eye, MapPin, Camera } from 'lucide-react';

export const LookbookPage: React.FC = () => {
  const { goToProduct, goToShop } = useNavigation();
  const { addToCart } = useCart();
  const { products } = useStore();


  return (
    <div className="w-full min-h-screen bg-white">
      
      {/* 1. EDITORIAL HEADER */}
      <section className="bg-black text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center gap-2 font-mono text-xs text-neutral-400 tracking-widest uppercase">
            <Camera size={14} />
            <span>EDITORIAL CURATION // 2026 FIELD SPEC</span>
          </div>
          <h1 className="font-nike text-5xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-[0.88] text-white">
            LOOKBOOK ARCHIVE
          </h1>
          <p className="font-sans text-neutral-400 text-sm sm:text-base max-w-2xl font-normal leading-relaxed pt-2">
            Caps tested and styled across harsh environments, subways, and brutalist architecture. Tokyo, Berlin, Reykjavik, and New York.
          </p>
        </div>
      </section>

      {/* 2. MASONRY / EDITORIAL GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-28">
        
        {LOOKBOOK_ITEMS.map((item, index) => {
          const featuredProduct = products.find((p) => p.id === item.featuredProductId) || products[0];
          const isReversed = index % 2 !== 0;

          return (
            <div
              key={item.id}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center ${
                isReversed ? 'lg:flex-row-reverse' : ''
              }`}
            >
              
              {/* Massive Lookbook Photo */}
              <div className={`lg:col-span-7 relative group overflow-hidden bg-neutral-100 ${isReversed ? 'lg:order-2' : 'lg:order-1'}`}>
                <div className="aspect-[4/5] sm:aspect-[16/11] overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 filter contrast-105"
                  />
                </div>
                
                {/* Location Stamp */}
                <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md text-white px-3 py-1.5 font-mono text-[10px] uppercase flex items-center gap-1.5">
                  <MapPin size={12} />
                  <span>{item.location}</span>
                </div>
                <div className="absolute bottom-4 right-4 bg-white/90 text-black px-2.5 py-1 font-mono text-[10px] uppercase">
                  PHOTO: {item.photographer}
                </div>
              </div>

              {/* Lookbook Narrative & Linked Product Buy Card */}
              <div className={`lg:col-span-5 space-y-8 ${isReversed ? 'lg:order-1' : 'lg:order-2'}`}>
                
                <div className="space-y-3">
                  <div className="flex gap-2">
                    {item.tags.map((tag) => (
                      <span key={tag} className="font-mono text-[10px] uppercase bg-neutral-100 px-2 py-0.5 font-semibold text-neutral-700">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h2 className="font-nike text-3xl sm:text-4xl font-black uppercase text-black leading-none">
                    {item.title}
                  </h2>

                  <p className="font-sans text-sm text-neutral-600 italic leading-relaxed pt-1">
                    "{item.quote}"
                  </p>
                </div>

                {/* Interactive "Shop This Look" Card */}
                <div className="p-5 bg-neutral-50 border border-neutral-200 space-y-4">
                  <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">
                    FEATURED EQUIPMENT IN SHOT:
                  </span>

                  <div className="flex gap-4 items-center">
                    <div className="w-20 h-20 bg-white border border-neutral-200 overflow-hidden flex-shrink-0">
                      <img
                        src={featuredProduct.images[0]}
                        alt={featuredProduct.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-nike text-lg font-bold uppercase text-black leading-tight">
                        {featuredProduct.name}
                      </h4>
                      <p className="font-sans text-xs text-neutral-500">
                        {featuredProduct.material} • {featuredProduct.profile}
                      </p>
                      <p className="font-sans text-sm font-semibold text-black mt-1">
                        ${featuredProduct.price.toFixed(2)} USD
                      </p>
                    </div>
                  </div>

                  {/* Direct Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => goToProduct(featuredProduct.id)}
                      className="flex-1 py-3 px-4 bg-white border border-neutral-300 font-sans text-xs font-bold uppercase tracking-wider text-black hover:border-black transition-colors flex items-center justify-center gap-2 rounded-full"
                    >
                      <Eye size={14} />
                      <span>VIEW SPECS</span>
                    </button>
                    <button
                      onClick={() => addToCart(featuredProduct, featuredProduct.sizes[0], featuredProduct.colors[0]?.name || 'Standard')}
                      className="flex-1 py-3 px-4 bg-black text-white font-sans text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 rounded-full shadow-md"
                    >
                      <ShoppingBag size={14} />
                      <span>ADD TO BAG</span>
                    </button>
                  </div>

                </div>

              </div>

            </div>
          );
        })}

      </section>

      {/* Footer CTA */}
      <section className="bg-neutral-100 py-16 px-4 text-center border-t border-neutral-200 space-y-4">
        <h3 className="font-nike text-3xl sm:text-4xl font-black uppercase text-black">
          READY TO EXPLORE THE ENTIRE CATALOG?
        </h3>
        <p className="font-sans text-sm text-neutral-600 max-w-md mx-auto">
          Over 8 high-performance cap silhouettes engineered with Gore-Tex, Cordura, and heavyweight twills.
        </p>
        <button
          onClick={() => goToShop()}
          className="px-8 py-4 bg-black text-white font-sans text-sm font-bold uppercase tracking-wider rounded-full hover:bg-neutral-800 transition-colors inline-flex items-center gap-2"
        >
          <span>BROWSE ALL STYLES</span>
          <ArrowRight size={15} />
        </button>
      </section>

    </div>
  );
};
