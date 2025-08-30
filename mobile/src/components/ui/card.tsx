import * as React from 'react';
import { View, ViewProps, StyleSheet, ViewStyle } from 'react-native';
import { colors, shadows, borderRadius, spacing } from '../../lib/utils';

export interface CardProps extends ViewProps {
  variant?: 'default' | 'outline';
  elevation?: 'none' | 'sm' | 'md' | 'lg';
}

const Card = React.forwardRef<View, CardProps>(
  ({ style, variant = 'default', elevation = 'md', ...props }, ref) => {
    const cardStyle = [
      styles.base,
      styles[`variant_${variant}`],
      elevation !== 'none' && shadows[elevation],
      style,
    ];

    return <View ref={ref} style={cardStyle} {...props} />;
  }
);

Card.displayName = 'Card';

const CardHeader = React.forwardRef<View, ViewProps>(
  ({ style, ...props }, ref) => (
    <View ref={ref} style={[styles.header, style]} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<View, ViewProps>(
  ({ style, ...props }, ref) => (
    <View ref={ref} style={[styles.title, style]} {...props} />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<View, ViewProps>(
  ({ style, ...props }, ref) => (
    <View ref={ref} style={[styles.description, style]} {...props} />
  )
);
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<View, ViewProps>(
  ({ style, ...props }, ref) => (
    <View ref={ref} style={[styles.content, style]} {...props} />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<View, ViewProps>(
  ({ style, ...props }, ref) => (
    <View ref={ref} style={[styles.footer, style]} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.lg,
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  // Variants
  variant_default: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  variant_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  // Layout components
  header: {
    flexDirection: 'column',
    padding: spacing.md,
    paddingBottom: spacing.xs,
  },
  title: {
    // Title styles handled by Text component
  },
  description: {
    // Description styles handled by Text component
  },
  content: {
    padding: spacing.md,
    paddingTop: 0,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingTop: 0,
  },
});

export { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
};
