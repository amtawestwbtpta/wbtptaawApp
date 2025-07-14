import React, { useState } from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Clipboard } from 'react-native';
import { responsiveWidth } from 'react-native-responsive-dimensions';
import Toast from 'react-native-toast-message';
import { THEME_COLOR } from '../utils/Colors';

const CopyableText = ({ text, message, color }) => {
  const [copied, setCopied] = useState(false);
  showToast = (type, text1, text2, position) => {
    Toast.show({
      type: type,
      text1: text1,
      text2: text2,
      visibilityTime: 1500,
      position: position ? position : 'top',
      topOffset: 500,
    });
  };
  const handleCopy = () => {
    Clipboard.setString(text);
    setCopied(true);
    showToast('success', message ? message : 'Copied!');
    // Reset after 2 seconds
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <TouchableOpacity onPress={handleCopy} style={styles.container}>
      <Text style={[styles.text, { color: color ? color : THEME_COLOR }]}>
        {text}
      </Text>
      <Text style={styles.copyText}>{copied ? '✓ Copied' : 'Tap to Copy'}</Text>
      <Toast />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: responsiveWidth(3),
    // backgroundColor: '#f0f0f0',
    borderRadius: 8,
    margin: responsiveWidth(3),
  },
  text: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: 'center',
    color: THEME_COLOR,
  },
  copyText: {
    color: '#007AFF',
    fontSize: 14,
    textAlign: 'right',
  },
});

export default CopyableText;
