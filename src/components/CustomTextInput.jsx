import {
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import React, { useState } from 'react';
import { THEME_COLOR } from '../utils/Colors';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Fontisto from 'react-native-vector-icons/Fontisto';

const CustomTextInput = ({
  placeholder,
  value,
  onChangeText,
  type,
  secure,
  size,
  multiline,
  bgcolor,
  editable,
  maxLength,
  title,
  color,
  numberOfLines,
  fontFamily,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secure);
  const isEditable = editable ?? true;

  // Handle keyboard type with decimal support
  const getKeyboardType = () => {
    if (type === 'numberpad' || type === 'number-pad') {
      return Platform.OS === 'ios' ? 'decimal-pad' : 'numeric';
    }
    return type || 'default';
  };

  // Handle text input with enhanced numeric filtering
  const handleTextChange = text => {
    if (type === 'numberpad' || type === 'number-pad') {
      // Allow empty string
      if (text === '') {
        onChangeText('');
        return;
      }

      // Handle negative numbers and decimals
      let newText = '';
      let hasDecimal = false;
      let hasMinus = false;

      for (let i = 0; i < text.length; i++) {
        const char = text[i];

        // Allow minus sign only at the beginning
        if (char === '-' && newText === '') {
          newText += char;
          hasMinus = true;
        }
        // Allow digits
        else if (char >= '0' && char <= '9') {
          newText += char;
        }
        // Allow decimal point only once
        else if (char === '.' && !hasDecimal) {
          // If decimal is first character, prepend '0'
          if (newText === '' || newText === '-') {
            newText = newText === '-' ? '-0.' : '0.';
          } else {
            newText += '.';
          }
          hasDecimal = true;
        }
      }

      // Handle cases where only minus sign was entered
      if (newText === '-') {
        onChangeText('-');
        return;
      }

      // Handle cases like "0." where we want to keep the decimal
      if (newText.endsWith('.') && !hasDecimal) {
        hasDecimal = true;
      }

      // Prevent multiple leading zeros
      if (newText.startsWith('00') && !newText.startsWith('0.')) {
        newText = '0' + newText.substring(2).replace(/^0+/, '');
      }

      // Handle special cases for decimal values
      if (newText === '0.') {
        onChangeText('0.');
        return;
      }

      // Validate the final number
      const numValue = Number(newText);
      if (isNaN(numValue)) {
        onChangeText('');
      } else {
        // Return the string representation as-is for decimal inputs
        onChangeText(newText);
      }
    } else {
      onChangeText(text);
    }
  };

  return (
    <View
      style={[
        styles.input,
        {
          width: size === 'small' ? 90 : Dimensions.get('window').width - 100,
          height:
            size === 'small'
              ? 40
              : size === 'medium'
                ? 100
                : size === 'large'
                  ? 250
                  : title?.length >= 45
                    ? 60
                    : 50,
          marginRight: size === 'small' ? 5 : 0,
          borderColor: isFocused ? THEME_COLOR : '#9e9e9e',
          borderWidth: isFocused ? 1.5 : 1,
        },
      ]}
    >
      {title ? (
        <Text
          style={[
            styles.title,
            {
              color: color ? color : isFocused ? 'darkgreen' : 'blue',
              fontFamily: fontFamily ? fontFamily : 'times',
            },
          ]}
        >
          {title}
        </Text>
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: title?.length >= 45 ? responsiveHeight(2) : 0,
        }}
      >
        <TextInput
          placeholder={placeholder}
          value={value}
          editable={isEditable}
          onChangeText={handleTextChange}
          keyboardType={getKeyboardType()}
          secureTextEntry={isSecure}
          multiline={size === 'large' ? true : false}
          numberOfLines={numberOfLines ? numberOfLines : 10}
          textAlignVertical={'top'}
          textAlign="left"
          placeholderTextColor={isFocused ? 'blueviolet' : THEME_COLOR}
          maxLength={maxLength ? maxLength : 500000}
          style={{
            color: 'black',
            backgroundColor: bgcolor
              ? bgcolor
              : !isEditable
                ? 'rgba(212, 212, 212,0.3)'
                : 'transparent',
            width: isEditable ? '90%' : '100%',
            fontFamily: fontFamily ? fontFamily : 'default',
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {secure && value?.length > 0 && (
          <TouchableOpacity
            onPress={() => setIsSecure(!isSecure)}
            style={{ paddingRight: 10 }}
          >
            <Ionicons
              name={isSecure ? 'eye' : 'eye-off'}
              size={responsiveFontSize(2)}
              color={isSecure ? THEME_COLOR : 'red'}
            />
          </TouchableOpacity>
        )}
        {!isEditable && (
          <Text style={{ right: responsiveWidth(5), position: 'absolute' }}>
            {'  '}
            <Fontisto name="locked" size={30} color={color ? color : 'gray'} />
          </Text>
        )}
      </View>
    </View>
  );
};

export default CustomTextInput;

const styles = StyleSheet.create({
  input: {
    width: Dimensions.get('window').width - 100,
    height: 50,
    borderRadius: 10,
    alignSelf: 'center',
    marginVertical: responsiveHeight(1.5),
    paddingLeft: 10,
  },
  title: {
    alignSelf: 'flex-start',
    left: responsiveWidth(5),
    top: -responsiveHeight(1.2),
    position: 'absolute',
    backgroundColor: 'white',
    paddingLeft: responsiveWidth(2),
    paddingRight: responsiveWidth(2),
    borderRadius: responsiveWidth(1),
  },
});
