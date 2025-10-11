import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  Platform,
  Linking,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { THEME_COLOR } from '../utils/Colors';
import CustomTextInput from '../components/CustomTextInput';
import CustomButton from '../components/CustomButton';
import Loader from '../components/Loader';
import {
  compareObjects,
  ordinal_suffix_of,
} from '../modules/calculatefunctions';

import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AnimatedSeacrch from '../components/AnimatedSeacrch';
import { useGlobalContext } from '../context/Store';
import { getCollection, updateDocument } from '../firebase/firestoreHelper';
import { showToast } from '../modules/Toaster';
import { DownloadWeb, myAPIKey } from '../modules/constants';
import StudentCount from '../components/StudentCount';
import StudentInput from '../components/StudentInput';
import { decryptData } from '../modules/encryption';
import { Buffer } from 'buffer';
const StudentTeacherData = () => {
  const token = decryptData(myAPIKey);
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const ref = useRef();
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
    setStateArray,
    setActiveTab,
  } = useGlobalContext();
  const user = state.USER;
  const [selectedSchool, setSelectedSchool] = useState('Select School Name');
  const [teacherData, setTeacherData] = useState([]);
  const [schoolData, setschoolData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filteredSchool, setFilteredSchool] = useState([]);
  const [schoolName, setSchoolName] = useState('');
  const [showData, setShowData] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const [showLoader, setShowLoader] = useState(false);

  const [visible, setVisible] = useState(false);
  const [editSchool, setEditSchool] = useState({
    pp: 0,
    i: 0,
    ii: 0,
    iii: 0,
    iv: 0,
    v: 0,
    id: '',
    school: '',
    gp: '',
    year: 2025,
    udise: '',
    student_2023: 0,
    student_2024: 0,
    student_2025: 0,
  });
  const [uneditedSchool, setUneditedSchool] = useState({
    pp: 0,
    i: 0,
    ii: 0,
    iii: 0,
    iv: 0,
    v: 0,
    id: '',
    school: '',
    gp: '',
    year: 2025,
    udise: '',
    student_2023: 0,
    student_2024: 0,
    student_2025: 0,
  });
  const [total_student, setTotal_student] = useState(0);
  const scrollToTop = () => {
    ref.current?.scrollTo({
      y: 0,
      animated: true,
    });
  };
  const updateData = async () => {
    let equalObject = compareObjects(editSchool, uneditedSchool);
    if (!equalObject) {
      setShowLoader(true);
      const editedData = {
        ...editSchool,
        pp: parseInt(editSchool.pp),
        i: parseInt(editSchool.i),
        ii: parseInt(editSchool.ii),
        iii: parseInt(editSchool.iii),
        iv: parseInt(editSchool.iv),
        v: parseInt(editSchool.v),
        student_2023: parseInt(editSchool.student_2023),
        student_2024: parseInt(editSchool.student_2024),
        student_2025: parseInt(editSchool.student_2025),
        year: parseInt(editSchool.year),
      };
      await updateDocument('schools', editedData.id, editedData).then(
        async () => {
          let x = schoolState.filter(el => el.id !== editedData.id);
          x = [...x, editedData];
          const newData = x.sort((a, b) => a.school.localeCompare(b.school));
          try {
            // Ensure we upload valid JSON content to GitHub
            const jsonContent = JSON.stringify(newData, null, 2);
            const content = Buffer.from(jsonContent, 'utf-8').toString(
              'base64',
            );
            const url =
              'https://api.github.com/repos/amtawestwbtpta/awwbtptadata/contents/schools.json';
            let sha = null;
            try {
              const check = await fetch(url, {
                headers: { Authorization: `token ${token}` },
              });
              if (check.ok) {
                const data = await check.json();
                sha = data.sha;
              }
            } catch (error) {
              console.log(error);
            }
            await fetch(url, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `token ${token}`,
              },
              body: JSON.stringify({
                message: 'Update school data',
                content: content,
                branch: 'main',
                sha,
              }),
            });
          } catch (error) {
            console.log(error);
            showToast('error', 'Failed to update data on GitHub');
            setVisible(false);
          }

          setSchoolState(newData);
          setschoolData(newData);
          setFilteredSchool(newData);
          setVisible(false);
          setShowLoader(false);
          showToast('success', 'School Details Updated Successfully');
        },
      );
    } else {
      setVisible(false);
      showToast('error', 'Data is Same, No need to Update.');
    }
  };

  const makeCall = phoneNumber => {
    let dial;
    if (Platform.OS === 'android') {
      dial = `tel:${phoneNumber}`;
    } else {
      dial = `telprompt:${phoneNumber}`;
    }
    Linking.openURL(dial);
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
      setTeacherData(teachersState);
    }
    const schDifference = (Date.now() - schoolUpdateTime) / 1000 / 60 / 15;
    if (schDifference >= 1 || schoolState.length === 0) {
      setSchoolUpdateTime(Date.now());
      getSchoolStateData();
    } else {
      setschoolData(schoolState);
    }
  };

  useEffect(() => {
    getMainData();
  }, [isFocused]);
  useEffect(() => {}, [
    filteredData,
    filteredSchool,
    editSchool,
    teachersState,
    schoolState,
    showData,
    selectedSchool,
    schoolData,
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
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {!visible ? (
          <ScrollView
            ref={ref}
            contentContainerStyle={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {showData && (
              <Text selectable style={styles.desc}>
                Select School Name
              </Text>
            )}

            <TouchableOpacity
              style={[styles.dropDownnSelector, { marginTop: 5 }]}
              onPress={() => {
                setIsClicked(!isClicked);
                setFilteredData(teacherData);
                setSelectedSchool('Select School Name');
                setFilteredSchool(schoolData);
                setShowData(false);
                setSchoolName('');
              }}
            >
              {isClicked ? (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    width: '100%',
                  }}
                >
                  <Text
                    style={[
                      styles.dropDownText,
                      { paddingRight: responsiveWidth(2) },
                    ]}
                  >
                    {selectedSchool}
                  </Text>

                  <AntDesign name="up" size={30} color={THEME_COLOR} />
                </View>
              ) : (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    width: '100%',
                  }}
                >
                  <Text
                    style={[
                      styles.dropDownText,
                      { paddingRight: responsiveWidth(2) },
                    ]}
                  >
                    {selectedSchool}
                  </Text>

                  <AntDesign name="down" size={30} color={THEME_COLOR} />
                </View>
              )}
            </TouchableOpacity>
            {isClicked ? (
              <ScrollView style={styles.dropDowArea}>
                <AnimatedSeacrch
                  value={schoolName}
                  placeholder={'Search School Name'}
                  onChangeText={text => {
                    setSchoolName(text);
                    if (text.length) {
                      setFilteredSchool(
                        schoolData.filter(el =>
                          el.school
                            .toString()
                            .toLowerCase()
                            .match(text.toLowerCase()),
                        ),
                      );
                    } else {
                      setFilteredSchool(schoolData);
                    }
                  }}
                  func={() => {
                    setSchoolName('');
                    setFilteredSchool(schoolData);
                  }}
                />
                {filteredSchool.map((item, index) => {
                  return (
                    <TouchableOpacity
                      key={index}
                      style={styles.AdminName}
                      onPress={() => {
                        setIsClicked(false);
                        scrollToTop();
                        setSchoolName('');
                        setShowData(true);
                        setFilteredData(
                          teacherData.filter(el => el.udise.match(item.udise)),
                        );
                        setSelectedSchool(item.school);
                        setFilteredSchool(
                          schoolData.filter(el => el.udise.match(item.udise)),
                        );
                        const data = schoolData.filter(el =>
                          el.udise.match(item.udise),
                        )[0];
                        const totalStudents =
                          parseInt(data.pp) +
                          parseInt(data.i) +
                          parseInt(data.ii) +
                          parseInt(data.iii) +
                          parseInt(data.iv) +
                          parseInt(data.v);
                        setTotal_student(totalStudents);
                      }}
                    >
                      <Text selectable style={styles.dropDownText}>{`${
                        index + 1
                      }. ${item.school}`}</Text>
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
                }}
              >
                <View style={styles.itemView}>
                  <Text selectable style={styles.dropDownText}>
                    SCHOOL NAME: {filteredSchool[0]?.school}
                  </Text>
                  <Text selectable style={styles.dropDownText}>
                    GP NAME: {filteredSchool[0]?.gp}
                  </Text>
                  <Text selectable style={styles.dropDownText}>
                    UDISE: {filteredSchool[0]?.udise}
                  </Text>
                  <Text selectable style={styles.dropDownText}>
                    Total Teacher: {filteredData.length}
                  </Text>
                  {/* <Text selectable style={styles.dropDownText}>
                Total Student {filteredSchool[0]?.year - 2}:{' '}
                {filteredSchool[0]?.student_prev2}
              </Text>
              <Text selectable style={styles.dropDownText}>
                Total Student {filteredSchool[0]?.year - 1}:{' '}
                {filteredSchool[0]?.student}
              </Text>
              <Text selectable style={styles.dropDownText}>
                Total Student {filteredSchool[0]?.year}:{' '}
                {total_student}
              </Text> */}
                  <StudentCount info={filteredSchool[0]} />
                  {user.circle === 'admin' && (
                    <TouchableOpacity
                      onPress={() => {
                        setEditSchool(filteredSchool[0]);
                        setUneditedSchool(filteredSchool[0]);
                        setVisible(true);
                      }}
                    >
                      <FontAwesome5 name="edit" size={25} color="blue" />
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.itemView}>
                  {(filteredData.length > 2 &&
                    total_student >= 100 &&
                    Math.floor(total_student / filteredData.length) >= 40) ||
                  (filteredData.length > 2 &&
                    total_student < 100 &&
                    Math.floor(total_student / filteredData.length) > 35) ||
                  (filteredData.length <= 2 &&
                    Math.floor(total_student / filteredData.length) > 35) ? (
                    <View>
                      <Text selectable style={styles.dropDownText}>
                        Student Teacher Ratio is{' '}
                        {Math.floor(total_student / filteredData.length)}, Less
                        Teacher
                      </Text>
                    </View>
                  ) : (filteredData.length > 2 &&
                      Math.floor(total_student / filteredData.length) >= 30) ||
                    filteredData.length <= 2 ||
                    Math.floor(total_student / filteredData.length) <= 30 ? (
                    <View>
                      <Text selectable style={styles.dropDownText}>
                        Student Teacher Ratio is{' '}
                        {Math.floor(total_student / filteredData.length)},
                        Normal
                      </Text>
                    </View>
                  ) : (
                    <View>
                      <Text selectable style={styles.dropDownText}>
                        Student Teacher Ratio is{' '}
                        {Math.floor(total_student / filteredData.length)},
                        Excess Teacher
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.itemView}>
                  <Text selectable style={styles.dropDownText}>
                    No. of Pre Primary Students: {filteredSchool[0]?.pp}
                  </Text>
                  <Text selectable style={styles.dropDownText}>
                    No. of Class I Students: {filteredSchool[0]?.i}
                  </Text>
                  <Text selectable style={styles.dropDownText}>
                    No. of Class II Students: {filteredSchool[0]?.ii}
                  </Text>
                  <Text selectable style={styles.dropDownText}>
                    No. of Class III Students: {filteredSchool[0]?.iii}
                  </Text>
                  <Text selectable style={styles.dropDownText}>
                    No. of Class IV Students: {filteredSchool[0]?.iv}
                  </Text>
                  {filteredSchool[0]?.v > 0 ? (
                    <Text selectable style={styles.dropDownText}>
                      No. of Class V Students: {filteredSchool[0]?.v}
                    </Text>
                  ) : null}
                </View>
                {user.circle === 'admin' ||
                user.school === filteredSchool[0]?.school ? (
                  <CustomButton
                    title={'All Teachers Salary'}
                    onClick={() => {
                      navigation.navigate('AllTeachersSalary');
                      setStateArray(
                        filteredData.sort((a, b) => a.rank - b.rank),
                      );
                    }}
                  />
                ) : null}
                <ScrollView style={{ marginBottom: responsiveHeight(8) }}>
                  {filteredData.map((el, ind) => {
                    return (
                      <TouchableOpacity
                        style={styles.itemView}
                        key={ind}
                        onPress={() => {
                          if (user.circle === 'admin') {
                            navigation.navigate('ViewDetails');
                            setStateObject(el);
                          } else {
                            return;
                          }
                        }}
                      >
                        <Text selectable style={styles.dropDownText}>
                          {ordinal_suffix_of(ind + 1)} Teacher
                        </Text>
                        <Text selectable style={styles.dropDownText}>
                          Teacher's Name: {el.tname}
                        </Text>
                        <Text selectable style={styles.dropDownText}>
                          Designation: {el.desig}
                        </Text>
                        {el.gender === 'male' && el.association === 'WBTPTA' ? (
                          <TouchableOpacity
                            onPress={() => makeCall(parseInt(el.phone))}
                          >
                            <Text selectable style={styles.dropDownText}>
                              <Feather
                                name="phone-call"
                                size={18}
                                color={THEME_COLOR}
                              />{' '}
                              Mobile: {el.phone}
                            </Text>
                          </TouchableOpacity>
                        ) : user.circle === 'admin' ||
                          user.question == 'admin' ||
                          user.gender === 'female' ? (
                          <TouchableOpacity
                            onPress={() => makeCall(parseInt(el.phone))}
                          >
                            <Text selectable style={styles.dropDownText}>
                              <Feather
                                name="phone-call"
                                size={18}
                                color={THEME_COLOR}
                              />{' '}
                              Mobile: {el.phone}
                            </Text>
                          </TouchableOpacity>
                        ) : null}

                        <Text selectable style={styles.dropDownText}>
                          Association: {el.association}
                        </Text>
                        {user.circle === 'admin' ? (
                          <View>
                            <Text selectable style={styles.dropDownText}>
                              DOB: {el.dob}
                            </Text>
                            <Text selectable style={styles.dropDownText}>
                              DOJ: {el.doj}
                            </Text>
                            <Text selectable style={styles.dropDownText}>
                              DOJ in This School: {el.dojnow}
                            </Text>
                            <Text selectable style={styles.dropDownText}>
                              DOR: {el.dor}
                            </Text>
                            <Text selectable style={styles.dropDownText}>
                              Training: {el.training}
                            </Text>
                            <Text selectable style={styles.dropDownText}>
                              Address: {el.address}
                            </Text>
                          </View>
                        ) : null}

                        {el.hoi === 'Yes' ? (
                          <Text
                            selectable
                            style={[styles.dropDownText, { color: 'green' }]}
                          >
                            Head of The Institute
                          </Text>
                        ) : null}
                        {user.circle === 'admin' ? (
                          <View
                            style={{
                              flexDirection: 'row',
                              alignSelf: 'center',
                              justifyContent: 'center',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                            }}
                          >
                            <CustomButton
                              title={'Edit Details'}
                              size={'small'}
                              fontSize={responsiveFontSize(1.5)}
                              color={'chocolate'}
                              onClick={() => {
                                navigation.navigate('EditDetails');
                                setStateObject(el);
                              }}
                            />
                            <CustomButton
                              title={`Leave`}
                              size={'small'}
                              fontSize={responsiveFontSize(1.5)}
                              color={'blueviolet'}
                              onClick={async () => {
                                const url = `${DownloadWeb}/LeaveProposal?data=${JSON.stringify(
                                  { pan: el.pan },
                                )}`;
                                await Linking.openURL(url);
                              }}
                            >
                              <MaterialIcons
                                name="download-for-offline"
                                color={'white'}
                                size={30}
                              />
                            </CustomButton>

                            <CustomButton
                              title={`HRA`}
                              size={'small'}
                              fontSize={responsiveFontSize(1.5)}
                              color={'darkgreen'}
                              onClick={async () => {
                                const url = `${DownloadWeb}/HRA?data=${JSON.stringify(
                                  { pan: el.pan },
                                )}`;
                                await Linking.openURL(url);
                              }}
                            >
                              <MaterialIcons
                                name="download-for-offline"
                                color={'white'}
                                size={30}
                              />
                            </CustomButton>
                          </View>
                        ) : null}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </ScrollView>
            ) : null}
          </ScrollView>
        ) : (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              selectable
              style={{
                fontSize: 23,
                fontWeight: '500',
                textAlign: 'center',
                color: THEME_COLOR,
              }}
            >
              Edit School Details
            </Text>

            {/* <CustomTextInput
              placeholder={'Enter School Name'}
              value={editSchool.school}
              onChangeText={text => {
                setEditSchool({ ...editSchool, school: text });
              }}
            />
            <CustomTextInput
              placeholder={'Enter UDISE'}
              type={'number-pad'}
              value={editSchool.udise}
              onChangeText={text => {
                setEditSchool({ ...editSchool, udise: text });
              }}
            />
            <CustomTextInput
              placeholder={'Enter GP Name'}
              value={editSchool.gp}
              onChangeText={text => {
                setEditSchool({ ...editSchool, gp: text });
              }}
            />
            <CustomTextInput
              placeholder={`Enter Student ${filteredSchool[0]?.year - 1}`}
              type={'number-pad'}
              value={editSchool.student.toString()}
              onChangeText={text => {
                setEditSchool({ ...editSchool, student: text });
              }}
            />
            <CustomTextInput
              placeholder={`Enter Student ${filteredSchool[0]?.year}`}
              type={'number-pad'}
              value={editSchool.total_student.toString()}
              onChangeText={text => {
                setEditSchool({ ...editSchool, total_student: text });
              }}
            />
            <CustomTextInput
              placeholder={'Enter PP Student'}
              type={'number-pad'}
              value={editSchool.pp.toString()}
              onChangeText={text => {
                setEditSchool({ ...editSchool, pp: text });
              }}
            />
            <CustomTextInput
              placeholder={'Enter Class I Student'}
              type={'number-pad'}
              value={editSchool.i.toString()}
              onChangeText={text => {
                setEditSchool({ ...editSchool, i: text });
              }}
            />
            <CustomTextInput
              placeholder={'Enter Class II Student'}
              type={'number-pad'}
              value={editSchool.ii.toString()}
              onChangeText={text => {
                setEditSchool({ ...editSchool, ii: text });
              }}
            />
            <CustomTextInput
              placeholder={'Enter Class III Student'}
              type={'number-pad'}
              value={editSchool.iii.toString()}
              onChangeText={text => {
                setEditSchool({ ...editSchool, iii: text });
              }}
            />
            <CustomTextInput
              placeholder={'Enter Class IV Student'}
              type={'number-pad'}
              value={editSchool.iv.toString()}
              onChangeText={text => {
                setEditSchool({ ...editSchool, iv: text });
              }}
            />
              <CustomTextInput
                placeholder={'Enter Class V Student'}
                type={'number-pad'}
                value={editSchool.v.toString()}
                onChangeText={text => {
                  setEditSchool({ ...editSchool, v: text });
                }}
              /> */}
            <StudentInput info={editSchool} onInfoChange={setEditSchool} />
            <View style={{ marginBottom: responsiveHeight(2) }}>
              <CustomButton title={'Update'} onClick={updateData} />
              <CustomButton
                title={'Close'}
                color={'purple'}
                onClick={() => {
                  setVisible(false);
                  scrollToTop();
                }}
              />
            </View>
          </View>
        )}

        <Loader visible={showLoader} />
      </ScrollView>
    </View>
  );
};

export default StudentTeacherData;

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
    width: responsiveWidth(90),
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
    width: responsiveWidth(80),

    borderRadius: responsiveWidth(2),
    marginTop: responsiveHeight(1),
    backgroundColor: '#fff',
    elevation: 5,
    alignSelf: 'center',
    marginBottom: responsiveHeight(10),
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
  modalView: {
    marginTop: responsiveHeight(2),
    marginBottom: responsiveHeight(2),
    width: responsiveWidth(90),
    // height: responsiveHeight(100),
    // position: 'absolute',
    // backgroundColor: 'rgba(255, 255, 255,.9)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  mainView: {
    marginTop: responsiveHeight(2),
    marginBottom: responsiveHeight(2),
    width: responsiveWidth(90),
    // height: responsiveHeight(100),
    borderRadius: 10,

    backgroundColor: 'white',
    alignSelf: 'center',
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
