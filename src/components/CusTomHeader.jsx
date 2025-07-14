import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import { useGlobalContext } from '../context/Store';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import { THEME_COLOR } from '../utils/Colors';
export default function CusTomHeader() {
  const { setActiveTab } = useGlobalContext();
  const navigation = useNavigation();
  const refresh = () => {
    navigation.navigate('Home');
    setActiveTab(0);
  };
  return (
    <View style={styles.header}>
      <View
        style={{
          justifyContent: 'space-between',
          alignItems: 'center',
          alignSelf: 'center',
          flexDirection: 'row',
          width: '95%',
          paddingHorizontal: responsiveWidth(3),
          marginTop: -responsiveHeight(1),
        }}
      >
        <TouchableOpacity onPress={() => refresh()}>
          <Image
            source={require('../assets/images/logosq.png')}
            style={{
              width: responsiveWidth(25),
              height: responsiveWidth(25),
              transform: [
                { scale: 0.3 },
                { translateX: -responsiveHeight(15) },
                { translateY: -responsiveHeight(7) },
              ],
            }}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => refresh()}>
          <Text
            selectable
            style={{
              fontSize: responsiveFontSize(2),
              fontFamily: 'timesbd',
              fontWeight: '500',
              transform: [
                { scale: 1.5 },
                { scaleY: 1.3 },
                { translateX: -responsiveHeight(3.5) },
                { translateY: -responsiveHeight(1) },
              ],
              color: 'white',
            }}
          >
            WBTPTA AMTA WEST
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    width: responsiveWidth(100),
    height: responsiveHeight(6),
    backgroundColor: THEME_COLOR,
    elevation: 5,
    shadowColor: 'black',
    borderBottomLeftRadius: responsiveWidth(3),
    borderBottomRightRadius: responsiveWidth(3),
    padding: responsiveHeight(0.5),
    marginBottom: responsiveHeight(2),
  },
});
