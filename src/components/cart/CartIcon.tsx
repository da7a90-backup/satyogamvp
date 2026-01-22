'use client';

import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';

interface CartIconProps {
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
  showLabel?: boolean;
}

export function CartIcon({ className, variant = 'ghost', showLabel = false }: CartIconProps) {
  const { totalItems, toggleDrawer } = useCart();

  return (
    <Button
      variant={variant}
      onClick={toggleDrawer}
      className={cn('relative', className)}
    >
      <ShoppingCart className="h-5 w-5" />
      {showLabel && <span className="ml-2">Cart</span>}

      {/* Badge Counter */}
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-blue-600 text-white text-xs font-bold rounded-full animate-in zoom-in-50 duration-200">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </Button>
  );
}
