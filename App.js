import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';
import { StripeProvider } from '@stripe/stripe-react-native';

import { auth } from './src/firebase/config';
import { CartProvider } from './src/context/CartContext';

import Login from './src/screens/Login';
import Register from './src/screens/Register';
import Home from './src/screens/Home';
import ViewItem from './src/screens/ViewItem';
import Cart from './src/screens/Cart';
import Checkout from './src/screens/Checkout';
import Receipt from './src/screens/Receipt';
import AdminDashboard from './src/admin/AdminDashboard';

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) return null;

  return (
    <StripeProvider publishableKey="pk_test_51SgubSP8trJ0Z1HMns42npVRZG5l32Et3EOaKoh6qGhneoPyiPnvm34bnxPAYkA1lcEUElx8k5Fe9ow3K6pYRG7m00feIWJ7eB">
      <CartProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {/* Unauthenticated users */}
            {!user ? (
              <>
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="Register" component={Register} />
              </>
            ) : user.email === 'admin@example.com' ? (
              // Admin user
              <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
            ) : (
              // Normal user
              <>
                <Stack.Screen name="Home" component={Home} />
                <Stack.Screen name="ViewItem" component={ViewItem} />
                <Stack.Screen name="Cart" component={Cart} />
                <Stack.Screen name="Checkout" component={Checkout} />
                <Stack.Screen name="Receipt" component={Receipt} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </CartProvider>
    </StripeProvider>
  );
}
