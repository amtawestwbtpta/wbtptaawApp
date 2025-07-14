import React from 'react';
import { View } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Foundation from 'react-native-vector-icons/Foundation';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Octicons from 'react-native-vector-icons/Octicons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import Zocial from 'react-native-vector-icons/Zocial';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
// Note: Lucide and MaterialDesignIcons are not included in react-native-vector-icons
// They have been replaced with similar alternatives

const iconFamilies = {
  AntDesign,
  Entypo,
  EvilIcons,
  Feather,
  FontAwesome,
  FontAwesome5,
  FontAwesome6,
  Fontisto,
  Foundation,
  Ionicons,
  MaterialCommunityIcons, // Replaces MaterialDesignIcons
  MaterialIcons,
  MaterialDesignIcons,
  Octicons,
  SimpleLineIcons,
  Zocial,
};

const CustomIcon = ({
  family,
  name,
  size = 24,
  color = 'black',
  ...restProps
}) => {
  const IconComponent = iconFamilies[family];

  if (!IconComponent) {
    console.warn(`Icon family "${family}" is not supported`);
    return <View style={{ width: size, height: size }} />;
  }

  return <IconComponent name={name} size={size} color={color} {...restProps} />;
};

export default CustomIcon;
