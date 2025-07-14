import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  BackHandler,
  FlatList,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { THEME_COLOR } from '../utils/Colors';
import CustomButton from '../components/CustomButton';
const { width, height } = Dimensions.get('window');
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import { round2dec, round5 } from '../modules/calculatefunctions';
import { useGlobalContext } from '../context/Store';
const AllQuestionData = () => {
  const { questionState, questionRateState } = useGlobalContext();
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const [questionData, setQuestionData] = useState(questionState);
  const [qRateData, setQRateData] = useState({
    id: '',
    question_pp_rate: '',
    question_1_rate: '',
    question_2_rate: '',
    question_3_rate: '',
    question_4_rate: '',
    question_5_rate: '',
    term: '1st',
    year: new Date().getFullYear(),
  });
  const [filteredData, setFilteredData] = useState(questionState);
  const [firstData, setFirstData] = useState(0);
  const [visibleItems, setVisibleItems] = useState(10);
  const [isGpClicked, setIsGpClicked] = useState(false);
  const [selectedGP, setSelectedGP] = useState('Select GP Name');
  const [gp, setGp] = useState([
    { gp: 'Select GP Name' },
    { gp: 'AMORAGORI' },
    { gp: 'BKBATI' },
    { gp: 'GAZIPUR' },
    { gp: 'JHAMTIA' },
    { gp: 'JHIKIRA' },
    { gp: 'JOYPUR' },
    { gp: 'NOWPARA' },
    { gp: 'THALIA' },
  ]);
  const orgGp = [
    { gp: 'Select GP Name' },
    { gp: 'AMORAGORI' },
    { gp: 'BKBATI' },
    { gp: 'GAZIPUR' },
    { gp: 'JHAMTIA' },
    { gp: 'JHIKIRA' },
    { gp: 'JOYPUR' },
    { gp: 'NOWPARA' },
    { gp: 'THALIA' },
  ];

  useEffect(() => {
    setQuestionData(questionState);
    setQRateData(questionRateState);
    setFilteredData(questionState);
  }, [isFocused]);

  useEffect(() => {}, [qRateData, questionData, filteredData]);
  const scrollRef = useRef();

  const onPressTouch = () => {
    scrollRef.current?.scrollTo({
      y: 0,
      animated: true,
    });
  };
  const loadPrev = () => {
    setVisibleItems(prevVisibleItems => prevVisibleItems - 10);
    setFirstData(firstData - 10);
    onPressTouch();
  };
  const loadMore = () => {
    setVisibleItems(prevVisibleItems => prevVisibleItems + 10);
    setFirstData(firstData + 10);
    onPressTouch();
  };
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        navigation.navigate('QuestionSection', { navigation: navigation });
        return true;
      },
    );
    return () => backHandler.remove();
  }, []);
  useEffect(() => {}, [
    isFocused,
    filteredData,
    questionData,
    qRateData,
    firstData,
    visibleItems,
  ]);
  return (
    <View style={styles.container}>
      <ScrollView ref={scrollRef} nestedScrollEnabled={true}>
        <Text selectable style={styles.title}>
          {`Amta West Circle, ${qRateData.term} Summative Exam,  ${qRateData.year}`}
        </Text>
        <TouchableOpacity
          style={[styles.dropDownnSelector, { marginTop: 5 }]}
          onPress={() => {
            setIsGpClicked(!isGpClicked);
            setSelectedGP('Select GP Name');
            setFilteredData(questionData);
            setVisibleItems(10);
            setFirstData(0);
            setGp(orgGp);
          }}
        >
          {isGpClicked ? (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <Text
                selectable
                style={[
                  styles.dropDownText,
                  { paddingRight: responsiveWidth(2) },
                ]}
              >
                {selectedGP}
              </Text>

              <AntDesign name="up" size={30} color={THEME_COLOR} />
            </View>
          ) : (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <Text
                selectable
                style={[
                  styles.dropDownText,
                  { paddingRight: responsiveWidth(2) },
                ]}
              >
                {selectedGP}
              </Text>

              <AntDesign name="down" size={30} color={THEME_COLOR} />
            </View>
          )}
        </TouchableOpacity>
        {isGpClicked ? (
          <ScrollView style={styles.dropDowArea}>
            <FlatList
              data={gp}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  key={index}
                  style={styles.AdminName}
                  onPress={() => {
                    setIsGpClicked(false);
                    setSelectedGP(item.gp);
                    setGp(gp.filter(el => item.gp.match(el.gp)));
                    setFilteredData(
                      filteredData.filter(el => item.gp.match(el.gp)),
                    );
                  }}
                >
                  <Text selectable style={styles.dropDownText}>
                    {item.gp}
                  </Text>
                </TouchableOpacity>
              )}
            />
            {/* {gp.map((item, index) => {
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.AdminName}
                  onPress={() => {
                    setIsGpClicked(false);
                    setSelectedGP(item.gp);
                    setGp(gp.filter(el => item.gp.match(el.gp)));
                    setFilteredData(
                      filteredData.filter(el => item.gp.match(el.gp)),
                    );
                  }}>
                  <Text selectable style={styles.dropDownText}>{item.gp}</Text>
                </TouchableOpacity>
              );
            })} */}
          </ScrollView>
        ) : null}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: responsiveHeight(1),
          }}
        >
          {firstData >= 10 && (
            <View>
              <CustomButton
                color={'orange'}
                title={'Previous'}
                onClick={loadPrev}
                size={'small'}
                fontSize={14}
              />
            </View>
          )}
          {visibleItems < filteredData.length && (
            <View>
              <CustomButton
                title={'Next'}
                onClick={loadMore}
                size={'small'}
                fontSize={14}
              />
            </View>
          )}
          {!isGpClicked && (
            <CustomButton
              title={'Show All School'}
              color={'blueviolet'}
              onClick={() => {
                setIsGpClicked(false);
                setSelectedGP('Select GP Name');
                onPressTouch();
                setFilteredData(questionData);
                setVisibleItems(10);
                setFirstData(0);
              }}
              size={'small'}
              fontSize={responsiveFontSize(1.2)}
            />
          )}
        </View>
        <FlatList
          data={filteredData.slice(firstData, visibleItems)}
          renderItem={({ item, index }) => (
            <View style={styles.itemView} key={index}>
              <Image
                source={{
                  uri: `https://api.qrserver.com/v1/create-qr-code/?data=Amta West Circle, ${
                    qRateData.term
                  } Summative Exam, ${qRateData.year},\n${item.school},  GP: ${
                    item.gp
                  }, PP Students ${
                    item.cl_pp_student
                  }, Amount Rs. ₹ ${round2dec(
                    item.cl_pp_student * qRateData.pp_rate,
                  )}, Class I Students ${
                    item.cl_1_student
                  }, Amount Rs. ₹ ${round2dec(
                    item.cl_1_student * qRateData.i_rate,
                  )}, Class II Students ${
                    item.cl_2_student
                  }, Amount Rs. ₹ ${round2dec(
                    item.cl_2_student * qRateData.ii_rate,
                  )}, Class III Students ${
                    item.cl_3_student
                  }, Amount Rs. ₹ ${round2dec(
                    item.cl_3_student * qRateData.iii_rate,
                  )}, Class IV Students ${
                    item.cl_4_student
                  }, Amount Rs. ₹ ${round2dec(
                    item.cl_4_student * qRateData.iv_rate,
                  )}, Class V Students ${
                    item.cl_5_student
                  }, Amount Rs. ₹ ${round2dec(
                    item.cl_5_student * qRateData.v_rate,
                  )}, Total Student. ${item.total_student}, Total Amount ₹ ${
                    item.total_rate
                  }.&amp;size=400x400`,
                }}
                style={{
                  width: responsiveHeight(15),
                  height: responsiveHeight(15),
                }}
                alt="QRCode"
              />
              <Text selectable style={styles.text}>
                Sl No.: {index + 1 + firstData}
              </Text>
              <Text selectable style={styles.text}>
                School Name:
              </Text>
              <Text selectable style={styles.text}>
                {item.school}
              </Text>
              <Text selectable style={styles.text}>
                GP: {item.gp}
              </Text>
              <Text selectable style={styles.text}>
                Class PP Students: {item.cl_pp_student}
              </Text>
              <Text selectable style={styles.text}>
                Class I Students: {item.cl_1_student}
              </Text>
              <Text selectable style={styles.text}>
                Class II Students: {item.cl_2_student}
              </Text>
              <Text selectable style={styles.text}>
                Class III Students: {item.cl_3_student}
              </Text>
              <Text selectable style={styles.text}>
                Class IV Students: {item.cl_4_student}
              </Text>
              {item.cl_5_student > 0 && (
                <Text selectable style={styles.text}>
                  Class V Students: {item.cl_5_student}
                </Text>
              )}
              <Text selectable style={styles.text}>
                Total Students: {item.total_student}
              </Text>
              <Text selectable style={styles.text}>
                Total Cost: Rs. ₹
                {round5(
                  item.cl_pp_student * qRateData.pp_rate +
                    item.cl_1_student * qRateData.i_rate +
                    item.cl_2_student * qRateData.ii_rate +
                    item.cl_3_student * qRateData.iii_rate +
                    item.cl_4_student * qRateData.iv_rate +
                    item.cl_5_student * qRateData.v_rate,
                )}
              </Text>
            </View>
          )}
        />

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: responsiveHeight(1),
          }}
        >
          {firstData >= 10 && (
            <View>
              <CustomButton
                color={'orange'}
                title={'Previous'}
                onClick={loadPrev}
                size={'small'}
                fontSize={14}
              />
            </View>
          )}
          {visibleItems < filteredData.length && (
            <View>
              <CustomButton
                title={'Next'}
                onClick={loadMore}
                size={'small'}
                fontSize={14}
              />
            </View>
          )}
          {!isGpClicked && (
            <CustomButton
              title={'Show All School'}
              color={'blueviolet'}
              onClick={() => {
                setIsGpClicked(false);
                setSelectedGP('Select GP Name');
                onPressTouch();
                setFilteredData(questionData);
                setVisibleItems(10);
                setFirstData(0);
              }}
              size={'small'}
              fontSize={responsiveFontSize(1.2)}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default AllQuestionData;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  title: {
    textAlign: 'center',
    fontSize: responsiveFontSize(3),
    fontWeight: '700',
    paddingLeft: responsiveWidth(2),
    paddingRight: responsiveWidth(2),
    color: THEME_COLOR,
  },
  desc: {
    textAlign: 'center',
    fontSize: responsiveFontSize(2.5),
    fontWeight: '500',
    paddingLeft: responsiveWidth(5),
    paddingRight: responsiveWidth(5),
    color: THEME_COLOR,
  },
  text: {
    textAlign: 'center',
    fontSize: responsiveFontSize(1.8),
    fontWeight: '500',
    paddingLeft: responsiveWidth(5),
    paddingRight: responsiveWidth(5),
    color: THEME_COLOR,
  },
  dropDownnSelector: {
    width: responsiveWidth(90),
    height: responsiveHeight(6),
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: THEME_COLOR,
    alignSelf: 'center',
    marginTop: responsiveHeight(15),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: responsiveWidth(5),
    paddingRight: responsiveWidth(5),
  },
  gpDropDownnSelector: {
    width: responsiveWidth(76),
    height: responsiveHeight(6),
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: THEME_COLOR,
    alignSelf: 'center',
    marginTop: responsiveHeight(15),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: responsiveWidth(5),
    paddingRight: responsiveWidth(5),
  },
  gpDropDowArea: {
    width: responsiveWidth(76),
    borderRadius: responsiveWidth(2),
    marginTop: responsiveHeight(1),
    backgroundColor: '#fff',
    elevation: 5,
    alignSelf: 'center',
    marginBottom: responsiveHeight(1),
  },
  dropDowArea: {
    width: responsiveWidth(90),

    borderRadius: responsiveWidth(2),
    marginTop: responsiveHeight(1),
    backgroundColor: '#fff',
    elevation: 5,
    alignSelf: 'center',
    marginBottom: responsiveHeight(20),
  },
  gpAdminName: {
    width: responsiveWidth(76),
    height: responsiveHeight(4),
    borderBottomWidth: 0.2,
    borderBottomColor: THEME_COLOR,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  AdminName: {
    width: responsiveWidth(80),
    height: responsiveHeight(7),
    borderBottomWidth: 0.2,
    borderBottomColor: THEME_COLOR,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  dropDownText: {
    fontSize: responsiveFontSize(2),
    color: THEME_COLOR,
    alignSelf: 'center',
    textAlign: 'center',
    fontFamily: 'kalpurush',
  },
  membership: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(3),
    fontWeight: '500',
    padding: responsiveWidth(2),
    color: 'darkgreen',
    marginTop: responsiveHeight(1),
    textAlign: 'center',
    fontFamily: 'kalpurush',
  },

  itemView: {
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'white',
    width: responsiveWidth(90),
    borderRadius: responsiveWidth(2),
    padding: responsiveWidth(2),
    elevation: 5,
    margin: responsiveWidth(0.5),
  },
  label: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(1.5),
    fontWeight: '500',
    marginTop: responsiveHeight(0.2),
    color: THEME_COLOR,
    textAlign: 'center',
  },
  modalView: {
    width: width,
    height: height,
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255,.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainView: {
    width: responsiveWidth(80),
    height: responsiveHeight(35),
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
});
