import {
  StyleSheet,
  Text,
  View,
  Image,
  BackHandler,
  Alert,
  TouchableOpacity,
  Linking,
  ScrollView,
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { THEME_COLOR } from '../utils/Colors';
import CustomTextInput from '../components/CustomTextInput';
import CustomButton from '../components/CustomButton';
import { useNavigation } from '@react-navigation/native';
import EncryptedStorage from 'react-native-encrypted-storage';
import Loader from '../components/Loader';
import { useIsFocused } from '@react-navigation/native';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import { useGlobalContext } from '../context/Store';
import bcrypt from 'react-native-bcrypt';
import isaac from 'isaac';
import { TelegramURL } from '../modules/constants';
import { showToast } from '../modules/Toaster';
import { getDocumentByField } from '../firebase/firestoreHelper';
import RNExitApp from 'react-native-exit-app';
import { resetAndNavigate } from '../navigation/NavigationUtil';
const Login = () => {
  const navigationOccurred = useRef(false);
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { state, setState } = useGlobalContext();
  const [visible, setVisible] = useState(false);
  const [token, setToken] = useState('');
  const [titleColor, setTitleColor] = useState('darkgreen');
  const [inputField, setInputField] = useState({
    username: '',
    password: '',
  });
  const [errField, setErrField] = useState({
    usernameErr: '',
    passwordErr: '',
  });
  bcrypt.setRandomFallback(len => {
    const buf = new Uint8Array(len);

    return buf.map(() => Math.floor(isaac.random() * 256));
  });
  const compare = (userPassword, serverPassword) => {
    let match = bcrypt.compareSync(userPassword, serverPassword);

    return match;
  };

  const validForm = () => {
    let formIsValid = true;
    setErrField({
      usernameErr: '',
      passwordErr: '',
      cpasswordErr: '',
    });
    if (inputField.username === '') {
      formIsValid = false;
      setErrField(prevState => ({
        ...prevState,
        usernameErr: 'Please Enter Username',
      }));
    }

    if (inputField.password === '') {
      formIsValid = false;
      setErrField(prevState => ({
        ...prevState,
        passwordErr: 'Please Enter Password',
      }));
    }

    return formIsValid;
  };

  const submitForm = async () => {
    if (validForm()) {
      setVisible(true);
      try {
        const username = inputField.username.replace(/\s/g, '').toLowerCase();
        const record = await getDocumentByField(
          'userteachers',
          'username',
          username,
        );
        const userRecord = JSON.stringify(record);
        if (userRecord) {
          if (compare(inputField.password, record.password)) {
            if (!record.disabled) {
              try {
                const trecord = await getDocumentByField(
                  'teachers',
                  'pan',
                  record.pan,
                );
                const teacherRecord = JSON.stringify(trecord);
                const loggedAt = Date.now().toString();

                setState({
                  USER: record,
                  TEACHER: trecord,
                  LOGGEDAT: loggedAt,
                });

                await EncryptedStorage.setItem('teacher', teacherRecord);
                await EncryptedStorage.setItem('user', userRecord);
                await EncryptedStorage.setItem('loggedAt', loggedAt);
                setVisible(false);
                showToast(
                  'success',
                  `Congrats ${record.tname}!`,
                  'You are Logined Successfully!',
                );
                setInputField({
                  username: '',
                  password: '',
                });
                setTimeout(() => resetAndNavigate('Home'), 600);
              } catch (e) {
                showToast('error', 'Your Account Not Found');
                console.log(e);
              }
            }
          } else {
            setVisible(false);
            showToast('error', 'Invalid Username or Password');
          }
        } else {
          setVisible(false);
          showToast('error', 'Invalid Username or Password');
        }
      } catch (e) {
        setVisible(false);
        console.log(e);
        showToast('error', 'Connection Error');
      }
    } else {
      showToast('error', 'Form Is Invalid');
      setTitleColor('red');
    }
  };

  const checkLogin = async () => {
    if (navigationOccurred.current) return;
    navigationOccurred.current = true;
    const user = await EncryptedStorage.getItem('user');
    if (user) {
      resetAndNavigate('Home');
    }
  };
  useEffect(() => {}, [inputField]);
  useEffect(() => {
    checkLogin();
  }, [isFocused]);

  useEffect(() => {
    const backAction = () => {
      Alert.alert('Hold On!', 'Are You Sure To Exit App?', [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        {
          text: 'Exit',
          onPress: () => RNExitApp.exitApp(),
        },
      ]);
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  }, [isFocused]);
  return (
    <ScrollView>
      <Image
        source={require('../assets/images/bg2.jpg')}
        style={styles.banner}
      />

      <View style={styles.card}>
        <Text selectable style={styles.title}>
          Login
        </Text>
        <CustomTextInput
          value={inputField.username}
          title={'Username'}
          color={titleColor}
          placeholder={'Enter Username'}
          onChangeText={text =>
            setInputField({ ...inputField, username: text })
          }
        />
        {errField.usernameErr.length > 0 && (
          <Text selectable style={styles.textErr}>
            {errField.usernameErr}
          </Text>
        )}
        <CustomTextInput
          secure={true}
          value={inputField.password}
          title={'Password'}
          color={titleColor}
          placeholder={'Enter Password'}
          onChangeText={text => {
            setInputField({ ...inputField, password: text });
          }}
        />
        {errField.passwordErr.length > 0 && (
          <Text selectable style={styles.textErr}>
            {errField.passwordErr}
          </Text>
        )}

        <CustomButton title="Login" onClick={submitForm} />
        <View style={styles.row}>
          <Text selectable style={{ color: 'black', fontSize: 18 }}>
            Don't Have an Account?
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: 'green',
              padding: responsiveWidth(2),
              borderRadius: 5,
              marginLeft: 5,
            }}
            onPress={() => resetAndNavigate('SignUp')}
          >
            <Text
              selectable
              style={styles.account}
              // onPress={() => resetAndNavigate('Signup')}
            >
              Create New
            </Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.row, { marginTop: 20 }]}>
          <Text selectable style={{ color: 'black', fontSize: 18 }}>
            Forgot Password?
          </Text>
          <TouchableOpacity
            onPress={() => resetAndNavigate('OTPForm')}
            style={{
              backgroundColor: 'chocolate',
              padding: responsiveWidth(2),
              borderRadius: 5,
              marginLeft: 5,
            }}
          >
            <Text selectable style={styles.account}>
              Press Here
            </Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.row, { marginTop: 20 }]}>
          <Text selectable style={{ color: 'black', fontSize: 18 }}>
            Feeling Trouble?
          </Text>
          <TouchableOpacity
            onPress={async () => await Linking.openURL(TelegramURL)}
            style={{
              backgroundColor: 'blueviolet',
              padding: responsiveWidth(2),
              borderRadius: 5,
              marginLeft: 5,
            }}
          >
            <Text selectable style={styles.account}>
              Press Here
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <Loader visible={visible} />
    </ScrollView>
  );
};

export default Login;

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

    backgroundColor: 'white',

    elevation: 5,
    borderRadius: responsiveWidth(5),
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.7,
    marginTop: -responsiveHeight(3),
    marginBottom: responsiveHeight(3),
    paddingBottom: responsiveHeight(2),
  },
  title: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(3),
    fontWeight: '500',
    marginTop: responsiveHeight(1),
    color: THEME_COLOR,
  },
  label: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(1.5),
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
  },
});
