import * as React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { colors, fontSize } from '../../lib/utils';

export interface ReceepTextProps extends TextProps {
  variant?: 'default' | 'destructive' | 'muted' | 'accent' | 'secondary';
  size?: 'xs' | 'sm' | 'default' | 'lg' | 'xl' | '2xl' | '3xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
}

const Text = React.forwardRef<RNText, ReceepTextProps>(
  ({ style, variant = 'default', size = 'default', weight = 'normal', ...props }, ref) => {
    const textStyle = [
      styles.base,
      styles[`size_${size}`],
      styles[`weight_${weight}`],
      styles[`variant_${variant}`],
      style,
    ];

    return (
      <RNText
        ref={ref}
        style={textStyle}
        {...props}
      />
    );
  }
);

Text.displayName = 'Text';

const styles = StyleSheet.create({
  base: {
    color: colors.text,
    fontFamily: 'System',
  },
  // Sizes
  size_xs: { fontSize: fontSize.xs },
  size_sm: { fontSize: fontSize.sm },
  size_default: { fontSize: fontSize.base },
  size_lg: { fontSize: fontSize.lg },
  size_xl: { fontSize: fontSize.xl },
  size_2xl: { fontSize: fontSize.xxl },
  size_3xl: { fontSize: fontSize.xxxl },
  // Weights
  weight_normal: { fontWeight: '400' },
  weight_medium: { fontWeight: '500' },
  weight_semibold: { fontWeight: '600' },
  weight_bold: { fontWeight: '700' },
  // Variants
  variant_default: { color: colors.text },
  variant_destructive: { color: colors.error },
  variant_muted: { color: colors.textMuted },
  variant_accent: { color: colors.secondary },
  variant_secondary: { color: colors.secondary },
});

export { Text };
