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

import { Text, Card, CardContent, Button, LoadingOverlay } from '../components/ui';
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
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
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
                {isSignUp ? 'Create Account' : 'Welcome Back! 👋'}
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
              <View style={styles.googleButtonWrapper}>
                <Button
                  variant='ghost'
                  size='lg'
                  onPress={handleGoogleAuth}
                  style={styles.googleButtonInner}
                >
                  <View style={styles.oauthButtonContent}>
                    <Text style={styles.googleIcon}>G</Text>
                    <Text weight="medium" style={styles.oauthButtonText}>Continue with Google</Text>
                  </View>
                </Button>
              </View>

              <View style={styles.appleButtonWrapper}>
                <Button
                  variant='ghost'
                  size='lg'
                  onPress={handleAppleAuth}
                  style={styles.appleButtonInner}
                >
                  <View style={styles.oauthButtonContent}>
                    <Ionicons name="logo-apple" size={20} color={colors.white} />
                    <Text weight="medium" style={styles.appleButtonText}>
                      Continue with Apple
                    </Text>
                  </View>
                </Button>
              </View>
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
              variant='ghost'
              size='lg'
              onPress={handleEmailAuth}
              style={styles.emailButton}
            >
              <View style={styles.emailButtonContent}>
                <Ionicons name="mail-outline" size={18} color={colors.textMuted} />
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
                <Animated.View entering={SlideInLeft.delay(100)}>
                  <Text size="xs" weight="semibold" style={styles.toggleButtonText}>
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </Text>
                </Animated.View>
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
          <Animated.View 
            entering={SlideInLeft.delay(700)}
            style={styles.feature}
          >
            <View style={styles.featureIcon}>
              <Text style={styles.featureEmoji}>📸</Text>
            </View>
            <Text size="xs" weight="medium" style={styles.featureText}>
              Scan Receipts
            </Text>
          </Animated.View>

          <Animated.View 
            entering={FadeInUp.delay(800)}
            style={styles.feature}
          >
            <View style={styles.featureIcon}>
              <Text style={styles.featureEmoji}>📊</Text>
            </View>
            <Text size="xs" weight="medium" style={styles.featureText}>
              Track Expenses
            </Text>
          </Animated.View>

          <Animated.View 
            entering={SlideInRight.delay(900)}
            style={styles.feature}
          >
            <View style={styles.featureIcon}>
              <Text style={styles.featureEmoji}>💾</Text>
            </View>
            <Text size="xs" weight="medium" style={styles.featureText}>
              Auto Backup
            </Text>
          </Animated.View>
        </View>
      </Animated.View>

      {/* Footer */}
      <Animated.View 
        entering={FadeInUp.delay(1000)}
        style={styles.footer}
      >
        <Text variant="muted" size="xs" style={styles.footerText}>
          By continuing, you agree to our{' '}
          <Text size="xs" weight="medium" style={styles.footerLink}>
            Terms of Service
          </Text>
          {' & '}
          <Text size="xs" weight="medium" style={styles.footerLink}>
            Privacy Policy
          </Text>
        </Text>
      </Animated.View>
      
      <LoadingOverlay visible={isLoading} message={loadingMessage} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoIcon: {
    fontSize: 64,
    marginBottom: spacing.sm,
  },
  logoText: {
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  tagline: {
    textAlign: 'center',
    opacity: 0.8,
  },
  authCardContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  authCard: {
    ...shadows.lg,
    borderRadius: 16,
  },
  authContent: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  authTitle: {
    textAlign: 'center',
    marginBottom: spacing.xs,
    marginTop: spacing.md,
    color: colors.text,
  },
  authSubtitle: {
    textAlign: 'center',
    marginBottom: spacing.lg,
    opacity: 0.7,
  },
  oauthSection: {
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  oauthButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
  },
  appleButton: {
    marginBottom: spacing.md,
    backgroundColor: colors.black,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 52,
  },
  googleButtonWrapper: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  googleButtonInner: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 52,
  },
  appleButtonWrapper: {
    backgroundColor: colors.black,
    borderRadius: 12,
    overflow: 'hidden',
  },
  appleButtonInner: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 52,
  },
  oauthButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 44,
  },
  oauthButtonText: {
    marginLeft: spacing.sm,
    fontSize: 16,
    color: colors.text,
  },
  appleButtonText: {
    marginLeft: spacing.sm,
    fontSize: 16,
    color: colors.white,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4285F4',
    backgroundColor: colors.white,
    borderRadius: 12,
    width: 24,
    height: 24,
    textAlign: 'center',
    lineHeight: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
    opacity: 0.5,
  },
  dividerText: {
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
  },
  emailButton: {
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 52,
  },
  emailButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 44,
  },
  emailButtonText: {
    marginLeft: spacing.sm,
    color: colors.textMuted,
    fontSize: 16,
  },
  toggleSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  toggleButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginLeft: spacing.xs,
    minHeight: 32,
    minWidth: 64,
    borderRadius: 6,
  },
  toggleButtonText: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  featuresSection: {
    paddingVertical: spacing.lg,
    backgroundColor: colors.background,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  feature: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: spacing.xs,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary + '25',
  },
  featureEmoji: {
    fontSize: 20,
  },
  featureText: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 12,
  },
  footer: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  footerText: {
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: '80%',
    opacity: 0.6,
  },
  footerLink: {
    color: colors.primary,
    opacity: 0.8,
  },
});
