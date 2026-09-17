import React from 'react';
import { useCart } from '../../context/CartContext';
import { useNavigation } from '../../context/NavigationContext';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    subtotal,
    amountUntilFreeShipping,
    freeShippingProgress,
    totalItems,
  } = useCart();

  const { goToShop, goToCheckout } = useNavigation();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* 1. Backdrop scrim */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-black/60 transition-opacity animate-fadeIn"
      />

      {/* 2. Slide-out Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-neutral-200 flex flex-col shadow-2xl animate-slideInRight">
          
          {/* Top Bar */}
          <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBag size={20} className="text-black" />
              <h2 className="font-nike text-2xl font-bold uppercase tracking-tight text-black">
                SHOPPING BAG
              </h2>
              <span className="font-sans text-xs font-semibold text-neutral-500">
                ({totalItems} {totalItems === 1 ? 'Item' : 'Items'})
              </span>
            </div>
            <button
              onClick={closeCart}
              className="p-2 text-neutral-500 hover:text-black transition-colors rounded-full hover:bg-neutral-100"
              aria-label="Close cart drawer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Free Shipping Meter */}
          <div className="bg-neutral-50 p-4 border-b border-neutral-200">
            <div className="flex justify-between items-center text-xs font-sans mb-2">
              <span className="text-neutral-800">
                {amountUntilFreeShipping === 0 ? (
                  <span className="text-black font-bold">✓ YOU HAVE QUALIFIED FOR FREE DISPATCH</span>
                ) : (
                  <span>Add <strong className="text-black font-bold">${amountUntilFreeShipping.toFixed(2)}</strong> more for Free Shipping</span>
                )}
              </span>
              <span className="text-neutral-500 font-bold">{freeShippingProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-black transition-all duration-300 ease-out rounded-full"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List or Empty State */}
          <div className="flex-1 overflow-y-auto p-6 divide-y divide-neutral-200">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4 space-y-6">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-400">
                  <ShoppingBag size={30} strokeWidth={1.5} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-nike text-3xl font-black uppercase tracking-tight text-black">
                    BAG IS EMPTY
                  </h3>
                  <p className="font-sans text-xs text-neutral-500 max-w-xs leading-relaxed">
                    There are no items in your bag. Explore our collection of high-performance technical caps.
                  </p>
                </div>
                <button
                  onClick={() => {
                    closeCart();
                    goToShop();
                  }}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-black text-white font-sans text-xs font-bold uppercase tracking-wider rounded-full hover:bg-neutral-800 transition-colors shadow-lg"
                >
                  <span>SHOP NEW RELEASES</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="py-5 flex gap-4 first:pt-0 last:pb-0">
                  {/* Thumbnail */}
                  <div className="w-20 h-20 flex-shrink-0 bg-neutral-100 border border-neutral-200 overflow-hidden">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-nike text-base font-bold uppercase text-black">
                          {item.product.name}
                        </h4>
                        <span className="font-sans text-sm font-bold text-black ml-2">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                      <div className="mt-1 font-sans text-xs text-neutral-500 space-y-0.5">
                        <p>Size: {item.selectedSize.split(' ')[0]}</p>
                        <p>Color: {item.selectedColor}</p>
                      </div>
                    </div>

                    {/* Quantity Modifier and Remove Button */}
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-dashed border-neutral-200">
                      <div className="flex items-center border border-neutral-300 rounded-sm">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-neutral-100 text-black transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center font-sans text-xs font-bold text-black">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-neutral-100 text-black transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-neutral-400 hover:text-red-600 transition-colors p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-neutral-200 bg-white space-y-4">
              <div className="space-y-2 font-sans text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-black text-sm">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Estimated Shipping</span>
                  <span className="font-semibold text-black">
                    {subtotal >= 150 ? 'FREE' : '$12.00'}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-black pt-3 border-t border-neutral-200">
                  <span>Estimated Total</span>
                  <span>${subtotal.toFixed(2)} USD</span>
                </div>
              </div>

              {/* Checkout Button (Nike style) */}
              <button
                onClick={() => {
                  closeCart();
                  goToCheckout();
                }}
                className="w-full py-4 bg-black text-white font-sans text-sm font-bold uppercase tracking-wider hover:bg-neutral-800 transition-all flex items-center justify-center gap-3 group rounded-full shadow-lg"
              >
                <span>PROCEED TO CHECKOUT</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={closeCart}
                className="w-full py-3 border border-neutral-300 font-sans text-xs font-bold text-neutral-700 uppercase tracking-wider hover:border-black hover:text-black transition-colors text-center rounded-full"
              >
                CONTINUE SHOPPING
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
