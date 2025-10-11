import React, { useEffect, useState, useMemo, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native';
import CustomTextInput from './CustomTextInput';

const StudentInput = ({
  info = {},
  onInfoChange, // callback to pass updated info object to parent
  containerStyle = styles.defaultContainer,
  headerStyle = styles.defaultHeader,
}) => {
  // Local controlled copy of the info object so inputs stay controlled
  const [localInfo, setLocalInfo] = useState(() => ({ ...info }));

  // Capture which keys were numeric on first render and keep them stable
  const numericKeysRef = useRef(
    Object.keys(info).filter(k => typeof info[k] === 'number'),
  );
  const numericKeys = numericKeysRef.current;

  // Sync local state when parent provides new info
  useEffect(() => {
    setLocalInfo({ ...info });
  }, [info]);

  // Generic change handler for inputs
  const handleChange = (key, rawValue) => {
    const isNumKey = numericKeys.includes(key);
    let newVal = rawValue;

    if (isNumKey) {
      // Allow empty string while typing so the user can clear and re-type.
      if (rawValue === '') {
        newVal = '';
      } else {
        const parsed = Number(rawValue);
        // If parsing fails, keep rawValue, otherwise store the parsed number
        newVal = Number.isNaN(parsed) ? rawValue : parsed;
      }
    }

    const updated = { ...localInfo, [key]: newVal };
    setLocalInfo(updated);

    // Prepare the object we send to the parent
    const updatedForParent = { ...updated };
    if (isNumKey && newVal === '') {
      updatedForParent[key] = null;
    }

    if (typeof onInfoChange === 'function') onInfoChange(updatedForParent);
  };

  const entries = Object.entries(localInfo || {});

  if (entries.length === 0) {
    return (
      <View style={containerStyle}>
        <Text style={headerStyle}>No student data available</Text>
      </View>
    );
  }

  return (
    <ScrollView>
      {entries
        .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
        .map(([key, value]) => {
          // Keep keyboard numeric for keys that were numeric in the original info
          const isNumber = numericKeys.includes(key);
          // For nicer label text, replace underscores with spaces
          const labelText = key.replace(/_/g, ' ').toUpperCase();

          return (
            key !== 'id' && (
              <View style={containerStyle} key={key}>
                {key !== 'v' ? (
                  <CustomTextInput
                    value={
                      value === undefined || value === null ? '' : String(value)
                    }
                    onChangeText={text => handleChange(key, text)}
                    placeholder={labelText}
                    title={labelText}
                    type={isNumber ? 'numberpad' : 'default'}
                  />
                ) : key === 'v' && value > 0 ? (
                  <CustomTextInput
                    value={
                      value === undefined || value === null ? '' : String(value)
                    }
                    onChangeText={text => handleChange(key, text)}
                    placeholder={labelText}
                    title={labelText}
                    type={isNumber ? 'numberpad' : 'default'}
                  />
                ) : null}
              </View>
            )
          );
        })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  defaultContainer: {
    margin: 4,
    padding: 8,
  },
  defaultHeader: {
    color: '#007AFF', // primary color equivalent
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
});

export default StudentInput;
