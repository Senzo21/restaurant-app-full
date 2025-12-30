import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../styles/colors';

export default function Receipt({ route, navigation }) {
  const { orderId, total, address, items } = route.params;

  return (
    <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Order Receipt</Text>

        <View style={styles.card}>
          <Text style={styles.header}>Order ID:</Text>
          <Text style={styles.text}>{orderId}</Text>

          <Text style={styles.header}>Delivery Address:</Text>
          <Text style={styles.text}>{address}</Text>

          <Text style={styles.header}>Items:</Text>
          {items.map(item => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemText}>{item.name} x {item.qty}</Text>
              <Text style={styles.itemText}>R{item.price * item.qty}</Text>
            </View>
          ))}

          <View style={styles.totalRow}>
            <Text style={styles.totalText}>Total Paid:</Text>
            <Text style={styles.totalText}>R{total}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={() => navigation.replace('Home')}>
          <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex:1 },
  scrollContainer: { padding:20, alignItems:'center' },
  title: { fontSize:28, fontWeight:'bold', color:'#fff', marginBottom:20 },
  card: { backgroundColor:'#fff', padding:20, borderRadius:16, width:'100%', marginBottom:20, shadowColor:'#000', shadowOffset:{width:0,height:6}, shadowOpacity:0.3, shadowRadius:10, elevation:8 },
  header: { fontWeight:'bold', fontSize:16, marginTop:10 },
  text: { fontSize:16, marginBottom:6 },
  itemRow: { flexDirection:'row', justifyContent:'space-between', marginBottom:4 },
  itemText: { fontSize:16 },
  totalRow: { flexDirection:'row', justifyContent:'space-between', marginTop:10, borderTopWidth:1, borderTopColor:'#ccc', paddingTop:10 },
  totalText: { fontSize:18, fontWeight:'bold' },
  button: { backgroundColor:'#3b5998', padding:16, borderRadius:16, alignItems:'center', width:'100%' },
  buttonText: { color:'#fff', fontSize:18, fontWeight:'bold' },
});
