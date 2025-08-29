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
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View 
          entering={FadeInDown.delay(200).springify()}
          style={styles.header}
        >
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>🧾</Text>
            <Text size="3xl" weight="bold" style={styles.logoText}>
              Receep
            </Text>
          </View>
          <Text variant="muted" size="lg" style={styles.tagline}>
            Track your receipts with ease
          </Text>
        </Animated.View>

        {/* Auth Card */}
        <Animated.View entering={FadeInUp.delay(400).springify()}>
          <Card style={styles.authCard}>
            <CardContent style={styles.authContent}>
              {/* Title */}
              <Animated.View entering={SlideInLeft.delay(600).springify()}>
                <Text size="xl" weight="bold" style={styles.authTitle}>
                  {isSignUp ? 'Create Account' : 'Welcome Back'}
                </Text>
                <Text variant="muted" style={styles.authSubtitle}>
                  {isSignUp 
                    ? 'Start tracking your receipts today' 
                    : 'Sign in to continue to your account'
                  }
                </Text>
              </Animated.View>

              {/* OAuth Buttons */}
              <Animated.View 
                entering={SlideInRight.delay(700).springify()}
                style={styles.oauthSection}
              >
                <Button
                  variant="outline"
                  onPress={handleGoogleAuth}
                  style={styles.oauthButton}
                >
                  <View style={styles.oauthButtonContent}>
                    <Text style={styles.googleIcon}>G</Text>
                    <Text weight="medium">Continue with Google</Text>
                  </View>
                </Button>

                <Button
                  variant="outline"
                  onPress={handleAppleAuth}
                  style={styles.appleButton}
                >
                  <View style={styles.oauthButtonContent}>
                    <Ionicons name="logo-apple" size={20} color={colors.white} />
                    <Text weight="medium" style={styles.appleButtonText}>
                      Continue with Apple
                    </Text>
                  </View>
                </Button>
              </Animated.View>

              {/* Divider */}
              <Animated.View 
                entering={FadeInUp.delay(800).springify()}
                style={styles.divider}
              >
                <View style={styles.dividerLine} />
                <Text variant="muted" size="sm" style={styles.dividerText}>
                  or
                </Text>
                <View style={styles.dividerLine} />
              </Animated.View>

              {/* Email Button */}
              <Animated.View entering={SlideInLeft.delay(900).springify()}>
                <Button
                  onPress={handleEmailAuth}
                  style={styles.emailButton}
                >
                  <View style={styles.emailButtonContent}>
                    <Ionicons name="mail-outline" size={18} color={colors.white} />
                    <Text weight="medium" style={styles.emailButtonText}>
                      {isSignUp ? 'Sign up with Email' : 'Sign in with Email'}
                    </Text>
                  </View>
                </Button>
              </Animated.View>

              {/* Toggle Auth Mode */}
              <Animated.View 
                entering={FadeInUp.delay(1000).springify()}
                style={styles.toggleSection}
              >
                <Text variant="muted" size="sm">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                </Text>
                <TouchableOpacity 
                  onPress={toggleAuthMode}
                  style={styles.toggleButton}
                  activeOpacity={0.7}
                >
                  <Text size="sm" weight="semibold" style={styles.toggleButtonText}>
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </CardContent>
          </Card>
        </Animated.View>

        {/* Features Preview */}
        <Animated.View 
          entering={FadeInUp.delay(1100).springify()}
          style={styles.featuresSection}
        >
          <View style={styles.featureRow}>
            <Animated.View 
              entering={SlideInLeft.delay(1200).springify()}
              style={styles.feature}
            >
              <View style={styles.featureIcon}>
                <Text>📸</Text>
              </View>
              <Text size="sm" weight="medium" style={styles.featureText}>
                Scan Receipts
              </Text>
            </Animated.View>

            <Animated.View 
              entering={SlideInRight.delay(1300).springify()}
              style={styles.feature}
            >
              <View style={styles.featureIcon}>
                <Text>📊</Text>
              </View>
              <Text size="sm" weight="medium" style={styles.featureText}>
                Track Expenses
              </Text>
            </Animated.View>

            <Animated.View 
              entering={SlideInLeft.delay(1400).springify()}
              style={styles.feature}
            >
              <View style={styles.featureIcon}>
                <Text>💾</Text>
              </View>
              <Text size="sm" weight="medium" style={styles.featureText}>
                Auto Backup
              </Text>
            </Animated.View>
          </View>
        </Animated.View>

        {/* Footer */}
        <Animated.View 
          entering={FadeInUp.delay(1500).springify()}
          style={styles.footer}
        >
          <Text variant="muted" size="xs" style={styles.footerText}>
            By continuing, you agree to our Terms & Privacy Policy
          </Text>
        </Animated.View>
      </ScrollView>
      
      <LoadingOverlay visible={isLoading} message={loadingMessage} />
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingTop: spacing.xxl,
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
    marginBottom: spacing.sm,
  },
  tagline: {
    textAlign: 'center',
  },
  authCard: {
    marginBottom: spacing.xl,
    ...shadows.lg,
  },
  authContent: {
    paddingVertical: spacing.xl,
  },
  authTitle: {
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  authSubtitle: {
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  oauthSection: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  oauthButton: {
    paddingVertical: spacing.md,
  },
  oauthButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
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
  },
  appleButton: {
    backgroundColor: colors.black,
    borderColor: colors.black,
    paddingVertical: spacing.md,
  },
  appleButtonText: {
    color: colors.white,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    paddingHorizontal: spacing.md,
  },
  emailButton: {
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  emailButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
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
    paddingHorizontal: spacing.sm,
  },
  toggleButtonText: {
    color: colors.primary,
  },
  featuresSection: {
    marginBottom: spacing.xl,
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  featureText: {
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
  footerText: {
    textAlign: 'center',
    lineHeight: 18,
  },
});
