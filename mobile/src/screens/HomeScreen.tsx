import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  RefreshControl, 
  ActivityIndicator 
} from 'react-native';
import { PurchaseCard } from '../components/PurchaseCard';
import { Purchase } from '../types';
import { fetchPurchases } from '../services/mockData';

export const HomeScreen: React.FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadPurchases = useCallback(async () => {
    try {
      const data = await fetchPurchases();
      setPurchases(data);
    } catch (error) {
      console.error('Error loading purchases:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadPurchases();
    setIsRefreshing(false);
  }, [loadPurchases]);

  useEffect(() => {
    loadPurchases();
  }, [loadPurchases]);

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>🧾</Text>
      <Text style={styles.emptyStateTitle}>No purchases yet</Text>
      <Text style={styles.emptyStateSubtitle}>
        Start by scanning your first receipt!
      </Text>
    </View>
  );

  const renderPurchase = ({ item }: { item: Purchase }) => (
    <PurchaseCard purchase={item} />
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading purchases...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={purchases}
        renderItem={renderPurchase}
        keyExtractor={(item) => item.id}
        contentContainerStyle={purchases.length === 0 ? styles.emptyContainer : styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#2196F3']}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});
