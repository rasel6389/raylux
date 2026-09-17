import React, { useState } from 'react';
import { Product } from '../../types/product';
import { useCart } from '../../context/CartContext';
import { useNavigation } from '../../context/NavigationContext';
import { useStore } from '../../context/StoreContext';
import { useCurrency } from '../../context/CurrencyContext';
import { Plus, Check, Heart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, className = '' }) => {
  const { addToCart } = useCart();
  const { goToProduct } = useNavigation();
  const { toggleWishlist, isInWishlist } = useStore();
  const { formatPrice } = useCurrency();
  const [isHovered, setIsHovered] = useState(false);
  const [selectedQuickSize, setSelectedQuickSize] = useState<string>(product.sizes[0] || 'ONE SIZE');
  const [addedAnimation, setAddedAnimation] = useState(false);

  const favorited = isInWishlist(product.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleQuickAdd = (e: React.MouseEvent, size: string) => {
    e.stopPropagation();
    setSelectedQuickSize(size);
    addToCart(product, size, product.colors[0]?.name || 'Standard');
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const handleCardClick = () => {
    goToProduct(product.id);
  };

  const primaryImage = product.images[0];
  const secondaryImage = product.images[1] || product.images[0];

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group cursor-pointer bg-white flex flex-col relative transition-all duration-200 ${className}`}
    >
      {/* 1. PRODUCT PHOTO CANVAS */}
      <div className="relative w-full aspect-square bg-[#f5f5f5] overflow-hidden mb-3">
        
        {/* Nike Style Corner Badge */}
        {product.badge && (
          <div className="absolute top-3 left-3 z-10">
            <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-black bg-white/90 px-2.5 py-1">
              {product.badge === 'NEW DROP' ? 'JUST IN' : product.badge}
            </span>
          </div>
        )}

        {/* Favorite Heart Button */}
        <button
          onClick={handleFavoriteClick}
          aria-label={favorited ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-3 right-3 z-10 p-1.5 rounded-full transition-all duration-200 ${
            favorited
              ? 'bg-red-50 text-red-600 shadow'
              : 'bg-white/80 hover:bg-white text-neutral-500 hover:text-black opacity-0 group-hover:opacity-100'
          }`}
        >
          <Heart size={16} className={favorited ? 'fill-red-600 text-red-600' : ''} />
        </button>

        {/* Product Imagery */}
        <img
          src={isHovered ? secondaryImage : primaryImage}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
        />


        {/* Quick Add Desktop Hover Drawer */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-white/95 backdrop-blur-sm border-t border-neutral-200 translate-y-full group-hover:translate-y-0 transition-transform duration-200 hidden md:block">
          <div className="flex items-center justify-between text-[11px] font-sans font-medium text-neutral-500 mb-2">
            <span className="uppercase">Quick Add Size</span>
            <span className="font-mono text-[10px]">{product.specs.weightGsm}</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {product.sizes.slice(0, 3).map((size) => (
              <button
                key={size}
                onClick={(e) => handleQuickAdd(e, size)}
                className="py-2 px-1 bg-white border border-neutral-300 text-black text-xs font-sans font-semibold uppercase hover:bg-black hover:text-white hover:border-black transition-colors text-center truncate"
              >
                {size.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* 2. NIKE STYLE PRODUCT HIERARCHY */}
      <div className="flex-1 flex flex-col justify-between space-y-1">
        
        {/* Status indicator line */}
        <div className="text-[12px] font-sans font-bold text-[#b85d19] uppercase tracking-wide">
          {product.featured ? "Best Seller" : product.newArrival ? "Just In" : "Member Product"}
        </div>

        {/* Product Title in bold condensed Nike font */}
        <h3 className="font-nike text-lg sm:text-xl font-bold uppercase text-black leading-tight tracking-tight group-hover:text-neutral-600 transition-colors">
          {product.name}
        </h3>

        {/* Subtitle / Category */}
        <p className="font-sans text-sm text-neutral-500 font-normal">
          {product.profile} • {product.material}
        </p>

        {/* Color count */}
        <p className="font-sans text-xs text-neutral-500 font-medium">
          {product.colors.length} {product.colors.length === 1 ? 'Colour' : 'Colours'}
        </p>

        {/* Price display & mobile add trigger */}
        <div className="pt-2 flex items-center justify-between">
          <div className="font-sans text-base font-semibold text-black">
            {formatPrice(product.price)}
          </div>

          <button
            onClick={(e) => handleQuickAdd(e, selectedQuickSize)}
            aria-label={`Quick add ${product.name}`}
            className="md:hidden p-2 bg-black text-white hover:bg-neutral-800 transition-colors rounded-full"
          >
            {addedAnimation ? <Check size={14} /> : <Plus size={14} />}
          </button>
        </div>

      </div>
    </div>
  );
};
