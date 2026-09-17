import React from 'react';
import { HERO_PRODUCT } from '../data/products';
import { ProductCard } from '../components/product/ProductCard';
import { useNavigation } from '../context/NavigationContext';
import { useStore } from '../context/StoreContext';
import { ArrowRight, Shield, Compass, Sparkles, Camera } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { goToShop, goToProduct, goToLookbook } = useNavigation();
  const { products, heroConfig } = useStore();

  // 4-column New Arrivals (Nike layout)
  const newArrivals = products.filter((p) => p.newArrival).slice(0, 4);


  return (
    <div className="w-full bg-white">
      
      {/* 1. MONUMENTAL NIKE-INSPIRED HERO SECTION (DYNAMICALLY MANAGED FROM ADMIN) */}
      <section className="relative w-full min-h-[92vh] flex flex-col justify-between overflow-hidden bg-black text-white">
        
        {/* Background Editorial Streetwear Image with Vignette Scrim */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroConfig.imageUrl || "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=2400&q=85"}
            alt="RAYLUX Hero Banner Editorial"
            className="w-full h-full object-cover object-[center_28%] filter contrast-[1.12] brightness-[0.82] transition-all duration-700"
          />
          {/* Subtle Nike-style contrast vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/20"></div>
        </div>

        {/* Top Floating Badge & Caption */}
        <div className="relative z-10 p-6 sm:p-10 max-w-7xl mx-auto w-full flex justify-between items-start">
          {heroConfig.badgeActive ? (
            <div className="inline-flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-full text-white">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              <span className="font-sans text-xs font-bold uppercase tracking-wider">
                {heroConfig.badgeText}
              </span>
            </div>
          ) : <div />}

          {(heroConfig.topRightCaptionLine1 || heroConfig.topRightCaptionLine2) && (
            <div className="hidden sm:block font-sans text-xs text-white/80 font-medium tracking-wide text-right">
              {heroConfig.topRightCaptionLine1}
              <br />
              <strong className="text-white">{heroConfig.topRightCaptionLine2}</strong>
            </div>
          )}
        </div>

        {/* Bottom: Nike Monumental Typography & Directives */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-32 flex flex-col justify-end">
          
          {/* Giant Nike-Style Display Title */}
          <div className="overflow-hidden select-none mb-3">
            {heroConfig.superTitle && (
              <span className="font-sans text-xs sm:text-sm font-extrabold uppercase tracking-widest text-white/80 block mb-2">
                {heroConfig.superTitle}
              </span>
            )}
            <h1 className="font-nike text-6xl sm:text-8xl lg:text-[11rem] font-black uppercase tracking-tighter leading-[0.86] text-white">
              {heroConfig.mainTitle || 'ENGINEERED TO LEAD'}
            </h1>
          </div>

          {/* Sub-Manifesto & Pill CTAs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end pt-4 border-t border-white/20">
            <div className="lg:col-span-8 space-y-2">
              <p className="font-sans text-base sm:text-xl text-white/95 max-w-2xl font-normal leading-relaxed">
                {heroConfig.description}
              </p>
            </div>

            {/* Nike Pill Action Buttons */}
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
              <button
                onClick={() => heroConfig.primaryBtnAction === 'lookbook' ? goToLookbook() : goToShop()}
                className="w-full py-4 px-8 bg-white text-black font-sans text-sm font-bold uppercase tracking-wider rounded-full hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 group shadow-xl cursor-pointer"
              >
                <span>{heroConfig.primaryBtnText || 'SHOP THE COLLECTION'}</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>

              {heroConfig.secondaryBtnActive && (
                <button
                  onClick={() => heroConfig.secondaryBtnAction === 'shop' ? goToShop() : goToLookbook()}
                  className="w-full py-4 px-8 bg-transparent border border-white text-white font-sans text-sm font-bold uppercase tracking-wider rounded-full hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Camera size={16} />
                  <span>{heroConfig.secondaryBtnText || 'VIEW 2026 LOOKBOOK'}</span>
                </button>
              )}
            </div>
          </div>

        </div>

      </section>

      {/* 2. NIKE ANNOUNCEMENT TICKER */}
      <div className="w-full bg-neutral-950 text-white py-3 overflow-hidden select-none border-y border-neutral-800">
        <div className="flex whitespace-nowrap animate-marquee font-sans text-xs font-semibold uppercase tracking-widest text-neutral-400 gap-10">
          <span className="text-white">GORE-TEX 3L MEMBRANE</span>
          <span>•</span>
          <span>LASER-PERFORATED AERODYNAMIC VENTS</span>
          <span>•</span>
          <span>340 GSM HIGH-DENSITY HEAVY TWILL</span>
          <span>•</span>
          <span>CORDURA® 500D MIL-SPEC WEAVE</span>
          <span>•</span>
          <span>COMPLIMENTARY EXPRESS DISPATCH OVER $150</span>
          <span>•</span>
          <span>AUTHENTICATED SAME-DAY DISPATCH</span>
        </div>
      </div>

      {/* 3. CORE REQUIREMENT: "NEW ARRIVALS" 4-COLUMN PRODUCT GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-neutral-200 gap-4">
          <div className="space-y-1">
            <span className="font-sans text-xs font-bold text-neutral-500 uppercase tracking-wider block">
              THE LATEST DROPS
            </span>
            <h2 className="font-nike text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight uppercase text-black">
              NEW ARRIVALS
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => goToShop()}
              className="inline-flex items-center gap-2 font-sans text-sm uppercase font-bold text-black hover:text-neutral-500 transition-colors"
            >
              <span>EXPLORE ALL ({products.length})</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* 4-Column Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

      </section>

      {/* 4. NIKE STYLE EDITORIAL MANIFESTO SPLIT BANNER */}
      <section className="w-full bg-neutral-100 border-y border-neutral-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 items-center">
          
          {/* Left Column: Studio Photo */}
          <div className="lg:col-span-6 relative aspect-square lg:aspect-[4/3] overflow-hidden bg-neutral-200">
            <img
              src="https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?auto=format&fit=crop&w=1200&q=80"
              alt="RAYLUX Technical Cap Construction"
              className="w-full h-full object-cover object-center filter contrast-105"
            />
            <div className="absolute bottom-6 left-6 bg-black text-white p-4 font-sans text-xs space-y-1">
              <span className="text-[10px] text-neutral-400 uppercase font-bold block">TEXTILE SPECIFICATION</span>
              <p className="font-nike text-lg font-bold uppercase">CORDURA® 500D + GORE-TEX HYBRID</p>
              <p className="text-neutral-400 font-mono text-[11px]">28,000MM HYDROSTATIC HEAD</p>
            </div>
          </div>

          {/* Right Column: Narrative */}
          <div className="lg:col-span-6 p-8 sm:p-14 lg:p-20 space-y-8">
            <div className="space-y-4">
              <span className="font-sans text-xs font-bold uppercase text-neutral-500 tracking-wider block">
                PHILOSOPHY OF PERFORMANCE
              </span>
              <h2 className="font-nike text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-black leading-none">
                DISCIPLINED FORM. ZERO COMPROMISE.
              </h2>
              <p className="font-sans text-base text-neutral-700 leading-relaxed">
                Traditional headwear relies on decorative crests, fragile crowns, and cheap synthetics. RAYLUX discards ornament in favor of architectural purity. Engineered for endurance athletes, architects, and urban commuters who demand relentless quality.
              </p>
            </div>

            {/* 3 Value Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-neutral-300 font-sans text-xs">
              <div className="space-y-1">
                <Shield size={20} className="text-black mb-1" />
                <h4 className="font-bold text-black uppercase text-sm">STORM PROOF</h4>
                <p className="text-neutral-600 leading-normal">
                  Seam-sealed tape blocks high-velocity precipitation.
                </p>
              </div>
              <div className="space-y-1">
                <Compass size={20} className="text-black mb-1" />
                <h4 className="font-bold text-black uppercase text-sm">CRANIAL FIT</h4>
                <p className="text-neutral-600 leading-normal">
                  360-degree balanced contouring for zero pressure points.
                </p>
              </div>
              <div className="space-y-1">
                <Sparkles size={20} className="text-black mb-1" />
                <h4 className="font-bold text-black uppercase text-sm">TACTILE TWILL</h4>
                <p className="text-neutral-600 leading-normal">
                  Heavy 340 GSM weave for permanent structured crown posture.
                </p>
              </div>
            </div>

            <button
              onClick={() => goToProduct(HERO_PRODUCT.id)}
              className="px-8 py-4 bg-black text-white font-sans text-sm font-bold uppercase tracking-wider rounded-full hover:bg-neutral-800 transition-colors inline-flex items-center gap-2"
            >
              <span>EXPLORE MONOLITH 01</span>
              <ArrowRight size={15} />
            </button>
          </div>

        </div>
      </section>

      {/* 5. CURATED SERIES / NIKE CATEGORY SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="mb-12 pb-6 border-b border-neutral-200">
          <span className="font-sans text-xs font-bold text-neutral-500 uppercase tracking-wider block">
            SHOP BY DIVISION
          </span>
          <h2 className="font-nike text-4xl sm:text-5xl font-black uppercase text-black tracking-tight">
            CURATED PILLARS
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Pillar 1 */}
          <div
            onClick={() => goToShop('STRUCTURED')}
            className="group cursor-pointer space-y-4"
          >
            <div className="aspect-[4/3] bg-neutral-100 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80"
                alt="Monolith 6-Panel"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute bottom-4 left-4 bg-white/95 text-black font-sans text-xs font-bold px-3 py-1 uppercase">
                Series 01
              </span>
            </div>
            <div>
              <h3 className="font-nike text-2xl font-bold uppercase text-black group-hover:underline">
                MONOLITH 6-PANEL
              </h3>
              <p className="font-sans text-sm text-neutral-500">
                High-crown structured caps in 340 GSM heavy twill.
              </p>
            </div>
          </div>

          {/* Pillar 2 */}
          <div
            onClick={() => goToShop('TECHNICAL')}
            className="group cursor-pointer space-y-4"
          >
            <div className="aspect-[4/3] bg-neutral-100 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?auto=format&fit=crop&w=800&q=80"
                alt="GORE-TEX Runner"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute bottom-4 left-4 bg-white/95 text-black font-sans text-xs font-bold px-3 py-1 uppercase">
                Series 02
              </span>
            </div>
            <div>
              <h3 className="font-nike text-2xl font-bold uppercase text-black group-hover:underline">
                GORE-TEX 3L RUNNER
              </h3>
              <p className="font-sans text-sm text-neutral-500">
                Waterproof alpine caps with laser-perforated lateral vents.
              </p>
            </div>
          </div>

          {/* Pillar 3 */}
          <div
            onClick={() => goToShop('CAMP_CAP')}
            className="group cursor-pointer space-y-4"
          >
            <div className="aspect-[4/3] bg-neutral-100 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1534215754734-18e55d13e346?auto=format&fit=crop&w=800&q=80"
                alt="Cordura Camp Cap"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute bottom-4 left-4 bg-white/95 text-black font-sans text-xs font-bold px-3 py-1 uppercase">
                Series 03
              </span>
            </div>
            <div>
              <h3 className="font-nike text-2xl font-bold uppercase text-black group-hover:underline">
                CORDURA® 500D CAMP
              </h3>
              <p className="font-sans text-sm text-neutral-500">
                Low-profile 5-panel built from Mil-Spec ballistic nylon.
              </p>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};
