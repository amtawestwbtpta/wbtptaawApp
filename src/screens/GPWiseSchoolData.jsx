import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { THEME_COLOR } from '../utils/Colors';
import CustomButton from '../components/CustomButton';
import Loader from '../components/Loader';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import AntDesign from 'react-native-vector-icons/AntDesign';
import CircularProgress from 'react-native-circular-progress-indicator';
import { useGlobalContext } from '../context/Store';
import { getCollection } from '../firebase/firestoreHelper';
const GPWiseSchoolData = () => {
  const {
    state,
    teachersState,
    setTeachersState,
    schoolState,
    setSchoolState,
    teacherUpdateTime,
    setTeacherUpdateTime,
    schoolUpdateTime,
    setSchoolUpdateTime,
    setStateObject,
    setActiveTab,
    setStateArray,
  } = useGlobalContext();
  const user = state.USER;
  const isFocused = useIsFocused();
  const navigation = useNavigation();

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
  const [unfgp, setUnfGp] = useState([
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
  const [teacherData, setTeacherData] = useState([]);
  const [schoolData, setschoolData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filteredSchool, setFilteredSchool] = useState([
    {
      id: 'schools101',
      school: 'AMORAGORI GIRLS PRIMARY SCHOOL',
      udise: '19160210302',
      gp: 'AMORAGORI',
      student: 40,
      pp: 1,
      i: 4,
      ii: 6,
      iii: 3,
      iv: 4,
      v: 0,
      total_student: 18,
    },
  ]);
  const [clickedTeachers, setClickedTeachers] = useState([]);
  const [selectedGPTeacher, setSelectedGPTeacher] = useState([]);
  const [showData, setShowData] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [otherClicked, setOtherClicked] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [selectedGpName, setSelectedGpName] = useState('');
  const [editSchool, setEditSchool] = useState({
    id: 'schools101',
    school: 'AMORAGORI GIRLS PRIMARY SCHOOL',
    udise: '19160210302',
    gp: 'AMORAGORI',
    student: 40,
    pp: 1,
    i: 4,
    ii: 6,
    iii: 3,
    iv: 4,
    v: 0,
    total_student: 18,
  });
  const scrollRef = useRef();

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({
      y: 0,
      animated: true,
    });
  };

  const getTeacherStateData = async () => {
    setShowLoader(true);
    await getCollection('teachers')
      .then(data => {
        const newData = data.sort((a, b) => {
          // First, compare the "school" keys
          if (a.school < b.school) {
            return -1;
          }
          if (a.school > b.school) {
            return 1;
          }
          // If "school" keys are equal, compare the "rank" keys
          return a.rank - b.rank;
        });
        setTeachersState(newData);
        setTeacherData(newData);
        setShowLoader(false);
      })
      .catch(e => {
        console.log('error', e);
        setShowLoader(false);
      });
  };
  const getSchoolStateData = async () => {
    setShowLoader(true);
    await getCollection('schools')
      .then(data => {
        setSchoolState(data);
        setschoolData(data);
        setFilteredSchool(data);
        setShowLoader(false);
      })
      .catch(e => {
        console.log('error', e);
        setShowLoader(false);
      });
  };
  const getMainData = async () => {
    const teacherDifference = (Date.now() - teacherUpdateTime) / 1000 / 60 / 15;
    if (teacherDifference >= 1 || teachersState.length === 0) {
      setTeacherUpdateTime(Date.now());
      getTeacherStateData();
    } else {
      setTeacherData(
        teachersState.sort((a, b) => b.desig.localeCompare(a.desig)),
      );
      setShowLoader(false);
    }
    const schDifference = (Date.now() - schoolUpdateTime) / 1000 / 60 / 15;
    if (schDifference >= 1 || schoolState.length === 0) {
      setSchoolUpdateTime(Date.now());
      getSchoolStateData();
    } else {
      setschoolData(schoolState);
      setFilteredSchool(schoolState);
      setShowLoader(false);
    }
  };

  useEffect(() => {
    getMainData();
    setFilteredData(teachersState.filter(item => item.gp === gp[0].gp));
    setFilteredSchool(schoolState.filter(item => item.gp === gp[0].gp));
    scrollToTop();
  }, [isFocused]);

  useEffect(() => {}, [
    filteredData,
    filteredSchool,
    editSchool,
    gp,
    teachersState,
    schoolState,
  ]);
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        setActiveTab(0);
        return true;
      },
    );
    return () => backHandler.remove();
  }, []);
  return (
    <View style={styles.container}>
      <Text selectable style={styles.title}>
        GP Wise School Data
      </Text>
      <ScrollView ref={scrollRef}>
        {showData && (
          <Text selectable style={styles.desc}>
            Select GP Name
          </Text>
        )}
        <TouchableOpacity
          style={[styles.dropDownnSelector, { marginTop: 5 }]}
          onPress={() => {
            setIsClicked(!isClicked);
            setFilteredData(teacherData);
            setGp(unfgp);
            setFilteredSchool(schoolData);
            setShowData(false);
          }}
        >
          {isClicked ? (
            <AntDesign name="up" size={30} color={THEME_COLOR} />
          ) : (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '100%',
              }}
            >
              <Text
                selectable
                style={[
                  styles.dropDownText,
                  { paddingRight: responsiveWidth(2) },
                ]}
              >
                {gp[0].gp}
              </Text>

              <AntDesign name="down" size={30} color={THEME_COLOR} />
            </View>
          )}
        </TouchableOpacity>
        {isClicked ? (
          <ScrollView style={styles.dropDowArea}>
            {gp.map((item, index) => {
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.AdminName}
                  onPress={() => {
                    setIsClicked(false);
                    setShowData(true);
                    setFilteredData(
                      teacherData.filter(el => el.gp.match(item.gp)),
                    );
                    setClickedTeachers(
                      teacherData.filter(el => el.gp.match(item.gp)),
                    );
                    setSelectedGPTeacher(
                      teacherData.filter(el => el.gp.match(item.gp)),
                    );
                    setFilteredSchool(
                      schoolData.filter(el => el.gp.match(item.gp)),
                    );
                    setGp(gp.filter(el => el.gp.match(item.gp)));
                  }}
                >
                  <Text selectable style={styles.dropDownText}>
                    {item.gp}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : null}
        {showData ? (
          <ScrollView
            style={{
              marginTop: 5,
              alignSelf: 'center',
              width: responsiveWidth(94),
              marginBottom: responsiveHeight(8),
            }}
          >
            {filteredSchool.length > 0 ? (
              <Text selectable style={styles.dropDownText}>
                Total School: {filteredSchool.length}
              </Text>
            ) : null}
            {filteredSchool.length > 1 ? (
              <View>
                <Text selectable style={styles.dropDownText}>
                  Total Teacher: {selectedGPTeacher.length}
                </Text>
                <Text selectable style={styles.dropDownText}>
                  Total WBTPTA Teacher:{' '}
                  {
                    selectedGPTeacher.filter(el => el.association === 'WBTPTA')
                      .length
                  }
                </Text>
                <Text selectable style={styles.dropDownText}>
                  Total OTHER Teacher:{' '}
                  {
                    selectedGPTeacher.filter(el => el.association !== 'WBTPTA')
                      .length
                  }
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'center',
                    margin: responsiveWidth(2),
                  }}
                >
                  <CircularProgress
                    initialValue={0}
                    value={
                      (selectedGPTeacher.filter(
                        el => el.association === 'WBTPTA',
                      ).length /
                        selectedGPTeacher.length) *
                      100
                    }
                    radius={40}
                    duration={5000}
                    progressValueColor={'darkgreen'}
                    activeStrokeColor={'darkgreen'}
                    title={'WBTPTA'}
                    titleColor={'darkgreen'}
                    titleStyle={{ fontWeight: 'bold' }}
                    inActiveStrokeWidth={4}
                    inActiveStrokeOpacity={0.2}
                    progressFormatter={value => {
                      'worklet';

                      return value.toFixed(2); // 2 decimal places
                    }}
                  />
                  <View style={{ paddingLeft: responsiveWidth(5) }}>
                    <CircularProgress
                      initialValue={100}
                      value={
                        (selectedGPTeacher.filter(
                          el => el.association !== 'WBTPTA',
                        ).length /
                          selectedGPTeacher.length) *
                        100
                      }
                      radius={40}
                      duration={5000}
                      progressValueColor={'red'}
                      activeStrokeColor={'red'}
                      title={'OTHERS'}
                      titleColor={'red'}
                      titleStyle={{ fontWeight: 'bold' }}
                      inActiveStrokeOpacity={0.2}
                      inActiveStrokeWidth={4}
                      progressFormatter={value => {
                        'worklet';

                        return value.toFixed(2); // 2 decimal places
                      }}
                    />
                  </View>
                </View>
              </View>
            ) : null}
            {gp[0].gp !== 'Select GP Name' ? (
              <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
                {clickedTeachers.length !==
                clickedTeachers.filter(el => el.association === 'WBTPTA')
                  .length ? (
                  <CustomButton
                    title={'WBTPTA'}
                    size={'small'}
                    fontSize={responsiveFontSize(1.8)}
                    onClick={() => {
                      setClickedTeachers(
                        filteredData.filter(el => el.association === 'WBTPTA'),
                      );
                      setOtherClicked(false);
                    }}
                  />
                ) : null}
                {clickedTeachers.length !==
                clickedTeachers.filter(el => el.association !== 'WBTPTA')
                  .length ? (
                  <CustomButton
                    title={'OTHER'}
                    color={'darkred'}
                    size={'small'}
                    fontSize={responsiveFontSize(1.8)}
                    onClick={() => {
                      setClickedTeachers(
                        filteredData.filter(el => el.association !== 'WBTPTA'),
                      );
                      setOtherClicked(true);
                    }}
                  />
                ) : null}

                {clickedTeachers.length !== filteredData.length ? (
                  <CustomButton
                    title={'All'}
                    color={'blueviolet'}
                    size={'small'}
                    onClick={() => {
                      setClickedTeachers(filteredData);
                      setOtherClicked(false);
                    }}
                  />
                ) : null}
              </View>
            ) : null}
            {filteredSchool.map((el, ind) => {
              let selectedSchool = el.udise;
              return (
                <View key={ind} style={styles.itemView}>
                  <Text selectable style={styles.dropDownText}>
                    SL. NO.: {ind + 1}{' '}
                  </Text>
                  <Text selectable style={styles.dropDownText}>
                    SCHOOL NAME:
                  </Text>
                  <Text selectable style={styles.dropDownText}>
                    {el.school},
                  </Text>
                  <Text selectable style={styles.dropDownText}>
                    UDISE: {el.udise}
                  </Text>

                  <Text selectable style={styles.dropDownText}>
                    TOTAL TEACHER:{' '}
                    {
                      teacherData.filter(el => el.udise.match(selectedSchool))
                        .length
                    }
                  </Text>
                  <Text selectable style={styles.dropDownText}>
                    TOTAL STUDENT: {el.total_student}
                  </Text>
                  <Text selectable style={styles.dropDownText}>
                    S/T RATIO:{' '}
                    {Math.floor(
                      el.total_student /
                        teacherData.filter(el => el.udise.match(selectedSchool))
                          .length,
                    )}
                  </Text>
                  <View>
                    {clickedTeachers.filter(el =>
                      el.udise.match(selectedSchool),
                    ).length ? (
                      clickedTeachers
                        .filter(el => el.udise.match(selectedSchool))
                        .map((elem, index) => (
                          <View
                            key={index}
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'center',
                              alignItems: 'center',
                              alignSelf: 'center',
                              flexWrap: 'wrap',
                            }}
                          >
                            <Text
                              selectable
                              style={[
                                styles.dropDownText,
                                {
                                  margin: responsiveWidth(1),
                                  textAlign: 'center',
                                },
                              ]}
                            >
                              ({index + 1}) {elem.tname},
                              {elem.hoi === 'Yes'
                                ? ` (${elem.desig}), (HOI),`
                                : ` (AT),`}{' '}
                              ({elem.association})
                            </Text>
                            {user?.circle === 'admin' && (
                              <View
                                style={{
                                  flexDirection: 'row',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  alignSelf: 'center',
                                  flexWrap: 'wrap',
                                }}
                              >
                                <TouchableOpacity
                                  style={{
                                    backgroundColor: 'purple',
                                    margin: responsiveWidth(1),
                                    padding: responsiveWidth(1),
                                    borderRadius: responsiveWidth(1),
                                    resizeMode: 'contain',
                                  }}
                                  onPress={() => {
                                    navigation.navigate('ViewDetails');
                                    setStateObject(elem);
                                  }}
                                >
                                  <Text
                                    selectable
                                    style={{ color: 'white', fontSize: 12 }}
                                  >
                                    View
                                  </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={{
                                    backgroundColor: 'red',
                                    margin: responsiveWidth(1),
                                    padding: responsiveWidth(1),
                                    borderRadius: responsiveWidth(1),
                                    resizeMode: 'contain',
                                  }}
                                  onPress={() => {
                                    navigation.navigate('EditDetails');
                                    setStateObject(elem);
                                  }}
                                >
                                  <Text
                                    selectable
                                    style={{ color: 'white', fontSize: 12 }}
                                  >
                                    Edit
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            )}
                          </View>
                        ))
                    ) : otherClicked ? (
                      <Text selectable style={styles.dropDownText}>
                        All Are WBTPTA Teachers
                      </Text>
                    ) : (
                      <Text selectable style={styles.dropDownText}>
                        No WBTPTA Teacher
                      </Text>
                    )}
                    {user.circle === 'admin' ||
                    user.udise === selectedSchool ? (
                      <CustomButton
                        title={'All Teachers Salary'}
                        onClick={() => {
                          navigation.navigate('AllTeachersSalary');
                          setStateArray(
                            teacherData.filter(el =>
                              el.udise.match(selectedSchool),
                            ),
                          );
                        }}
                      />
                    ) : null}
                  </View>
                </View>
              );
            })}
            {gp[0].gp !== 'Select GP Name' ? (
              <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
                {clickedTeachers.length !==
                clickedTeachers.filter(el => el.association === 'WBTPTA')
                  .length ? (
                  <CustomButton
                    title={'WBTPTA'}
                    size={'small'}
                    onClick={() => {
                      setClickedTeachers(
                        filteredData.filter(el => el.association === 'WBTPTA'),
                      );
                      setOtherClicked(false);
                    }}
                  />
                ) : null}
                {clickedTeachers.length !==
                clickedTeachers.filter(el => el.association !== 'WBTPTA')
                  .length ? (
                  <CustomButton
                    title={'OTHER'}
                    color={'darkred'}
                    size={'small'}
                    onClick={() => {
                      setClickedTeachers(
                        filteredData.filter(el => el.association !== 'WBTPTA'),
                      );
                      setOtherClicked(true);
                    }}
                  />
                ) : null}

                {clickedTeachers.length !== filteredData.length ? (
                  <CustomButton
                    title={'All'}
                    color={'blueviolet'}
                    size={'small'}
                    onClick={() => {
                      setClickedTeachers(filteredData);
                      setOtherClicked(false);
                    }}
                  />
                ) : null}
              </View>
            ) : null}
          </ScrollView>
        ) : null}
      </ScrollView>
      <Loader visible={showLoader} />
    </View>
  );
};

export default GPWiseSchoolData;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    textAlign: 'center',
    fontSize: responsiveFontSize(3),
    fontWeight: '700',
    paddingLeft: responsiveWidth(5),
    paddingRight: responsiveWidth(5),
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
    fontSize: responsiveFontSize(2),
    fontWeight: '500',
    paddingLeft: responsiveWidth(5),
    paddingRight: responsiveWidth(5),
    color: THEME_COLOR,
  },
  dropDownnSelector: {
    width: responsiveWidth(60),
    height: responsiveHeight(7),
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
  dropDowArea: {
    width: responsiveWidth(60),

    borderRadius: responsiveWidth(2),
    marginTop: responsiveHeight(1),
    backgroundColor: '#fff',
    elevation: 5,
    alignSelf: 'center',
    marginBottom: responsiveHeight(20),
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
    margin: responsiveWidth(1),
    resizeMode: 'contain',
  },
  label: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(1.5),
    fontWeight: '500',
    marginTop: responsiveHeight(0.2),
    color: THEME_COLOR,
    textAlign: 'center',
  },
});
