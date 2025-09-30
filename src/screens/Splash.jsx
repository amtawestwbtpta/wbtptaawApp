import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  Linking,
  Alert,
  Modal,
  TouchableOpacity,
  Image,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { THEME_COLOR } from '../utils/Colors';
import EncryptedStorage from 'react-native-encrypted-storage';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useGlobalContext } from '../context/Store';
import { AndroidAppLink, appVersion } from '../modules/constants';
import CustomButton from '../components/CustomButton';
import RNExitApp from 'react-native-exit-app';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Loader from '../components/Loader';
import { getCollection, getDocumentByField } from '../firebase/firestoreHelper';
import { resetAndNavigate } from '../navigation/NavigationUtil';
import {
  responsiveHeight,
  responsiveFontSize,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import { showToast } from '../modules/Toaster';

const Splash = () => {
  const { setState } = useGlobalContext();
  const navigationOccurred = useRef(false);
  const timerRef = useRef(null);
  const imageTimerRef = useRef(null);

  // Animation values
  const mamata_y = useSharedValue(0);
  const logoImg_y = useSharedValue(0);
  const amta_x = useSharedValue(0);
  const west_x = useSharedValue(0);
  const circle_y = useSharedValue(0);

  // State for image rotation
  const [currentImage, setCurrentImage] = useState('mamata');
  const [showModal, setShowModal] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  // Animation styles
  const mamataImageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -mamata_y.value }],
  }));

  const logoImageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -logoImg_y.value }],
  }));

  const amtaAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: amta_x.value }],
  }));

  const westAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: west_x.value }],
  }));

  const circleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: circle_y.value }],
  }));

  // Initial animation
  const swipeAmtaWestCircle = () => {
    mamata_y.value = responsiveHeight(100);
    logoImg_y.value = responsiveHeight(100);
    amta_x.value = -responsiveWidth(100);
    west_x.value = responsiveWidth(100);
    circle_y.value = responsiveHeight(100);

    mamata_y.value = withTiming(0, { duration: 500 });
    logoImg_y.value = withTiming(0, { duration: 500 });
    amta_x.value = withTiming(0, { duration: 600 });
    west_x.value = withTiming(0, { duration: 700 });
    circle_y.value = withTiming(0, { duration: 800 });
  };

  // Get user details and navigate
  const getDetails = async () => {
    // Prevent duplicate navigation
    if (navigationOccurred.current) return;

    try {
      const userID = JSON.parse(await EncryptedStorage.getItem('user'));
      const teacherID = JSON.parse(await EncryptedStorage.getItem('teacher'));
      const loggedAt = parseInt(await EncryptedStorage.getItem('loggedAt'));

      const res = await getCollection('appUpdate');
      const data = res[0];

      // Check for app updates
      if (data.update && data.appVersion > appVersion) {
        setShowModal(true);
        return;
      }

      // Mark navigation as occurred
      navigationOccurred.current = true;
      if (userID) {
        // Check if session is still valid (15 minutes)
        if ((Date.now() - loggedAt) / 1000 / 60 < 15) {
          setState({
            USER: userID,
            TEACHER: teacherID,
            LOGGEDAT: loggedAt,
          });
          resetAndNavigate('Home');
        } else {
          // Session expired - validate user status
          try {
            const userData = await getDocumentByField(
              'userteachers',
              'empid',
              userID.empid,
            );

            if (userData.disabled) {
              showToast('error', 'Account Disabled', 'Contact WBTPTA Admin');
              await EncryptedStorage.clear();
              resetAndNavigate('Login');
            } else {
              if ((Date.now() - loggedAt) / 1000 / 60 / 60 / 24 / 7 < 7) {
                // Session Valid - User Sent to HomeScreen
                setState({
                  USER: userID,
                  TEACHER: teacherID,
                  LOGGEDAT: Date.now(),
                });
                resetAndNavigate('Home');
              } else {
                // Session expired - User Logged Out
                await EncryptedStorage.clear();
                resetAndNavigate('Login');
              }
            }
          } catch (e) {
            console.log('User validation error:', e);
            await EncryptedStorage.clear();
            resetAndNavigate('Login');
          }
        }
      } else {
        // No user found - go to login
        resetAndNavigate('Login');
      }
    } catch (e) {
      console.log('Error in getDetails:', e);
      resetAndNavigate('Login');
    } finally {
      setShowLoader(false);
    }
  };

  // Rotate images every 2 seconds
  const startImageRotation = () => {
    const images = ['mamata', 'avishek', 'sukanta'];
    let index = 0;

    // Show first image immediately
    setCurrentImage(images[index]);

    // Rotate through images
    imageTimerRef.current = setInterval(() => {
      index = (index + 1) % images.length;
      setCurrentImage(images[index]);
    }, 2000);
  };

  useEffect(() => {
    // Run initial animation
    swipeAmtaWestCircle();

    // Start image rotation
    startImageRotation();

    // After 5 seconds, show loader and get details
    timerRef.current = setTimeout(() => {
      setShowLoader(true);
      getDetails();
    }, 5000);

    // Cleanup on unmount
    return () => {
      clearTimeout(timerRef.current);
      clearInterval(imageTimerRef.current);
    };
  }, []);

  // Render current image with proper source
  const renderCurrentImage = () => {
    const imageStyle = {
      width: 240,
      height: 240,
      marginVertical: responsiveHeight(1),
      borderRadius: 200,
      marginTop: responsiveHeight(6),
    };

    switch (currentImage) {
      case 'mamata':
        return (
          <Animated.Image
            source={require('../assets/images/mb2.png')}
            style={[imageStyle, mamataImageAnimatedStyle]}
          />
        );
      case 'avishek':
        return (
          <Animated.Image
            source={require('../assets/images/ab2.png')}
            style={imageStyle}
          />
        );
      case 'sukanta':
        return (
          <Animated.Image
            source={require('../assets/images/sp2_nama.png')}
            style={imageStyle}
          />
        );
      default:
        return (
          <Animated.Image
            source={require('../assets/images/mb2.png')}
            style={[imageStyle, mamataImageAnimatedStyle]}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={THEME_COLOR} barStyle={'light-content'} />

      {!showModal ? (
        <View
          style={{
            flex: 1,
            alignSelf: 'center',
            justifyContent: 'space-evenly',
            alignItems: 'center',
          }}
        >
          <Image
            style={styles.tmcLogo}
            source={require('../assets/images/tmc.png')}
          />

          {renderCurrentImage()}

          <Animated.Image
            source={require('../assets/images/logo.png')}
            style={[styles.logoImage, logoImageAnimatedStyle]}
          />

          <View style={styles.textContainer}>
            <Animated.Text style={[styles.logoText, amtaAnimatedStyle]}>
              Amta
            </Animated.Text>
            <Animated.Text style={[styles.logoText, westAnimatedStyle]}>
              West
            </Animated.Text>
            <Animated.Text style={[styles.logoText, circleAnimatedStyle]}>
              WBTPTA
            </Animated.Text>
          </View>

          <View style={styles.loaderContainer}>{showLoader && <Loader />}</View>
        </View>
      ) : (
        <Modal animationType="slide" visible={showModal} transparent>
          <View style={styles.modalView}>
            <View style={styles.mainView}>
              <Text style={styles.updateTitle}>Your App Has a New Update</Text>

              <Text style={styles.updateText}>
                Please download and install the latest version and uninstall the
                previous version to enjoy all features.
              </Text>

              <CustomButton
                title={'Download Now'}
                fontSize={responsiveFontSize(1.5)}
                size={'medium'}
                color={'darkgreen'}
                onClick={async () => {
                  await EncryptedStorage.clear();
                  await Linking.openURL(AndroidAppLink);
                }}
              />

              <TouchableOpacity
                style={styles.exitButton}
                onPress={() => RNExitApp.exitApp()}
              >
                <MaterialCommunityIcons
                  name="power"
                  size={responsiveFontSize(4)}
                  color={'red'}
                />
                <Text style={styles.exitText}>Exit App</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME_COLOR,
  },
  tmcLogo: {
    width: 200,
    height: 200,
    position: 'absolute',
    tintColor: 'white',
    top: responsiveHeight(10),
  },
  logoImage: {
    width: 150,
    height: 150,
    marginBottom: responsiveHeight(1),
    marginTop: responsiveHeight(4),
  },
  textContainer: {
    marginVertical: responsiveHeight(3),
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: responsiveFontSize(8),
    // fontWeight: '700',
    color: 'white',
    fontFamily: 'stencil',
    shadowColor: '#fff',
    shadowOffset: {
      width: 2,
      height: 4,
    },
    shadowOpacity: 0.5,
    elevation: 5,
    shadowRadius: 5.46,
  },
  loaderContainer: {
    marginVertical: responsiveHeight(1),
    width: responsiveFontSize(40),
    height: responsiveWidth(40),
  },
  modalView: {
    flex: 1,
    width: responsiveWidth(90),
    padding: responsiveHeight(2),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  mainView: {
    width: responsiveWidth(90),
    padding: responsiveHeight(2),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: 'white',
  },
  updateTitle: {
    fontSize: responsiveFontSize(3),
    fontWeight: '500',
    textAlign: 'center',
    color: THEME_COLOR,
  },
  updateText: {
    fontSize: responsiveFontSize(2),
    fontWeight: '500',
    margin: responsiveHeight(1),
    color: THEME_COLOR,
    textAlign: 'center',
  },
  exitButton: {
    marginTop: responsiveHeight(2),
    justifyContent: 'center',
    alignItems: 'center',
  },
  exitText: {
    color: 'red',
    fontWeight: 'bold',
  },
});

export default Splash;
