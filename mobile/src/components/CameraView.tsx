import React, { useState, useRef } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { CameraView as ExpoCameraView, CameraType, useCameraPermissions } from 'expo-camera';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  interpolate,
  FadeIn,
  SlideInDown
} from 'react-native-reanimated';
import { Text } from './ui/text';
import { Button } from './ui/button';
import { colors, spacing, shadows } from '../lib/utils';
import { ReceepHaptics } from '../lib/haptics';

interface CameraViewProps {
  onTakePhoto: () => void;
  isLoading?: boolean;
}

export const CameraView: React.FC<CameraViewProps> = ({ onTakePhoto, isLoading = false }) => {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<ExpoCameraView>(null);
  const pulseAnimation = useSharedValue(0);

  React.useEffect(() => {
    pulseAnimation.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      true
    );
  }, []);

  const animatedFrameStyle = useAnimatedStyle(() => {
    const scale = interpolate(pulseAnimation.value, [0, 1], [1, 1.02]);
    const opacity = interpolate(pulseAnimation.value, [0, 1], [0.8, 1]);
    
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const handleTakePhoto = async () => {
    if (!cameraRef.current || isLoading) return;
    
    ReceepHaptics.medium();
    
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        exif: false,
      });
      
      if (photo) {
        onTakePhoto();
      }
    } catch (error) {
      ReceepHaptics.error();
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const toggleCameraFacing = () => {
    ReceepHaptics.light();
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  if (!permission) {
    // Camera permissions are still loading
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text size="lg" style={styles.permissionText}>
            Loading camera...
          </Text>
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <Animated.View 
          entering={FadeIn.delay(200).springify()}
          style={styles.permissionContainer}
        >
          <Text style={styles.permissionIcon}>📷</Text>
          <Text size="xl" weight="semibold" style={styles.permissionTitle}>
            Camera Access Required
          </Text>
          <Text variant="muted" style={styles.permissionDescription}>
            Receep needs camera access to scan your receipts and extract purchase information.
          </Text>
          <Button onPress={requestPermission} style={styles.permissionButton}>
            Grant Camera Permission
          </Button>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ExpoCameraView 
        style={styles.camera} 
        facing={facing}
        ref={cameraRef}
      >
        {/* Overlay with frame */}
        <View style={styles.overlay}>
          <Animated.View 
            entering={FadeIn.delay(200).springify()}
            style={styles.instructionContainer}
          >
            <Text size="lg" style={styles.instructionText}>
              Point camera at receipt
            </Text>
            <Text variant="muted" style={styles.subInstructionText}>
              Make sure all text is clearly visible
            </Text>
          </Animated.View>
          
          <Animated.View 
            style={[styles.frame, animatedFrameStyle]}
            entering={FadeIn.delay(400).springify()}
          >
            <View style={styles.corner} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
            
            {/* Scanning line animation when processing */}
            {isLoading && (
              <Animated.View 
                style={styles.scanLine}
                entering={FadeIn.springify()}
              />
            )}
          </Animated.View>

          <View style={styles.spacer} />
          
          <Animated.View 
            entering={SlideInDown.delay(600).springify()}
            style={styles.controlsContainer}
          >
            <Button
              variant="outline"
              onPress={toggleCameraFacing}
              style={styles.flipButton}
            >
              🔄
            </Button>
            
            <Button
              onPress={handleTakePhoto}
              disabled={isLoading}
              size="lg"
              style={styles.captureButton}
            >
              {isLoading ? 'Processing Receipt...' : 'Capture Receipt'}
            </Button>
            
            <View style={styles.spacerButton} />
          </Animated.View>
        </View>
      </ExpoCameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.background,
  },
  permissionIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  permissionTitle: {
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  permissionDescription: {
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  permissionText: {
    color: colors.textMuted,
    textAlign: 'center',
  },
  permissionButton: {
    ...shadows.lg,
  },
  instructionContainer: {
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  instructionText: {
    color: colors.white,
    marginBottom: spacing.xs,
    textAlign: 'center',
    fontWeight: '600',
  },
  subInstructionText: {
    textAlign: 'center',
    color: colors.textMuted,
  },
  frame: {
    width: 280,
    height: 380,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: colors.primary,
    borderWidth: 4,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    top: 0,
    left: 0,
    borderRadius: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    left: undefined,
    borderRightWidth: 4,
    borderLeftWidth: 0,
    borderTopWidth: 4,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    top: undefined,
    left: 0,
    borderLeftWidth: 4,
    borderRightWidth: 0,
    borderBottomWidth: 4,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    top: undefined,
    left: undefined,
    borderRightWidth: 4,
    borderLeftWidth: 0,
    borderBottomWidth: 4,
    borderTopWidth: 0,
  },
  scanLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.primary,
    opacity: 0.8,
  },
  spacer: {
    flex: 1,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  flipButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderColor: colors.white,
    ...shadows.md,
  },
  captureButton: {
    flex: 1,
    marginHorizontal: spacing.md,
    ...shadows.lg,
  },
  spacerButton: {
    width: 56,
  },
});
