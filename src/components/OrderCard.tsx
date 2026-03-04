import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colors from '../styles/colors';
import type { Order } from '../types';

type Props = {
  order: Order;
};

export default function OrderCard({ order }: Props): JSX.Element {
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity style={styles.card} onPress={() => setExpanded((prev) => !prev)}>
      <Text style={styles.email}>{order.email}</Text>
      <Text style={styles.total}>R{order.total}</Text>
      {expanded &&
        order.items.map((item) => (
          <Text key={item.id} style={styles.item}>
            {item.name} x{item.qty}
          </Text>
        ))}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.secondary, padding: 14, borderRadius: 12, marginBottom: 10 },
  email: { color: colors.white, fontWeight: 'bold' },
  total: { color: colors.white, marginVertical: 4 },
  item: { color: '#ccc', marginLeft: 10 },
});
