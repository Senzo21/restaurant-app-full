import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useStripe } from '@stripe/stripe-react-native';
import { addDoc, collection, doc, getDoc, serverTimestamp } from 'firebase/firestore';

import { CartContext } from '../context/CartContext';
import { STRIPE_API_URL } from '../config/env';
import { auth, db } from '../firebase/config';
import type { ScreenProps } from '../types';

type PaymentIntentResponse = {
  clientSecret?: string;
  error?: string;
};

export default function Checkout({ navigation }: ScreenProps<'Checkout'>): JSX.Element {
  const context = useContext(CartContext);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  if (!context) {
    return <></>;
  }

  const { cart, clearCart } = context;

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cart],
  );

  useEffect(() => {
    const loadAddress = async () => {
      if (!auth.currentUser) {
        return;
      }

      const ref = doc(db, 'users', auth.currentUser.uid);
      const snapshot = await getDoc(ref);
      if (snapshot.exists()) {
        const userData = snapshot.data() as { address?: string };
        setAddress(userData.address ?? '');
      }
    };

    void loadAddress();
  }, []);

  const initializePaymentSheet = async (): Promise<boolean> => {
    try {
      const email = auth.currentUser?.email;
      if (!email) {
        Alert.alert('Error', 'You must be logged in to checkout.');
        return false;
      }

      const response = await fetch(`${STRIPE_API_URL}/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total, email }),
      });

      const data = (await response.json()) as PaymentIntentResponse;
      if (!response.ok || !data.clientSecret) {
        Alert.alert('Payment Setup Failed', data.error ?? 'Unable to initialize payment.');
        return false;
      }

      const { error } = await initPaymentSheet({
        paymentIntentClientSecret: data.clientSecret,
        merchantDisplayName: 'Restaurant App',
      });

      if (error) {
        Alert.alert('Stripe Error', error.message);
        return false;
      }

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to initialize payment.';
      Alert.alert('Error', message);
      return false;
    }
  };

  const handleCheckout = async () => {
    if (!auth.currentUser) {
      Alert.alert('Error', 'You must be logged in to checkout.');
      return;
    }

    if (!address.trim()) {
      Alert.alert('Missing Address', 'Please enter a delivery address.');
      return;
    }

    if (!cart.length) {
      Alert.alert('Cart Empty', 'Add items to your cart before checkout.');
      return;
    }

    setLoading(true);

    const ready = await initializePaymentSheet();
    if (!ready) {
      setLoading(false);
      return;
    }

    const { error } = await presentPaymentSheet();
    if (error) {
      Alert.alert('Payment Failed', error.message);
      setLoading(false);
      return;
    }

    const purchasedItems = [...cart];

    try {
      const orderRef = await addDoc(collection(db, 'orders'), {
        userId: auth.currentUser.uid,
        email: auth.currentUser.email,
        items: purchasedItems,
        total,
        address: address.trim(),
        paymentStatus: 'paid',
        createdAt: serverTimestamp(),
      });

      await clearCart();
      navigation.replace('Receipt', {
        orderId: orderRef.id,
        total,
        address: address.trim(),
        items: purchasedItems,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Order saving failed.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Checkout</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Delivery Address</Text>
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            placeholder="Enter delivery address"
            placeholderTextColor="#aaa"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Order Summary</Text>
          {cart.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemText}>
                {item.name} x {item.qty}
              </Text>
              <Text style={styles.itemText}>R{item.price * item.qty}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalText}>Total:</Text>
            <Text style={styles.totalText}>R{total}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.payBtn} onPress={handleCheckout} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payText}>Place Order and Pay</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { padding: 20, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    width: '100%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  label: { fontWeight: 'bold', fontSize: 16, marginBottom: 10 },
  input: { backgroundColor: '#f1f1f1', padding: 14, borderRadius: 12, color: '#333', marginBottom: 10 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  itemText: { fontSize: 16 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 10,
  },
  totalText: { fontSize: 18, fontWeight: 'bold' },
  payBtn: { backgroundColor: '#3b5998', padding: 16, borderRadius: 16, alignItems: 'center', width: '100%' },
  payText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
