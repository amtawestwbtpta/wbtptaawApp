import { StyleSheet, Text, View, Image, BackHandler } from 'react-native';
import React, { useState, useEffect } from 'react';
import { THEME_COLOR } from '../utils/Colors';
import CustomTextInput from '../components/CustomTextInput';
import CustomButton from '../components/CustomButton';
import Registration from './Registration';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import { useIsFocused } from '@react-navigation/native';
import { showToast } from '../modules/Toaster';
import { resetAndNavigate } from '../navigation/NavigationUtil';
import { getDocumentByField } from '../firebase/firestoreHelper';
const Signup = () => {
  const [showSignUpForm, setShowSignUpForm] = useState(true);
  const [allData, setAllData] = useState({});
  const isFocused = useIsFocused();
  const [empid, setEmpid] = useState('');
  const [titleColor, setTitleColor] = useState('skyblue');
  const findEmpid = async () => {
    if (empid !== '') {
      try {
        const record = await getDocumentByField(
          'userteachers',
          'empid',
          empid.toUpperCase(),
        );
        if (record) {
          showToast(
            'error',
            `Hello ${record.tname}`,
            'You Are Already Registered, Please Login with your username and password',
          );
          setTimeout(() => {
            setEmpid('');
            resetAndNavigate('Login');
          }, 1600);
        } else {
          const trecord = await getDocumentByField(
            'teachers',
            'empid',
            empid.toUpperCase(),
          );
          if (trecord) {
            setAllData(trecord);
            if (trecord.association === 'WBTPTA') {
              showToast(
                'success',
                `Congrats! ${trecord.tname}`,
                `Please Review And Register Yourself On Next Page.`,
              );
              setTimeout(() => {
                setShowSignUpForm(false);
              }, 1500);
            } else {
              showToast(
                'error',
                'Only WBTPTA Members Are Allowed',
                'Join Us Today To get All Advatage.',
              );
            }
          } else {
            showToast(
              'error',
              'Employee ID Is Invalid',
              'Please Enter Correct Employee ID',
            );
          }
        }
      } catch (e) {
        showToast(
          'error',
          'Employee ID Is Invalid',
          'Please Enter Correct Employee ID',
        );
        console.log(e);
      }
    } else {
      showToast('error', 'Form Is Invalid', 'Employee ID Field is Necessary');
      setTitleColor('red');
    }
  };

  const setSignUpFalse = () => {
    setEmpid('');
    setShowSignUpForm(true);
  };
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        resetAndNavigate('Login');
        return true;
      },
    );
    return () => backHandler.remove();
  }, [isFocused]);
  return (
    <View style={styles.container}>
      {showSignUpForm ? (
        <View style={styles.container}>
          <Image
            source={require('../assets/images/bg2.jpg')}
            style={styles.banner}
          />

          <View style={styles.card}>
            <Text selectable style={styles.title}>
              Sign Up
            </Text>
            <Text selectable style={styles.label}>
              Enter Your Employee ID
            </Text>
            <CustomTextInput
              placeholder={'Enter Employee ID'}
              title={'Employee ID'}
              color={titleColor}
              maxLength={10}
              value={empid}
              onChangeText={text => setEmpid(text)}
            />

            <CustomButton title="Sign Up" onClick={findEmpid} />
            <CustomButton
              title="Cancel"
              color={'red'}
              onClick={() => {
                resetAndNavigate('Login');
              }}
            />
          </View>
        </View>
      ) : (
        <Registration data={allData} setSignUp={setSignUpFalse} />
      )}
    </View>
  );
};

export default Signup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  banner: {
    width: responsiveWidth(100),
    height: responsiveHeight(30),
  },
  card: {
    width: responsiveWidth(90),
    height: responsiveHeight(100),
    backgroundColor: 'white',
    position: 'absolute',
    top: responsiveHeight(28),
    elevation: 5,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.7,
  },
  title: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(3),
    fontWeight: '500',
    marginTop: responsiveHeight(3),
    color: THEME_COLOR,
  },
  label: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(2),
    fontWeight: '400',
    marginTop: 5,
    color: THEME_COLOR,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: responsiveHeight(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  textErr: {
    fontSize: responsiveFontSize(2),
    color: 'red',
    alignSelf: 'center',
    marginTop: responsiveHeight(4),
  },
  account: {
    color: 'white',
    fontWeight: '500',
    fontSize: responsiveFontSize(2),
    fontFamily: 'kalpurush',
  },
});
