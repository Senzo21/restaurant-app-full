import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { CartContext } from '../context/CartContext';
import { auth, db } from '../firebase/config';
import { addDoc, collection, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../styles/colors';

export default function Checkout({ navigation }) {
  const { cart, clearCart } = useContext(CartContext);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  useEffect(() => {
    const loadAddress = async () => {
      if (!auth.currentUser) return;
      const ref = doc(db, 'users', auth.currentUser.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) setAddress(snap.data().address || '');
    };
    loadAddress();
  }, []);

  const initializePaymentSheet = async () => {
    try {
      const response = await fetch('http://192.168.0.104:4242/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total }),
      });
      const { clientSecret } = await response.json();
      const { error } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Restaurant App'
      });
      if (error) { Alert.alert('Stripe Error', error.message); return false; }
      return true;
    } catch {
      Alert.alert('Error', 'Unable to initialize payment');
      return false;
    }
  };

  const handleCheckout = async () => {
    if (!address) { Alert.alert('Missing Address', 'Please enter a delivery address'); return; }
    setLoading(true);
    const ready = await initializePaymentSheet();
    if (!ready) { setLoading(false); return; }
    const { error } = await presentPaymentSheet();
    if (error) { Alert.alert('Payment Failed', error.message); setLoading(false); return; }

    try {
      const orderRef = await addDoc(collection(db, 'orders'), {
        userId: auth.currentUser.uid,
        email: auth.currentUser.email,
        items: cart,
        total,
        address,
        paymentStatus: 'paid',
        createdAt: serverTimestamp()
      });
      clearCart();
      setLoading(false);
      navigation.replace('Receipt', { orderId: orderRef.id, total, address, items: cart });
    } catch {
      Alert.alert('Error', 'Order saved but something went wrong');
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
          {cart.map(item => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemText}>{item.name} x {item.qty}</Text>
              <Text style={styles.itemText}>R{item.price * item.qty}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalText}>Total:</Text>
            <Text style={styles.totalText}>R{total}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.payBtn} onPress={handleCheckout} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.payText}>Place Order & Pay</Text>}
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { padding: 20, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 16, width: '100%', marginBottom: 20, shadowColor:'#000', shadowOffset:{width:0,height:6}, shadowOpacity:0.3, shadowRadius:10, elevation:8 },
  label: { fontWeight: 'bold', fontSize: 16, marginBottom: 10 },
  input: { backgroundColor: '#f1f1f1', padding: 14, borderRadius: 12, color:'#333', marginBottom:10 },
  itemRow: { flexDirection:'row', justifyContent:'space-between', marginBottom:6 },
  itemText: { fontSize: 16 },
  totalRow: { flexDirection:'row', justifyContent:'space-between', marginTop:10, borderTopWidth:1, borderTopColor:'#ccc', paddingTop:10 },
  totalText: { fontSize: 18, fontWeight:'bold' },
  payBtn: { backgroundColor: '#3b5998', padding:16, borderRadius:16, alignItems:'center', width:'100%' },
  payText: { color:'#fff', fontSize:18, fontWeight:'bold' },
});
