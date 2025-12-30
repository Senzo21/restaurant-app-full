import React, { useContext } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { CartContext } from '../context/CartContext';

export default function ViewItem({ route, navigation }) {
  const { food } = route.params;
  const { addItem } = useContext(CartContext);

  const handleAddToCart = () => {
    addItem(food);
    Alert.alert('Success', `${food.name} added to cart!`);
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={food.image} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.title}>{food.name}</Text>
        <Text style={styles.desc}>{food.desc}</Text>
        <Text style={styles.price}>Price: R{food.price}</Text>

        <TouchableOpacity style={styles.cartBtn} onPress={handleAddToCart}>
          <Text style={styles.cartText}>Add to Cart</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1e34' },
  image: { width: '100%', height: 250 },
  content: { padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  desc: { fontSize: 16, color: '#ddd', marginBottom: 12 },
  price: { fontSize: 18, fontWeight: 'bold', color: '#ffae42', marginBottom: 16 },
  cartBtn: { backgroundColor: '#ffae42', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  cartText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  backBtn: { backgroundColor: '#132f4c', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  backText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
