import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
  Modal,
  Switch,
  BackHandler,
} from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { THEME_COLOR } from '../utils/Colors';
import EncryptedStorage from 'react-native-encrypted-storage';
import CustomButton from '../components/CustomButton';
import {
  GetMonthName,
  INR,
  IndianFormat,
  readCSVFile,
} from '../modules/calculatefunctions';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import RNExitApp from 'react-native-exit-app';
import Carousel from 'react-native-reanimated-carousel';
import ImageView from 'react-native-image-viewing';
import { downloadFile } from '../modules/downloadFile';
import {
  AppURL,
  appVersion,
  TelegramURL,
  VercelWeb,
} from '../modules/constants';
import { useGlobalContext } from '../context/Store';
import Loader from '../components/Loader';
import Ropa from '../modules/ropa';
import { updateDocument } from '../firebase/firestoreHelper';
import { showToast } from '../modules/Toaster';
import { resetAndNavigate } from '../navigation/NavigationUtil';
const Dashboard = () => {
  const {
    state,
    slideState,
    setStateObject,
    questionRateState,
    setNavState,
    setActiveTab,
    setStateArray,
  } = useGlobalContext();
  const user = state.USER;
  const navigation = useNavigation();
  const teacher = state.TEACHER;
  const isFocused = useIsFocused();
  const [showData, setShowData] = useState(false);
  const [btnText, setBtnText] = useState('Show Your Data');
  const [dataFetched, setDataFetched] = useState(false);
  const [bankData, setBankData] = useState({});
  const [slides, setSlides] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [showProfilePhoto, setShowProfilePhoto] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [titles, setTitles] = useState([]);
  const [photoNames, setPhotoNames] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showUpdModal, setShowUpdModal] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [inputField, setInputField] = useState({
    id: 'mmTthKv8liICC83Eia2n',
    appVersion: appVersion,
    update: true,
  });
  const ifsc_ser = () => {
    fetch(`https://ifsc.razorpay.com/${teacher.ifsc}`)
      .then(res => res.json())
      .then(data => setBankData(data));
  };
  const [images, setImages] = useState([]);
  const today = new Date();
  const year = today.getFullYear();
  const [month, setMonth] = useState(GetMonthName(today.getMonth()));

  let tname,
    id,
    desig,
    school,
    disability,
    empid,
    pan,
    addl,
    da,
    hra,
    ma,
    gross,
    gpf,
    gpfprev,
    pfund,
    ptax,
    gsli,
    udise,
    bank,
    account,
    ifsc,
    level,
    cell,
    ir;
  tname = teacher.tname;
  id = teacher.id;
  desig = teacher.desig;
  school = teacher.school;
  disability = teacher.disability;
  empid = teacher.empid;
  pan = teacher.pan;
  udise = teacher.udise;
  bank = teacher.bank;
  account = teacher.account;
  ifsc = teacher.ifsc;

  let netpay;

  let basicpay;

  const [salary, setSalary] = useState({
    basic: 0,
    da: 0.14,
    pfund: 0,
    ma: 0,
    addl: 0,
    ir: 0,
    hra: 0,
    gross: 0,
    netpay: 0,
    ptax: 0,
    level: 0,
    cell: 0,
    deduction: 0,
    id,
    tname,
    desig,
    school,
    disability,
    empid,
    pan,
    udise,
    bank,
    account,
    ifsc,
    month: month,
    year: year,
    basicpay,
    today: today,
  });

  const getModifiedSalary = async () => {
    setShowLoader(true);
    const q1 = await readCSVFile(`${month.toLowerCase()}-${year}`);
    const q2 = await readCSVFile(`april-2024`);
    const monthSalary = q1?.filter(el => el.id === id)[0];
    const aprilSalary = q2?.filter(el => el.id === id)[0];
    if (month === 'July' && year === 2024 && aprilSalary?.basic > 0) {
      ir = Math.round(aprilSalary?.basic * 0.04);
    } else {
      ir = 0;
    }
    basicpay = monthSalary?.basic;
    da = Math.round(basicpay * monthSalary?.daPercent);
    hra =
      monthSalary?.hraPercent > 10
        ? monthSalary?.hraPercent
        : Math.round(basicpay * monthSalary?.hraPercent);
    addl = monthSalary?.addl;
    ma = monthSalary?.ma;
    pfund = monthSalary?.gpf;
    gsli = monthSalary?.gsli;
    level = Ropa(basicpay).lv;
    cell = Ropa(basicpay).ce;
    gross = basicpay + da + ir + hra + addl + ma;
    if (gross > 40000) {
      ptax = 200;
    } else if (gross > 25000) {
      ptax = 150;
    } else if (gross > 15000) {
      ptax = 130;
    } else if (gross > 10000) {
      ptax = 110;
    } else {
      ptax = 0;
    }

    if (disability === 'YES') {
      ptax = 0;
    }

    let deduction = gsli + pfund + ptax;

    netpay = gross - deduction;
    setSalary({
      ...salary,
      level,
      cell,
      basicpay,
      basic: basicpay,
      da,
      ir,
      hra,
      addl,
      ma,
      pfund,
      gross,
      ptax,
      netpay,
      deduction,
      gsli,
      month,
      year,
    });
    setShowLoader(false);
  };

  const getphotos = async () => {
    setSlides(slideState);
    let i = [];

    slideState.map(el => {
      return i.push({ uri: el.url });
    });
    setImages(i);
    let p = [];

    slideState.map(el => {
      return p.push({ fileName: el.fileName, url: el.url });
    });
    setPhotoNames(p);
    let t = [];
    slideState.map(el => {
      return t.push({ titles: el.title, descriptions: el.description });
    });
    setTitles(t);
  };

  const disableUpdate = async () => {
    setShowLoader(true);
    await updateDocument('appUpdate', inputField.id, {
      update: false,
    })
      .then(async () => {
        setShowLoader(false);
        showToast('success', 'App Update Set Closed Successfully!');
      })
      .catch(e => {
        setShowLoader(false);
        showToast('error', 'App Update Updation Failed!');
        console.log(e);
      });
  };
  const enableUpdate = async () => {
    setShowLoader(true);
    await updateDocument('appUpdate', inputField.id, {
      update: true,
    })
      .then(async () => {
        setShowLoader(false);
        showToast('success', 'App Update Set Open Successfully!');
      })
      .catch(e => {
        setShowLoader(false);
        showToast('error', 'App Update Updation Failed!');
        console.log(e);
      });
  };
  const updateAppVersion = async () => {
    setShowLoader(true);
    try {
      await updateDocument('appUpdate', inputField.id, inputField)
        .then(async () => {
          setShowLoader(false);
          setShowUpdModal(false);
          showToast(
            'success',
            `App Update Set to ${
              inputField.update ? 'Enabled' : 'Disabled'
            } Successfully!`,
          );
        })
        .catch(e => {
          setShowLoader(false);
          showToast('error', 'App Update Updation Failed!');
          console.log(e);
        });
    } catch (error) {
      setShowLoader(false);
      showToast('error', 'App Update Updation Failed!');
      console.log(error);
    }
  };

  useEffect(() => {
    getphotos();
    if (teacher === '') {
      EncryptedStorage.clear();
      navigation.navigate('Login');
    }
  }, [isFocused, slideState]);
  const [backPressCount, setBackPressCount] = useState(0);

  const handleBackPress = useCallback(() => {
    if (backPressCount === 0) {
      setBackPressCount(prevCount => prevCount + 1);
      setTimeout(() => setBackPressCount(0), 2000);
    } else if (backPressCount === 1) {
      RNExitApp.exitApp();
    }
    return true;
  }, [backPressCount]);

  useEffect(() => {
    const backListener = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );
    return backListener.remove;
  }, [handleBackPress]);

  return (
    <View style={styles.container}>
      <Loader visible={showLoader} />
      <ScrollView>
        <View
          style={[
            styles.bottom,
            { flex: 1, shadowColor: 'black', elevation: 5 },
          ]}
        >
          <Carousel
            loop
            mode="parallax"
            modeConfig={{
              parallaxScrollingScale: 0.9,
              parallaxScrollingOffset: 50,
            }}
            width={responsiveWidth(100)}
            height={responsiveHeight(35)}
            autoPlay={true}
            autoPlayInterval={1000}
            pagingEnabled={true}
            snapEnabled={true}
            data={slides}
            scrollAnimationDuration={1000}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={{
                  flex: 1,
                  // borderWidth: 1,
                  justifyContent: 'center',
                }}
                onPress={() => {
                  setCurrentIndex(index);
                  setIsVisible(true);
                }}
              >
                <View
                  style={{
                    width: responsiveWidth(100),
                    height: responsiveHeight(8),
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'center',
                    backgroundColor: 'darkorange',
                    borderTopLeftRadius: responsiveHeight(2),
                    borderTopRightRadius: responsiveHeight(2),
                  }}
                >
                  <Text
                    selectable
                    style={[
                      styles.dataText,
                      {
                        fontSize: responsiveFontSize(2.5),
                        color: 'white',
                        fontWeight: '700',
                        fontFamily: 'Roboto',
                      },
                    ]}
                  >
                    {item.title}
                  </Text>
                </View>
                <Image
                  source={{ uri: item.url }}
                  style={{
                    width: responsiveWidth(100),
                    height: responsiveHeight(20),
                    alignSelf: 'center',
                  }}
                />
                <View
                  style={{
                    width: responsiveWidth(100),
                    height: responsiveHeight(8),
                    borderBottomLeftRadius: responsiveWidth(4),
                    borderBottomRightRadius: responsiveWidth(4),
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'center',
                    backgroundColor: 'green',
                  }}
                >
                  <Text
                    selectable
                    style={[
                      styles.dataText,
                      {
                        fontSize: responsiveFontSize(1.8),
                        color: 'white',
                        fontWeight: '700',
                      },
                    ]}
                  >
                    {item.description}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
          <ImageView
            images={images}
            imageIndex={currentIndex}
            visible={isVisible}
            presentationStyle={'overFullScreen'}
            onRequestClose={() => setIsVisible(false)}
            animationType="slide"
            onImageIndexChange={index => setCurrentIndex(index)}
            FooterComponent={() => {
              return (
                <View>
                  <Text
                    selectable
                    style={[
                      styles.dataText,
                      { fontSize: responsiveFontSize(1.8), color: 'white' },
                    ]}
                  >
                    {titles[currentIndex].titles}
                  </Text>

                  <Text
                    selectable
                    style={[
                      styles.dataText,
                      { fontSize: responsiveFontSize(1.5), color: 'white' },
                    ]}
                  >
                    {titles[currentIndex].descriptions}
                  </Text>
                  <TouchableOpacity
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      position: 'absolute',
                      top: -responsiveHeight(85),
                      left: responsiveWidth(65),
                    }}
                    onPress={async () => {
                      await downloadFile(
                        photoNames[currentIndex].url,
                        photoNames[currentIndex].fileName,
                      );

                      setIsVisible(false);
                    }}
                  >
                    <MaterialIcons
                      name="download-for-offline"
                      color={'white'}
                      size={30}
                    />
                    <Text
                      selectable
                      style={[
                        styles.dataText,
                        { fontSize: responsiveFontSize(1.5), color: 'white' },
                      ]}
                    >
                      Download
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            }}
          />
          <ImageView
            images={[{ uri: user.url }]}
            imageIndex={0}
            visible={showProfilePhoto}
            doubleTapToZoomEnabled={true}
            presentationStyle="overFullScreen"
            animationType="slide"
            onRequestClose={() => setShowProfilePhoto(false)}
            FooterComponent={() => {
              return (
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'center',
                    flexDirection: 'row',
                    marginTop: -responsiveHeight(94),
                    marginLeft: responsiveWidth(60),
                  }}
                >
                  <TouchableOpacity
                    style={{
                      marginRight: responsiveWidth(5),
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    onPress={async () => {
                      await downloadFile(
                        user.url,
                        user.photoName.split(`${user.id}-`)[1],
                      );

                      setShowProfilePhoto(false);
                    }}
                  >
                    <MaterialIcons
                      name="download-for-offline"
                      color={'white'}
                      size={40}
                    />
                    <Text
                      selectable
                      style={[
                        styles.dataText,
                        { fontSize: responsiveFontSize(1.5), color: 'white' },
                      ]}
                    >
                      Download
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      marginRight: responsiveWidth(15),
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    onPress={() => {
                      setShowProfilePhoto(false);
                      navigation.navigate('ChangePhoto');
                    }}
                  >
                    <MaterialCommunityIcons
                      name="camera-flip-outline"
                      size={40}
                      color={'white'}
                    />
                    <Text
                      selectable
                      style={[
                        styles.dataText,
                        { fontSize: responsiveFontSize(1.5), color: 'white' },
                      ]}
                    >
                      Change Photo
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            }}
          />
          {user.url ? (
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignSelf: 'center',
              }}
              onPress={() => setShowProfilePhoto(true)}
            >
              <Image
                source={{
                  uri: user.url,
                }}
                style={{
                  width: responsiveWidth(20),
                  height: responsiveWidth(20),
                  borderRadius: responsiveWidth(10),
                  alignSelf: 'center',
                }}
              />

              {/* <TouchableOpacity
                style={{
                  marginLeft: responsiveWidth(-6),
                  marginTop: responsiveHeight(5),
                }}
                onPress={() => {
                  navigation.navigate('ChangePhoto');
                  
                }}>
                <MaterialCommunityIcons
                  name="camera-flip-outline"
                  size={20}
                  color={'white'}
                />
              </TouchableOpacity> */}
            </TouchableOpacity>
          ) : null}

          <Text selectable style={styles.title}>
            {`Welcome ${teacher.tname}, ${teacher.desig} of \n ${teacher.school}!`}
          </Text>

          <CustomButton
            title={btnText}
            color={btnText === 'Show Your Data' ? 'darkgreen' : 'chocolate'}
            onClick={() => {
              setShowData(!showData);
              if (btnText === 'Show Your Data') {
                setBtnText('Hide Your Data');
                if (!dataFetched) {
                  ifsc_ser();
                  getModifiedSalary();
                  setDataFetched(true);
                }
              } else {
                setBtnText('Show Your Data');
              }
            }}
          />

          {showData ? (
            <ScrollView style={{ marginBottom: 20, marginTop: 10 }}>
              <View style={styles.dataView}>
                <Text selectable style={styles.dataText}>
                  Name: {teacher.tname}
                </Text>
              </View>
              <View style={styles.dataView}>
                <Text selectable style={styles.dataText}>
                  Father's Name: {teacher.fname}
                </Text>
              </View>
              <View style={styles.dataView}>
                <Text selectable style={styles.dataText}>
                  School: {teacher.school}
                </Text>
              </View>
              <View style={styles.dataView}>
                <Text selectable style={styles.dataText}>
                  UDISE: {teacher.udise}
                </Text>
              </View>
              <View style={styles.dataView}>
                <Text selectable style={styles.dataText}>
                  Designation: {teacher.desig}
                </Text>
              </View>
              <View style={styles.dataView}>
                <Text selectable style={styles.dataText}>
                  Gram Panchayet: {teacher.gp}
                </Text>
              </View>
              <View style={styles.dataView}>
                <Text selectable style={styles.dataText}>
                  Mobile: {teacher.phone}
                </Text>
              </View>
              <View style={styles.dataView}>
                <Text selectable style={styles.dataText}>
                  Email: {teacher.email}
                </Text>
              </View>
              <View style={styles.dataView}>
                <Text selectable style={styles.dataText}>
                  Date of Birth: {teacher.dob}
                </Text>
              </View>
              <View style={styles.dataView}>
                <Text selectable style={styles.dataText}>
                  Date of Joining: {teacher.doj}
                </Text>
              </View>
              <View style={styles.dataView}>
                <Text selectable style={styles.dataText}>
                  DOJ in Present School: {teacher.dojnow}
                </Text>
              </View>
              <View style={styles.dataView}>
                <Text selectable style={styles.dataText}>
                  Date of Retirement: {teacher.dor}
                </Text>
              </View>
              <View style={styles.dataView}>
                <Text selectable style={styles.dataText}>
                  Employee ID: {teacher.empid}
                </Text>
              </View>
              <View style={styles.dataView}>
                <Text selectable style={styles.dataText}>
                  Training: {teacher.training}
                </Text>
              </View>
              <View style={styles.dataView}>
                <Text selectable style={styles.dataText}>
                  PAN: {teacher.pan}
                </Text>
              </View>
              <View style={styles.dataView}>
                <Text selectable style={styles.dataText}>
                  Address: {teacher.address}
                </Text>
              </View>
              <View style={styles.dataView}>
                <Text selectable style={styles.dataText}>
                  BANK: {teacher.bank}
                </Text>
              </View>
              <View style={styles.dataView}>
                <Text selectable style={styles.dataText}>
                  Account No: {teacher.account}
                </Text>
              </View>
              <View style={styles.dataView}>
                <Text selectable style={styles.dataText}>
                  IFS Code: {teacher.ifsc}
                </Text>
              </View>
              <View style={styles.dataView}>
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
              </View>
              <View style={styles.dataView}>
                <Text selectable style={styles.dataText}>
                  BASIC: ₹ {IndianFormat(salary?.basicpay)}
                </Text>
              </View>
              <View style={styles.dataView}>
                <Text selectable style={styles.dataText}>
                  DA: ₹ {IndianFormat(salary?.da)}
                </Text>
              </View>
              <View style={styles.dataView}>
                <Text selectable style={styles.dataText}>
                  HRA: ₹ {IndianFormat(salary?.hra)}
                </Text>
              </View>
              {addl ? (
                <View style={styles.dataView}>
                  <Text selectable style={styles.dataText}>
                    Additional Pay: ₹ {IndianFormat(salary?.addl)}
                  </Text>
                </View>
              ) : null}
              <View style={styles.dataView}>
                <Text selectable style={styles.dataText}>
                  Gross Pay: ₹ {IndianFormat(salary?.gross)}
                </Text>
              </View>
              {pfund > 0 ? (
                gpf === gpfprev ? (
                  <View style={styles.dataView}>
                    <Text selectable style={styles.dataText}>
                      GPF: ₹ {IndianFormat(salary?.pfund)}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.dataView}>
                    <Text selectable style={styles.dataText}>
                      March GPF: ₹ {IndianFormat(salary?.gpfprev)}
                    </Text>
                    <Text selectable style={styles.dataText}>
                      April GPF: ₹ {IndianFormat(salary?.gpf)}
                    </Text>
                  </View>
                )
              ) : null}
              <View style={styles.dataView}>
                <Text selectable style={styles.dataText}>
                  PTAX: ₹ {IndianFormat(salary?.ptax)}
                </Text>
              </View>
              <View style={styles.dataView}>
                <Text selectable style={styles.dataText}>
                  Net Pay: ₹ {IndianFormat(salary?.netpay)}
                </Text>
              </View>
              <View style={styles.dataView}>
                <Text selectable style={styles.dataText}>
                  Net Pay in Words: {INR(salary?.netpay)}
                </Text>
              </View>
              <CustomButton
                title={btnText}
                color={btnText === 'Show Your Data' ? 'darkgreen' : 'chocolate'}
                onClick={() => {
                  setShowData(!showData);

                  btnText === 'Show Your Data'
                    ? setBtnText('Hide Data')
                    : setBtnText('Show Your Data');
                }}
              />
              <CustomButton
                title={'Edit teacher'}
                size={'small'}
                fontSize={responsiveFontSize(1.5)}
                color={'blueviolet'}
                onClick={() => {
                  navigation.navigate('EditDetails');
                  setStateObject(teacher);
                }}
              />
            </ScrollView>
          ) : (
            <View>
              {user.circle === 'admin' ? (
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'center',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                  }}
                >
                  <CustomButton
                    size={'small'}
                    fontSize={responsiveFontSize(1.5)}
                    title={'Registered Users'}
                    color={'crimson'}
                    onClick={() => {
                      navigation.navigate('RegUsers');
                    }}
                  />

                  <CustomButton
                    size={'small'}
                    fontSize={responsiveFontSize(1.5)}
                    title={'Slide Photos'}
                    color={'darkolivegreen'}
                    onClick={() => {
                      navigation.navigate('UpdateSlides');
                    }}
                  />

                  <CustomButton
                    size={'small'}
                    fontSize={responsiveFontSize(1.5)}
                    title={'Service Life'}
                    color={'darkgreen'}
                    onClick={() => {
                      navigation.navigate('TeacherServiceLife');
                    }}
                  />
                  <CustomButton
                    size={'small'}
                    fontSize={responsiveFontSize(1.5)}
                    title={'Retirement Section'}
                    color={'brown'}
                    onClick={() => {
                      navigation.navigate('Retirement');
                    }}
                  />
                  <CustomButton
                    size={'small'}
                    fontSize={responsiveFontSize(1.4)}
                    title={'App Update Settings'}
                    color={'seagreen'}
                    onClick={() => setShowUpdModal(true)}
                  />
                </View>
              ) : null}

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  alignSelf: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <CustomButton
                  size={'small'}
                  fontSize={responsiveFontSize(1.4)}
                  title={'IT Reloaded'}
                  color={'cadetblue'}
                  onClick={() => navigation.navigate('ITReloaded')}
                />
                <CustomButton
                  size={'small'}
                  fontSize={responsiveFontSize(1.4)}
                  title={'All Teacher Salary'}
                  color={'chocolate'}
                  onClick={() => {
                    setStateArray([]);
                    navigation.navigate('AllTeachersSalary');
                  }}
                />
                {user.question === 'admin' && (
                  <CustomButton
                    size={'small'}
                    fontSize={responsiveFontSize(1.5)}
                    title={'Question Section'}
                    color={'blueviolet'}
                    onClick={() => {
                      navigation.navigate('QuestionSection');
                    }}
                  />
                )}
                <CustomButton
                  size={'small'}
                  fontSize={responsiveFontSize(1.5)}
                  title={'Yearwise Teachers'}
                  color={'deeppink'}
                  onClick={() => {
                    navigation.navigate('YearwiseTeachers');
                  }}
                />

                {questionRateState?.isAccepting && (
                  <CustomButton
                    size={'small'}
                    fontSize={responsiveFontSize(1.5)}
                    title={'Question Requisition'}
                    color={'fuchsia'}
                    onClick={() => {
                      navigation.navigate('QuestionRequisition');
                    }}
                  />
                )}
                <CustomButton
                  size={'small'}
                  fontSize={responsiveFontSize(1.5)}
                  title={'Update App'}
                  color={'rebeccapurple'}
                  onClick={async () => {
                    await Linking.openURL(AppURL); // It will open the URL on browser.
                  }}
                />

                {/* <CustomButton
                  size={'small'}
                  fontSize={responsiveFontSize(1.5)}
                  title={'Telegram'}
                  color={'dodgerblue'}
                  onClick={async () => {
                    await Linking.openURL(TelegramURL); // It will open the URL on browser.
                  }}
                /> */}
                <CustomButton
                  size={'small'}
                  fontSize={responsiveFontSize(1.5)}
                  title={'Website'}
                  color={'navy'}
                  onClick={async () => {
                    setShowModal(true);
                  }}
                />
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  alignSelf: 'center',
                }}
              >
                <TouchableOpacity
                  style={{
                    paddingLeft: responsiveWidth(5),
                    marginTop: responsiveHeight(2),
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={() => {
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
                  }}
                >
                  <MaterialCommunityIcons
                    name="power"
                    size={responsiveFontSize(4)}
                    color={'red'}
                  />
                  <Text selectable style={{ color: 'red', fontWeight: 'bold' }}>
                    Exit App
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    paddingLeft: responsiveWidth(5),
                    marginTop: responsiveHeight(2),
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={() => {
                    Alert.alert('Hold On!', 'Are You Sure To Sign Out?', [
                      {
                        text: 'Cancel',
                        onPress: () => null,
                        style: 'cancel',
                      },
                      {
                        text: 'Sign Out',
                        onPress: async () => {
                          setNavState(false);
                          setActiveTab(0);
                          await EncryptedStorage.clear();
                          resetAndNavigate('Login');
                        },
                      },
                    ]);
                    return true;
                  }}
                >
                  <AntDesign
                    name="logout"
                    size={responsiveFontSize(4)}
                    color={'red'}
                  />
                  <Text selectable style={{ color: 'red', fontWeight: 'bold' }}>
                    Sign Out
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
        <Modal
          animationType="slide"
          visible={showModal}
          transparent
          closeOnClick={true}
          onRequestClose={() => {
            setShowModal(false);
          }}
        >
          <TouchableOpacity
            style={styles.modalView}
            onPress={() => {
              setShowModal(false);
            }}
          >
            <View style={styles.mainView}>
              <Text
                selectable
                style={{
                  fontSize: responsiveFontSize(3),
                  fontWeight: '500',
                  textAlign: 'center',
                  color: THEME_COLOR,
                }}
              >
                Choose Website
              </Text>
              <Text selectable style={styles.label}>
                By Pressing Visit, you will be redirect to our Website{' '}
                {VercelWeb} on your web browser.
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  alignSelf: 'center',
                }}
              >
                <CustomButton
                  title={'Visit on Your Browser'}
                  color={'darkgreen'}
                  size="small"
                  fontSize={responsiveFontSize(1.4)}
                  onClick={async () => {
                    setShowModal(false);
                    await Linking.openURL(VercelWeb); // It will open the URL on browser.
                  }}
                />
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
        <Modal
          animationType="slide"
          visible={showUpdModal}
          transparent
          closeOnClick={true}
          onRequestClose={() => {
            setShowUpdModal(false);
            setInputField({
              id: 'mmTthKv8liICC83Eia2n',
              appVersion: appVersion,
              update: true,
            });
          }}
        >
          <TouchableOpacity
            style={styles.modalView}
            onPress={() => {
              setShowUpdModal(false);
              setInputField({
                id: 'mmTthKv8liICC83Eia2n',
                appVersion: appVersion,
                update: true,
              });
            }}
          >
            <View style={styles.mainView}>
              <Text
                selectable
                style={{
                  fontSize: responsiveFontSize(3),
                  fontWeight: '500',
                  textAlign: 'center',
                  color: THEME_COLOR,
                }}
              >
                Update App Version
              </Text>
              <View
                style={{
                  alignSelf: 'center',
                  marginVertical: responsiveHeight(1),
                  width: responsiveWidth(50),
                  flexDirection: 'row',
                }}
              >
                {/* <CustomTextInput
                  title={'Version'}
                  type={'number-pad'}
                  size={'small'}
                  value={inputField.appVersion.toString()}
                  onChangeText={text => {
                    if (text !== '') {
                      setInputField({
                        ...inputField,
                        appVersion: parseInt(text),
                      });
                    } else {
                      setInputField({...inputField, appVersion: ''});
                    }
                  }}
                /> */}
                <CustomButton
                  title={'+'}
                  size={'xsmall'}
                  color={'green'}
                  onClick={() => {
                    setInputField({
                      ...inputField,
                      appVersion: inputField.appVersion + 1,
                    });
                  }}
                />
                <Text selectable style={styles.label}>
                  {inputField.appVersion}
                </Text>
                <CustomButton
                  title={'-'}
                  size={'xsmall'}
                  color={'darkred'}
                  onClick={() => {
                    setInputField({
                      ...inputField,
                      appVersion: inputField.appVersion - 1,
                    });
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignSelf: 'center',
                  marginTop: responsiveHeight(1),
                  marginBottom: responsiveHeight(1),
                }}
              >
                <Text
                  selectable
                  style={[styles.label, { paddingRight: responsiveWidth(1.5) }]}
                >
                  Disable Update
                </Text>
                <Switch
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={inputField.update ? '#f5dd4b' : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={e => {
                    // if (inputField.update) {
                    //   disableUpdate();
                    // } else {
                    //   enableUpdate();
                    // }
                    setInputField({
                      ...inputField,
                      update: e,
                    });
                  }}
                  value={inputField.update}
                />

                <Text selectable style={[styles.label, { paddingLeft: 5 }]}>
                  Enable Update
                </Text>
              </View>
              <CustomButton
                size={'medium'}
                fontSize={responsiveFontSize(1.5)}
                title={'Update Version'}
                onClick={() => updateAppVersion()}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </ScrollView>
    </View>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    // flex: 1,
  },
  title: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(2),
    fontWeight: '500',
    marginTop: responsiveHeight(3),
    color: THEME_COLOR,
    textAlign: 'center',
    padding: 5,
  },
  bottom: {
    marginBottom: responsiveHeight(8),
  },
  dataView: {
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
    backgroundColor: '#ddd',
    marginTop: responsiveHeight(1),
    borderRadius: 10,
    padding: 10,
    width: responsiveWidth(90),
  },
  dataText: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(2),
    color: THEME_COLOR,
    textAlign: 'center',
    padding: 5,
  },
  bankDataText: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(1.5),
    color: THEME_COLOR,
    textAlign: 'center',
    padding: 1,
  },
  modalView: {
    flex: 1,
    width: responsiveWidth(90),
    height: responsiveWidth(30),
    padding: responsiveHeight(2),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    elevation: 5,
  },
  mainView: {
    width: responsiveWidth(90),
    height: responsiveHeight(30),
    padding: responsiveHeight(2),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: 'antiquewhite',
    borderRadius: 10,
    alignSelf: 'center',
    elevation: 5,
  },
  label: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(2),
    fontWeight: '500',
    margin: responsiveHeight(1),
    color: THEME_COLOR,
    textAlign: 'center',
  },
});
