import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  Linking,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useIsFocused, useNavigation } from '@react-navigation/native';

import { THEME_COLOR } from '../utils/Colors';
import CustomButton from '../components/CustomButton';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  getDay,
  getFullYear,
  getMonthName,
} from '../modules/calculatefunctions';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import * as Progress from 'react-native-progress';
import Pdf from 'react-native-pdf';
import { downloadFile } from '../modules/downloadFile';
import ImageView from 'react-native-image-viewing';
import AutoHeightImage from '../components/AutoHeightImage';
import { useGlobalContext } from '../context/Store';
import { showToast } from '../modules/Toaster';
import NavigationBarContainer from '../navigation/NavigationBarContainer';
const NoticeDetails = () => {
  const isFocused = useIsFocused();
  const { stateObject } = useGlobalContext();
  const pdfRef = useRef();
  let data = stateObject;
  const navigation = useNavigation();
  const [visible, setIsVisible] = useState(false);

  const [pageNo, setPageNo] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [isLink, setIsLink] = useState(false);
  const [textArr, setTextArr] = useState([]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        navigation.navigate('Home');
        return true;
      },
    );
    return () => backHandler.remove();
  }, []);
  useEffect(() => {}, [isFocused]);
  useEffect(() => {
    const txt = data.noticeText;
    if (txt?.includes('https')) {
      setIsLink(true);
      const firstIndex = txt?.indexOf('https'); //find link start
      const linkEnd = txt?.indexOf(' ', firstIndex); //find the end of link
      const firstTextSection = txt?.slice(0, firstIndex);
      const linkSection = txt?.slice(firstIndex, linkEnd);
      const secondSection = txt?.slice(linkEnd);
      setTextArr([firstTextSection, linkSection, secondSection]);
    } else {
      setIsLink(false);
    }
  }, []);
  return (
    <NavigationBarContainer>
      <ScrollView nestedScrollEnabled={true}>
        <View style={styles.itemView}>
          <Text selectable style={styles.title}>
            {data.title}
          </Text>
        </View>
        <View
          style={[
            styles.dateView,
            {
              flexDirection: 'row',
              marginTop: responsiveHeight(1),
            },
          ]}
        >
          <Text selectable style={styles.dropDownText}>
            Posted On: {getDay(data.date)}
          </Text>
          <Text selectable style={styles.dropDownText}>
            {' '}
            {getMonthName(data.date)}
          </Text>
          <Text selectable style={styles.dropDownText}>
            {' '}
            {getFullYear(data.date)}
          </Text>
        </View>

        <View style={styles.itemImageView}>
          {data.url ? (
            <ScrollView
              style={{ marginTop: responsiveHeight(2) }}
              contentContainerStyle={{
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'center',
              }}
            >
              {(data.type === 'image/jpeg' || data.type === 'image/png') && (
                <TouchableOpacity onPress={() => setIsVisible(true)}>
                  <AutoHeightImage
                    src={data.url}
                    style={{
                      borderRadius: responsiveWidth(2),
                      width: responsiveWidth(90),
                    }}
                  />
                </TouchableOpacity>
              )}
              {data.type === 'application/pdf' && (
                <View>
                  <Pdf
                    ref={pdfRef}
                    trustAllCerts={false}
                    source={{
                      uri: data.url,
                      cache: false,
                    }}
                    page={pageNo}
                    renderActivityIndicator={() => (
                      <Progress.CircleSnail
                        color={['red', 'green', 'blue']}
                        thickness={4}
                        size={50}
                      />
                    )}
                    showsHorizontalScrollIndicator={true}
                    showsVerticalScrollIndicator={true}
                    enablePaging={true}
                    onLoadProgress={percent => {
                      console.log(percent);
                    }}
                    onLoadComplete={(numberOfPages, filePath) => {
                      console.log(`Number of pages: ${numberOfPages}`);
                    }}
                    onPageChanged={(page, numberOfPages) => {
                      console.log(`Current page: ${page}`);
                      setPageNo(page);
                      setTotalPage(numberOfPages);
                    }}
                    onError={error => {
                      console.log(error);
                    }}
                    onPressLink={async uri => {
                      await Linking.openURL(uri); // It will open the URL on browser.
                    }}
                    style={{
                      flex: 1,
                      width: responsiveWidth(80),
                      height: responsiveHeight(60),
                      alignSelf: 'center',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  />
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                      margin: responsiveHeight(1),
                    }}
                  >
                    <View>
                      {pageNo > 1 && (
                        <CustomButton
                          color={'orange'}
                          title={'Previous'}
                          onClick={() => {
                            pdfRef.current.setPage(pageNo - 1);
                            setPageNo(pageNo - 1);
                          }}
                          size={'small'}
                          fontSize={14}
                        />
                      )}
                    </View>
                    {pageNo < totalPage && (
                      <View>
                        <CustomButton
                          title={'Next'}
                          onClick={() => {
                            pdfRef.current.setPage(pageNo + 1);
                            setPageNo(pageNo + 1);
                          }}
                          size={'small'}
                          fontSize={14}
                        />
                      </View>
                    )}
                  </View>
                  <Text style={styles.text}>
                    Page {pageNo} of {totalPage}
                  </Text>
                </View>
              )}

              {data.url !== '' && (
                <TouchableOpacity
                  style={{
                    margin: responsiveHeight(2),
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'center',
                  }}
                  onPress={async () =>
                    await downloadFile(data.url, data.photoName)
                  }
                >
                  <MaterialIcons
                    name="download-for-offline"
                    color={'green'}
                    size={30}
                  />
                  <Text selectable style={styles.text}>
                    Download
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          ) : (
            <Image
              source={require('../assets/images/notice.png')}
              style={{
                width: responsiveWidth(30),
                height: responsiveWidth(30),
                borderRadius: responsiveWidth(2),
              }}
            />
          )}
        </View>

        {!isLink ? (
          <View style={styles.itemView}>
            <Text selectable style={styles.label}>
              {data.noticeText}
            </Text>
          </View>
        ) : (
          <View style={styles.itemView}>
            <View>
              <Text selectable style={styles.label}>
                {textArr[0]}
              </Text>
            </View>
            <TouchableOpacity
              onPress={async () => {
                const supported = await Linking.canOpenURL(textArr[1]); //To check if URL is supported or not.
                if (supported) {
                  await Linking.openURL(textArr[1]); // It will open the URL on browser.
                } else {
                  showToast('error', 'Failed to open link');
                }
              }}
            >
              <Text selectable style={styles.label}>
                Click Here: {textArr[1]}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      {data.url !== '' && data.type.split('/')[0] === 'image' && (
        <ImageView
          images={[{ uri: data.url }]}
          imageIndex={0}
          visible={visible}
          // presentationStyle={'overFullScreen'}
          onRequestClose={() => setIsVisible(false)}
          FooterComponent={() => {
            return (
              <TouchableOpacity
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  alignSelf: 'center',
                  marginTop: -responsiveHeight(94),
                  marginLeft: responsiveWidth(55),
                  // width: responsiveWidth(10),
                }}
                onPress={async () =>
                  await downloadFile(data.url, data.photoName)
                }
              >
                <MaterialIcons
                  name="download-for-offline"
                  color={'green'}
                  size={40}
                />
                <Text selectable style={[styles.text, { color: 'white' }]}>
                  Download
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </NavigationBarContainer>
  );
};

export default NoticeDetails;

const styles = StyleSheet.create({
  title: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(3),
    fontWeight: '500',
    fontFamily: 'kalpurush',
    color: THEME_COLOR,
    textAlign: 'center',
  },
  label: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(3),
    fontWeight: '400',
    marginTop: responsiveHeight(0.3),
    color: THEME_COLOR,
    textAlign: 'center',
    fontFamily: 'kalpurush',
  },
  itemView: {
    width: responsiveWidth(92),
    backgroundColor: 'white',

    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: responsiveWidth(2),
    marginTop: responsiveHeight(1),
    marginBottom: responsiveHeight(1),
    padding: 5,
    shadowColor: 'black',
    elevation: 5,
  },
  itemImageView: {
    width: responsiveWidth(95),

    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: responsiveWidth(2),
    marginTop: responsiveHeight(1),
    marginBottom: responsiveHeight(1),
    padding: 5,
    shadowColor: 'black',
  },
  dateView: {
    width: responsiveWidth(92),
    backgroundColor: 'white',

    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: responsiveWidth(2),
    marginTop: responsiveHeight(0.3),
    marginBottom: responsiveHeight(0.3),
    paddingTop: responsiveHeight(1),
    paddingBottom: responsiveHeight(1),
    shadowColor: 'black',
    elevation: 5,
  },
  dateView2: {
    width: responsiveWidth(92),
    backgroundColor: 'white',

    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: responsiveWidth(2),
    marginTop: responsiveHeight(0.3),
    marginBottom: responsiveHeight(0.3),

    shadowColor: 'black',
  },
  dropDownText: {
    fontSize: responsiveFontSize(1.5),
    color: THEME_COLOR,
    alignSelf: 'center',
    textAlign: 'center',
  },
  text: {
    textAlign: 'center',
    fontSize: responsiveFontSize(1.5),
    fontWeight: '500',
    paddingLeft: responsiveWidth(5),
    paddingRight: responsiveWidth(5),
    color: THEME_COLOR,
    alignSelf: 'center',
  },
  modalView: {
    width: responsiveWidth(100),
    height: responsiveHeight(100),
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255,.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainView: {
    width: responsiveWidth(80),
    height: responsiveWidth(80),
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
});
