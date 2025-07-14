import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from 'react-native-vector-icons';

const CustomErrorComponent = ({
  onRetry,
  errorMessage = 'Failed to load webpage',
}) => {
  return (
    <View style={styles.container}>
      {/* Using vector icon */}
      <MaterialIcons name="error-outline" size={64} color="#ff4444" />

      {/* Alternative using image (uncomment to use) */}
      {/* <Image 
        source={require('./path/to/error-icon.png')} 
        style={styles.image} 
        resizeMode="contain"
      /> */}

      <Text style={styles.title}>Oops!</Text>
      <Text style={styles.message}>{errorMessage}</Text>

      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.buttonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#333',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 12,
    color: '#666',
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 16,
    elevation: 2,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
});

export default CustomErrorComponent;
