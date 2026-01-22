'use client';

import React from 'react';
import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem as CartItemType } from '@/lib/store-api';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem, isLoading } = useCart();

  const { product, quantity, id } = item;
  const subtotal = product.price * quantity;

  const handleIncrement = () => {
    updateQuantity(id, quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      updateQuantity(id, quantity - 1);
    }
  };

  const handleRemove = () => {
    removeItem(id);
  };

  return (
    <div className="flex gap-4 py-4 bg-white rounded-lg px-4 shadow-sm overflow-hidden">
      {/* Product Image */}
      <div className="flex-shrink-0 w-20 h-20 relative bg-gray-100 rounded-lg overflow-hidden">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-contain"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No image
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-[#000000] truncate" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
          {product.title}
        </h3>

        {/* Product Category Badge */}
        {product.categories && product.categories.length > 0 && (
          <p className="text-xs text-[#717680] mt-1 capitalize" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
            {product.categories[0]}
          </p>
        )}

        {/* Price */}
        <div className="mt-2">
          <span className="text-sm font-semibold text-[#000000]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
            ${product.price.toFixed(2)}
          </span>
        </div>

        {/* Quantity Controls & Remove Button */}
        <div className="flex items-center justify-between mt-3 gap-2">
          <div className="flex items-center gap-2">
            {/* Quantity Controls */}
            <div className="flex items-center border border-[#E5E7EB] rounded-md bg-white">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDecrement}
                disabled={isLoading || quantity <= 1}
                className="h-7 w-7 p-0 hover:bg-gray-50 text-[#374151]"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="px-3 text-sm font-medium text-[#000000]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleIncrement}
                disabled={isLoading}
                className="h-7 w-7 p-0 hover:bg-gray-50 text-[#374151]"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            {/* Remove Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={isLoading}
              className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Subtotal */}
          <span className="text-sm font-semibold text-[#7D1A13] flex-shrink-0" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
            ${subtotal.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
