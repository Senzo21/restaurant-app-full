import React, { useContext } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CartContext } from '../context/CartContext';
import colors from '../styles/colors';
import type { FoodItem } from '../types';

type Props = {
  item: FoodItem;
};

export default function FoodCard({ item }: Props): JSX.Element {
  const context = useContext(CartContext);

  if (!context) {
    return <></>;
  }

  const { addItem } = context;

  return (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.desc}>{item.desc}</Text>
        <TouchableOpacity style={styles.btn} onPress={() => addItem(item)}>
          <Text style={styles.btnText}>Add to cart - R{item.price}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    width: '48%',
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
  },
  image: { width: '100%', height: 120 },
  content: { padding: 10 },
  name: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  desc: { color: '#666', fontSize: 14, marginBottom: 8 },
  btn: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnText: { color: colors.white, fontWeight: 'bold', fontSize: 14 },
});
