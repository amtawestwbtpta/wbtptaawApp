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
import EncryptedStorage from 'react-native-encrypted-storage';
import bcrypt from 'react-native-bcrypt';
import isaac from 'isaac';
import Loader from '../components/Loader';
import { useIsFocused } from '@react-navigation/native';
import axios from 'axios';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import { showToast } from '../modules/Toaster';
import {
  getDocumentByField,
  updateDocument,
} from '../firebase/firestoreHelper';
import { resetAndNavigate } from '../navigation/NavigationUtil';
const PasswordForm = ({ email }) => {
  const isFocused = useIsFocused();
  const [loader, setLoader] = useState(false);
  bcrypt.setRandomFallback(len => {
    const buf = new Uint8Array(len);

    return buf.map(() => Math.floor(isaac.random() * 256));
  });
  const [inputField, setInputField] = useState({
    code: '',
    password: '',
    cpassword: '',
    email: email,
  });

  const submitBtn = async () => {
    if (
      inputField.email !== '' &&
      ValidateEmail(inputField.email) &&
      inputField.code !== '' &&
      inputField.password !== '' &&
      inputField.cpassword !== '' &&
      inputField.password === inputField.cpassword
    ) {
      const url = `https://awwbtpta.vercel.app/api/verifyotp`;
      try {
        setLoader(true);
        const password = bcrypt.hashSync(inputField.password, 10);
        const response = await axios.post(url, {
          code: inputField.code,
          email: inputField.email,
          password: password,
        });
        const record = response.data;
        if (record.success) {
          try {
            const result = await getDocumentByField(
              'userteachers',
              'email',
              inputField.email,
            );
            await updateDocument('userteachers', result.id, {
              password: password,
            })
              .then(() => {
                setLoader(false);
                showToast(
                  'success',
                  'Congrats! You are Password Reset is Successfull!',
                );
                setTimeout(async () => {
                  await EncryptedStorage.clear();
                  resetAndNavigate('Login');
                }, 1500);
              })
              .catch(e => {
                setLoader(false);
                showToast('error', e);
                console.log(e);
              });
          } catch (e) {
            setLoader(false);
            showToast('error', e);
            console.log(e);
          }
        } else {
          setLoader(false);
          showToast('error', record.message);
        }
      } catch (e) {
        setLoader(false);
        showToast('error', e);
        console.log(e);
      }
    } else {
      showToast('error', 'Form Is Invalid');
    }
  };
  function ValidateEmail(mail) {
    //eslint-disable-next-line
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/.test(mail)) {
      return true;
    }
    // alert("You have entered an invalid email address!");
    return false;
  }

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
  useEffect(() => {}, [isFocused]);
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={THEME_COLOR} barStyle={'light-content'} />
      <Image
        source={require('../assets/images/bg.jpg')}
        style={styles.banner}
      />

      <View style={styles.card}>
        <Text selectable style={styles.title}>
          Login
        </Text>
        <CustomTextInput
          value={inputField.code}
          placeholder={'Enter OTP'}
          type={'number-pad'}
          onChangeText={text =>
            setInputField({ ...inputField, code: text.replace(/\s/g, '') })
          }
        />
        <CustomTextInput
          value={inputField.password}
          secure={true}
          placeholder={'Enter Password'}
          onChangeText={text =>
            setInputField({ ...inputField, password: text })
          }
        />
        <CustomTextInput
          value={inputField.cpassword}
          placeholder={'Confirm Password'}
          onChangeText={text =>
            setInputField({ ...inputField, cpassword: text })
          }
        />
        <CustomButton title="Submit" onClick={submitBtn} />
        <CustomButton
          title="Cancel"
          onClick={() => resetAndNavigate('Login')}
        />
      </View>
      <Loader visible={loader} />
    </View>
  );
};

export default PasswordForm;

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
