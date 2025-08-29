import * as Haptics from "expo-haptics";

/**
 * Receep Haptics Utility
 * Provides consistent haptic feedback throughout the app according to design system guidelines
 */

export class ReceepHaptics {
  /**
   * Light haptic feedback for routine actions like toggling switches, tapping list items
   */
  static async light() {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics might not be available on all devices, silently fail
      console.debug("Haptics not available:", error);
    }
  }

  /**
   * Medium haptic feedback for button presses, card taps
   */
  static async medium() {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.debug("Haptics not available:", error);
    }
  }

  /**
   * Heavy haptic feedback for important actions like scanning receipts, major interactions
   */
  static async heavy() {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      console.debug("Haptics not available:", error);
    }
  }

  /**
   * Success haptic feedback for completed actions like successful receipt scan
   */
  static async success() {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.debug("Haptics not available:", error);
    }
  }

  /**
   * Error haptic feedback for failed actions or errors
   */
  static async error() {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
      console.debug("Haptics not available:", error);
    }
  }

  /**
   * Warning haptic feedback for warnings or cautionary actions
   */
  static async warning() {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (error) {
      console.debug("Haptics not available:", error);
    }
  }

  /**
   * Selection haptic feedback for selections, navigation changes
   */
  static async selection() {
    try {
      await Haptics.selectionAsync();
    } catch (error) {
      console.debug("Haptics not available:", error);
    }
  }
}
