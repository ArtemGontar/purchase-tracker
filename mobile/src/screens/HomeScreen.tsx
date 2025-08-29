import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  RefreshControl, 
  ActivityIndicator 
} from 'react-native';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { PurchaseCard } from '../components/PurchaseCard';
import { Text } from '../components/ui/text';
import { Purchase } from '../types';
import { fetchPurchases } from '../services/mockData';
import { colors, spacing } from '../lib/utils';
import { ReceepHaptics } from '../lib/haptics';

export const HomeScreen: React.FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadPurchases = useCallback(async () => {
    try {
      const data = await fetchPurchases();
      setPurchases(data);
      ReceepHaptics.success();
    } catch (error) {
      console.error('Error loading purchases:', error);
      ReceepHaptics.error();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    ReceepHaptics.light();
    await loadPurchases();
    setIsRefreshing(false);
  }, [loadPurchases]);

  useEffect(() => {
    loadPurchases();
  }, [loadPurchases]);

  const renderEmptyState = () => (
    <Animated.View 
      entering={FadeInUp.delay(300).springify()}
      style={styles.emptyState}
    >
      <Text style={styles.emptyStateIcon}>🧾</Text>
      <Text size="3xl" weight="bold" style={styles.emptyStateTitle}>
        No receipts yet
      </Text>
      <Text variant="muted" style={styles.emptyStateSubtitle}>
        Start by scanning your first receipt using the camera tab!
      </Text>
    </Animated.View>
  );

  const renderPurchase = ({ item, index }: { item: Purchase; index: number }) => (
    <Animated.View entering={FadeInUp.delay(index * 100).springify()}>
      <PurchaseCard purchase={item} />
    </Animated.View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Animated.View 
          entering={FadeInDown.springify()}
          style={styles.loadingContent}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <Text variant="muted" style={styles.loadingText}>
            Loading your receipts...
          </Text>
        </Animated.View>
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
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
            progressBackgroundColor={colors.background}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
  },
  listContainer: {
    paddingVertical: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyStateTitle: {
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    textAlign: 'center',
    lineHeight: 24,
  },
});
