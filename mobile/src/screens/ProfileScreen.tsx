import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Switch, 
  Alert,
  ScrollView
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Text, Card, CardContent, CardHeader, Button } from '../components/ui';
import { RootStackParamList } from '../types';
import { colors, spacing, shadows } from '../lib/utils';
import { ReceepHaptics } from '../lib/haptics';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const ProfileScreen: React.FC = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const navigation = useNavigation<NavigationProp>();

  const handleNotificationToggle = (value: boolean) => {
    ReceepHaptics.light();
    setNotificationsEnabled(value);
  };

  const handleLogout = () => {
    ReceepHaptics.warning();
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { 
          text: 'Cancel', 
          style: 'cancel',
          onPress: () => ReceepHaptics.light()
        },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            ReceepHaptics.success();
            // Navigate back to Auth screen
            navigation.navigate('Auth');
          }
        }
      ]
    );
  };

  const handleAbout = () => {
    ReceepHaptics.light();
    Alert.alert(
      'About Receep',
      'Version 1.0.0\n\nA beautiful app to track your purchases by scanning receipts.\n\nBuilt with React Native, Expo & lots of ❤️',
      [{ 
        text: 'OK',
        onPress: () => ReceepHaptics.light()
      }]
    );
  };

  const handleSettingPress = (setting: string) => {
    ReceepHaptics.selection();
    // Handle different settings navigation
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <Animated.View 
        entering={FadeInUp.delay(100)}
        style={styles.profileSection}
      >
        <View style={styles.avatar}>
          <Text size="2xl" weight="bold" style={styles.avatarText}>
            JD
          </Text>
        </View>
        <Text size="xl" weight="bold" style={styles.userName}>
          John Doe
        </Text>
        <Text variant="muted" style={styles.userEmail}>
          john.doe@example.com
        </Text>
      </Animated.View>

      {/* Settings Section */}
      <Animated.View entering={FadeInUp.delay(200)}>
        <Card style={styles.settingsCard}>
          <CardHeader>
            <Text size="lg" weight="semibold">Settings</Text>
          </CardHeader>
          <CardContent style={styles.settingsContent}>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => handleSettingPress('notifications')}
              activeOpacity={0.7}
            >
              <Text size="default" style={styles.settingLabel}>
                Push Notifications
              </Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.white}
                ios_backgroundColor={colors.border}
              />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.settingItem} 
              onPress={handleAbout}
              activeOpacity={0.7}
            >
              <Text size="default" style={styles.settingLabel}>
                About
              </Text>
              <Text variant="muted" style={styles.settingValue}>
                v1.0.0
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.settingItem} 
              onPress={() => handleSettingPress('export')}
              activeOpacity={0.7}
            >
              <Text size="default" style={styles.settingLabel}>
                Export Data
              </Text>
              <Text variant="muted" style={styles.settingArrow}>
                →
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.settingItem, styles.lastSettingItem]} 
              onPress={() => handleSettingPress('help')}
              activeOpacity={0.7}
            >
              <Text size="default" style={styles.settingLabel}>
                Help & Support
              </Text>
              <Text variant="muted" style={styles.settingArrow}>
                →
              </Text>
            </TouchableOpacity>
          </CardContent>
        </Card>
      </Animated.View>

      {/* Actions Section */}
      <Animated.View 
        entering={FadeInUp.delay(300)}
        style={styles.actionsSection}
      >
        <Button
          variant="destructive"
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          Logout
        </Button>
      </Animated.View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text variant="muted" size="sm" style={styles.footerText}>
          Receep - Receipt Tracker
        </Text>
        <Text variant="muted" size="xs" style={styles.footerSubtext}>
          Made with ❤️ using React Native & Expo
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  profileSection: {
    backgroundColor: colors.card,
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.md,
  },
  avatarText: {
    color: colors.white,
  },
  userName: {
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  userEmail: {
    textAlign: 'center',
  },
  settingsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  settingsContent: {
    paddingTop: 0,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lastSettingItem: {
    borderBottomWidth: 0,
  },
  settingLabel: {
    color: colors.text,
  },
  settingValue: {
    color: colors.textMuted,
  },
  settingArrow: {
    fontSize: 18,
    color: colors.textMuted,
  },
  actionsSection: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  logoutButton: {
    ...shadows.md,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  footerText: {
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  footerSubtext: {
    textAlign: 'center',
  },
});
