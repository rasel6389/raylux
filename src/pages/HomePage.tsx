import React, { useState } from 'react';
import { HERO_PRODUCT } from '../data/products';
import { ProductCard } from '../components/product/ProductCard';
import { useNavigation } from '../context/NavigationContext';
import { useStore } from '../context/StoreContext';
import {
  ArrowRight,
  Shield,
  Compass,
  Sparkles,
  Camera,
  Star,
  Mail,
  Check,
} from 'lucide-react';
import { HeroBlockType } from '../types/product';

export const HomePage: React.FC = () => {
  const { goToShop, goToProduct, goToLookbook } = useNavigation();
  const { products, heroConfig, editorialConfig, tickerConfig, pageSections } = useStore();

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  // Height class mapping
  const heightClass =
    heroConfig.heightMode === '100vh'
      ? 'min-h-screen'
      : heroConfig.heightMode === '80vh'
      ? 'min-h-[80vh]'
      : 'min-h-[92vh]';

  // Title size class mapping
  const titleSizeClass =
    heroConfig.titleSize === 'standard'
      ? 'text-4xl sm:text-6xl lg:text-7xl'
      : heroConfig.titleSize === 'massive'
      ? 'text-5xl sm:text-7xl lg:text-9xl'
      : 'text-6xl sm:text-8xl lg:text-[11rem]';

  // Alignment classes
  const isCenter = heroConfig.contentAlignment === 'center';
  const isRight = heroConfig.contentAlignment === 'right';
  const alignClass = isCenter ? 'text-center items-center' : isRight ? 'text-right items-end' : 'text-left items-start';

  // Primary button style
  const primaryBtnClass =
    heroConfig.primaryBtnStyle === 'black'
      ? 'bg-black text-white hover:bg-neutral-800 border border-white/40'
      : heroConfig.primaryBtnStyle === 'outline'
      ? 'bg-transparent text-white border-2 border-white hover:bg-white hover:text-black'
      : 'bg-white text-black hover:bg-neutral-200';

  // Secondary button style
  const secondaryBtnClass =
    heroConfig.secondaryBtnStyle === 'ghost'
      ? 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border border-white/20'
      : heroConfig.secondaryBtnStyle === 'glass'
      ? 'bg-black/50 backdrop-blur-md text-white hover:bg-black/70 border border-white/30'
      : 'bg-transparent border border-white text-white hover:bg-white hover:text-black';

  const isSplitLayout = heroConfig.layoutStyle === 'split-editorial';
  const isCenterLayout = heroConfig.layoutStyle === 'center-impact';
  const isBrutalist = heroConfig.layoutStyle === 'minimal-brutalist';

  const blockOrder: HeroBlockType[] = heroConfig.blockOrder || [
    'badge',
    'super_title',
    'headline',
    'description',
    'buttons',
  ];

  // Helper to render individual hero block
  const renderHeroBlock = (blockType: HeroBlockType) => {
    switch (blockType) {
      case 'badge':
        return heroConfig.badgeActive ? (
          <div key="badge" className="inline-flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-full text-white w-fit">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            <span className="font-sans text-xs font-bold uppercase tracking-wider">
              {heroConfig.badgeText}
            </span>
          </div>
        ) : null;

      case 'super_title':
        return heroConfig.superTitle ? (
          <span key="super_title" className="font-sans text-xs sm:text-sm font-extrabold uppercase tracking-widest text-neutral-300 block">
            {heroConfig.superTitle}
          </span>
        ) : null;

      case 'headline':
        return (
          <h1 key="headline" className={`font-nike ${titleSizeClass} font-black uppercase tracking-tighter leading-[0.88] text-white`}>
            {heroConfig.mainTitle || 'ENGINEERED TO LEAD'}
          </h1>
        );

      case 'description':
        return heroConfig.description ? (
          <p key="description" className="font-sans text-base sm:text-lg text-neutral-200 max-w-xl font-normal leading-relaxed">
            {heroConfig.description}
          </p>
        ) : null;

      case 'buttons':
        return (
          <div key="buttons" className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => heroConfig.primaryBtnAction === 'lookbook' ? goToLookbook() : goToShop()}
              className={`py-4 px-8 font-sans text-sm font-bold uppercase tracking-wider rounded-full transition-all flex items-center justify-center gap-2 group shadow-xl cursor-pointer ${primaryBtnClass}`}
            >
              <span>{heroConfig.primaryBtnText || 'SHOP THE COLLECTION'}</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            {heroConfig.secondaryBtnActive && (
              <button
                onClick={() => heroConfig.secondaryBtnAction === 'shop' ? goToShop() : goToLookbook()}
                className={`py-4 px-8 font-sans text-sm font-bold uppercase tracking-wider rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer ${secondaryBtnClass}`}
              >
                <Camera size={16} />
                <span>{heroConfig.secondaryBtnText || 'VIEW 2026 LOOKBOOK'}</span>
              </button>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // 1. HERO SECTION
  const renderHeroSection = () => (
    <section className={`relative w-full ${heightClass} flex flex-col justify-between overflow-hidden bg-black text-white ${isBrutalist ? 'border-b-4 border-black' : ''}`}>
      {/* Background Editorial Streetwear Image with Vignette Scrim */}
      {!isSplitLayout && (
        <div className="absolute inset-0 z-0">
          <img
            src={heroConfig.imageUrl || "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=2400&q=85"}
            alt="RAYLUXX Hero Banner Editorial"
            className="w-full h-full object-cover object-[center_28%] filter contrast-[1.12] brightness-[0.82] transition-all duration-700"
          />
          {/* Dark overlay slider tint */}
          <div
            className="absolute inset-0 transition-opacity duration-500"
            style={{ backgroundColor: `rgba(0, 0, 0, ${(heroConfig.overlayDarkness ?? 40) / 100})` }}
          />
          {/* Subtle Nike-style contrast vignette */}
          {heroConfig.overlayGradient !== false && (
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/20" />
          )}
        </div>
      )}

      {/* Top Floating Badge & Caption */}
      <div className={`relative z-10 p-6 sm:p-10 max-w-7xl mx-auto w-full flex ${isCenter ? 'justify-center' : 'justify-between'} items-start`}>
        {heroConfig.badgeActive ? (
          <div className="inline-flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-full text-white">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            <span className="font-sans text-xs font-bold uppercase tracking-wider">
              {heroConfig.badgeText}
            </span>
          </div>
        ) : <div />}

        {!isCenter && (heroConfig.topRightCaptionLine1 || heroConfig.topRightCaptionLine2) && (
          <div className="hidden sm:block font-sans text-xs text-white/80 font-medium tracking-wide text-right">
            {heroConfig.topRightCaptionLine1}
            <br />
            <strong className="text-white">{heroConfig.topRightCaptionLine2}</strong>
          </div>
        )}
      </div>

      {/* Split Layout Mode */}
      {isSplitLayout ? (
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center flex-1">
          <div className="lg:col-span-7 space-y-6">
            {blockOrder.map((type) => renderHeroBlock(type))}
          </div>
          <div className="lg:col-span-5 relative aspect-square sm:aspect-[4/5] rounded-3xl overflow-hidden border border-white/20 shadow-2xl">
            <img
              src={heroConfig.imageUrl || "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=2400&q=85"}
              alt="RAYLUXX Hero Split"
              className="w-full h-full object-cover filter contrast-[1.1] brightness-[0.9]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          </div>
        </div>
      ) : (
        /* Monumental / Center / Brutalist Layout */
        <div className={`relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-24 flex flex-col justify-end ${alignClass}`}>
          <div className={`overflow-hidden select-none mb-3 space-y-3 ${isCenter || isCenterLayout ? 'text-center mx-auto' : ''}`}>
            {blockOrder.filter((t) => t === 'super_title' || t === 'headline').map((type) => renderHeroBlock(type))}
          </div>

          {/* Sub-Manifesto & CTAs */}
          <div className={`w-full grid grid-cols-1 ${isCenter || isCenterLayout ? 'place-items-center text-center' : 'lg:grid-cols-12 items-end'} gap-8 pt-4 border-t border-white/20`}>
            <div className={`${isCenter || isCenterLayout ? 'max-w-2xl mx-auto text-center' : 'lg:col-span-8'} space-y-2`}>
              {blockOrder.filter((t) => t === 'description').map((type) => renderHeroBlock(type))}
            </div>

            {/* Action Buttons */}
            <div className={`${isCenter || isCenterLayout ? 'flex flex-row justify-center' : 'lg:col-span-4 flex flex-col sm:flex-row lg:flex-col'} gap-3 w-full sm:w-auto`}>
              {blockOrder.filter((t) => t === 'buttons').map((type) => renderHeroBlock(type))}
            </div>
          </div>
        </div>
      )}
    </section>
  );

  // 2. SCROLLING MARQUEE TICKER
  const renderTickerSection = () => (
    <div className="w-full bg-neutral-950 text-white py-3 overflow-hidden select-none border-y border-neutral-800">
      <div className="flex whitespace-nowrap animate-marquee font-sans text-xs font-semibold uppercase tracking-widest text-neutral-400 gap-10">
        {tickerConfig?.items && tickerConfig.items.length > 0 ? (
          tickerConfig.items.map((item, idx) => (
            <React.Fragment key={idx}>
              <span className={idx === 0 ? "text-white" : ""}>{item}</span>
              <span>•</span>
            </React.Fragment>
          ))
        ) : (
          <>
            <span className="text-white">GORE-TEX 3L MEMBRANE</span>
            <span>•</span>
            <span>LASER-PERFORATED AERODYNAMIC VENTS</span>
            <span>•</span>
            <span>340 GSM HIGH-DENSITY HEAVY TWILL</span>
            <span>•</span>
            <span>CORDURA® 500D MIL-SPEC WEAVE</span>
          </>
        )}
      </div>
    </div>
  );

  // 3. PRODUCT CATALOG GRID
  const renderProductsGrid = (settings?: Record<string, any>) => {
    const count = settings?.productCount || 4;
    const superTitle = settings?.superTitle || 'THE LATEST DROPS';
    const title = settings?.title || 'NEW ARRIVALS';
    const showExploreAll = settings?.showExploreAll !== false;
    const gridProducts = products.filter((p) => p.newArrival).slice(0, count);

    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-neutral-200 gap-4">
          <div className="space-y-1">
            <span className="font-sans text-xs font-bold text-neutral-500 uppercase tracking-wider block">
              {superTitle}
            </span>
            <h2 className="font-nike text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight uppercase text-black">
              {title}
            </h2>
          </div>

          {showExploreAll && (
            <div className="flex items-center gap-4">
              <button
                onClick={() => goToShop()}
                className="inline-flex items-center gap-2 font-sans text-sm uppercase font-bold text-black hover:text-neutral-500 transition-colors cursor-pointer"
              >
                <span>EXPLORE ALL ({products.length})</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${Math.min(count, 4)} gap-8`}>
          {gridProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    );
  };

  // 4. EDITORIAL PHILOSOPHY SPLIT
  const renderEditorialSection = () => (
    <section className="w-full bg-neutral-100 border-y border-neutral-200">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 items-center">
        {/* Left Column: Studio Photo */}
        <div className="lg:col-span-6 relative aspect-square lg:aspect-[4/3] overflow-hidden bg-neutral-200">
          <img
            src={editorialConfig?.imageUrl || "https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?auto=format&fit=crop&w=1200&q=80"}
            alt="RAYLUXX Technical Cap Construction"
            className="w-full h-full object-cover object-center filter contrast-105"
          />
          <div className="absolute bottom-6 left-6 bg-black text-white p-4 font-sans text-xs space-y-1">
            <span className="text-[10px] text-neutral-400 uppercase font-bold block">
              {editorialConfig?.specBadgeTag || 'TEXTILE SPECIFICATION'}
            </span>
            <p className="font-nike text-lg font-bold uppercase">
              {editorialConfig?.specBadgeTitle || 'CORDURA® 500D + GORE-TEX HYBRID'}
            </p>
            <p className="text-neutral-400 font-mono text-[11px]">
              {editorialConfig?.specBadgeSub || '28,000MM HYDROSTATIC HEAD'}
            </p>
          </div>
        </div>

        {/* Right Column: Narrative */}
        <div className="lg:col-span-6 p-8 sm:p-14 lg:p-20 space-y-8">
          <div className="space-y-4">
            <span className="font-sans text-xs font-bold uppercase text-neutral-500 tracking-wider block">
              {editorialConfig?.superTitle || 'PHILOSOPHY OF PERFORMANCE'}
            </span>
            <h2 className="font-nike text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-black leading-none">
              {editorialConfig?.title || 'DISCIPLINED FORM. ZERO COMPROMISE.'}
            </h2>
            <p className="font-sans text-base text-neutral-700 leading-relaxed">
              {editorialConfig?.description || 'Traditional headwear relies on decorative crests, fragile crowns, and cheap synthetics. RAYLUXX discards ornament in favor of architectural purity. Engineered for endurance athletes, architects, and urban commuters who demand relentless quality.'}
            </p>
          </div>

          {/* 3 Value Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-neutral-300 font-sans text-xs">
            <div className="space-y-1">
              <Shield size={20} className="text-black mb-1" />
              <h4 className="font-bold text-black uppercase text-sm">
                {editorialConfig?.pillar1Title || 'STORM PROOF'}
              </h4>
              <p className="text-neutral-600 leading-normal">
                {editorialConfig?.pillar1Desc || 'Seam-sealed tape blocks high-velocity precipitation.'}
              </p>
            </div>
            <div className="space-y-1">
              <Compass size={20} className="text-black mb-1" />
              <h4 className="font-bold text-black uppercase text-sm">
                {editorialConfig?.pillar2Title || 'CRANIAL FIT'}
              </h4>
              <p className="text-neutral-600 leading-normal">
                {editorialConfig?.pillar2Desc || '360-degree balanced contouring for zero pressure points.'}
              </p>
            </div>
            <div className="space-y-1">
              <Sparkles size={20} className="text-black mb-1" />
              <h4 className="font-bold text-black uppercase text-sm">
                {editorialConfig?.pillar3Title || 'TACTILE TWILL'}
              </h4>
              <p className="text-neutral-600 leading-normal">
                {editorialConfig?.pillar3Desc || 'Heavy 340 GSM weave for permanent structured crown posture.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => goToProduct(HERO_PRODUCT.id)}
            className="px-8 py-4 bg-black text-white font-sans text-sm font-bold uppercase tracking-wider rounded-full hover:bg-neutral-800 transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <span>EXPLORE MONOLITH 01</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </section>
  );

  // 5. CURATED PILLARS SPOTLIGHT
  const renderSpotlightSection = (settings?: Record<string, any>) => (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
      <div className="mb-12 pb-6 border-b border-neutral-200">
        <span className="font-sans text-xs font-bold text-neutral-500 uppercase tracking-wider block">
          {settings?.superTitle || 'SHOP BY DIVISION'}
        </span>
        <h2 className="font-nike text-4xl sm:text-5xl font-black uppercase text-black tracking-tight">
          {settings?.title || 'CURATED PILLARS'}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div onClick={() => goToShop('STRUCTURED')} className="group cursor-pointer space-y-4">
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

        <div onClick={() => goToShop('TECHNICAL')} className="group cursor-pointer space-y-4">
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

        <div onClick={() => goToShop('CAMP_CAP')} className="group cursor-pointer space-y-4">
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
  );

  // 6. LOOKBOOK SHOWCASE BANNER
  const renderLookbookSection = (settings?: Record<string, any>) => (
    <section className="relative w-full min-h-[70vh] flex items-center bg-black text-white overflow-hidden my-12">
      <div className="absolute inset-0 z-0">
        <img
          src={settings?.imageUrl || "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1600&q=85"}
          alt="RAYLUXX Lookbook Banner"
          className="w-full h-full object-cover object-center opacity-65 filter contrast-110"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white">
            <Camera size={14} />
            <span>{settings?.tag || 'ARCHITECTURAL EDITORIAL // 2026'}</span>
          </div>
          <h2 className="font-nike text-5xl sm:text-7xl font-black uppercase tracking-tight text-white leading-none">
            {settings?.title || 'MONOLITH FIELD STUDY'}
          </h2>
          <p className="font-sans text-base sm:text-lg text-neutral-300 leading-relaxed font-normal">
            {settings?.subtitle || 'Engineered for high-altitude brutalist topography and extreme precipitation endurance. Tested through 12 alpine storm fronts.'}
          </p>
          <button
            onClick={() => goToLookbook()}
            className="py-4 px-8 bg-white text-black font-sans text-sm font-bold uppercase tracking-wider rounded-full hover:bg-neutral-200 transition-all inline-flex items-center gap-2 cursor-pointer shadow-2xl"
          >
            <span>{settings?.buttonText || 'EXPLORE FULL LOOKBOOK'}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );

  // 7. CLIENT TESTIMONIALS & PRESS
  const renderTestimonialsSection = (settings?: Record<string, any>) => (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 border-t border-neutral-200">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
        <span className="font-sans text-xs font-bold text-neutral-500 uppercase tracking-widest block">
          {settings?.superTitle || 'VERIFIED DISPATCH CLIENTS'}
        </span>
        <h2 className="font-nike text-4xl sm:text-5xl font-black uppercase text-black tracking-tight">
          {settings?.title || 'TESTED IN EXTREMES'}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            quote: 'The GORE-TEX 3L runner is unmatched. I wore it during an ultra in Snowdonia with relentless downpours; zero leakage and perfect crown breathability.',
            author: 'Kaelen Vance',
            role: 'Endurance Runner • London',
            stars: 5,
          },
          {
            quote: 'As an architect, structural posture matters to me. The 340 GSM heavy twill holds its monumental shape even after 6 months of daily wear.',
            author: 'Kenji Takahashi',
            role: 'Architectural Principal • Tokyo',
            stars: 5,
          },
          {
            quote: 'Clean brutalist aesthetic stripped of all annoying plastic snaps and logos. Just pure, military-grade textile perfection.',
            author: 'Elena Rostova',
            role: 'Industrial Designer • Berlin',
            stars: 5,
          },
        ].map((item, idx) => (
          <div key={idx} className="p-8 bg-neutral-50 border border-neutral-200 rounded-2xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex gap-1 text-amber-500">
                {Array.from({ length: item.stars }).map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              <p className="font-sans text-sm text-neutral-700 leading-relaxed italic">
                "{item.quote}"
              </p>
            </div>
            <div className="pt-4 border-t border-neutral-200">
              <p className="font-nike font-bold uppercase text-black text-sm">{item.author}</p>
              <p className="font-sans text-xs text-neutral-500">{item.role}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  // 8. VIP VAULT DISPATCH / NEWSLETTER
  const renderNewsletterSection = (settings?: Record<string, any>) => (
    <section className="w-full bg-neutral-950 text-white py-20 border-t border-neutral-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <span className="font-sans text-xs font-bold text-neutral-400 uppercase tracking-widest block">
          {settings?.superTitle || 'EXCLUSIVE ACCESS'}
        </span>
        <h2 className="font-nike text-4xl sm:text-6xl font-black uppercase text-white tracking-tight leading-none">
          {settings?.title || 'JOIN THE RAYLUXX GUILD'}
        </h2>
        <p className="font-sans text-base text-neutral-400 max-w-xl mx-auto font-normal">
          {settings?.subtitle || 'Receive priority allocation notices 48 hours prior to public drops. Complimentary international shipping on your initial order.'}
        </p>

        {newsletterSubmitted ? (
          <div className="inline-flex items-center gap-2 bg-emerald-950/80 border border-emerald-600/40 text-emerald-300 px-6 py-4 rounded-full text-sm font-bold">
            <Check size={18} />
            <span>VIP ALLOCATION CONFIRMED • WELCOME TO RAYLUXX</span>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newsletterEmail) setNewsletterSubmitted(true);
            }}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2"
          >
            <div className="relative flex-1">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="email"
                required
                placeholder="Enter client email..."
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-4 rounded-full bg-neutral-900 border border-neutral-700 text-white text-xs font-sans placeholder-neutral-500 focus:outline-none focus:border-white"
              />
            </div>
            <button
              type="submit"
              className="py-4 px-8 bg-white text-black font-sans text-xs font-bold uppercase tracking-wider rounded-full hover:bg-neutral-200 transition-colors whitespace-nowrap cursor-pointer shadow-lg"
            >
              REQUEST ALLOCATION
            </button>
          </form>
        )}
      </div>
    </section>
  );

  // 9. CUSTOM PROMOTION BANNER
  const renderCustomBannerSection = (settings?: Record<string, any>) => (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-16">
      <div className="p-8 sm:p-14 bg-black text-white rounded-3xl border border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 max-w-xl">
          <span className="font-sans text-xs font-bold uppercase tracking-widest text-neutral-400 block">
            {settings?.superTitle || 'LIMITED ALLOCATION'}
          </span>
          <h3 className="font-nike text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-none">
            {settings?.title || 'GLOBAL COLD-CLIMATE ARCHIVE'}
          </h3>
          <p className="font-sans text-sm text-neutral-400">
            {settings?.subtitle || 'Bonded 3-layer seams rated for sub-zero wind chills. Hand-inspected in London.'}
          </p>
        </div>
        <button
          onClick={() => goToShop()}
          className="py-4 px-8 bg-white text-black font-sans text-sm font-bold uppercase tracking-wider rounded-full hover:bg-neutral-200 transition-colors cursor-pointer shrink-0"
        >
          {settings?.buttonText || 'DISCOVER ARCHIVE'}
        </button>
      </div>
    </section>
  );

  return (
    <div className="w-full bg-white">
      {pageSections && pageSections.length > 0 ? (
        pageSections.map((section) => {
          if (!section.active) return null;
          switch (section.type) {
            case 'hero':
              return <React.Fragment key={section.id}>{renderHeroSection()}</React.Fragment>;
            case 'ticker':
              return <React.Fragment key={section.id}>{renderTickerSection()}</React.Fragment>;
            case 'products_grid':
              return <React.Fragment key={section.id}>{renderProductsGrid(section.settings)}</React.Fragment>;
            case 'editorial_split':
              return <React.Fragment key={section.id}>{renderEditorialSection()}</React.Fragment>;
            case 'category_spotlight':
              return <React.Fragment key={section.id}>{renderSpotlightSection(section.settings)}</React.Fragment>;
            case 'lookbook_showcase':
              return <React.Fragment key={section.id}>{renderLookbookSection(section.settings)}</React.Fragment>;
            case 'testimonials':
              return <React.Fragment key={section.id}>{renderTestimonialsSection(section.settings)}</React.Fragment>;
            case 'newsletter':
              return <React.Fragment key={section.id}>{renderNewsletterSection(section.settings)}</React.Fragment>;
            case 'custom_banner':
              return <React.Fragment key={section.id}>{renderCustomBannerSection(section.settings)}</React.Fragment>;
            default:
              return null;
          }
        })
      ) : (
        /* Fallback if no sections list */
        <>
          {renderHeroSection()}
          {renderTickerSection()}
          {renderProductsGrid()}
          {renderEditorialSection()}
          {renderSpotlightSection()}
        </>
      )}
    </div>
  );
};
