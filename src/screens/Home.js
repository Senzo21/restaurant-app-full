import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ScrollView
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient'; // <-- added for gradient background
import foods from '../data/foods';
import { CartContext } from '../context/CartContext';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';

const categories = ['All', 'Burgers', 'Mains', 'Desserts', 'Beverages', 'Starters'];
const screenWidth = Dimensions.get('window').width;
const numColumns = 2;
const cardWidth = (screenWidth - 48) / numColumns;

export default function Home({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { addItem, cart } = useContext(CartContext);

  const isAdmin = auth.currentUser?.email === 'admin@example.com';

  const filteredFoods =
    selectedCategory === 'All'
      ? foods
      : foods.filter(item => item.category === selectedCategory);

  const handleLogout = async () => {
    await signOut(auth);
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }]
    });
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, { width: cardWidth }]}>
      <Image source={item.image} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardDesc}>{item.desc}</Text>
        <Text style={styles.cardPrice}>R{item.price}</Text>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity style={styles.addBtn} onPress={() => addItem(item)}>
            <Text style={styles.addText}>Add</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.viewBtn}
            onPress={() => navigation.navigate('ViewItem', { food: item })}
          >
            <Text style={styles.viewText}>View</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={['#0f1c2c', '#132f4c', '#1a4f6e']} // <-- gradient colors
      style={{ flex: 1 }}
    >
      <FlatList
        data={filteredFoods}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={numColumns}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 16 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
        ListHeaderComponent={
          <>
            {/* Header Row */}
            <View style={styles.headerRow}>
              <Text style={styles.heading}>Menu</Text>

              <TouchableOpacity onPress={handleLogout}>
                <Text style={styles.logout}>Logout</Text>
              </TouchableOpacity>
            </View>

            {/* Admin Access */}
            {isAdmin && (
              <TouchableOpacity
                style={styles.adminBtn}
                onPress={() => navigation.navigate('Admin')}
              >
                <Text style={styles.adminText}>Admin Dashboard</Text>
              </TouchableOpacity>
            )}

            {/* Categories */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryBtn,
                    selectedCategory === cat && styles.categoryActive
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === cat && styles.categoryTextActive
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        }
      />

      {/* Floating Cart */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('Cart')}>
        <Text style={styles.fabText}>Cart ({cart.length})</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 28, fontWeight: 'bold', color: '#fff' },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },

  logout: { color: '#ff6b6b', fontWeight: 'bold' },

  adminBtn: {
    backgroundColor: '#ffae42',
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center'
  },
  adminText: { fontWeight: 'bold', color: '#000' },

  categoryContainer: { marginBottom: 16 },
  categoryBtn: {
    backgroundColor: '#132f4c',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 10
  },
  categoryActive: { backgroundColor: '#ffae42' },
  categoryText: { color: '#fff', fontWeight: 'bold' },
  categoryTextActive: { color: '#000' },

  card: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' },
  cardImage: { width: '100%', height: 120 },
  cardContent: { padding: 12 },
  cardTitle: { fontWeight: 'bold' },
  cardDesc: { color: '#666', fontSize: 12 },
  cardPrice: { fontWeight: 'bold' },

  addBtn: {
    backgroundColor: '#28a745',
    paddingVertical: 6,
    borderRadius: 12,
    flex: 0.48,
    alignItems: 'center'
  },
  addText: { color: '#fff', fontWeight: 'bold' },

  viewBtn: {
    backgroundColor: '#ffae42',
    paddingVertical: 6,
    borderRadius: 12,
    flex: 0.48,
    alignItems: 'center'
  },
  viewText: { fontWeight: 'bold' },

  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#132f4c',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 30
  },
  fabText: { color: '#fff', fontWeight: 'bold' }
});
