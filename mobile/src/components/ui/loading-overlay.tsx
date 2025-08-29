import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Text } from './text';
import { colors, spacing } from '../../lib/utils';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  visible, 
  message = 'Loading...' 
}) => {
  if (!visible) return null;

  return (
    <Animated.View 
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={styles.overlay}
    >
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text variant="muted" style={styles.message}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.xl,
    alignItems: 'center',
    minWidth: 120,
  },
  message: {
    marginTop: spacing.md,
    textAlign: 'center',
  },
});
