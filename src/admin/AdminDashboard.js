import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StyleSheet,
  Dimensions
} from 'react-native';

import { db, auth } from '../firebase/config';
import { signOut } from 'firebase/auth';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { LineChart } from 'react-native-chart-kit';
import { TextInput, Button, Modal, Portal, Provider as PaperProvider, Chip } from 'react-native-paper';

const screenWidth = Dimensions.get('window').width;

export default function AdminDashboard({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [foods, setFoods] = useState([]);
  const [users, setUsers] = useState([]);
  const [revenue, setRevenue] = useState(0);
  const [selectedFood, setSelectedFood] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [foodForm, setFoodForm] = useState({
    name: '',
    price: '',
    desc: '',
    category: ''
  });

  const categories = ['Burgers', 'Pizza', 'Pasta', 'Chicken'];

  // Verify admin access
  useEffect(() => {
    verifyAdmin();
    loadAll();
  }, []);

  const verifyAdmin = async () => {
    const ref = doc(db, 'users', auth.currentUser.uid);
    const snap = await getDoc(ref);

    if (!snap.exists() || snap.data().role !== 'admin') {
      Alert.alert('Access Denied', 'Admin only');
      return;
    }
  };

  const loadAll = async () => {
    await Promise.all([loadOrders(), loadFoods(), loadUsers()]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    // App.js will redirect automatically
  };

  const loadOrders = async () => {
    const snap = await getDocs(collection(db, 'orders'));
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    setOrders(data);
    setRevenue(data.reduce((s, o) => s + o.total, 0));
  };

  const loadFoods = async () => {
    const snap = await getDocs(collection(db, 'foods'));
    setFoods(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const loadUsers = async () => {
    const snap = await getDocs(collection(db, 'users'));
    setUsers(snap.docs.map(d => d.data()));
  };

  const handleAddFood = async () => {
    await addDoc(collection(db, 'foods'), {
      ...foodForm,
      price: parseFloat(foodForm.price)
    });
    setModalVisible(false);
    setFoodForm({ name: '', price: '', desc: '', category: '' });
    loadFoods();
  };

  const handleUpdateFood = async () => {
    await updateDoc(doc(db, 'foods', selectedFood.id), {
      ...foodForm,
      price: parseFloat(foodForm.price)
    });
    setSelectedFood(null);
    setModalVisible(false);
    loadFoods();
  };

  const handleDeleteFood = async (id) => {
    await deleteDoc(doc(db, 'foods', id));
    loadFoods();
  };

  const ordersPerCategory = categories.map(cat =>
    orders.reduce((sum, o) => sum + o.items.filter(i => i.category === cat).length, 0)
  );

  return (
    <PaperProvider>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Admin Dashboard</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.metrics}>
          <Metric label="Orders" value={orders.length} />
          <Metric label="Revenue" value={`R${revenue}`} />
          <Metric label="Users" value={users.length} />
          <Metric label="Menu Items" value={foods.length} />
        </View>

        <Text style={styles.sectionTitle}>Sales Distribution</Text>
        <LineChart
          data={{
            labels: categories,
            datasets: [{ data: ordersPerCategory }]
          }}
          width={screenWidth - 32}
          height={220}
          chartConfig={{
            backgroundGradientFrom: '#020617',
            backgroundGradientTo: '#020617',
            color: () => '#22c55e',
            labelColor: () => '#94a3b8'
          }}
          style={styles.chart}
        />

        <Text style={styles.sectionTitle}>Recent Orders</Text>
        {orders.slice(0, 3).map(o => (
          <View key={o.id} style={styles.orderCard}>
            <Text style={styles.orderEmail}>{o.email}</Text>
            <Text style={styles.orderTotal}>R{o.total}</Text>
            <Chip style={styles.chip} textStyle={{ color: '#000' }}>
              Paid
            </Chip>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Menu Management</Text>
        <Button mode="contained" onPress={() => setModalVisible(true)}>
          Add New Food
        </Button>

        {foods.map(f => (
          <View key={f.id} style={styles.foodCard}>
            <Text style={styles.foodTitle}>{f.name}</Text>
            <Text style={styles.foodDesc}>{f.desc}</Text>
            <Text style={styles.foodPrice}>R{f.price}</Text>

            <View style={styles.foodActions}>
              <Button onPress={() => {
                setSelectedFood(f);
                setFoodForm(f);
                setModalVisible(true);
              }}>Edit</Button>
              <Button textColor="#ef4444" onPress={() => handleDeleteFood(f.id)}>Delete</Button>
            </View>
          </View>
        ))}

        <Portal>
          <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modal}>
            <TextInput label="Name" value={foodForm.name} onChangeText={t => setFoodForm({ ...foodForm, name: t })} />
            <TextInput label="Description" value={foodForm.desc} onChangeText={t => setFoodForm({ ...foodForm, desc: t })} />
            <TextInput label="Price" keyboardType="numeric" value={foodForm.price.toString()} onChangeText={t => setFoodForm({ ...foodForm, price: t })} />
            <TextInput label="Category" value={foodForm.category} onChangeText={t => setFoodForm({ ...foodForm, category: t })} />
            <Button mode="contained" onPress={selectedFood ? handleUpdateFood : handleAddFood}>
              {selectedFood ? 'Update' : 'Add'}
            </Button>
          </Modal>
        </Portal>
      </ScrollView>
    </PaperProvider>
  );
}

const Metric = ({ label, value }) => (
  <View style={styles.metricCard}>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={styles.metricValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  title: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  logoutBtn: { backgroundColor: '#ef4444', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12 },
  logoutText: { color: '#fff', fontWeight: 'bold' },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  metricCard: { width: '48%', backgroundColor: '#0f172a', borderRadius: 18, padding: 16, marginBottom: 12 },
  metricLabel: { color: '#94a3b8', fontSize: 13 },
  metricValue: { color: '#22c55e', fontSize: 22, fontWeight: 'bold' },
  sectionTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginVertical: 12 },
  chart: { borderRadius: 16 },
  orderCard: { backgroundColor: '#0f172a', padding: 12, borderRadius: 14, marginBottom: 8 },
  orderEmail: { color: '#fff', fontWeight: 'bold' },
  orderTotal: { color: '#22c55e', fontSize: 16 },
  chip: { backgroundColor: '#22c55e', alignSelf: 'flex-start', marginTop: 4 },
  foodCard: { backgroundColor: '#0f172a', padding: 14, borderRadius: 16, marginBottom: 10 },
  foodTitle: { color: '#fff', fontWeight: 'bold' },
  foodDesc: { color: '#94a3b8', fontSize: 12 },
  foodPrice: { color: '#22c55e', fontWeight: 'bold' },
  foodActions: { flexDirection: 'row', justifyContent: 'space-between' },
  modal: { backgroundColor: '#fff', padding: 20, borderRadius: 18, margin: 16 }
});
