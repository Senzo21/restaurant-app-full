import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type FoodCategory = 'Burgers' | 'Mains' | 'Desserts' | 'Beverages' | 'Starters';

export type FoodItem = {
  id: string;
  name: string;
  category: FoodCategory;
  price: number;
  desc: string;
  image: string;
};

export type CartItem = FoodItem & {
  qty: number;
};

export type Order = {
  id: string;
  userId: string;
  email: string;
  items: CartItem[];
  total: number;
  address: string;
  paymentStatus: 'paid' | 'failed' | 'pending';
};

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  ViewItem: { food: FoodItem };
  Cart: undefined;
  Checkout: undefined;
  Receipt: {
    orderId: string;
    total: number;
    address: string;
    items: CartItem[];
  };
  AdminDashboard: undefined;
};

export type ScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;
