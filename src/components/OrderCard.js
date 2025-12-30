import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import colors from '../styles/colors';

export default function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity style={styles.card} onPress={()=>setExpanded(!expanded)}>
      <Text style={styles.email}>{order.email}</Text>
      <Text style={styles.total}>R{order.total}</Text>
      {expanded && order.items.map(i => (
        <Text key={i.id} style={styles.item}>{i.name} x{i.qty}</Text>
      ))}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.secondary, padding:14, borderRadius:12, marginBottom:10 },
  email: { color: colors.white, fontWeight:'bold' },
  total: { color: colors.white, marginVertical:4 },
  item: { color: '#ccc', marginLeft:10 }
});
