// src/components/WebViewScreen.jsx
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  Button,
  BackHandler,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Loader from './Loader';
import { VercelWeb } from '../modules/constants';
import { useNavigation } from '@react-navigation/native';

const Website = () => {
  const navigation = useNavigation();
  const [error, setError] = useState(null);
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        navigation.goBack();
        return true;
      },
    );
    return () => backHandler.remove();
  }, []);

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>File not found</Text>

        <Button
          title="Go Back"
          onPress={() => navigation.goBack()}
          color="#1a4b8c"
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        source={{ uri: VercelWeb }}
        style={styles.webview}
        originWhitelist={['file://']}
        onError={syntheticEvent => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error:', nativeEvent);
          setError(nativeEvent.description);
        }}
        onHttpError={syntheticEvent => {
          const { nativeEvent } = syntheticEvent;
          console.warn('HTTP error:', nativeEvent.statusCode);
          setError(`HTTP Error: ${nativeEvent.statusCode}`);
        }}
        renderLoading={() => (
          <View style={styles.loaderContainer}>
            <Loader />
          </View>
        )}
        startInLoadingState={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f7',
  },
  webview: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 20,
    color: 'red',
    marginBottom: 10,
  },
  errorDetails: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default Website;
