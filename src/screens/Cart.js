import React, { useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { CartContext } from '../context/CartContext';
import { auth } from '../firebase/config';
import CartItem from '../components/CartItem';
import colors from '../styles/colors';

export default function Cart({ navigation }) {
  const { cart, clearCart } = useContext(CartContext);
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  // Restrict unregistered users
  if (!auth.currentUser) {
    return (
      <View style={styles.empty}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.emptyText}>You must register or login to place orders</Text>
      </View>
    );
  }

  if (cart.length === 0) {
    return (
      <View style={styles.empty}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.emptyText}>Your cart is empty</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <FlatList
        data={cart}
        keyExtractor={i => i.id}
        renderItem={({ item }) => <CartItem item={item} />}
        contentContainerStyle={{ paddingBottom: 140 }}
      />

      {/* Sticky summary */}
      <View style={styles.summary}>
        <Text style={styles.total}>Total: R{total}</Text>
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.checkoutBtn}
            onPress={() => navigation.navigate('Checkout')}
          >
            <Text style={styles.btnText}>Checkout</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.clearBtn} onPress={clearCart}>
            <Text style={styles.btnText}>Clear Cart</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary, padding: 16 },
  backBtn: { marginBottom: 12 },
  backText: { color: colors.white, fontSize: 16, fontWeight: 'bold' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: colors.white, fontSize: 18, fontWeight: 'bold' },
  summary: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.secondary,
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 5,
  },
  total: { color: colors.white, fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  btnRow: { flexDirection: 'row', justifyContent: 'space-between' },
  checkoutBtn: {
    backgroundColor: colors.success,
    padding: 14,
    borderRadius: 12,
    flex: 0.48,
    alignItems: 'center',
  },
  clearBtn: {
    backgroundColor: colors.danger,
    padding: 14,
    borderRadius: 12,
    flex: 0.48,
    alignItems: 'center',
  },
  btnText: { color: colors.white, fontWeight: 'bold', fontSize: 16 },
});
