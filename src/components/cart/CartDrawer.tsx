'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { CartItem } from './CartItem';
import { ScrollArea } from '@/components/ui/scroll-area';

export function CartDrawer() {
  const router = useRouter();
  const { cart, isDrawerOpen, setIsDrawerOpen, totalItems } = useCart();

  const handleCheckout = () => {
    setIsDrawerOpen(false);
    router.push('/dashboard/user/checkout');
  };

  const handleViewStore = () => {
    setIsDrawerOpen(false);
    router.push('/dashboard/user/dharma-bandhara');
  };

  // Calculate totals
  const subtotal = cart?.subtotal || 0;
  const total = cart?.total || 0;

  return (
    <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0 bg-[#FAF8F1]">
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b border-[#E5E7EB] bg-white">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold text-[#000000]" style={{ fontFamily: 'Optima, serif' }}>
              Shopping Cart ({totalItems})
            </SheetTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDrawerOpen(false)}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X className="h-5 w-5 text-[#717680]" />
            </Button>
          </div>
        </SheetHeader>

        {/* Cart Items */}
        {!cart || totalItems === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#FAF8F1]">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
              <ShoppingCart className="h-12 w-12 text-[#717680]" />
            </div>
            <h3 className="text-xl font-bold text-[#000000] mb-2" style={{ fontFamily: 'Optima, serif' }}>
              Your cart is empty
            </h3>
            <p className="text-sm text-[#717680] mb-6 text-center" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
              Browse our dharma bandhara and add items to your cart
            </p>
            <Button
              onClick={handleViewStore}
              className="w-full max-w-xs bg-[#7D1A13] hover:bg-[#7D1A13]/90 text-white"
              style={{ fontFamily: 'Avenir Next, sans-serif' }}
            >
              Browse Store
            </Button>
          </div>
        ) : (
          <>
            {/* Items List */}
            <ScrollArea className="flex-1 px-6 bg-[#FAF8F1]">
              <div className="py-4 space-y-4">
                {cart.items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            </ScrollArea>

            {/* Footer with Totals & Checkout */}
            <div className="border-t border-[#E5E7EB] bg-white px-6 py-4 space-y-4">
              {/* Total */}
              <div className="flex justify-between text-lg font-bold" style={{ fontFamily: 'Optima, serif' }}>
                <span className="text-[#000000]">Total</span>
                <span className="text-[#7D1A13]">${total.toFixed(2)}</span>
              </div>

              {/* Checkout Button */}
              <Button
                onClick={handleCheckout}
                className="w-full bg-[#7D1A13] hover:bg-[#7D1A13]/90 text-white font-semibold"
                style={{ fontFamily: 'Avenir Next, sans-serif' }}
                size="lg"
              >
                Proceed to Checkout
              </Button>

              {/* Continue Shopping */}
              <Button
                onClick={handleViewStore}
                variant="outline"
                className="w-full border-[#E5E7EB] text-[#374151] hover:bg-gray-50"
                style={{ fontFamily: 'Avenir Next, sans-serif' }}
                size="lg"
              >
                Continue Shopping
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
