import React, { useContext, useMemo } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CartItem from '../components/CartItem';
import { CartContext } from '../context/CartContext';
import { auth } from '../firebase/config';
import colors from '../styles/colors';
import type { CartItem as CartItemType, ScreenProps } from '../types';

export default function Cart({ navigation }: ScreenProps<'Cart'>): JSX.Element {
  const context = useContext(CartContext);

  if (!context) {
    return <></>;
  }

  const { cart, clearCart } = context;

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cart],
  );

  if (!auth.currentUser) {
    return (
      <View style={styles.empty}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.emptyText}>You must register or login to place orders.</Text>
      </View>
    );
  }

  if (cart.length === 0) {
    return (
      <View style={styles.empty}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.emptyText}>Your cart is empty.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <FlatList
        data={cart}
        keyExtractor={(item) => item.id}
        renderItem={({ item }: { item: CartItemType }) => <CartItem item={item} />}
        contentContainerStyle={{ paddingBottom: 140 }}
      />

      <View style={styles.summary}>
        <Text style={styles.total}>Total: R{total}</Text>
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.checkoutBtn} onPress={() => navigation.navigate('Checkout')}>
            <Text style={styles.btnText}>Checkout</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => {
              void clearCart();
            }}
          >
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
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primary },
  emptyText: { color: colors.white, fontSize: 18, fontWeight: 'bold', textAlign: 'center', paddingHorizontal: 20 },
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
