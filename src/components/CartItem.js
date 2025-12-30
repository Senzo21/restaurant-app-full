import React, { useContext } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { CartContext } from '../context/CartContext';
import colors from '../styles/colors';

export default function CartItem({ item }) {
  const { addItem, removeItem } = useContext(CartContext);

  return (
    <View style={styles.card}>
      <Image source={item.image} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>R{item.price * item.qty}</Text>

        {/* Quantity buttons */}
        <View style={styles.qtyContainer}>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => removeItem(item.id)}>
            <Text style={styles.qtyBtnText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.qtyText}>{item.qty}</Text>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => addItem(item)}>
            <Text style={styles.qtyBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.removeBtn} onPress={() => removeItem(item.id)}>
        <Text style={styles.removeText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    elevation: 3,
    alignItems: 'center',
  },
  image: { width: 70, height: 70, borderRadius: 12 },
  info: { flex: 1, marginLeft: 12 },
  name: { fontWeight: 'bold', fontSize: 16 },
  price: { fontWeight: 'bold', fontSize: 14, marginVertical: 4, color: colors.primary },
  qtyContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  qtyBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  qtyBtnText: { color: colors.white, fontWeight: 'bold', fontSize: 16 },
  qtyText: { marginHorizontal: 10, fontWeight: 'bold', fontSize: 16 },
  removeBtn: { padding: 6, backgroundColor: colors.danger, borderRadius: 8 },
  removeText: { color: colors.white, fontWeight: 'bold', fontSize: 12 },
});
