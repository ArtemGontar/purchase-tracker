import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Purchase, RootStackParamList } from '../types';
import { Card, CardContent, CardHeader, Text } from './ui';
import { colors, spacing, shadows, borderRadius } from '../lib/utils';
import { ReceepHaptics } from '../lib/haptics';

interface PurchaseCardProps {
  purchase: Purchase;
}

type NavigationProp = StackNavigationProp<RootStackParamList>;

const AnimatedCard = Animated.createAnimatedComponent(Card);

export const PurchaseCard: React.FC<PurchaseCardProps> = ({ purchase }) => {
  const scale = useSharedValue(1);
  const navigation = useNavigation<NavigationProp>();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
    ReceepHaptics.light();
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    ReceepHaptics.medium();
    // Navigate to receipt detail screen
    navigation.navigate('ReceiptDetail', { purchase });
  };

  const getCategoryColor = (storeName: string) => {
    // Simple category color assignment based on store name
    const categories: Record<string, string> = {
      'Target': colors.error,
      'Starbucks': '#00704A', // Starbucks green
      'Walmart': '#0071CE', // Walmart blue
      'CVS': '#CC0000', // CVS red
      'Apple Store': '#007AFF', // Apple blue
    };
    return categories[storeName] || colors.primary;
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={styles.pressableContainer}
    >
      <AnimatedCard style={[styles.card, animatedStyle]} elevation="md">
        <CardHeader style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.storeInfo}>
              <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(purchase.storeName) }]} />
              <Text size="lg" weight="semibold" style={styles.storeName}>
                {purchase.storeName}
              </Text>
            </View>
            <Text size="xl" weight="bold" style={styles.total}>
              {formatCurrency(purchase.total)}
            </Text>
          </View>
        </CardHeader>
        
        <CardContent style={styles.content}>
          <View style={styles.detailsRow}>
            <Text variant="muted" size="sm">
              {formatDate(purchase.date)}
            </Text>
            <Text variant="muted" size="sm">
              {purchase.items.length} item{purchase.items.length !== 1 ? 's' : ''}
            </Text>
          </View>
          
          {purchase.items.length > 0 && (
            <View style={styles.itemsPreview}>
              <Text variant="muted" size="sm" numberOfLines={1}>
                {purchase.items.slice(0, 2).map(item => item.name).join(', ')}
                {purchase.items.length > 2 && ` +${purchase.items.length - 2} more`}
              </Text>
            </View>
          )}
        </CardContent>
      </AnimatedCard>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressableContainer: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
  },
  card: {
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  header: {
    paddingBottom: spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  storeName: {
    color: colors.text,
    flex: 1,
  },
  total: {
    color: colors.primary,
    marginLeft: spacing.sm,
  },
  content: {
    paddingTop: 0,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  itemsPreview: {
    marginTop: spacing.xs,
  },
});
