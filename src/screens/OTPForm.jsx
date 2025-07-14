import {
  StyleSheet,
  Text,
  View,
  Image,
  StatusBar,
  BackHandler,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { THEME_COLOR } from '../utils/Colors';
import CustomTextInput from '../components/CustomTextInput';
import CustomButton from '../components/CustomButton';
import Loader from '../components/Loader';
import { useIsFocused } from '@react-navigation/native';
import axios from 'axios';
import PasswordForm from './PasswordForm';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import { showToast } from '../modules/Toaster';
import { resetAndNavigate } from '../navigation/NavigationUtil';
const OTPForm = () => {
  const isFocused = useIsFocused();
  const [otpform, showform] = useState(true);
  const [loader, setLoader] = useState(false);
  const [email, setEmail] = useState('');

  const sendOtp = async () => {
    if (ValidateEmail(email)) {
      const url = `https://awwbtpta.vercel.app/api/forgotpassword`;
      let options = {
        method: 'POST',
        url: url,
        data: { email: email },
      };
      try {
        setLoader(true);
        let response = await axios(options);
        let record = response.data;
        if (record.success) {
          showToast('success', record.message);
          showform(false);
          setLoader(false);
        } else {
          setLoader(false);
          showToast('error', record.message);
        }
      } catch (e) {
        setLoader(false);
        showToast('error', 'Something Went Wrong!');
        console.log(e);
      }
    } else {
      showToast('error', 'Invalid Email!');
    }
  };

  function ValidateEmail(mail) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/.test(mail)) {
      return true;
    }
    // alert("You have entered an invalid email address!");
    return false;
  }
  useEffect(() => {}, [isFocused]);
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
      <StatusBar backgroundColor={THEME_COLOR} barStyle={'light-content'} />
      {otpform ? (
        <View style={styles.container}>
          <Image
            source={require('../assets/images/bg2.jpg')}
            style={styles.banner}
          />
          <View style={styles.card}>
            <Text selectable style={styles.title}>
              Forgot Password
            </Text>
            <Text selectable style={styles.label}>
              Enter Email
            </Text>
            <CustomTextInput
              placeholder={'Enter Email'}
              value={email}
              type={'email-address'}
              onChangeText={text => setEmail(text.replace(/\s/g, ''))}
            />
            <CustomButton title="Send OTP" onClick={sendOtp} />
            <CustomButton
              title="Go Back"
              onClick={() => resetAndNavigate('Login')}
            />
          </View>
          <Loader visible={loader} />
        </View>
      ) : (
        <PasswordForm email={email} />
      )}
    </View>
  );
};

export default OTPForm;

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
