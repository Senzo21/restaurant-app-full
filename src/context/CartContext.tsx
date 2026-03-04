import React, { createContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CartItem, FoodItem } from '../types';

type CartContextValue = {
  cart: CartItem[];
  addItem: (item: FoodItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => Promise<void>;
};

export const CartContext = createContext<CartContextValue | undefined>(undefined);

type CartProviderProps = {
  children: React.ReactNode;
};

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const loadCart = async () => {
      const saved = await AsyncStorage.getItem('cart');
      if (!saved) {
        return;
      }

      try {
        setCart(JSON.parse(saved) as CartItem[]);
      } catch {
        setCart([]);
      }
    };

    void loadCart();
  }, []);

  useEffect(() => {
    void AsyncStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addItem = (item: FoodItem) => {
    setCart((prev) => {
      const existing = prev.find((cartItem) => cartItem.id === item.id);
      if (existing) {
        return prev.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, qty: cartItem.qty + 1 } : cartItem,
        );
      }

      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeItem = (id: string) => {
    setCart((prev) => {
      const existing = prev.find((cartItem) => cartItem.id === id);
      if (!existing) {
        return prev;
      }

      if (existing.qty <= 1) {
        return prev.filter((cartItem) => cartItem.id !== id);
      }

      return prev.map((cartItem) =>
        cartItem.id === id ? { ...cartItem, qty: cartItem.qty - 1 } : cartItem,
      );
    });
  };

  const clearCart = async () => {
    setCart([]);
    await AsyncStorage.removeItem('cart');
  };

  const value = useMemo(
    () => ({
      cart,
      addItem,
      removeItem,
      clearCart,
    }),
    [cart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
