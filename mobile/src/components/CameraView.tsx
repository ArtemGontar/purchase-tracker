import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface CameraViewProps {
  onTakePhoto: () => void;
  isLoading?: boolean;
}

export const CameraView: React.FC<CameraViewProps> = ({ onTakePhoto, isLoading = false }) => {
  return (
    <View style={styles.container}>
      <View style={styles.cameraPlaceholder}>
        <Text style={styles.cameraText}>📸</Text>
        <Text style={styles.instructionText}>Point camera at receipt</Text>
        <View style={styles.frame}>
          <View style={styles.corner} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>
      </View>
      
      <TouchableOpacity 
        style={[styles.captureButton, isLoading && styles.captureButtonDisabled]} 
        onPress={onTakePhoto}
        disabled={isLoading}
      >
        <Text style={styles.captureButtonText}>
          {isLoading ? 'Processing...' : 'Take Photo'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  cameraText: {
    fontSize: 64,
    marginBottom: 16,
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 32,
  },
  frame: {
    width: 250,
    height: 350,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#2196F3',
    borderWidth: 3,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    top: 0,
    left: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    left: 'auto',
    borderRightWidth: 3,
    borderLeftWidth: 0,
    borderTopWidth: 3,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    top: 'auto',
    left: 0,
    borderLeftWidth: 3,
    borderRightWidth: 0,
    borderBottomWidth: 3,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    top: 'auto',
    left: 'auto',
    borderRightWidth: 3,
    borderLeftWidth: 0,
    borderBottomWidth: 3,
    borderTopWidth: 0,
  },
  captureButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 50,
    marginBottom: 50,
  },
  captureButtonDisabled: {
    backgroundColor: '#666',
  },
  captureButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
