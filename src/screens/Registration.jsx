import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  BackHandler,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { THEME_COLOR } from '../utils/Colors';
import CustomTextInput from '../components/CustomTextInput';
import CustomButton from '../components/CustomButton';
import axios from 'axios';
import EncryptedStorage from 'react-native-encrypted-storage';
import storage from '@react-native-firebase/storage';
import ImagePicker from 'react-native-image-crop-picker';
import { Image as Img } from 'react-native-compressor';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Loader from '../components/Loader';
import bcrypt from 'react-native-bcrypt';
import isaac from 'isaac';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import { showToast } from '../modules/Toaster';
import { setDocument, updateDocument } from '../firebase/firestoreHelper';
import { resetAndNavigate } from '../navigation/NavigationUtil';
const Registration = props => {
  let data = props.data;
  let setSignUpFalse = props.setSignUp;

  // console.log(data);
  bcrypt.setRandomFallback(len => {
    const buf = new Uint8Array(len);

    return buf.map(() => Math.floor(isaac.random() * 256));
  });
  const userId = data.id;
  const [visible, setVisible] = useState(false);
  const [path, setPath] = useState('');
  const [imageName, setImageName] = useState('');
  const [titleColor, setTitleColor] = useState('skyblue');
  const [inputField, setInputField] = useState({
    teachersID: data.id,
    tname: data.tname,
    school: data.school,
    desig: data.desig,
    gender: data.gender,
    pan: data.pan,
    udise: data.udise,
    circle: data.circle,
    showAccount: data.showAccount,
    empid: data.empid,
    question: data.question,
    email: data.email,
    phone: data.phone,
    id: userId,
    username: '',
    password: '',
    cpassword: '',
  });
  useEffect(() => {}, [inputField]);

  function ValidateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
  const reference = storage().ref(`/profileImage/${userId}-${imageName}`);

  const registerUser = async () => {
    if (validForm()) {
      setVisible(true);
      const result = await Img.compress(path, {
        progressDivider: 10,
        downloadProgress: progress => {
          console.log('downloadProgress: ', progress);
        },
      });
      const pathToFile = result;
      // uploads file
      await reference.putFile(pathToFile);
      const url = await storage()
        .ref(`/profileImage/${userId}-${imageName}`)
        .getDownloadURL();
      const username = inputField.username.replace(/\s/g, '').toLowerCase();
      await setDocument('userteachers', userId, {
        teachersID: inputField.teachersID,
        tname: inputField.tname,
        school: inputField.school,
        desig: inputField.desig,
        gender: inputField.gender,
        pan: inputField.pan,
        udise: inputField.udise,
        circle: inputField.circle,
        empid: inputField.empid,
        question: inputField.question,
        email: inputField.email,
        id: userId,
        username: username,
        password: bcrypt.hashSync(inputField.password, 10),
        url: url,
        photoName: `${userId}-${imageName}`,
      })
        .then(async () => {
          const backendUrl = `https://awwbtpta.vercel.app/api/signup`;
          inputField.username = username;
          try {
            let response = await axios.post(backendUrl, inputField);
            let record = response.data;
            if (record.success) {
              await setDocument('profileImage', userId, {
                title: inputField.tname,
                description: inputField.school,
                url: url,
                fileName: `${userId}-${imageName}`,
                id: userId,
              }).then(async () => {
                await updateDocument('teachers', userId, {
                  registered: true,
                });
                await ImagePicker.clean()
                  .then(() => {
                    console.log('removed all tmp images from tmp directory');
                  })
                  .catch(e => {
                    console.log(e);
                  });
                EncryptedStorage.clear();
                setVisible(false);
                showToast(
                  'success',
                  `Congratulation ${inputField.tname} You are Successfully Registered!`,
                );
                setInputField({
                  teachersID: '',
                  tname: '',
                  school: '',
                  desig: '',
                  gender: '',
                  pan: '',
                  udise: '',
                  circle: '',
                  showAccount: '',
                  empid: '',
                  question: '',
                  email: '',
                  phone: '',
                  id: '',
                  username: '',
                  password: '',
                  cpassword: '',
                });
                setImageName('');
                setPath('');
                setSignUpFalse();
                setTimeout(() => resetAndNavigate('Login'), 1500);
              });
            } else {
              setVisible(false);
              showToast('error', 'Some Error Happened!');
              EncryptedStorage.clear();
              setTimeout(() => {
                resetAndNavigate('Login');
              }, 1500);
            }
          } catch (e) {
            setVisible(false);
            showToast('error', 'Some Error Happened!');
            console.log(e.response.data.data);
            EncryptedStorage.clear();
            setTimeout(() => {
              resetAndNavigate('Login');
            }, 1500);
          }
        })
        .catch(e => {
          setVisible(false);
          showToast('error', e);
          console.log(e);
        });
    } else {
      setVisible(false);
      showToast('error', 'Form Is Invalid');
      setTitleColor('red');
    }
  };
  const validForm = () => {
    let formIsValid = true;

    if (inputField.username === '') {
      formIsValid = false;
    }
    if (inputField.email === '' || !ValidateEmail(inputField.email)) {
      formIsValid = false;
    }
    if (inputField.phone === '') {
      formIsValid = false;
    }
    if (inputField.password === '') {
      formIsValid = false;
    }
    if (inputField.password.length <= 5) {
      formIsValid = false;
      setErrField(prevState => ({
        ...prevState,
        passwordErr: 'Password length must be minimum 6',
      }));
    }

    if (
      inputField.cpassword === '' ||
      inputField.password !== inputField.cpassword
    ) {
      formIsValid = false;
    }
    console.log(ValidateEmail(inputField.email));
    return formIsValid;
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        setSignUpFalse();
        return true;
      },
    );
    return () => backHandler.remove();
  }, []);
  return (
    <ScrollView>
      <Image
        source={require('../assets/images/bg2.jpg')}
        style={styles.banner}
      />

      <View style={styles.card}>
        <Text selectable style={styles.title}>
          Sign Up
        </Text>
        <CustomTextInput
          placeholder={'Enter Email'}
          title={'Email'}
          color={titleColor}
          value={inputField.email}
          onChangeText={text => setInputField({ ...inputField, email: text })}
        />

        <CustomTextInput
          placeholder={'Enter Mobile Number'}
          title={'Mobile'}
          color={titleColor}
          value={inputField.phone}
          onChangeText={text => setInputField({ ...inputField, phone: text })}
        />

        <CustomTextInput
          placeholder={'Enter Username'}
          title={'Username'}
          color={titleColor}
          value={inputField.username}
          onChangeText={text =>
            setInputField({ ...inputField, username: text })
          }
        />

        <CustomTextInput
          placeholder={'Enter Password'}
          title={'Password'}
          color={titleColor}
          secure={true}
          value={inputField.password}
          onChangeText={text =>
            setInputField({ ...inputField, password: text })
          }
          bgcolor={
            inputField.password === inputField.cpassword &&
            inputField.password !== ''
              ? 'rgba(135, 255, 167,.3)'
              : 'transparent'
          }
        />

        <CustomTextInput
          placeholder={'Enter Confirm Password'}
          title={'Confirm Password'}
          color={titleColor}
          secure={false}
          value={inputField.cpassword}
          onChangeText={text =>
            setInputField({ ...inputField, cpassword: text })
          }
          bgcolor={
            inputField.password === inputField.cpassword &&
            inputField.cpassword !== ''
              ? 'rgba(135, 255, 167,.3)'
              : 'transparent'
          }
        />

        <Text selectable style={[styles.label, { marginBottom: 5 }]}>
          Upload Profile Picture
        </Text>

        {path == '' ? (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'center',
            }}
          >
            <TouchableOpacity
              onPress={async () => {
                await ImagePicker.openCamera({
                  width: 400,
                  height: 400,
                  cropping: true,
                  mediaType: 'photo',
                })
                  .then(image => {
                    setPath(image.path);
                    setImageName(
                      image.path.split('/react-native-image-crop-picker/')[1],
                    );
                  })
                  .catch(async e => {
                    console.log(e);
                    await ImagePicker.clean()
                      .then(() => {
                        console.log(
                          'removed all tmp images from tmp directory',
                        );
                      })
                      .catch(e => {
                        console.log(e);
                      });
                  });
              }}
            >
              <Image
                source={require('../assets/images/camera.png')}
                style={{
                  width: responsiveWidth(10),
                  height: responsiveWidth(10),
                  alignSelf: 'center',
                  tintColor: THEME_COLOR,
                }}
              />
              <Text selectable style={styles.label}>
                Open Camera
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => {
                await ImagePicker.openPicker({
                  width: 400,
                  height: 400,
                  cropping: true,
                  mediaType: 'photo',
                })
                  .then(image => {
                    setPath(image.path);
                    setImageName(
                      image.path.substring(image.path.lastIndexOf('/') + 1),
                    );
                  })
                  .catch(async e => {
                    console.log(e);
                    await ImagePicker.clean()
                      .then(() => {
                        console.log(
                          'removed all tmp images from tmp directory',
                        );
                      })
                      .catch(e => {
                        console.log(e);
                      });
                  });
              }}
              style={{ paddingLeft: responsiveWidth(10) }}
            >
              <Image
                source={require('../assets/images/file.png')}
                style={{
                  width: responsiveWidth(10),
                  height: responsiveWidth(10),
                  alignSelf: 'center',
                  tintColor: THEME_COLOR,
                }}
              />
              <Text selectable style={styles.label}>
                Open Gallery
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={{
              width: responsiveWidth(20),
              height: responsiveHeight(3),

              alignSelf: 'center',
            }}
            onPress={() => {
              setPath('');
            }}
          >
            <View style={{ flexDirection: 'row' }}>
              <View>
                <Image
                  source={{ uri: path }}
                  style={{
                    width: 50,
                    height: 50,
                    alignSelf: 'center',
                    borderRadius: 5,
                  }}
                />
              </View>
              <View>
                <TouchableOpacity onPress={() => setPath('')}>
                  <Text selectable style={{ color: 'red' }}>
                    <MaterialIcons name="cancel" size={20} />
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
        <View style={{ marginTop: responsiveHeight(4) }}>
          <CustomButton title="Sign Up" onClick={registerUser} />
          <CustomButton title="Cancel" color={'red'} onClick={setSignUpFalse} />
        </View>
      </View>
      <Loader visible={visible} />
    </ScrollView>
  );
};

export default Registration;

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
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
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
    marginLeft: responsiveWidth(2),
    color: THEME_COLOR,
    fontWeight: '600',
    fontSize: responsiveFontSize(2),
  },
});
