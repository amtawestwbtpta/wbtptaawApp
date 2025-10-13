import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { THEME_COLOR } from '../utils/Colors';
import CustomTextInput from '../components/CustomTextInput';
import CustomButton from '../components/CustomButton';
import Loader from '../components/Loader';
import {
  findEmptyValues,
  compareObjects,
  round5,
} from '../modules/calculatefunctions';

import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import AntDesign from 'react-native-vector-icons/AntDesign';
import uuid from 'react-native-uuid';
import { useGlobalContext } from '../context/Store';
import {
  getCollection,
  getDocumentByField,
  setDocument,
  updateDocument,
} from '../firebase/firestoreHelper';
import NavigationBarContainer from '../navigation/NavigationBarContainer';
import CopyableText from '../components/CopyableText';
import { showToast } from '../modules/Toaster';
const QuestionRequisition = () => {
  const isFocused = useIsFocused();
  const {
    state,
    questionState,
    setQuestionState,
    questionUpdateTime,
    setQuestionUpdateTime,
    questionRateState,
    setQuestionRateState,
    questionRateUpdateTime,
    setQuestionRateUpdateTime,
    schoolState,
    setSchoolState,
    schoolUpdateTime,
    setSchoolUpdateTime,
  } = useGlobalContext();
  const teacher = state.TEACHER;
  const navigation = useNavigation();
  const [docId, setDocId] = useState(uuid.v4().split('-')[0]);
  const [questionID, setQuestionID] = useState(docId);
  const [showLoader, setShowLoader] = useState(false);
  const [search, setSearch] = useState('');
  const [serial, setSerial] = useState(0);
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
    isAccepting: true,
  });
  const [selectedSchool, setSelectedSchool] = useState('Select School Name');
  const [visible, setVisible] = useState(false);
  const [addSchoolVisible, setAddSchoolVisible] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [token, setToken] = useState('');
  const [udise, setUdise] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [schData, setSchData] = useState([]);
  const [enteryDone, setEnteryDone] = useState(false);
  const [addInputField, setAddInputField] = useState({
    id: docId,
    school: '',
    gp: '',
    udise: '',
    cl_pp_student: '',
    cl_1_student: '',
    cl_2_student: '',
    cl_3_student: '',
    cl_4_student: '',
    cl_5_student: '',
    payment: 'DUE',
    paid: '0',
    total_student: '',
    total_rate: '',
  });
  const [selectTerm, setSelectTerm] = useState([
    { term: '1st', selected: false },
    { term: '2nd', selected: false },
    { term: '3rd', selected: false },
  ]);

  const [editInputField, setEditInputField] = useState({
    id: '',
    school: '',
    gp: '',
    udise: '',
    cl_pp_student: '',
    cl_1_student: '',
    cl_2_student: '',
    cl_3_student: '',
    cl_4_student: '',
    cl_5_student: '',
    payment: 'Due',
    paid: '0',
    total_student: '0',
    total_rate: '0',
  });

  const [orgSchoolField, setOrgSchoolField] = useState({
    id: '',
    school: '',
    gp: '',
    udise: '',
    cl_pp_student: '',
    cl_1_student: '',
    cl_2_student: '',
    cl_3_student: '',
    cl_4_student: '',
    cl_5_student: '',
    payment: 'Due',
    paid: '0',
    total_student: '0',
    total_rate: '0',
  });

  const [originalQuestionInputField, setOriginalQuestionInputField] = useState({
    id: '',
    pp_rate: 0,
    i_rate: 0,
    ii_rate: 0,
    iii_rate: 0,
    iv_rate: 0,
    v_rate: 0,
    term: '',
    year: new Date().getFullYear(),
  });

  const [showData, setShowData] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isAccepting, setIsAccepting] = useState(questionRateState.isAccepting);

  const [filteredData, setFilteredData] = useState([]);
  const [selectShow, setSelectShow] = useState(true);
  const getData = async () => {
    setShowLoader(true);
    await getCollection('questions')
      .then(data => {
        const sorted = data.sort((a, b) => {
          // Compare by 'gp'
          if (a.gp < b.gp) {
            return -1; // a comes first
          }
          if (a.gp > b.gp) {
            return 1; // b comes first
          }

          // If 'gp' is the same, compare by 'school'
          if (a.school < b.school) {
            return -1; // a comes first
          }
          if (a.school > b.school) {
            return 1; // b comes first
          }

          return 0; // They are equal
        });
        setQuestionState(sorted);
        setQuestionUpdateTime(Date.now());
        setDocId(`questions${data.length + 101}-${uuid.v4().split('-')[0]}`);
        setQuestionID(
          `questions${data.length + 101}-${uuid.v4().split('-')[0]}`,
        );

        setSerial(data.length + 1);
      })
      .then(async () => {
        setShowLoader(false);
        setShowData(false);
        setSelectedSchool('Select School Name');
        setIsClicked(false);
      })
      .catch(e => {
        setShowLoader(false);
        console.log(e);
      });
  };
  const settleQuestionData = data => {
    const tdata = teacher;
    if (tdata?.circle === 'admin') {
      setSchData(data);
      setFilteredData(data);
    } else if (tdata?.circle !== 'admin' && tdata?.question === 'admin') {
      setSchData(data.filter(school => school.gp === tdata?.gp));
      setFilteredData(data.filter(school => school.gp === tdata?.gp));
    } else {
      setSchData(data.filter(school => school.udise === tdata?.udise));
      setFilteredData(data.filter(school => school.udise === tdata?.udise));
    }
  };
  const addNewSchool = async () => {
    await getDocumentByField('questions', 'udise', addInputField.udise).then(
      async snapShot => {
        if (snapShot.length > 0) {
          showToast('error', 'School Question Requisition Already Submitted!');
        } else {
          if (!findEmptyValues(addInputField)) {
            setShowLoader(true);
            await setDocument('questions', docId, {
              id: docId,
              school: addInputField.school,
              gp: addInputField.gp,
              udise: addInputField.udise,
              cl_pp_student: addInputField.cl_pp_student,
              cl_1_student: addInputField.cl_1_student,
              cl_2_student: addInputField.cl_2_student,
              cl_3_student: addInputField.cl_3_student,
              cl_4_student: addInputField.cl_4_student,
              cl_5_student: addInputField.cl_5_student,
              payment: 'DUE',
              paid: 0,
              total_student: addInputField.total_student,
              total_rate: addInputField.total_rate,
            })
              .then(() => {
                const qState = [
                  ...questionState,
                  {
                    id: docId,
                    school: addInputField.school,
                    gp: addInputField.gp,
                    udise: addInputField.udise,
                    cl_pp_student: addInputField.cl_pp_student,
                    cl_1_student: addInputField.cl_1_student,
                    cl_2_student: addInputField.cl_2_student,
                    cl_3_student: addInputField.cl_3_student,
                    cl_4_student: addInputField.cl_4_student,
                    cl_5_student: addInputField.cl_5_student,
                    payment: 'Due',
                    paid: 0,
                    total_student: addInputField.total_student,
                    total_rate: addInputField.total_rate,
                  },
                ].sort((a, b) => {
                  // Compare by 'gp'
                  if (a.gp < b.gp) {
                    return -1; // a comes first
                  }
                  if (a.gp > b.gp) {
                    return 1; // b comes first
                  }

                  // If 'gp' is the same, compare by 'school'
                  if (a.school < b.school) {
                    return -1; // a comes first
                  }
                  if (a.school > b.school) {
                    return 1; // b comes first
                  }

                  return 0; // They are equal
                });
                setQuestionState(qState);
                setQuestionUpdateTime(Date.now());
                setShowData(false);
                setSubmitted(true);
                setSelectedSchool('Select School Name');
                setDocId(
                  `questions${qState.length + 101}-${uuid.v4().split('-')[0]}`,
                );
                setShowLoader(false);
                showToast(
                  'success',
                  'Question Requisition Submitted Successfully!',
                );
              })
              .catch(e => {
                setShowLoader(false);
                showToast('error', 'Question Requisition Submission Failed!');
                console.log(e);
              });
          } else {
            showToast('error', 'Form Invalid!');
          }
        }
      },
    );
  };

  const updateSchool = async () => {
    if (!compareObjects(editInputField, orgSchoolField)) {
      setShowLoader(true);
      await updateDocument('questions', editInputField.id, editInputField)
        .then(() => {
          let x = questionState.filter(el => el.id === editInputField.id)[0];
          let y = questionState.filter(el => el.id !== editInputField.id);
          y = [...y, editInputField];

          const newData = y.sort((a, b) => {
            // Compare by 'gp'
            if (a.gp < b.gp) {
              return -1; // a comes first
            }
            if (a.gp > b.gp) {
              return 1; // b comes first
            }

            // If 'gp' is the same, compare by 'school'
            if (a.school < b.school) {
              return -1; // a comes first
            }
            if (a.school > b.school) {
              return 1; // b comes first
            }

            return 0; // They are equal
          });
          setQuestionState(newData);

          setQuestionUpdateTime(Date.now());
          setShowLoader(false);
          showToast('success', 'School Details Updated Successfully!');

          setShowData(false);
          setSelectShow(true);
        })
        .catch(e => {
          setShowLoader(false);
          showToast('error', 'School Details Updation Failed!');
          console.log(e);
        });
    } else {
      showToast('error', 'Data is Same!');
    }
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
  const getQuestionData = () => {
    const difference = (Date.now() - questionUpdateTime) / 1000 / 60 / 15;
    if (questionState.length === 0 || difference >= 1) {
      getData();
    } else {
      setDocId(
        `questions${questionState.length + 101}-${uuid.v4().split('-')[0]}`,
      );
      setQuestionID(
        `questions${questionState.length + 101}-${uuid.v4().split('-')[0]}`,
      );

      setSerial(questionState.length + 1);
      setShowLoader(false);
      setShowData(false);
      setSelectedSchool('Select School Name');
      setIsClicked(false);
    }
    const questionRateDifference =
      (Date.now() - questionRateUpdateTime) / 1000 / 60 / 15;
    if (questionRateDifference >= 1 || questionRateState.length === 0) {
      getQuestionRate();
    } else {
      setQRateData(questionRateState);
      let otherTerms = selectTerm.filter(
        el => el.term !== questionRateState.term,
      );

      let tempTerm = {
        term: questionRateState.term,
        selected: true,
      };
      otherTerms.push(tempTerm);

      setSelectTerm(otherTerms);
    }

    const schDifference = (Date.now() - schoolUpdateTime) / 1000 / 60 / 15;
    if (schDifference >= 1 || schoolState.length === 0) {
      setSchoolUpdateTime(Date.now());
      getSchoolStateData();
    } else {
      settleQuestionData(schoolState);
    }
  };

  const getQuestionRate = async () => {
    setShowLoader(true);
    await getCollection('question_rate')
      .then(data => {
        let otherTerms = selectTerm.filter(el => el.term !== data[0].term);

        let tempTerm = {
          term: data[0].term,
          selected: true,
        };
        otherTerms.push(tempTerm);

        setSelectTerm(otherTerms);

        setQuestionRateState(data[0]);
        setQuestionRateUpdateTime(Date.now());
        setShowLoader(false);
      })
      .catch(e => {
        setShowLoader(false);
        showToast('error', e);
        console.log(e);
      });
  };

  const getSchoolStateData = async () => {
    setShowLoader(true);
    await getCollection('schools')
      .then(data => {
        setSchoolState(data);
        setShowLoader(false);
        settleQuestionData(data);
      })
      .catch(e => {
        console.log('error', e);
        setShowLoader(false);
      });
  };

  useEffect(() => {
    getQuestionData();
  }, [isFocused]);
  useEffect(() => {}, [
    originalQuestionInputField,
    docId,
    selectTerm,
    editInputField,
    questionID,
  ]);
  return (
    <NavigationBarContainer>
      <ScrollView
        style={{ backgroundColor: 'white' }}
        nestedScrollEnabled={true}
      >
        {isAccepting ? (
          <View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'center',
              }}
            >
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  alignSelf: 'center',
                }}
              >
                <CustomButton
                  title={'Enter School Requisition'}
                  color={'darkgreen'}
                  fontSize={12}
                  onClick={() => {
                    setShowData(false);
                    setAddSchoolVisible(true);
                    setVisible(false);
                    setSelectShow(false);
                    setSubmitted(false);
                    setShowResult(false);
                  }}
                />
                <CustomButton
                  title={'Edit/ View Submitted Data'}
                  fontSize={12}
                  onClick={() => {
                    setShowData(false);
                    setAddSchoolVisible(false);
                    setVisible(true);
                    setSelectShow(false);
                    setSubmitted(false);
                    setToken('');
                    setUdise('');
                    setEditInputField({
                      id: '',
                      school: '',
                      gp: '',
                      udise: '',
                      cl_pp_student: '',
                      cl_1_student: '',
                      cl_2_student: '',
                      cl_3_student: '',
                      cl_4_student: '',
                      cl_5_student: '',
                      payment: 'Due',
                      paid: '0',
                      total_student: '0',
                      total_rate: '0',
                    });
                    setOrgSchoolField({
                      id: '',
                      school: '',
                      gp: '',
                      udise: '',
                      cl_pp_student: '',
                      cl_1_student: '',
                      cl_2_student: '',
                      cl_3_student: '',
                      cl_4_student: '',
                      cl_5_student: '',
                      payment: 'Due',
                      paid: '0',
                      total_student: '0',
                      total_rate: '0',
                    });
                    setShowResult(false);
                  }}
                />
              </View>
            </View>

            {addSchoolVisible && (
              <View style={styles.modalView}>
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
                    Enter Your Question Requisition for {questionRateState.term}{' '}
                    Summative Examination, {new Date().getFullYear()}:
                  </Text>
                  {!isClicked && !showData && (
                    <Text
                      selectable
                      style={{
                        fontSize: responsiveFontSize(3),
                        fontWeight: '500',
                        textAlign: 'center',
                        color: THEME_COLOR,
                        marginVertical: responsiveHeight(1),
                      }}
                    >
                      Select Your School:
                    </Text>
                  )}

                  <TouchableOpacity
                    style={[styles.dropDownnSelector, { marginTop: 5 }]}
                    onPress={() => {
                      setIsClicked(!isClicked);
                      setFilteredData(schData);
                      setSelectedSchool('Select School Name');
                      setSelectShow(true);
                      setShowData(false);
                    }}
                  >
                    {isClicked ? (
                      <View style={{ flexDirection: 'row' }}>
                        <Text
                          selectable
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
                      <View style={{ flexDirection: 'row' }}>
                        <Text
                          selectable
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

                  {selectShow ? (
                    <ScrollView
                      style={{ alignSelf: 'center' }}
                      contentContainerStyle={{
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      {isClicked ? (
                        <ScrollView style={styles.dropDowArea}>
                          <CustomTextInput
                            value={search}
                            placeholder={'Enter School Name'}
                            onChangeText={text => {
                              setSearch(text);
                              setFilteredData(
                                schData.filter(el =>
                                  el.school
                                    .toLowerCase()
                                    .match(text.toLowerCase()),
                                ),
                              );
                            }}
                          />
                          {filteredData.map((item, index) => {
                            return (
                              <TouchableOpacity
                                key={index}
                                style={styles.AdminName}
                                onPress={() => {
                                  setIsClicked(false);
                                  setShowData(true);
                                  setFilteredData(
                                    schData.filter(el =>
                                      el.udise.match(item.udise),
                                    ),
                                  );
                                  const findSch = questionState.filter(el =>
                                    el.udise.match(item.udise),
                                  );
                                  if (findSch.length > 0) {
                                    setEnteryDone(true);
                                  } else {
                                    setEnteryDone(false);
                                  }
                                  setSelectedSchool(
                                    `${index + 1}. ${item.school}`,
                                  );
                                  setAddInputField({
                                    ...addInputField,
                                    school: item.school,
                                    udise: item.udise,
                                    gp: item.gp,
                                    id: docId,
                                    sl: serial,
                                    cl_pp_student: parseInt(item.pp),
                                    cl_1_student: parseInt(item.i),
                                    cl_2_student: parseInt(item.ii),
                                    cl_3_student: parseInt(item.iii),
                                    cl_4_student: parseInt(item.iv),
                                    cl_5_student: parseInt(item.v),
                                    total_student:
                                      parseInt(item.pp) +
                                      parseInt(item.i) +
                                      parseInt(item.ii) +
                                      parseInt(item.iii) +
                                      parseInt(item.iv) +
                                      parseInt(item.v),
                                    total_rate: round5(
                                      item.pp * questionRateState.pp_rate +
                                        item.i * questionRateState.i_rate +
                                        item.ii * questionRateState.ii_rate +
                                        item.iii * questionRateState.iii_rate +
                                        item.iv * questionRateState.iv_rate +
                                        item.v * questionRateState.v_rate,
                                    ),
                                    payment: 'DUE',
                                    paid: 0,
                                  });
                                  setSearch('');
                                }}
                              >
                                <Text selectable style={styles.dropDownText}>
                                  {index + 1 + '. ' + item.school}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </ScrollView>
                      ) : null}
                    </ScrollView>
                  ) : null}
                  {showData && (
                    <View>
                      <View style={styles.itemView}>
                        <Text selectable style={styles.dropDownText}>
                          School Name: {addInputField.school}
                        </Text>
                        <Text selectable style={styles.dropDownText}>
                          UDISE: {addInputField.udise}
                        </Text>
                        <Text selectable style={styles.dropDownText}>
                          GP: {addInputField.gp}
                        </Text>
                        <Text selectable style={styles.dropDownText}>
                          Total Students: {addInputField.total_student}
                        </Text>
                        <Text selectable style={styles.dropDownText}>
                          Total Rate: {addInputField.total_rate}
                        </Text>
                        {enteryDone ? (
                          <Text
                            selectable
                            style={[styles.dropDownText, { color: 'red' }]}
                          >
                            Entry Already Done
                          </Text>
                        ) : (
                          <Text
                            selectable
                            style={[styles.dropDownText, { color: 'green' }]}
                          >
                            Entry Not Done
                          </Text>
                        )}
                      </View>
                      <Text selectable style={styles.dropDownText}>
                        Enter Students Number:
                      </Text>
                      <View
                        style={[
                          styles.itemView,
                          { flexDirection: 'row', flexWrap: 'wrap' },
                        ]}
                      >
                        <View
                          style={{
                            margin: 5,
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <Text selectable style={styles.dropDownText}>
                            Class PP
                          </Text>
                          <CustomTextInput
                            size="small"
                            placeholder={'PP'}
                            type={'number-pad'}
                            value={addInputField.cl_pp_student.toString()}
                            onChangeText={text => {
                              if (text !== '') {
                                setAddInputField({
                                  ...addInputField,
                                  cl_pp_student: parseInt(text),
                                  total_student:
                                    parseInt(text) +
                                    addInputField.cl_1_student +
                                    addInputField.cl_2_student +
                                    addInputField.cl_3_student +
                                    addInputField.cl_4_student +
                                    addInputField.cl_5_student,
                                  total_rate: round5(
                                    parseInt(text) * questionRateState.pp_rate +
                                      addInputField.cl_1_student *
                                        questionRateState.i_rate +
                                      addInputField.cl_2_student *
                                        questionRateState.ii_rate +
                                      addInputField.cl_3_student *
                                        questionRateState.iii_rate +
                                      addInputField.cl_4_student *
                                        questionRateState.iv_rate +
                                      addInputField.cl_5_student *
                                        questionRateState.v_rate,
                                  ),
                                });
                              } else {
                                setAddInputField({
                                  ...addInputField,
                                  cl_pp_student: '',
                                });
                              }
                            }}
                          />
                        </View>
                        <View
                          style={{
                            margin: 5,
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <Text selectable style={styles.dropDownText}>
                            Class I
                          </Text>
                          <CustomTextInput
                            size="small"
                            placeholder={'Class I'}
                            type={'number-pad'}
                            value={addInputField.cl_1_student.toString()}
                            onChangeText={text => {
                              if (text !== '') {
                                setAddInputField({
                                  ...addInputField,
                                  cl_1_student: parseInt(text),
                                  total_student:
                                    parseInt(text) +
                                    addInputField.cl_pp_student +
                                    addInputField.cl_2_student +
                                    addInputField.cl_3_student +
                                    addInputField.cl_4_student +
                                    addInputField.cl_5_student,
                                  total_rate: round5(
                                    parseInt(text) * questionRateState.i_rate +
                                      addInputField.cl_pp_student *
                                        questionRateState.pp_rate +
                                      addInputField.cl_2_student *
                                        questionRateState.ii_rate +
                                      addInputField.cl_3_student *
                                        questionRateState.iii_rate +
                                      addInputField.cl_4_student *
                                        questionRateState.iv_rate +
                                      addInputField.cl_5_student *
                                        questionRateState.v_rate,
                                  ),
                                });
                              } else {
                                setAddInputField({
                                  ...addInputField,
                                  cl_1_student: '',
                                });
                              }
                            }}
                          />
                        </View>
                        <View
                          style={{
                            margin: 5,
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <Text selectable style={styles.dropDownText}>
                            Class II
                          </Text>
                          <CustomTextInput
                            size="small"
                            placeholder={'Class II'}
                            type={'number-pad'}
                            value={addInputField.cl_2_student.toString()}
                            onChangeText={text => {
                              if (text !== '') {
                                setAddInputField({
                                  ...addInputField,
                                  cl_2_student: parseInt(text),
                                  total_student:
                                    parseInt(text) +
                                    addInputField.cl_pp_student +
                                    addInputField.cl_1_student +
                                    addInputField.cl_3_student +
                                    addInputField.cl_4_student +
                                    addInputField.cl_5_student,
                                  total_rate: round5(
                                    parseInt(text) * questionRateState.ii_rate +
                                      addInputField.cl_pp_student *
                                        questionRateState.pp_rate +
                                      addInputField.cl_1_student *
                                        questionRateState.i_rate +
                                      addInputField.cl_3_student *
                                        questionRateState.iii_rate +
                                      addInputField.cl_4_student *
                                        questionRateState.iv_rate +
                                      addInputField.cl_5_student *
                                        questionRateState.v_rate,
                                  ),
                                });
                              } else {
                                setAddInputField({
                                  ...addInputField,
                                  cl_2_student: '',
                                });
                              }
                            }}
                          />
                        </View>
                        <View
                          style={{
                            margin: 5,
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <Text selectable style={styles.dropDownText}>
                            Class III
                          </Text>
                          <CustomTextInput
                            size="small"
                            placeholder={'Class III'}
                            type={'number-pad'}
                            value={addInputField.cl_3_student.toString()}
                            onChangeText={text => {
                              if (text !== '') {
                                setAddInputField({
                                  ...addInputField,
                                  cl_3_student: parseInt(text),
                                  total_student:
                                    parseInt(text) +
                                    addInputField.cl_pp_student +
                                    addInputField.cl_2_student +
                                    addInputField.cl_1_student +
                                    addInputField.cl_4_student +
                                    addInputField.cl_5_student,
                                  total_rate: round5(
                                    parseInt(text) *
                                      questionRateState.iii_rate +
                                      addInputField.cl_pp_student *
                                        questionRateState.pp_rate +
                                      addInputField.cl_2_student *
                                        questionRateState.ii_rate +
                                      addInputField.cl_1_student *
                                        questionRateState.i_rate +
                                      addInputField.cl_4_student *
                                        questionRateState.iv_rate +
                                      addInputField.cl_5_student *
                                        questionRateState.v_rate,
                                  ),
                                });
                              } else {
                                setAddInputField({
                                  ...addInputField,
                                  cl_3_student: '',
                                });
                              }
                            }}
                          />
                        </View>
                        <View
                          style={{
                            margin: 5,
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <Text selectable style={styles.dropDownText}>
                            Class IV
                          </Text>
                          <CustomTextInput
                            size="small"
                            placeholder={'Class IV'}
                            type={'number-pad'}
                            value={addInputField.cl_4_student.toString()}
                            onChangeText={text => {
                              if (text !== '') {
                                setAddInputField({
                                  ...addInputField,
                                  cl_4_student: parseInt(text),
                                  total_student:
                                    parseInt(text) +
                                    addInputField.cl_pp_student +
                                    addInputField.cl_2_student +
                                    addInputField.cl_3_student +
                                    addInputField.cl_1_student +
                                    addInputField.cl_5_student,
                                  total_rate: round5(
                                    parseInt(text) * questionRateState.iv_rate +
                                      addInputField.cl_pp_student *
                                        questionRateState.pp_rate +
                                      addInputField.cl_2_student *
                                        questionRateState.ii_rate +
                                      addInputField.cl_3_student *
                                        questionRateState.iii_rate +
                                      addInputField.cl_1_student *
                                        questionRateState.i_rate +
                                      addInputField.cl_5_student *
                                        questionRateState.v_rate,
                                  ),
                                });
                              } else {
                                setAddInputField({
                                  ...addInputField,
                                  cl_4_student: '',
                                });
                              }
                            }}
                          />
                        </View>
                        <View
                          style={{
                            margin: 5,
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <Text selectable style={styles.dropDownText}>
                            Class V
                          </Text>
                          <CustomTextInput
                            size="small"
                            placeholder={'Class V'}
                            type={'number-pad'}
                            value={addInputField.cl_5_student.toString()}
                            onChangeText={text => {
                              if (text !== '') {
                                setAddInputField({
                                  ...addInputField,
                                  cl_5_student: parseInt(text),
                                  total_student:
                                    parseInt(text) +
                                    addInputField.cl_pp_student +
                                    addInputField.cl_2_student +
                                    addInputField.cl_3_student +
                                    addInputField.cl_4_student +
                                    addInputField.cl_1_student,
                                  total_rate: round5(
                                    parseInt(text) * questionRateState.v_rate +
                                      addInputField.cl_pp_student *
                                        questionRateState.pp_rate +
                                      addInputField.cl_2_student *
                                        questionRateState.ii_rate +
                                      addInputField.cl_3_student *
                                        questionRateState.iii_rate +
                                      addInputField.cl_4_student *
                                        questionRateState.iv_rate +
                                      addInputField.cl_1_student *
                                        questionRateState.i_rate,
                                  ),
                                });
                              } else {
                                setAddInputField({
                                  ...addInputField,
                                  cl_5_student: '',
                                });
                              }
                            }}
                          />
                        </View>
                      </View>

                      <CustomButton
                        title={'Submit'}
                        disabled={enteryDone}
                        onClick={() => {
                          addNewSchool();
                        }}
                      />
                      <CustomButton
                        title={'Cancel'}
                        color={'purple'}
                        onClick={() => {
                          setAddInputField({
                            id: docId,
                            school: '',
                            gp: '',
                            udise: '',
                            cl_pp_student: '',
                            cl_1_student: '',
                            cl_2_student: '',
                            cl_3_student: '',
                            cl_4_student: '',
                            cl_5_student: '',
                            payment: 'DUE',
                            paid: '0',
                            total_student: '',
                            total_rate: '',
                          });
                          setShowData(false);
                          setSelectedSchool('Select School Name');
                        }}
                      />
                    </View>
                  )}
                </View>
              </View>
            )}
            {submitted && (
              <View
                style={[
                  styles.mainView,
                  {
                    marginVertical: responsiveHeight(2),
                    backgroundColor: 'aliceblue',
                    padding: responsiveWidth(2),
                  },
                ]}
              >
                <Text
                  selectable
                  style={{
                    fontSize: responsiveFontSize(2),
                    fontWeight: '500',
                    textAlign: 'center',
                    color: THEME_COLOR,
                  }}
                >
                  Tour Question Requisition Submitted Successfully. Please Note
                  That Your Submission Token Number is:
                </Text>

                <Text
                  selectable
                  style={{
                    fontSize: responsiveFontSize(3),
                    fontWeight: '500',
                    textAlign: 'center',
                    color: THEME_COLOR,
                  }}
                >
                  {questionID}
                </Text>
                <CopyableText
                  text={questionID}
                  message={'Your submission token has been copied successfully'}
                />

                <CustomButton
                  title={'Close'}
                  size={'xsmall'}
                  color={'red'}
                  onClick={() => {
                    setSubmitted(false);
                    setQuestionID(docId);
                  }}
                />
              </View>
            )}

            {visible && (
              <View style={styles.modalView}>
                <View style={styles.mainView}>
                  <CustomTextInput
                    value={token}
                    placeholder={'Enter Token No.'}
                    onChangeText={text => {
                      setToken(text);
                    }}
                  />
                  <CustomTextInput
                    value={udise}
                    placeholder={'Enter UDISE No.'}
                    onChangeText={text => {
                      setUdise(text);
                    }}
                  />
                  <CustomButton
                    title={'Search'}
                    size={'xsmall'}
                    color={'red'}
                    onClick={() => {
                      if (token === '' || udise === '') {
                        showToast('error', 'Please enter both token and UDISE');
                        return;
                      }
                      let fdata = questionState.filter(
                        el => el.id === token && el.udise === udise,
                      );
                      if (fdata.length > 0) {
                        setShowResult(true);
                        setEditInputField(fdata[0]);
                        setOrgSchoolField(fdata[0]);
                      } else {
                        showToast('error', 'No record found');
                        setShowResult(false);
                      }
                    }}
                  />

                  {showResult && (
                    <View style={styles.mainView}>
                      <Text
                        style={{
                          fontSize: responsiveFontSize(2),
                          color: THEME_COLOR,
                        }}
                      >
                        School: {orgSchoolField.school}
                      </Text>
                      <Text
                        style={{
                          fontSize: responsiveFontSize(2),
                          color: THEME_COLOR,
                        }}
                      >
                        GP: {orgSchoolField.gp}
                      </Text>

                      <Text
                        style={{
                          fontSize: responsiveFontSize(2),
                          color: THEME_COLOR,
                        }}
                      >
                        UDISE: {orgSchoolField.udise}
                      </Text>
                      <Text
                        style={{
                          fontSize: responsiveFontSize(2),
                          color: THEME_COLOR,
                        }}
                      >
                        Class PP Students: {orgSchoolField.cl_pp_student}
                      </Text>
                      <Text
                        style={{
                          fontSize: responsiveFontSize(2),
                          color: THEME_COLOR,
                        }}
                      >
                        Class I Students: {orgSchoolField.cl_1_student}
                      </Text>

                      <Text
                        style={{
                          fontSize: responsiveFontSize(2),
                          color: THEME_COLOR,
                        }}
                      >
                        Class II Students: {orgSchoolField.cl_2_student}
                      </Text>
                      <Text
                        style={{
                          fontSize: responsiveFontSize(2),
                          color: THEME_COLOR,
                        }}
                      >
                        Class III Students: {orgSchoolField.cl_3_student}
                      </Text>
                      <Text
                        style={{
                          fontSize: responsiveFontSize(2),
                          color: THEME_COLOR,
                        }}
                      >
                        Class IV Students: {orgSchoolField.cl_4_student}
                      </Text>
                      {orgSchoolField.cl_5_student > 0 && (
                        <Text
                          style={{
                            fontSize: responsiveFontSize(2),
                            color: THEME_COLOR,
                          }}
                        >
                          Class V Students: {orgSchoolField.cl_5_student}
                        </Text>
                      )}
                      <Text
                        style={{
                          fontSize: responsiveFontSize(2),
                          color: THEME_COLOR,
                        }}
                      >
                        Total Students: {orgSchoolField.total_student}
                      </Text>
                      <Text
                        style={{
                          fontSize: responsiveFontSize(2),
                          color: THEME_COLOR,
                        }}
                      >
                        Total Rate: ₹{orgSchoolField.total_rate}
                      </Text>
                      <Text
                        style={{
                          fontSize: responsiveFontSize(3),
                          color: 'green',
                          marginVertical: responsiveHeight(1),
                          fontWeight: '700',
                        }}
                      >
                        Edit Your Data:
                      </Text>

                      <View style={styles.mainView}>
                        <View
                          style={[
                            styles.itemView,
                            { flexDirection: 'row', flexWrap: 'wrap' },
                          ]}
                        >
                          <View
                            style={{
                              margin: 5,
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            <Text selectable style={styles.dropDownText}>
                              Class PP
                            </Text>
                            <CustomTextInput
                              size="small"
                              placeholder={'PP'}
                              type={'number-pad'}
                              value={editInputField.cl_pp_student.toString()}
                              onChangeText={text => {
                                if (text !== '') {
                                  setEditInputField({
                                    ...editInputField,
                                    cl_pp_student: parseInt(text),
                                    total_student:
                                      parseInt(text) +
                                      editInputField.cl_1_student +
                                      editInputField.cl_2_student +
                                      editInputField.cl_3_student +
                                      editInputField.cl_4_student +
                                      editInputField.cl_5_student,
                                    total_rate: round5(
                                      parseInt(text) *
                                        questionRateState.pp_rate +
                                        editInputField.cl_1_student *
                                          questionRateState.i_rate +
                                        editInputField.cl_2_student *
                                          questionRateState.ii_rate +
                                        editInputField.cl_3_student *
                                          questionRateState.iii_rate +
                                        editInputField.cl_4_student *
                                          questionRateState.iv_rate +
                                        editInputField.cl_5_student *
                                          questionRateState.v_rate,
                                    ),
                                  });
                                } else {
                                  setEditInputField({
                                    ...editInputField,
                                    cl_pp_student: '',
                                  });
                                }
                              }}
                            />
                          </View>
                          <View
                            style={{
                              margin: 5,
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            <Text selectable style={styles.dropDownText}>
                              Class I
                            </Text>
                            <CustomTextInput
                              size="small"
                              placeholder={'Class I'}
                              type={'number-pad'}
                              value={editInputField.cl_1_student.toString()}
                              onChangeText={text => {
                                if (text !== '') {
                                  setEditInputField({
                                    ...editInputField,
                                    cl_1_student: parseInt(text),
                                    total_student:
                                      parseInt(text) +
                                      editInputField.cl_pp_student +
                                      editInputField.cl_2_student +
                                      editInputField.cl_3_student +
                                      editInputField.cl_4_student +
                                      editInputField.cl_5_student,
                                    total_rate: round5(
                                      parseInt(text) *
                                        questionRateState.i_rate +
                                        editInputField.cl_pp_student *
                                          questionRateState.pp_rate +
                                        editInputField.cl_2_student *
                                          questionRateState.ii_rate +
                                        editInputField.cl_3_student *
                                          questionRateState.iii_rate +
                                        editInputField.cl_4_student *
                                          questionRateState.iv_rate +
                                        editInputField.cl_5_student *
                                          questionRateState.v_rate,
                                    ),
                                  });
                                } else {
                                  setEditInputField({
                                    ...editInputField,
                                    cl_1_student: '',
                                  });
                                }
                              }}
                            />
                          </View>
                          <View
                            style={{
                              margin: 5,
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            <Text selectable style={styles.dropDownText}>
                              Class II
                            </Text>
                            <CustomTextInput
                              size="small"
                              placeholder={'Class II'}
                              type={'number-pad'}
                              value={editInputField.cl_2_student.toString()}
                              onChangeText={text => {
                                if (text !== '') {
                                  setEditInputField({
                                    ...editInputField,
                                    cl_2_student: parseInt(text),
                                    total_student:
                                      parseInt(text) +
                                      editInputField.cl_pp_student +
                                      editInputField.cl_1_student +
                                      editInputField.cl_3_student +
                                      editInputField.cl_4_student +
                                      editInputField.cl_5_student,
                                    total_rate: round5(
                                      parseInt(text) *
                                        questionRateState.ii_rate +
                                        editInputField.cl_pp_student *
                                          questionRateState.pp_rate +
                                        editInputField.cl_1_student *
                                          questionRateState.i_rate +
                                        editInputField.cl_3_student *
                                          questionRateState.iii_rate +
                                        editInputField.cl_4_student *
                                          questionRateState.iv_rate +
                                        editInputField.cl_5_student *
                                          questionRateState.v_rate,
                                    ),
                                  });
                                } else {
                                  setEditInputField({
                                    ...editInputField,
                                    cl_2_student: '',
                                  });
                                }
                              }}
                            />
                          </View>
                          <View
                            style={{
                              margin: 5,
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            <Text selectable style={styles.dropDownText}>
                              Class III
                            </Text>
                            <CustomTextInput
                              size="small"
                              placeholder={'Class III'}
                              type={'number-pad'}
                              value={editInputField.cl_3_student.toString()}
                              onChangeText={text => {
                                if (text !== '') {
                                  setEditInputField({
                                    ...editInputField,
                                    cl_3_student: parseInt(text),
                                    total_student:
                                      parseInt(text) +
                                      editInputField.cl_pp_student +
                                      editInputField.cl_2_student +
                                      editInputField.cl_1_student +
                                      editInputField.cl_4_student +
                                      editInputField.cl_5_student,
                                    total_rate: round5(
                                      parseInt(text) *
                                        questionRateState.iii_rate +
                                        editInputField.cl_pp_student *
                                          questionRateState.pp_rate +
                                        editInputField.cl_2_student *
                                          questionRateState.ii_rate +
                                        editInputField.cl_1_student *
                                          questionRateState.i_rate +
                                        editInputField.cl_4_student *
                                          questionRateState.iv_rate +
                                        editInputField.cl_5_student *
                                          questionRateState.v_rate,
                                    ),
                                  });
                                } else {
                                  setEditInputField({
                                    ...editInputField,
                                    cl_3_student: '',
                                  });
                                }
                              }}
                            />
                          </View>
                          <View
                            style={{
                              margin: 5,
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            <Text selectable style={styles.dropDownText}>
                              Class IV
                            </Text>
                            <CustomTextInput
                              size="small"
                              placeholder={'Class IV'}
                              type={'number-pad'}
                              value={editInputField.cl_4_student.toString()}
                              onChangeText={text => {
                                if (text !== '') {
                                  setEditInputField({
                                    ...editInputField,
                                    cl_4_student: parseInt(text),
                                    total_student:
                                      parseInt(text) +
                                      editInputField.cl_pp_student +
                                      editInputField.cl_2_student +
                                      editInputField.cl_3_student +
                                      editInputField.cl_1_student +
                                      editInputField.cl_5_student,
                                    total_rate: round5(
                                      parseInt(text) *
                                        questionRateState.iv_rate +
                                        editInputField.cl_pp_student *
                                          questionRateState.pp_rate +
                                        editInputField.cl_2_student *
                                          questionRateState.ii_rate +
                                        editInputField.cl_3_student *
                                          questionRateState.iii_rate +
                                        editInputField.cl_1_student *
                                          questionRateState.i_rate +
                                        editInputField.cl_5_student *
                                          questionRateState.v_rate,
                                    ),
                                  });
                                } else {
                                  setEditInputField({
                                    ...editInputField,
                                    cl_4_student: '',
                                  });
                                }
                              }}
                            />
                          </View>
                          <View
                            style={{
                              margin: 5,
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            <Text selectable style={styles.dropDownText}>
                              Class V
                            </Text>
                            <CustomTextInput
                              size="small"
                              placeholder={'Class V'}
                              type={'number-pad'}
                              value={editInputField.cl_5_student.toString()}
                              onChangeText={text => {
                                if (text !== '') {
                                  setEditInputField({
                                    ...editInputField,
                                    cl_5_student: parseInt(text),
                                    total_student:
                                      parseInt(text) +
                                      editInputField.cl_pp_student +
                                      editInputField.cl_2_student +
                                      editInputField.cl_3_student +
                                      editInputField.cl_4_student +
                                      editInputField.cl_1_student,
                                    total_rate: round5(
                                      parseInt(text) *
                                        questionRateState.v_rate +
                                        editInputField.cl_pp_student *
                                          questionRateState.pp_rate +
                                        editInputField.cl_2_student *
                                          questionRateState.ii_rate +
                                        editInputField.cl_3_student *
                                          questionRateState.iii_rate +
                                        editInputField.cl_4_student *
                                          questionRateState.iv_rate +
                                        editInputField.cl_1_student *
                                          questionRateState.i_rate,
                                    ),
                                  });
                                } else {
                                  setEditInputField({
                                    ...editInputField,
                                    cl_5_student: '',
                                  });
                                }
                              }}
                            />
                          </View>
                        </View>
                        <View
                          style={{
                            marginTop: responsiveHeight(1),
                            marginBottom: responsiveHeight(2),
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            alignSelf: 'center',
                          }}
                        >
                          <CustomButton
                            size={'small'}
                            title={'Submit'}
                            onClick={() => {
                              updateSchool();
                            }}
                          />
                          <CustomButton
                            size={'small'}
                            title={'Cancel'}
                            color={'purple'}
                            onClick={() => {
                              setShowData(false);
                              setAddSchoolVisible(false);
                              setVisible(false);
                              setSelectShow(false);
                              setSubmitted(false);
                              setToken('');
                              setUdise('');
                              setEditInputField({
                                id: '',
                                school: '',
                                gp: '',
                                udise: '',
                                cl_pp_student: '',
                                cl_1_student: '',
                                cl_2_student: '',
                                cl_3_student: '',
                                cl_4_student: '',
                                cl_5_student: '',
                                payment: 'Due',
                                paid: '0',
                                total_student: '0',
                                total_rate: '0',
                              });
                              setOrgSchoolField({
                                id: '',
                                school: '',
                                gp: '',
                                udise: '',
                                cl_pp_student: '',
                                cl_1_student: '',
                                cl_2_student: '',
                                cl_3_student: '',
                                cl_4_student: '',
                                cl_5_student: '',
                                payment: 'Due',
                                paid: '0',
                                total_student: '0',
                                total_rate: '0',
                              });
                              setShowResult(false);
                            }}
                          />
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>
        ) : (
          <View>
            <Text style={styles.title}>
              Currently We Are Not Acceping Any Question Reqisition or Question
              Reqisition Period is Over
            </Text>
          </View>
        )}

        <Loader visible={showLoader} />
      </ScrollView>
    </NavigationBarContainer>
  );
};

export default QuestionRequisition;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    position: 'absolute',
    width: responsiveWidth(100),
    height: responsiveHeight(8.5),
    backgroundColor: THEME_COLOR,
    elevation: 5,
    shadowColor: 'black',
    borderBottomLeftRadius: responsiveWidth(3),
    borderBottomRightRadius: responsiveWidth(3),
    padding: 3,
    marginBottom: responsiveHeight(2),
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
    width: responsiveWidth(80),
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
    width: responsiveWidth(80),

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
    margin: responsiveHeight(1),
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
    width: responsiveWidth(100),

    backgroundColor: 'rgba(255, 255, 255,.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainView: {
    width: responsiveWidth(80),

    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'white',
  },
});
