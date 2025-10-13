import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  PanResponder,
  SafeAreaView,
  ScrollView,
  BackHandler,
} from 'react-native';
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import Header from './Header';
import { useGlobalContext } from '../context/Store';
import AutoHeightImage from '../components/AutoHeightImage';
import { THEME_COLOR } from '../utils/Colors';
import { resetAndNavigate } from '../navigation/NavigationUtil';
import EncryptedStorage from 'react-native-encrypted-storage';
import RNExitApp from 'react-native-exit-app';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { navTabs } from '../navigation/NavItems';
import CustomIcon from '../components/CustomIcon';
import { useNavigation, useRoute } from '@react-navigation/native';
const NavigationBarContainer = ({ children }) => {
  const { navState, setNavState, setActiveTab, activeTab, setState } =
    useGlobalContext();
  const spinAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const navigation = useNavigation();
  const route = useRoute();
  // Create pan responder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !navState,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -30 && !navState) {
          // Swipe left detected - show nav
          showNav();
        } else if (
          (gestureState.dx > 30 && navState) ||
          gestureState.vx > 0.3
        ) {
          // Swipe right detected - hide nav
          hideNav();
        }
      },
    }),
  ).current;

  const showNav = () => {
    setNavState(true);

    // Reset animations
    spinAnim.setValue(0);
    slideAnim.setValue(0);
    opacityAnim.setValue(0);

    // Run animations together
    Animated.parallel([
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideNav = index => {
    // Run reverse animations
    Animated.parallel([
      Animated.timing(spinAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      resetAndNavigate('Home');
      setActiveTab(index);
      setNavState(false);
    });
  };
  const hideNavBar = () => {
    // Run reverse animations
    Animated.parallel([
      Animated.timing(spinAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setNavState(false);
    });
  };

  // Interpolate animations
  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['90deg', '0deg'],
  });

  const slide = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [responsiveWidth(80), 0],
  });

  const opacity = opacityAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const renderNavItem = (item, index) => (
    <TouchableOpacity
      key={item.id}
      style={styles.navItem}
      onPress={() => {
        hideNav(index);
      }}
    >
      <Text style={styles.navIcon}>
        <CustomIcon
          family={item.iconFamily}
          name={item.iconName}
          size={responsiveFontSize(3)}
          color={activeTab === index ? 'yellow' : 'white'}
        />
      </Text>
      <Text
        style={[
          styles.navText,
          { color: activeTab === index ? 'yellow' : 'white' },
        ]}
      >
        {item.title}
      </Text>
    </TouchableOpacity>
  );
  const [backPressCount, setBackPressCount] = useState(0);
  const handleBackPress = () => {
    if (navState) {
      hideNavBar();
    } else {
      if (backPressCount === 0 && route.name !== 'Home') {
        navigation.goBack();
      } else if (backPressCount === 0 && activeTab !== 0) {
        setActiveTab(0);
      } else if (backPressCount === 0) {
        setBackPressCount(prevCount => prevCount + 1);
        setTimeout(() => setBackPressCount(0), 2000);
      } else if (backPressCount === 1 && route.name !== 'Home') {
        navigation.goBack();
      } else if (backPressCount === 1 && route.name === 'Home') {
        RNExitApp.exitApp();
      }
    }

    return true;
  };

  useEffect(() => {
    const backListener = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );
    return backListener.remove;
  }, [handleBackPress]);
  useEffect(() => {}, [route, backPressCount]);
  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.header} {...panResponder.panHandlers}>
        <Header showNav={showNav} hideNavBar={hideNavBar} />
      </View>
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: responsiveHeight(18),
          right: 20,
          zIndex: 5,
          opacity: 0.2,
        }}
        onPress={() => {
          if (navState) {
            hideNavBar();
          } else {
            showNav();
          }
          setNavState(!navState);
        }}
      >
        <CustomIcon
          family="AntDesign"
          name={!navState ? 'menu-unfold' : 'menu-fold'}
          size={30}
        />
      </TouchableOpacity>
      {/* Scrollable Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={!navState}
        {...panResponder.panHandlers}
      >
        <View
          style={[styles.container, { marginVertical: responsiveHeight(1) }]}
        >
          {children}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © WBTPTA Amta West Circle {new Date().getFullYear()}
          </Text>
        </View>
      </ScrollView>

      {/* Navigation Bar Section */}

      {/* Navigation Overlay */}
      {navState && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={hideNavBar}
        />
      )}

      {/* Navigation Bar */}
      <Animated.View
        style={[
          styles.navbar,
          {
            transform: [{ translateX: slide }, { rotateY: spin }],
            opacity: opacity,
          },
        ]}
      >
        <View style={styles.navHeader}>
          <Text style={styles.navTitle}>Menu</Text>
          <TouchableOpacity onPress={hideNavBar}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>
        <View
          style={[styles.navHeader, { flexDirection: 'column', padding: 0 }]}
        >
          <AutoHeightImage
            src={require('../assets/images/logo.png')}
            style={{
              width: responsiveWidth(15),
              margin: responsiveHeight(1),
              alignSelf: 'center',
            }}
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'center',
            }}
          >
            <Text
              style={[
                styles.navTitle,
                { alignSelf: 'center', fontFamily: 'timesbd' },
              ]}
            >
              WBTPTA{' '}
            </Text>
            <Text
              style={[
                styles.navTitle,
                {
                  alignSelf: 'center',
                  fontFamily: 'sho',
                  fontSize: responsiveFontSize(2.8),
                },
              ]}
            >
              আমতা পশ্চিম চক্র
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.navScroll}
          contentContainerStyle={styles.navItemsContainer}
        >
          {navTabs.map(renderNavItem)}
        </ScrollView>

        <View style={styles.navFooter}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: responsiveWidth(2),
              width: '80%',
              marginVertical: responsiveHeight(2),
            }}
          >
            <TouchableOpacity
              onPress={async () => {
                setNavState(false);
                setActiveTab(0);
                setState({
                  USER: '',
                  TEACHER: '',
                  LOGGEDAT: '',
                  TOKEN: '',
                });
                await EncryptedStorage.clear();
                resetAndNavigate('Login');
              }}
            >
              <MaterialCommunityIcons
                name="logout"
                size={responsiveFontSize(2)}
                color={'red'}
              >
                Sign Out
              </MaterialCommunityIcons>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                RNExitApp.exitApp();
              }}
            >
              <MaterialCommunityIcons
                name="close-circle"
                size={responsiveFontSize(2)}
                color={'red'}
              >
                Exit App
              </MaterialCommunityIcons>
            </TouchableOpacity>
          </View>
          <Text style={styles.navFooterText}>
            © WBTPTA Amta West Circle {new Date().getFullYear()}
          </Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(5),
    paddingVertical: responsiveHeight(3),
    backgroundColor: '#1a1a2e',
    borderBottomWidth: responsiveHeight(0.3),
    borderBottomColor: 'darkgreen',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: responsiveHeight(2),
  },
  footer: {
    padding: responsiveWidth(2),
    alignItems: 'center',
    marginTop: responsiveHeight(2),
    borderTopWidth: responsiveWidth(0.2),
    borderTopColor: 'rgba(255,255,255,0.1)',
    position: 'static',
    bottom: 0,
  },
  footerText: {
    fontSize: responsiveFontSize(1.8),
    color: THEME_COLOR,
    marginBottom: responsiveHeight(0.5),
  },
  navbar: {
    position: 'absolute',
    top: 0,
    right: 0,
    height: '100%',
    width: responsiveWidth(80),
    backgroundColor: '#0068bd',
    borderLeftWidth: responsiveWidth(0.3),
    borderLeftColor: '#e74c3c',
    transformOrigin: 'right',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  navHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: responsiveWidth(2),
    paddingHorizontal: responsiveWidth(4),
    // paddingTop: responsiveHeight(2),
    borderBottomWidth: responsiveWidth(0.3),
    borderBottomColor: '#16213e',
  },
  navTitle: {
    fontSize: responsiveFontSize(2.5),
    fontFamily: 'timesbd',
    color: '#fff',
  },
  closeButton: {
    fontSize: responsiveFontSize(2.5),
    color: '#e74c3c',
    fontWeight: '200',
  },
  navScroll: {
    flex: 1,
  },
  navItemsContainer: {
    padding: responsiveWidth(2),
    paddingBottom: responsiveHeight(5),
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: responsiveHeight(1),
    borderBottomWidth: responsiveWidth(0.2),
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  navIcon: {
    fontSize: responsiveFontSize(1.8),
    marginRight: responsiveWidth(4),
    color: '#ffcc00',
    width: responsiveWidth(8),
    textAlign: 'center',
  },
  navText: {
    fontSize: responsiveFontSize(1.8),
    color: '#fff',
    fontWeight: '500',
  },
  navFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(20, 20, 40, 0.9)',
    padding: responsiveWidth(0.5),
    alignItems: 'center',
  },
  navFooterText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: responsiveFontSize(1.8),
    marginBottom: responsiveHeight(0.5),
  },
  bottomText: {
    fontSize: responsiveFontSize(1.5),
    color: THEME_COLOR,
    textAlign: 'center',
    // fontWeight: '600',
  },
});

export default NavigationBarContainer;
