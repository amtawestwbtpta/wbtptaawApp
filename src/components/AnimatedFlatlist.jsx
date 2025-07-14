import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';
import React, {useState} from 'react';

const {width, height} = Dimensions.get('window');
const AnimatedFlatlist = () => {
  const [states, setStates] = useState([
    {
      key: 'AN',
      name: 'Andaman and Nicobar Islands',
    },
    {
      key: 'AP',
      name: 'Andhra Pradesh',
    },
  ]);

  const perwidth = value => {
    return width * 0.01 * value;
  };
  const perheight = value => {
    return height * 0.01 * value;
  };
  const perFont = text => {
    return height * 0.01 * text * 1.2;
  };

  const [showDropDown, setShowDropDown] = useState(false);
  const [selectedState, setSelectedState] = useState('Select State');

  return (
    <View style={{flex: 1, marginTop: perheight(1)}}>
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          alignSelf: 'center',
          width: perwidth(90),
          height: perheight(5),
          borderWidth: 0.3,
          borderColor: '#9e9e9e',
          borderRadius: perwidth(2),
        }}
        onPress={() => {
          setSelectedState('Select State');
          setShowDropDown(!showDropDown);
        }}>
        <Text style={{fontSize: perFont(2), color: '#000'}}>
          {selectedState}
        </Text>
      </TouchableOpacity>
      {showDropDown ? (
        <View style={{marginTop: perheight(1)}}>
          <View
            style={{
              width: perwidth(90),
              height: perheight(30),
              elevation: 5,
              borderRadius: perheight(1),
              backgroundColor: 'white',
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'center',
              marginTop: perheight(1),
            }}>
            <FlatList
              data={states}
              renderItem={({item, index}) => {
                return (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedState(item.name);
                      setShowDropDown(false);
                    }}
                    style={{
                      width: perwidth(90),
                      height: perheight(5),
                      justifyContent: 'center',
                      alignItems: 'center',
                      alignSelf: 'center',
                      borderBottomWidth: 0.3,
                      borderBottomColor: '#9e9e9e',
                    }}>
                    <Text style={{fontSize: perFont(2), color: '#000'}}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
};

export default AnimatedFlatlist;

const styles = StyleSheet.create({});
