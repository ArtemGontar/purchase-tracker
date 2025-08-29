import * as React from 'react';
import { 
  Pressable, 
  PressableProps, 
  StyleSheet, 
  ViewStyle,
  PressableStateCallbackType 
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors, shadows, borderRadius, spacing } from '../../lib/utils';
import { ReceepHaptics } from '../../lib/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  style?: ViewStyle;
}

const Button = React.forwardRef<React.ElementRef<typeof Pressable>, ButtonProps>(
  ({ 
    variant = 'default', 
    size = 'default', 
    style, 
    onPress,
    children,
    disabled,
    ...props 
  }, ref) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
      };
    });

    const handlePressIn = () => {
      scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
      ReceepHaptics.light();
    };

    const handlePressOut = () => {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    };

    const handlePress = (event: any) => {
      ReceepHaptics.medium();
      onPress?.(event);
    };

    React.useEffect(() => {
      opacity.value = withTiming(disabled ? 0.5 : 1, { duration: 150 });
    }, [disabled]);

    const getButtonStyle = (pressed: boolean) => [
      styles.base,
      styles[`variant_${variant}`],
      styles[`size_${size}`],
      pressed && styles.pressed,
      disabled && styles.disabled,
      style,
    ];

    return (
      <AnimatedPressable
        ref={ref}
        style={({ pressed }: PressableStateCallbackType) => [
          animatedStyle,
          getButtonStyle(pressed),
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled}
        {...props}
      >
        {children}
      </AnimatedPressable>
    );
  }
);

Button.displayName = 'Button';

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    ...shadows.sm,
  },
  // Variants
  variant_default: {
    backgroundColor: colors.primary,
  },
  variant_destructive: {
    backgroundColor: colors.error,
  },
  variant_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  variant_secondary: {
    backgroundColor: colors.secondary,
  },
  variant_ghost: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  variant_link: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  // Sizes
  size_default: {
    height: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  size_sm: {
    height: 36,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  size_lg: {
    height: 52,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  size_icon: {
    height: 44,
    width: 44,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  // States
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
});

export { Button };
