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
export default function Header({ showNav, hideNavBar }) {
  const { navState, setNavState, setActiveTab } = useGlobalContext();
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
          width: '100%',
          paddingHorizontal: responsiveWidth(3),
        }}
      >
        <TouchableOpacity onPress={() => refresh()}>
          <Image
            source={require('../assets/images/logosq.png')}
            style={{
              width: responsiveWidth(28),
              height: responsiveWidth(28),
              transform: [
                { scale: 0.3 },
                { translateX: -responsiveHeight(15) },
                { translateY: -responsiveHeight(5) },
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
                { translateY: -responsiveHeight(0.8) },
              ],
              color: 'white',
            }}
          >
            WBTPTA AMTA WEST
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            transform: [
              { scale: 2 },

              { translateX: -responsiveHeight(0.2) },
              { translateY: -responsiveHeight(0.7) },
            ],
          }}
          onPress={() => {
            if (navState) {
              hideNavBar();
            } else {
              showNav();
            }
            setNavState(!navState);
          }}
        >
          <AntDesign
            name={!navState ? 'menu-unfold' : 'menu-fold'}
            size={13}
            color={'white'}
          />
          <Text
            style={[
              styles.bottomText,
              { color: 'white', fontSize: responsiveFontSize(0.7) },
            ]}
          >
            Menu
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomText: {
    fontSize: responsiveFontSize(1.5),
    color: THEME_COLOR,
    textAlign: 'center',
    // fontWeight: '600',
  },
  bottomTextDbl: {
    fontSize: responsiveFontSize(1),
    color: THEME_COLOR,
    textAlign: 'center',
    fontWeight: '600',
  },
  header: {
    position: 'absolute',
    width: responsiveWidth(100),
    height: responsiveHeight(8.5),
    backgroundColor: THEME_COLOR,
    elevation: 5,
    shadowColor: 'black',
    borderBottomLeftRadius: responsiveWidth(3),
    borderBottomRightRadius: responsiveWidth(3),
    padding: responsiveHeight(0.5),
    marginBottom: responsiveHeight(2),
  },
  title: {
    textAlign: 'center',
    fontSize: responsiveFontSize(3),
    fontWeight: '200',
    paddingLeft: responsiveWidth(5),
    paddingRight: responsiveWidth(5),
    color: 'white',
    fontFamily: 'Times New Roman',
  },
  bottomBtn: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: responsiveHeight(1),
  },
});
