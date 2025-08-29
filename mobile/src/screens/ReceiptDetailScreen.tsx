import React from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity
} from 'react-native';
import Animated, { 
  FadeInUp, 
  FadeInDown, 
  SlideInRight 
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';

import { Text } from '../components/ui/text';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Purchase, RootStackParamList } from '../types';
import { colors, spacing, shadows } from '../lib/utils';
import { ReceepHaptics } from '../lib/haptics';

type ReceiptDetailRouteProp = RouteProp<RootStackParamList, 'ReceiptDetail'>;

export const ReceiptDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<ReceiptDetailRouteProp>();
  const { purchase } = route.params;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const handleBack = () => {
    ReceepHaptics.light();
    navigation.goBack();
  };

  const handleShare = () => {
    ReceepHaptics.medium();
    // TODO: Implement share functionality
  };

  const handleExport = () => {
    ReceepHaptics.medium();
    // TODO: Implement export functionality
  };

  const subtotal = purchase.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = purchase.total - subtotal;

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View 
        entering={FadeInDown.delay(100).springify()}
        style={styles.header}
      >
        <TouchableOpacity 
          onPress={handleBack}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text size="lg" weight="semibold" style={styles.headerTitle}>
          Receipt Details
        </Text>
        <TouchableOpacity 
          onPress={handleShare}
          style={styles.shareButton}
          activeOpacity={0.7}
        >
          <Ionicons name="share-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Store Info */}
        <Animated.View entering={FadeInUp.delay(200).springify()}>
          <Card style={styles.storeCard}>
            <CardHeader>
              <View style={styles.storeHeader}>
                <View style={styles.storeIcon}>
                  <Text size="xl">🏪</Text>
                </View>
                <View style={styles.storeInfo}>
                  <Text size="xl" weight="bold" style={styles.storeName}>
                    {purchase.storeName}
                  </Text>
                  <Text variant="muted" size="sm">
                    {formatDate(purchase.date)}
                  </Text>
                </View>
                <View style={styles.totalBadge}>
                  <Text size="lg" weight="bold" style={styles.totalAmount}>
                    {formatCurrency(purchase.total)}
                  </Text>
                </View>
              </View>
            </CardHeader>
          </Card>
        </Animated.View>

        {/* Items List */}
        <Animated.View entering={FadeInUp.delay(300).springify()}>
          <Card style={styles.itemsCard}>
            <CardHeader>
              <Text size="lg" weight="semibold">
                Items ({purchase.items.length})
              </Text>
            </CardHeader>
            <CardContent style={styles.itemsContent}>
              {purchase.items.map((item, index) => (
                <Animated.View 
                  key={index}
                  entering={SlideInRight.delay(400 + index * 100).springify()}
                  style={[
                    styles.itemRow,
                    index === purchase.items.length - 1 && styles.lastItemRow
                  ]}
                >
                  <View style={styles.itemInfo}>
                    <Text size="default" weight="medium" style={styles.itemName}>
                      {item.name}
                    </Text>
                    <Text variant="muted" size="sm">
                      Qty: {item.quantity} × {formatCurrency(item.price)}
                    </Text>
                  </View>
                  <Text size="default" weight="semibold" style={styles.itemTotal}>
                    {formatCurrency(item.price * item.quantity)}
                  </Text>
                </Animated.View>
              ))}
            </CardContent>
          </Card>
        </Animated.View>

        {/* Summary */}
        <Animated.View entering={FadeInUp.delay(500).springify()}>
          <Card style={styles.summaryCard}>
            <CardHeader>
              <Text size="lg" weight="semibold">
                Summary
              </Text>
            </CardHeader>
            <CardContent style={styles.summaryContent}>
              <View style={styles.summaryRow}>
                <Text variant="muted">Subtotal</Text>
                <Text>{formatCurrency(subtotal)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text variant="muted">Tax</Text>
                <Text>{formatCurrency(tax)}</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text size="lg" weight="semibold">Total</Text>
                <Text size="lg" weight="bold" style={styles.finalTotal}>
                  {formatCurrency(purchase.total)}
                </Text>
              </View>
            </CardContent>
          </Card>
        </Animated.View>

        {/* Actions */}
        <Animated.View 
          entering={FadeInUp.delay(600).springify()}
          style={styles.actionsSection}
        >
          <Button
            variant="outline"
            onPress={handleExport}
            style={styles.actionButton}
          >
            Export Receipt
          </Button>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...shadows.sm,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  shareButton: {
    padding: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  storeCard: {
    marginBottom: spacing.lg,
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    marginBottom: spacing.xs,
  },
  totalBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  totalAmount: {
    color: colors.white,
  },
  itemsCard: {
    marginBottom: spacing.lg,
  },
  itemsContent: {
    paddingTop: 0,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lastItemRow: {
    borderBottomWidth: 0,
  },
  itemInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  itemName: {
    marginBottom: spacing.xs,
  },
  itemTotal: {
    color: colors.primary,
  },
  summaryCard: {
    marginBottom: spacing.lg,
  },
  summaryContent: {
    paddingTop: 0,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.sm,
    paddingTop: spacing.md,
  },
  finalTotal: {
    color: colors.primary,
  },
  actionsSection: {
    marginBottom: spacing.xl,
  },
  actionButton: {
    // Action button styles
  },
});
