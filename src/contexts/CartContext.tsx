'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Cart, CartItem, cartApi } from '@/lib/store-api';
import { useToast } from '@/hooks/use-toast';

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  isDrawerOpen: boolean;
  totalItems: number;
  setIsDrawerOpen: (open: boolean) => void;
  toggleDrawer: () => void;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { toast } = useToast();

  // Calculate total items
  const totalItems = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  // Fetch cart from API
  const fetchCart = useCallback(async () => {
    // Don't fetch if no auth token
    const token = session?.user?.accessToken;
    if (!token) {
      setCart(null);
      return;
    }

    try {
      const data = await cartApi.getCart(token);
      setCart(data);
    } catch (error) {
      // Silently fail if not authenticated
      console.error('Failed to fetch cart:', error);
      setCart(null);
    }
  }, [session]);

  // Refresh cart
  const refreshCart = useCallback(async () => {
    setIsLoading(true);
    await fetchCart();
    setIsLoading(false);
  }, [fetchCart]);

  // Add item to cart
  const addItem = useCallback(
    async (productId: string, quantity: number = 1) => {
      // Check if user is authenticated
      const token = session?.user?.accessToken;
      if (!token) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to add items to your cart',
          variant: 'destructive',
        });
        return;
      }

      try {
        setIsLoading(true);
        await cartApi.addItem(productId, quantity, token);
        await fetchCart();

        // Open the cart drawer
        setIsDrawerOpen(true);

        // Scroll sidebar to top
        const sidebar = document.querySelector('[data-tour="sidebar"]') as HTMLElement;
        if (sidebar) {
          sidebar.scrollTo({ top: 0, behavior: 'smooth' });
        }

        toast({
          title: 'Added to cart',
          description: 'Product has been added to your cart',
        });
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to add item to cart',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [fetchCart, toast, session]
  );

  // Remove item from cart
  const removeItem = useCallback(
    async (itemId: string) => {
      const token = session?.user?.accessToken;
      if (!token) return;

      try {
        setIsLoading(true);
        await cartApi.removeItem(itemId, token);
        await fetchCart();

        toast({
          title: 'Item removed',
          description: 'Product has been removed from your cart',
        });
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to remove item',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [fetchCart, toast, session]
  );

  // Update item quantity
  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      if (quantity < 1) return;

      const token = session?.user?.accessToken;
      if (!token) return;

      try {
        setIsLoading(true);
        await cartApi.updateItem(itemId, quantity, token);
        await fetchCart();
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to update quantity',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [fetchCart, toast, session]
  );

  // Clear entire cart
  const clearCart = useCallback(async () => {
    const token = session?.user?.accessToken;
    if (!token) return;

    try {
      setIsLoading(true);
      await cartApi.clearCart(token);
      await fetchCart();

      toast({
        title: 'Cart cleared',
        description: 'Your cart has been cleared',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to clear cart',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [fetchCart, toast, session]);

  // Toggle drawer
  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((prev) => !prev);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const value: CartContextType = {
    cart,
    isLoading,
    isDrawerOpen,
    totalItems,
    setIsDrawerOpen,
    toggleDrawer,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
