import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { LineChart } from 'react-native-chart-kit';
import { Button, Chip, Modal, PaperProvider, Portal, TextInput } from 'react-native-paper';

import { ADMIN_EMAILS } from '../constants/auth';
import { auth, db } from '../firebase/config';
import type { FoodCategory, FoodItem, Order, ScreenProps } from '../types';

const screenWidth = Dimensions.get('window').width;

type FoodForm = {
  name: string;
  price: string;
  desc: string;
  category: string;
};

type ManagedFood = Omit<FoodItem, 'image' | 'price' | 'category'> & {
  category: string;
  price: number;
};

type AppUser = {
  id: string;
  role?: string;
};

const initialForm: FoodForm = {
  name: '',
  price: '',
  desc: '',
  category: '',
};

const categories: FoodCategory[] = ['Burgers', 'Mains', 'Desserts', 'Beverages', 'Starters'];

export default function AdminDashboard({ navigation }: ScreenProps<'AdminDashboard'>): JSX.Element {
  const [orders, setOrders] = useState<Order[]>([]);
  const [foods, setFoods] = useState<ManagedFood[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [selectedFood, setSelectedFood] = useState<ManagedFood | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [foodForm, setFoodForm] = useState<FoodForm>(initialForm);

  const revenue = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.total || 0), 0),
    [orders],
  );

  const verifyAdmin = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser?.email) {
      Alert.alert('Access Denied', 'Please log in as admin.');
      navigation.replace('Login');
      return;
    }

    const isAdminEmail = ADMIN_EMAILS.includes(currentUser.email);

    const ref = doc(db, 'users', currentUser.uid);
    const snapshot = await getDoc(ref);
    const role = snapshot.exists() ? (snapshot.data().role as string | undefined) : undefined;

    if (!isAdminEmail && role !== 'admin') {
      Alert.alert('Access Denied', 'Admin only.');
      await signOut(auth);
      navigation.replace('Login');
    }
  }, [navigation]);

  const loadOrders = useCallback(async () => {
    const snapshot = await getDocs(collection(db, 'orders'));
    const data = snapshot.docs.map((document) => ({
      id: document.id,
      ...(document.data() as Omit<Order, 'id'>),
    }));

    setOrders(data);
  }, []);

  const loadFoods = useCallback(async () => {
    const snapshot = await getDocs(collection(db, 'foods'));
    const data = snapshot.docs.map((document) => ({
      id: document.id,
      ...(document.data() as Omit<ManagedFood, 'id'>),
    }));

    setFoods(data);
  }, []);

  const loadUsers = useCallback(async () => {
    const snapshot = await getDocs(collection(db, 'users'));
    const data = snapshot.docs.map((document) => ({
      id: document.id,
      ...(document.data() as Omit<AppUser, 'id'>),
    }));

    setUsers(data);
  }, []);

  const loadAll = useCallback(async () => {
    await Promise.all([loadOrders(), loadFoods(), loadUsers()]);
  }, [loadFoods, loadOrders, loadUsers]);

  useEffect(() => {
    void verifyAdmin();
    void loadAll();
  }, [loadAll, verifyAdmin]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const resetModal = () => {
    setSelectedFood(null);
    setFoodForm(initialForm);
    setModalVisible(false);
  };

  const validateFoodForm = (): number | null => {
    const parsedPrice = Number(foodForm.price);
    if (!foodForm.name || !foodForm.desc || !foodForm.category || Number.isNaN(parsedPrice)) {
      Alert.alert('Invalid Input', 'Please provide valid name, description, category, and price.');
      return null;
    }

    return parsedPrice;
  };

  const handleAddFood = async () => {
    const parsedPrice = validateFoodForm();
    if (parsedPrice === null) {
      return;
    }

    await addDoc(collection(db, 'foods'), {
      name: foodForm.name,
      desc: foodForm.desc,
      category: foodForm.category,
      price: parsedPrice,
    });

    resetModal();
    await loadFoods();
  };

  const handleUpdateFood = async () => {
    if (!selectedFood) {
      return;
    }

    const parsedPrice = validateFoodForm();
    if (parsedPrice === null) {
      return;
    }

    await updateDoc(doc(db, 'foods', selectedFood.id), {
      name: foodForm.name,
      desc: foodForm.desc,
      category: foodForm.category,
      price: parsedPrice,
    });

    resetModal();
    await loadFoods();
  };

  const handleDeleteFood = async (id: string) => {
    await deleteDoc(doc(db, 'foods', id));
    await loadFoods();
  };

  const openEditModal = (food: ManagedFood) => {
    setSelectedFood(food);
    setFoodForm({
      name: food.name,
      desc: food.desc,
      category: food.category,
      price: String(food.price),
    });
    setModalVisible(true);
  };

  const ordersPerCategory = categories.map((category) =>
    orders.reduce((sum, order) => {
      const count = order.items?.filter((item) => item.category === category).length ?? 0;
      return sum + count;
    }, 0),
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
            datasets: [{ data: ordersPerCategory.length ? ordersPerCategory : [0, 0, 0, 0, 0] }],
          }}
          width={screenWidth - 32}
          height={220}
          chartConfig={{
            backgroundGradientFrom: '#020617',
            backgroundGradientTo: '#020617',
            color: () => '#22c55e',
            labelColor: () => '#94a3b8',
          }}
          style={styles.chart}
        />

        <Text style={styles.sectionTitle}>Recent Orders</Text>
        {orders.slice(0, 3).map((order) => (
          <View key={order.id} style={styles.orderCard}>
            <Text style={styles.orderEmail}>{order.email}</Text>
            <Text style={styles.orderTotal}>R{order.total}</Text>
            <Chip style={styles.chip} textStyle={{ color: '#000' }}>
              {order.paymentStatus ?? 'Paid'}
            </Chip>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Menu Management</Text>
        <Button mode="contained" onPress={() => setModalVisible(true)}>
          Add New Food
        </Button>

        {foods.map((food) => (
          <View key={food.id} style={styles.foodCard}>
            <Text style={styles.foodTitle}>{food.name}</Text>
            <Text style={styles.foodDesc}>{food.desc}</Text>
            <Text style={styles.foodPrice}>R{food.price}</Text>

            <View style={styles.foodActions}>
              <Button onPress={() => openEditModal(food)}>Edit</Button>
              <Button textColor="#ef4444" onPress={() => void handleDeleteFood(food.id)}>
                Delete
              </Button>
            </View>
          </View>
        ))}

        <Portal>
          <Modal
            visible={modalVisible}
            onDismiss={resetModal}
            contentContainerStyle={styles.modal}
          >
            <TextInput
              label="Name"
              value={foodForm.name}
              onChangeText={(value) => setFoodForm((prev) => ({ ...prev, name: value }))}
            />
            <TextInput
              label="Description"
              value={foodForm.desc}
              onChangeText={(value) => setFoodForm((prev) => ({ ...prev, desc: value }))}
            />
            <TextInput
              label="Price"
              keyboardType="numeric"
              value={foodForm.price}
              onChangeText={(value) => setFoodForm((prev) => ({ ...prev, price: value }))}
            />
            <TextInput
              label="Category"
              value={foodForm.category}
              onChangeText={(value) => setFoodForm((prev) => ({ ...prev, category: value }))}
            />
            <Button mode="contained" onPress={selectedFood ? handleUpdateFood : handleAddFood}>
              {selectedFood ? 'Update' : 'Add'}
            </Button>
          </Modal>
        </Portal>
      </ScrollView>
    </PaperProvider>
  );
}

type MetricProps = {
  label: string;
  value: string | number;
};

function Metric({ label, value }: MetricProps): JSX.Element {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

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
  modal: { backgroundColor: '#fff', padding: 20, borderRadius: 18, margin: 16 },
});
