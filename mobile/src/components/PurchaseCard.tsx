import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Purchase } from '../types';

interface PurchaseCardProps {
  purchase: Purchase;
}

export const PurchaseCard: React.FC<PurchaseCardProps> = ({ purchase }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePress = () => {
    const itemsList = purchase.items
      .map(item => `${item.quantity}x ${item.name} - $${item.price.toFixed(2)}`)
      .join('\n');
    
    Alert.alert(
      `${purchase.storeName} - $${purchase.total.toFixed(2)}`,
      `Date: ${formatDate(purchase.date)}\n\nItems:\n${itemsList}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <View style={styles.header}>
        <Text style={styles.storeName}>{purchase.storeName}</Text>
        <Text style={styles.total}>${purchase.total.toFixed(2)}</Text>
      </View>
      <Text style={styles.date}>{formatDate(purchase.date)}</Text>
      <Text style={styles.itemCount}>
        {purchase.items.length} item{purchase.items.length !== 1 ? 's' : ''}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  itemCount: {
    fontSize: 12,
    color: '#999',
  },
});
