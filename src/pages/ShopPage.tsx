import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/product/ProductCard';
import { FilterSidebar } from '../components/product/FilterSidebar';
import { FilterState } from '../types/product';
import { useNavigation } from '../context/NavigationContext';
import { SlidersHorizontal, X, ChevronDown, Search } from 'lucide-react';

export const ShopPage: React.FC = () => {
  const { shopCategoryFilter, searchQuery, setSearchQuery } = useNavigation();
  const { products } = useStore();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const initialFilters: FilterState = {
    category: shopCategoryFilter || 'ALL',
    materials: [],
    profiles: [],
    colors: [],
    sortBy: 'featured',
    inStockOnly: false,
  };

  const [filters, setFilters] = useState<FilterState>(initialFilters);

  // Sync external category navigation
  useEffect(() => {
    if (shopCategoryFilter) {
      setFilters((prev) => ({ ...prev, category: shopCategoryFilter }));
    }
  }, [shopCategoryFilter]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilters({
      category: 'ALL',
      materials: [],
      profiles: [],
      colors: [],
      sortBy: 'featured',
      inStockOnly: false,
    });
  };

  // Filter and sort computation
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesSku = product.sku.toLowerCase().includes(q);
        const matchesMat = product.material.toLowerCase().includes(q);
        const matchesCat = product.category.toLowerCase().includes(q);
        const matchesProfile = product.profile.toLowerCase().includes(q);
        if (!matchesName && !matchesSku && !matchesMat && !matchesCat && !matchesProfile) {
          return false;
        }
      }

      if (filters.category !== 'ALL' && product.category !== filters.category) {
        return false;
      }
      if (filters.materials.length > 0 && !filters.materials.includes(product.material)) {
        return false;
      }
      if (filters.profiles.length > 0 && !filters.profiles.includes(product.profile)) {
        return false;
      }
      if (filters.colors.length > 0) {
        const hasColor = product.colors.some((c) => filters.colors.includes(c.name));
        if (!hasColor) return false;
      }
      if (filters.inStockOnly && product.stockCount <= 0) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'price-asc') return a.price - b.price;
      if (filters.sortBy === 'price-desc') return b.price - a.price;
      if (filters.sortBy === 'newest') return (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0);
      return 0;
    });
  }, [products, filters, searchQuery]);


  return (
    <div className="w-full min-h-screen bg-white">
      
      {/* Top Banner (Nike style) */}
      <div className="bg-white border-b border-neutral-200 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-2">
          <div className="font-sans text-xs text-neutral-500 uppercase tracking-wider font-semibold flex items-center gap-2">
            <span>RAYLUXX</span>
            <span>/</span>
            <span>HEADWEAR</span>
            {filters.category !== 'ALL' && (
              <>
                <span>/</span>
                <span className="text-black font-bold">{filters.category}</span>
              </>
            )}
          </div>
          <h1 className="font-nike text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-black">
            {filters.category === 'ALL' ? 'ALL HEADWEAR CAPS' : `${filters.category} SERIES`} ({filteredProducts.length})
          </h1>
          <p className="font-sans text-sm text-neutral-600 max-w-2xl">
            Explore premium technical caps engineered for athletic performance and structural urban aesthetics.
          </p>
          {searchQuery.trim() && (
            <div className="pt-2 flex items-center gap-2">
              <span className="text-xs text-neutral-500 font-semibold uppercase">Search Query:</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-white text-xs font-bold rounded-full font-sans">
                <Search size={12} />
                <span>"{searchQuery}"</span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="hover:text-neutral-300 p-0.5 rounded-full"
                  title="Clear search"
                >
                  <X size={13} />
                </button>
              </span>
            </div>
          )}
        </div>
      </div>


      {/* Main Catalog View: Left Sidebar + 3-Column Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Sub-Header: Mobile Filter Toggle & Sort Selector */}
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-neutral-200">
          
          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden inline-flex items-center gap-2 px-4 py-2 border border-neutral-300 font-sans text-xs font-bold uppercase rounded-full hover:border-black"
          >
            <SlidersHorizontal size={14} />
            <span>Filters</span>
            <span className="text-neutral-500">({filteredProducts.length})</span>
          </button>

          {/* Desktop Count */}
          <div className="hidden lg:block font-sans text-sm text-neutral-500">
            Showing <strong className="text-black font-bold">{filteredProducts.length}</strong> Results
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 font-sans text-xs">
            <span className="text-neutral-500 uppercase hidden sm:inline-block font-medium">Sort By:</span>
            <div className="relative">
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                className="appearance-none bg-white border border-neutral-300 px-3.5 py-2 pr-8 text-xs font-sans font-semibold uppercase focus:outline-none focus:border-black cursor-pointer rounded-full"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest Releases</option>
                <option value="price-asc">Price: Low-High</option>
                <option value="price-desc">Price: High-Low</option>
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500" />
            </div>
          </div>

        </div>

        {/* 2-Column Main Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* LEFT FILTER SIDEBAR (Desktop) */}
          <div className="hidden lg:block lg:col-span-3 sticky top-28 bg-white pr-4">
            <FilterSidebar
              filters={filters}
              onFilterChange={setFilters}
              onResetFilters={handleResetFilters}
              totalMatches={filteredProducts.length}
            />
          </div>

          {/* RIGHT PRODUCT GRID: 3-COLUMN LAYOUT AS REQUIRED */}
          <div className="lg:col-span-9">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-24 border border-dashed border-neutral-300 p-8 space-y-4">
                <span className="font-sans text-xs text-neutral-400 font-bold uppercase tracking-wider block">
                  Zero Matching Caps
                </span>
                <h3 className="font-nike text-3xl font-black uppercase text-black">
                  NO RESULTS MATCH YOUR SELECTION
                </h3>
                <p className="font-sans text-sm text-neutral-500 max-w-sm mx-auto">
                  Try adjusting or clearing your filters to view more headwear.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-3 bg-black text-white font-sans text-xs font-bold uppercase tracking-wider rounded-full hover:bg-neutral-800 transition-colors"
                >
                  RESET ALL FILTERS
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Mobile Filters Slide-Over Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            onClick={() => setMobileFiltersOpen(false)}
            className="fixed inset-0 bg-black/60"
          />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full p-6 flex flex-col justify-between shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <span className="font-nike text-xl uppercase font-bold">
                FILTER PRODUCTS
              </span>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1 border border-neutral-200"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-6 flex-1">
              <FilterSidebar
                filters={filters}
                onFilterChange={setFilters}
                onResetFilters={handleResetFilters}
                totalMatches={filteredProducts.length}
              />
            </div>

            <div className="pt-4 border-t border-neutral-200">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full py-3.5 bg-black text-white font-sans text-xs uppercase font-bold rounded-full"
              >
                VIEW RESULTS ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
