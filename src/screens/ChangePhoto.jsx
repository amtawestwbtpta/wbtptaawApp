import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { THEME_COLOR } from '../utils/Colors';
import ImagePicker from 'react-native-image-crop-picker';
import { Image as Img } from 'react-native-compressor';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CustomButton from '../components/CustomButton';
import storage from '@react-native-firebase/storage';
import Loader from '../components/Loader';
import { useGlobalContext } from '../context/Store';
import EncryptedStorage from 'react-native-encrypted-storage';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import { useNavigation } from '@react-navigation/native';
import { useIsFocused } from '@react-navigation/native';
import { showToast } from '../modules/Toaster';
import { updateDocument } from '../firebase/firestoreHelper';
const ChangePhoto = () => {
  const navigation = useNavigation();
  const { state, setState } = useGlobalContext();
  const user = state.USER;
  const isFocused = useIsFocused();
  const [visible, setVisible] = useState(false);
  const [path, setPath] = useState('');
  const [imageName, setImageName] = useState('');

  const [disable, setDisable] = useState(true);

  const uploadPhoto = async () => {
    setVisible(true);

    const result = await Img.compress(path, {
      progressDivider: 10,
      downloadProgress: progress => {
        console.log('downloadProgress: ', progress);
      },
    });
    const pathToFile = result;
    const reference = storage().ref(
      `/profileImage/${user.id + '-' + imageName}`,
    );
    await reference
      .putFile(pathToFile)
      .then(() => {
        showToast('success', 'Photo Uploaded Successfully');
      })
      .catch(e => {
        showToast('error', 'Photo Upload Failed');
        console.log(e);
      });
    await storage()
      .ref('/profileImage/' + user.photoName)
      .delete()
      .then(async () => {
        const url = await storage()
          .ref(`/profileImage/${user.id + '-' + imageName}`)
          .getDownloadURL();
        await updateDocument('userteachers', user.id, {
          url: url,
          photoName: user.id + '-' + imageName,
        })
          .then(async () => {
            await updateDocument('profileImage', user.id, {
              url: url,
              fileName: user.id + '-' + imageName,
            })
              .then(async () => {
                user.url = url;
                user.photoName = user.id + '-' + imageName;
                let newuser = JSON.stringify(user);
                await EncryptedStorage.setItem('user', newuser);
                setState({ ...state, USER: user });
                setVisible(false);
                setPath('');
                setImageName('');
                setDisable(true);
                await ImagePicker.clean()
                  .then(() => {
                    console.log('removed all tmp images from tmp directory');
                  })
                  .catch(e => {
                    console.log(e);
                  });
                showToast('success', 'Photo Changed Successfully');

                setTimeout(() => {
                  navigation.navigate('Home');
                }, 2000);
              })
              .catch(e => {
                showToast('error', 'profileImage update failed');
                console.log(e);
              });
          })
          .catch(e => {
            setVisible(false);
            showToast('error', 'userteachers database update Error');
            console.log('2nd Try', e);
          });
      })
      .catch(e => {
        setVisible(false);
        showToast('error', 'Profile Image Deletation Failed!');
        console.log(e);
      });
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        navigation.navigate('Home');
        return true;
      },
    );
    return () => backHandler.remove();
  }, [isFocused]);
  useEffect(() => {}, [isFocused]);
  return (
    <View style={{ flex: 1 }}>
      <Text
        selectable
        style={{
          fontSize: responsiveFontSize(4),
          fontWeight: '600',
          color: THEME_COLOR,
          alignSelf: 'center',
          margin: responsiveHeight(3),
        }}
      >
        Change Photo
      </Text>
      <Image
        source={{
          uri: user.url,
        }}
        style={{
          width: responsiveWidth(20),
          height: responsiveWidth(20),
          borderRadius: responsiveWidth(10),
          alignSelf: 'center',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      />
      <View style={styles.imageView}>
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
                      image.path.substring(image.path.lastIndexOf('/') + 1),
                    );

                    setDisable(false);
                  })
                  .catch(async e => {
                    console.log(e);
                    setDisable(true);
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
                    setDisable(false);
                  })
                  .catch(async e => {
                    console.log(e);
                    setDisable(true);
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

              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'center',
            }}
            onPress={() => {
              setPath('');
              setDisable(true);
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'flex-start',
                alignSelf: 'center',
              }}
            >
              <View>
                <Image
                  source={{ uri: path }}
                  style={{
                    width: responsiveWidth(45),
                    height: responsiveWidth(45),
                    alignSelf: 'center',
                    borderRadius: 5,
                  }}
                />
              </View>
              <View>
                <TouchableOpacity
                  onPress={() => {
                    setPath('');
                    setDisable(true);
                  }}
                >
                  <Text selectable style={{ color: 'red' }}>
                    <MaterialIcons name="cancel" size={20} />
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
      </View>
      <CustomButton
        btnDisable={disable}
        title={'Upload Photo'}
        onClick={uploadPhoto}
      />
      <CustomButton
        title={'Cancel'}
        color={'blueviolet'}
        onClick={() => navigation.navigate('Home')}
      />
      <Loader visible={visible} />
    </View>
  );
};

export default ChangePhoto;

const styles = StyleSheet.create({
  imageView: {
    width: responsiveWidth(80),
    height: responsiveHeight(30),
    borderColor: THEME_COLOR,
    padding: responsiveWidth(20),
    borderWidth: 2,
    margin: responsiveHeight(3),
    borderRadius: 10,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(1.5),
    color: THEME_COLOR,
    textAlign: 'center',
    padding: 5,
  },
});
