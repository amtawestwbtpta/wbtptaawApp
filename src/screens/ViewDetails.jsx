import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  BackHandler,
  TouchableOpacity,
  DeviceEventEmitter,
  Clipboard,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { THEME_COLOR } from '../utils/Colors';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';

import CustomButton from '../components/CustomButton';
import { useGlobalContext } from '../context/Store';
import NavigationBarContainer from '../navigation/NavigationBarContainer';
const ViewDetails = () => {
  const { state, stateObject } = useGlobalContext();
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const user = state.USER;
  let {
    udise,
    tname,
    desig,
    school,
    circle,
    gp,
    phone,
    email,
    dob,
    doj,
    dojnow,
    dor,
    bank,
    account,
    ifsc,
    empid,
    training,
    pan,
    address,
    fname,
  } = stateObject;
  const [bankData, setBankData] = useState({});
  const ifsc_ser = () => {
    fetch(`https://ifsc.razorpay.com/${ifsc}`)
      .then(res => res.json())
      .then(data => setBankData(data));
  };

  useEffect(() => {
    ifsc_ser();
  }, [isFocused]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        navigation.goBack();
        DeviceEventEmitter.emit('goBack');
        return true;
      },
    );
    return () => backHandler.remove();
  }, [isFocused]);
  return (
    <NavigationBarContainer>
      <View style={styles.container}>
        <Text selectable style={styles.title}>
          DETAILS OF {tname}
        </Text>
        <ScrollView
          style={{
            marginTop: responsiveHeight(2),
          }}
        >
          {user.circle == 'admin' && (
            <CustomButton
              title={'Edit Details'}
              fontSize={responsiveFontSize(1.5)}
              size={'small'}
              marginBottom={responsiveHeight(1)}
              onClick={() => navigation.navigate('EditDetails')}
            />
          )}
          <CustomButton
            title={'Go Back'}
            color={'purple'}
            size={'small'}
            onClick={() => {
              navigation.goBack();
              DeviceEventEmitter.emit('goBack');
            }}
          />
          <TouchableOpacity
            style={styles.dataView}
            onPress={() => Clipboard.setString(tname)}
          >
            <Text selectable style={styles.dataText}>
              Name: {tname}
            </Text>
          </TouchableOpacity>
          {user.circle === 'admin' && (
            <TouchableOpacity
              style={styles.dataView}
              onPress={() => Clipboard.setString(tname)}
            >
              <Text selectable style={styles.dataText}>
                Access: {circle}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.dataView}
            onPress={() => Clipboard.setString(fname)}
          >
            <Text selectable style={styles.dataText}>
              Father's Name: {fname}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dataView}
            onPress={() => Clipboard.setString(school)}
          >
            <Text selectable style={styles.dataText}>
              School: {school}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dataView}
            onPress={() => Clipboard.setString(udise)}
          >
            <Text selectable style={styles.dataText}>
              UDISE: {udise}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dataView}
            onPress={() => Clipboard.setString(desig)}
          >
            <Text selectable style={styles.dataText}>
              Designation: {desig}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dataView}
            onPress={() => Clipboard.setString(gp)}
          >
            <Text selectable style={styles.dataText}>
              Gram Panchayet: {gp}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dataView}
            onPress={() => Clipboard.setString(phone)}
          >
            <Text selectable style={styles.dataText}>
              Mobile: {phone}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dataView}
            onPress={() => Clipboard.setString(email)}
          >
            <Text selectable style={styles.dataText}>
              Email: {email}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dataView}
            onPress={() => Clipboard.setString(dob)}
          >
            <Text selectable style={styles.dataText}>
              Date of Birth: {dob}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dataView}
            onPress={() => Clipboard.setString(doj)}
          >
            <Text selectable style={styles.dataText}>
              Date of Joining: {doj}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dataView}
            onPress={() => Clipboard.setString(dojnow)}
          >
            <Text selectable style={styles.dataText}>
              DOJ in Present School: {dojnow}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dataView}
            onPress={() => Clipboard.setString(dor)}
          >
            <Text selectable style={styles.dataText}>
              Date of Retirement: {dor}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dataView}
            onPress={() => Clipboard.setString(empid)}
          >
            <Text selectable style={styles.dataText}>
              Employee ID: {empid}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dataView}>
            <Text selectable style={styles.dataText}>
              Training: {training}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dataView}
            onPress={() => Clipboard.setString(pan)}
          >
            <Text selectable style={styles.dataText}>
              PAN: {pan}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dataView}
            onPress={() => Clipboard.setString(address)}
          >
            <Text selectable style={styles.dataText}>
              Address: {address}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dataView}>
            <Text selectable style={styles.dataText}>
              BANK: {bank}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dataView}
            onPress={() => Clipboard.setString(account)}
          >
            <Text selectable style={styles.dataText}>
              Account No: {account}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dataView}
            onPress={() => Clipboard.setString(ifsc)}
          >
            <Text selectable style={styles.dataText}>
              IFS Code: {ifsc}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dataView}>
            <Text selectable style={styles.bankDataText}>
              Bank Name: {bankData.BANK}
            </Text>
            <Text selectable style={styles.bankDataText}>
              Branch: {bankData.BRANCH}
            </Text>
            <Text selectable style={styles.bankDataText}>
              Address: {bankData.ADDRESS}
            </Text>
            <Text selectable style={styles.bankDataText}>
              MICR: {bankData.MICR}
            </Text>
          </TouchableOpacity>
          {user.circle == 'admin' && (
            <CustomButton
              title={'Edit Details'}
              fontSize={responsiveFontSize(1.5)}
              size={'small'}
              marginBottom={responsiveHeight(1)}
              onClick={() => navigation.navigate('EditDetails')}
            />
          )}
          <CustomButton
            title={'Go Back'}
            size={'small'}
            color={'purple'}
            onClick={() => {
              navigation.goBack();
              DeviceEventEmitter.emit('goBack');
            }}
          />
        </ScrollView>
      </View>
    </NavigationBarContainer>
  );
};

export default ViewDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(3),
    fontWeight: '500',
    marginTop: 10,
    color: THEME_COLOR,
    textAlign: 'center',
    padding: 5,
  },
  bottom: {
    marginBottom: 60,
  },
  dataView: {
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
    backgroundColor: '#ddd',
    marginTop: responsiveHeight(1),
    borderRadius: responsiveWidth(3),
    padding: responsiveWidth(5),
    width: responsiveWidth(94),
    elevation: 5,
  },
  dataText: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(2.5),
    color: THEME_COLOR,
    textAlign: 'center',
    padding: 5,
  },
  bankDataText: {
    alignSelf: 'center',
    fontSize: 15,
    color: THEME_COLOR,
    textAlign: 'center',
    padding: 1,
  },
});
