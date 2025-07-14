import {
  View,
  LogBox,
  KeyboardAvoidingView,
  Alert,
  StatusBar,
} from 'react-native';
import { GlobalContextProvider } from './src/context/Store';
import AppNavigator from './src/navigation/AppNavigator';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
LogBox.ignoreAllLogs();
export default function App() {
  return (
    <GlobalContextProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <StatusBar barStyle={'dark-content'} />
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ flex: 1 }}
            >
              <AppNavigator />
              <Toast />
            </KeyboardAvoidingView>
          </GestureHandlerRootView>
        </View>
      </SafeAreaView>
    </GlobalContextProvider>
  );
}
