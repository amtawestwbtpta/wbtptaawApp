import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { responsiveFontSize } from 'react-native-responsive-dimensions';
import { THEME_COLOR } from '../utils/Colors';

export default function StudentCount({ info }) {
  // Filter all keys that start with "student_"
  const studentEntries = Object.entries(info)
    .filter(([key]) => key.startsWith('student_'))
    .map(([key, value]) => ({
      year: key.split('_')[1], // Extract the year part
      count: value,
    }))
    .sort((a, b) => a.year - b.year); // Sort by year ascending

  return studentEntries.length > 0 ? (
    studentEntries.map(({ year, count }) => (
      <View key={year}>
        <Text selectable style={styles.dropDownText}>
          Total Student {year} : {count}
        </Text>
      </View>
    ))
  ) : (
    <View>
      <Text selectable style={styles.dropDownText}>
        No student data available
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  dropDownText: {
    fontSize: responsiveFontSize(2),
    color: THEME_COLOR,
    alignSelf: 'center',
    textAlign: 'center',
    fontFamily: 'kalpurush',
  },
});
