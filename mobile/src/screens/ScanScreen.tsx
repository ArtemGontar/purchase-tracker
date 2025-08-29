import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { CameraView } from '../components/CameraView';
import { addPurchase } from '../services/mockData';
import { Purchase } from '../types';
import { colors } from '../lib/utils';
import { ReceepHaptics } from '../lib/haptics';

export const ScanScreen: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const generateMockReceipt = (): Omit<Purchase, 'id'> => {
    const stores = ['Walmart', 'Target', 'Costco', 'Whole Foods', 'Kroger'];
    const items = [
      { name: 'Bananas', price: 1.99, quantity: 1 },
      { name: 'Milk 1L', price: 3.49, quantity: 1 },
      { name: 'Bread', price: 2.99, quantity: 1 },
      { name: 'Eggs 12ct', price: 4.29, quantity: 1 },
      { name: 'Chicken breast', price: 8.99, quantity: 1 },
      { name: 'Apples 3lb', price: 4.99, quantity: 1 },
      { name: 'Orange juice', price: 3.79, quantity: 1 },
      { name: 'Yogurt 6pk', price: 5.49, quantity: 1 },
    ];

    const randomStore = stores[Math.floor(Math.random() * stores.length)];
    const randomItems = items
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 4) + 2); // 2-5 items

    const total = randomItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return {
      date: new Date().toISOString(),
      storeName: randomStore,
      items: randomItems,
      total: Math.round(total * 100) / 100, // Round to 2 decimal places
    };
  };

  const handleTakePhoto = async () => {
    if (isProcessing) return;

    // Provide immediate haptic feedback
    ReceepHaptics.medium();
    setIsProcessing(true);

    try {
      // Simulate photo processing and OCR
      const mockReceipt = generateMockReceipt();
      const newPurchase = await addPurchase(mockReceipt);

      // Success haptic feedback
      ReceepHaptics.success();

      Alert.alert(
        'Receipt Saved! 🎉',
        `Successfully added purchase from ${newPurchase.storeName}\nTotal: $${newPurchase.total.toFixed(2)}`,
        [
          {
            text: 'View Details',
            onPress: () => {
              ReceepHaptics.light();
              const itemsList = newPurchase.items
                .map(item => `${item.quantity}x ${item.name} - $${item.price.toFixed(2)}`)
                .join('\n');
              
              Alert.alert(
                `${newPurchase.storeName} - $${newPurchase.total.toFixed(2)}`,
                `Items:\n${itemsList}`,
                [{ text: 'OK', onPress: () => ReceepHaptics.light() }]
              );
            }
          },
          { 
            text: 'OK',
            onPress: () => ReceepHaptics.light()
          }
        ]
      );
    } catch (error) {
      // Error haptic feedback
      ReceepHaptics.error();
      
      Alert.alert(
        'Error',
        'Failed to process receipt. Please try again.',
        [{ 
          text: 'OK',
          onPress: () => ReceepHaptics.light()
        }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Animated.View 
      entering={FadeIn.springify()}
      style={styles.container}
    >
      <CameraView onTakePhoto={handleTakePhoto} isLoading={isProcessing} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
