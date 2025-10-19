import React from 'react';
import { View, Text, Modal, StyleSheet } from 'react-native';
import { ProgressBar } from 'react-native-paper'; // optional, nice looking linear bar
import * as Progress from 'react-native-progress';
/**
 * UploadProgressBar component for showing upload progress
 * @param {boolean} visible - whether to show loader
 * @param {number} progress - upload progress percentage (0–100)
 * @param {string} message - optional message (default: "Uploading...")
 */
export default function UploadProgressBar({
  visible,
  progress = 0,
  message = 'Uploading...',
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Progress.CircleSnail
            color={['red', 'green', 'blue']}
            thickness={4}
            size={50}
          />
          <Text style={styles.message}>{message}</Text>
          <ProgressBar
            progress={progress / 100}
            color="#007bff"
            style={styles.bar}
          />
          <Text style={styles.percent}>{progress.toFixed(0)}%</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  spinner: {
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: '500',
  },
  bar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
  },
  percent: {
    marginTop: 6,
    fontSize: 14,
    color: '#333',
  },
});
