import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import Animated, { 
  FadeInUp, 
  FadeInDown, 
  SlideInLeft,
  SlideInRight
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { Text } from '../components/ui/text';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { LoadingOverlay } from '../components/ui/loading-overlay';
import { RootStackParamList } from '../types';
import { colors, spacing, shadows } from '../lib/utils';
import { ReceepHaptics } from '../lib/haptics';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const AuthScreen: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const navigation = useNavigation<NavigationProp>();

  const handleGoogleAuth = () => {
    ReceepHaptics.medium();
    setIsLoading(true);
    setLoadingMessage('Connecting to Google...');
    
    // Mock Google OAuth - navigate to main app
    setTimeout(() => {
      ReceepHaptics.success();
      setIsLoading(false);
      navigation.navigate('MainTabs');
    }, 1500);
  };

  const handleAppleAuth = () => {
    ReceepHaptics.medium();
    setIsLoading(true);
    setLoadingMessage('Connecting to Apple...');
    
    // Mock Apple OAuth - navigate to main app
    setTimeout(() => {
      ReceepHaptics.success();
      setIsLoading(false);
      navigation.navigate('MainTabs');
    }, 1500);
  };

  const handleEmailAuth = () => {
    ReceepHaptics.medium();
    setIsLoading(true);
    setLoadingMessage(isSignUp ? 'Creating account...' : 'Signing in...');
    
    // Mock email auth - navigate to main app
    setTimeout(() => {
      ReceepHaptics.success();
      setIsLoading(false);
      navigation.navigate('MainTabs');
    }, 1200);
  };

  const toggleAuthMode = () => {
    ReceepHaptics.light();
    setIsSignUp(!isSignUp);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View 
        entering={FadeInDown.delay(200)}
        style={styles.header}
      >
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>🧾</Text>
          <Text size="2xl" weight="bold" style={styles.logoText}>
            Receep
          </Text>
        </View>
        <Text variant="muted" size="default" style={styles.tagline}>
          Track your receipts with ease
        </Text>
      </Animated.View>

      {/* Auth Card */}
      <Animated.View entering={FadeInUp.delay(400)} style={styles.authCardContainer}>
        <Card style={styles.authCard}>
          <CardContent style={styles.authContent}>
            {/* Title */}
            <View>
              <Text size="lg" weight="bold" style={styles.authTitle}>
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </Text>
              <Text variant="muted" size="sm" style={styles.authSubtitle}>
                {isSignUp 
                  ? 'Start tracking your receipts' 
                  : 'Sign in to continue'
                }
              </Text>
            </View>

            {/* OAuth Buttons */}
            <View style={styles.oauthSection}>
              <Button
                variant="outline"
                onPress={handleGoogleAuth}
                style={styles.googleButton}
              >
                <View style={styles.oauthButtonContent}>
                  <Text style={styles.googleIcon}>G</Text>
                  <Text weight="medium">Continue with Google</Text>
                </View>
              </Button>

              <Button
                onPress={handleAppleAuth}
                style={styles.appleButton}
              >
                <View style={styles.oauthButtonContent}>
                  <Ionicons name="logo-apple" size={18} color={colors.white} />
                  <Text weight="medium" style={styles.appleButtonText}>
                    Continue with Apple
                  </Text>
                </View>
              </Button>
            </View>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text variant="muted" size="xs" style={styles.dividerText}>
                or
              </Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Email Button */}
            <Button
              onPress={handleEmailAuth}
              style={styles.emailButton}
            >
              <View style={styles.emailButtonContent}>
                <Ionicons name="mail-outline" size={16} color={colors.white} />
                <Text weight="medium" style={styles.emailButtonText}>
                  {isSignUp ? 'Sign up with Email' : 'Sign in with Email'}
                </Text>
              </View>
            </Button>

            {/* Toggle Auth Mode */}
            <View style={styles.toggleSection}>
              <Text variant="muted" size="xs">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </Text>
              <TouchableOpacity 
                onPress={toggleAuthMode}
                style={styles.toggleButton}
                activeOpacity={0.7}
              >
                <Text size="xs" weight="semibold" style={styles.toggleButtonText}>
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </Text>
              </TouchableOpacity>
            </View>
          </CardContent>
        </Card>
      </Animated.View>

      {/* Features Preview */}
      <Animated.View 
        entering={FadeInUp.delay(600)}
        style={styles.featuresSection}
      >
        <View style={styles.featureRow}>
          <View style={styles.feature}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureEmoji}>📸</Text>
            </View>
            <Text size="xs" weight="medium" style={styles.featureText}>
              Scan Receipts
            </Text>
          </View>

          <View style={styles.feature}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureEmoji}>📊</Text>
            </View>
            <Text size="xs" weight="medium" style={styles.featureText}>
              Track Expenses
            </Text>
          </View>

          <View style={styles.feature}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureEmoji}>💾</Text>
            </View>
            <Text size="xs" weight="medium" style={styles.featureText}>
              Auto Backup
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text variant="muted" size="xs" style={styles.footerText}>
          By continuing, you agree to our Terms & Privacy Policy
        </Text>
      </View>
      
      <LoadingOverlay visible={isLoading} message={loadingMessage} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  logoIcon: {
    fontSize: 48,
    marginBottom: spacing.xs,
  },
  logoText: {
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  tagline: {
    textAlign: 'center',
  },
  authCardContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  authCard: {
    ...shadows.lg,
  },
  authContent: {
    paddingVertical: spacing.lg,
  },
  authTitle: {
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  authSubtitle: {
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  oauthSection: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  googleButton: {
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
  },
  oauthButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  googleIcon: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4285F4',
    backgroundColor: colors.white,
    borderRadius: 10,
    width: 20,
    height: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  appleButton: {
    backgroundColor: '#1d1d1f',
    borderColor: '#1d1d1f',
    paddingVertical: spacing.sm,
  },
  appleButtonText: {
    color: colors.white,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    paddingHorizontal: spacing.sm,
  },
  emailButton: {
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  emailButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  emailButtonText: {
    color: colors.white,
  },
  toggleSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  toggleButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  toggleButtonText: {
    color: colors.primary,
  },
  featuresSection: {
    paddingVertical: spacing.sm,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  feature: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  featureEmoji: {
    fontSize: 16,
  },
  featureText: {
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: spacing.sm,
  },
  footerText: {
    textAlign: 'center',
    lineHeight: 16,
  },
});
