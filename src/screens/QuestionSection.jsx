import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  Alert,
  Switch,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { THEME_COLOR } from '../utils/Colors';
import CustomTextInput from '../components/CustomTextInput';
import CustomButton from '../components/CustomButton';
import Loader from '../components/Loader';
import {
  round2dec,
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
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ReactNativeModal from 'react-native-modal';
import uuid from 'react-native-uuid';
import { useGlobalContext } from '../context/Store';
import { showToast } from '../modules/Toaster';
import NavigationBarContainer from '../navigation/NavigationBarContainer';
import {
  deleteDocument,
  getCollection,
  setDocument,
  updateDocument,
} from '../firebase/firestoreHelper';
const QuestionSection = () => {
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
  } = useGlobalContext();
  const user = state.USER;
  const navigation = useNavigation();
  const [docId, setDocId] = useState(uuid.v4().split('-')[0]);
  const [showLoader, setShowLoader] = useState(false);
  const [search, setSearch] = useState('');
  const [qData, setQData] = useState([]);
  const [qRateData, setQRateData] = useState({
    id: '',
    pp_rate: '',
    i_rate: '',
    ii_rate: '',
    iii_rate: '',
    iv_rate: '',
    v_rate: '',
    term: '1st',
    year: new Date().getFullYear(),
    isAccepting: false,
  });
  const [selectedSchool, setSelectedSchool] = useState('Select School Name');
  const [visible, setVisible] = useState(false);
  const [addSchoolVisible, setAddSchoolVisible] = useState(false);
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
    payment: 'Due',
    paid: '0',
    total_student: '',
    total_rate: '',
  });
  const [indexNumber, setIndexNumber] = useState(0);
  const [selectTerm, setSelectTerm] = useState([
    { term: '1st', selected: false },
    { term: '2nd', selected: false },
    { term: '3rd', selected: false },
  ]);

  const onSelect = index => {
    let tempTerm = selectTerm;
    tempTerm.map((item, ind) => {
      if (ind === index) {
        item.selected = true;
      } else {
        item.selected = false;
      }
    });
    let x = [];
    tempTerm.map((item, ind) => {
      x.push(item);
    });
    x.sort((a, b) => a.term.localeCompare(b.term));
    setSelectTerm(x);
    let term = x.filter(el => el.selected === true)[0].term;

    setQuestionInputField({ ...questionInputField, term: term });
    setSubmitQuestionInputField({ ...submitQuestionInputField, term: term });
  };

  const [submitAddInputField, setSubmitAddInputField] = useState({
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
    payment: 'Due',
    paid: '0',
    total_student: '0',
    total_rate: '0',
  });

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

  const [showEditView, setShowEditView] = useState(false);

  const [questionInputField, setQuestionInputField] = useState({
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
  const [submitQuestionInputField, setSubmitQuestionInputField] = useState({
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

  const [selectedGp, setSelectedGp] = useState('Select GP From Below');

  const [showData, setShowData] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [gpClicked, setGpClicked] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [selectShow, setSelectShow] = useState(true);
  const getData = async () => {
    setShowLoader(true);
    try {
      const data = await getCollection('questions');
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
      setQData(data);
      setFilteredData(data);
      setQuestionUpdateTime(Date.now());
      setDocId(`questions${data.length + 101}-${uuid.v4().split('-')[0]}`);
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
        payment: 'Due',
        paid: '0',
        total_student: '',
        total_rate: '',
      });
      setSubmitAddInputField({
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
        payment: 'Due',
        paid: '0',
        total_student: '0',
        total_rate: '0',
      });
      setShowLoader(false);
      setShowData(false);
      setSelectedSchool('Select School Name');
      setIsClicked(false);
    } catch (e) {
      setShowLoader(false);
      console.log(e);
    }
  };

  const getQuestionRate = async () => {
    setShowLoader(true);
    try {
      const data = await getCollection('question_rate');
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
    } catch (e) {
      setShowLoader(false);
      showToast('error', e);
      console.log(e);
    }
  };

  const updateQrateData = async () => {
    if (!compareObjects(originalQuestionInputField, submitQuestionInputField)) {
      setShowLoader(true);
      await updateDocument(
        'question_rate',
        submitQuestionInputField.id,
        submitQuestionInputField,
      )
        .then(() => {
          setQuestionRateState(submitQuestionInputField);
          setQRateData(submitQuestionInputField);
          setQuestionUpdateTime(Date.now());
          setShowLoader(false);
          showToast('success', 'Question Rate Updated Successfully!');

          setShowData(false);
          setSelectShow(true);
        })
        .catch(e => {
          setShowLoader(false);
          showToast('error', 'Question Rate Updation Failed!');
          console.log(e);
        });
    } else {
      showToast('error', 'Data is Same!');
    }
  };
  const addNewSchool = async () => {
    if (!findEmptyValues(submitAddInputField)) {
      setShowLoader(true);
      let total_rate = round2dec(
        submitAddInputField.cl_pp_student * submitQuestionInputField.pp_rate +
          submitAddInputField.cl_1_student * submitQuestionInputField.i_rate +
          submitAddInputField.cl_2_student * submitQuestionInputField.ii_rate +
          submitAddInputField.cl_3_student * submitQuestionInputField.iii_rate +
          submitAddInputField.cl_4_student * submitQuestionInputField.iv_rate +
          submitAddInputField.cl_5_student * submitQuestionInputField.v_rate,
      );
      let total_student =
        submitAddInputField.cl_pp_student +
        submitAddInputField.cl_1_student +
        submitAddInputField.cl_2_student +
        submitAddInputField.cl_3_student +
        submitAddInputField.cl_4_student +
        submitAddInputField.cl_5_student;
      await setDocument('questions', docId, {
        id: docId,
        school: submitAddInputField.school,
        gp: submitAddInputField.gp,
        udise: submitAddInputField.udise,
        cl_pp_student: submitAddInputField.cl_pp_student,
        cl_1_student: submitAddInputField.cl_1_student,
        cl_2_student: submitAddInputField.cl_2_student,
        cl_3_student: submitAddInputField.cl_3_student,
        cl_4_student: submitAddInputField.cl_4_student,
        cl_5_student: submitAddInputField.cl_5_student,
        payment: 'Due',
        paid: 0,
        total_student: total_student,
        total_rate: total_rate,
      })
        .then(() => {
          const qState = [
            ...questionState,
            {
              id: docId,
              school: submitAddInputField.school,
              gp: submitAddInputField.gp,
              udise: submitAddInputField.udise,
              cl_pp_student: submitAddInputField.cl_pp_student,
              cl_1_student: submitAddInputField.cl_1_student,
              cl_2_student: submitAddInputField.cl_2_student,
              cl_3_student: submitAddInputField.cl_3_student,
              cl_4_student: submitAddInputField.cl_4_student,
              cl_5_student: submitAddInputField.cl_5_student,
              payment: 'Due',
              paid: 0,
              total_student: total_student,
              total_rate: total_rate,
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
          setQData(qState);
          setShowLoader(false);
          showToast('success', 'New School Added Successfully!');
        })
        .catch(e => {
          setShowLoader(false);
          showToast('error', 'School Addition Failed!');
          console.log(e);
        });
    } else {
      showToast('error', 'Form Invalid!');
    }
  };

  const updateSchool = async () => {
    if (!compareObjects(editInputField, orgSchoolField)) {
      setShowLoader(true);
      await updateDocument('questions', editInputField.id, {
        school: editInputField.school,
        gp: editInputField.gp,
        udise: editInputField.udise,
        cl_pp_student: editInputField.cl_pp_student,
        cl_1_student: editInputField.cl_1_student,
        cl_2_student: editInputField.cl_2_student,
        cl_3_student: editInputField.cl_3_student,
        cl_4_student: editInputField.cl_4_student,
        cl_5_student: editInputField.cl_5_student,
        payment: 'Due',
        paid: '0',
        total_student:
          parseInt(editInputField.cl_pp_student) +
          parseInt(editInputField.cl_1_student) +
          parseInt(editInputField.cl_2_student) +
          parseInt(editInputField.cl_3_student) +
          parseInt(editInputField.cl_4_student) +
          parseInt(editInputField.cl_5_student),
        total_rate: Math.round(
          parseInt(editInputField.cl_pp_student) * qRateData.pp_rate +
            parseInt(editInputField.cl_1_student) * qRateData.i_rate +
            parseInt(editInputField.cl_2_student) * qRateData.ii_rate +
            parseInt(editInputField.cl_3_student) * qRateData.iii_rate +
            parseInt(editInputField.cl_4_student) * qRateData.iv_rate +
            parseInt(editInputField.cl_5_student) * qRateData.v_rate,
        ),
      })
        .then(() => {
          let x = questionState.filter(el => el.id === editInputField.id)[0];
          let y = questionState.filter(el => el.id !== editInputField.id);
          y = [
            ...y,
            {
              id: editInputField.id,
              school: editInputField.school,
              gp: editInputField.gp,
              udise: editInputField.udise,
              cl_pp_student: editInputField.cl_pp_student,
              cl_1_student: editInputField.cl_1_student,
              cl_2_student: editInputField.cl_2_student,
              cl_3_student: editInputField.cl_3_student,
              cl_4_student: editInputField.cl_4_student,
              cl_5_student: editInputField.cl_5_student,
              payment: 'Due',
              paid: '0',
              total_student:
                parseInt(editInputField.cl_pp_student) +
                parseInt(editInputField.cl_1_student) +
                parseInt(editInputField.cl_2_student) +
                parseInt(editInputField.cl_3_student) +
                parseInt(editInputField.cl_4_student) +
                parseInt(editInputField.cl_5_student),
              total_rate: Math.round(
                parseInt(editInputField.cl_pp_student) * qRateData.pp_rate +
                  parseInt(editInputField.cl_1_student) * qRateData.i_rate +
                  parseInt(editInputField.cl_2_student) * qRateData.ii_rate +
                  parseInt(editInputField.cl_3_student) * qRateData.iii_rate +
                  parseInt(editInputField.cl_4_student) * qRateData.iv_rate +
                  parseInt(editInputField.cl_5_student) * qRateData.v_rate,
              ),
              term: x.term,
              year: x.year,
            },
          ];

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
          setQData(newData);
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

  const deleteSchoolDialog = async () => {
    Alert.alert('Hold On', `Are You Sure to Delete ${filteredData[0].school}`, [
      // The "No" button
      // Does nothing but dismiss the dialog when tapped
      {
        text: 'No',
        onPress: () => showToast('success', 'School Not Deleted!'),
      },
      // The "Yes" button
      {
        text: 'Yes',
        onPress: () => {
          deleteSchool();
        },
      },
    ]);
  };

  const deleteSchool = async () => {
    setShowLoader(true);
    await deleteDocument('questions', filteredData[0].id)
      .then(() => {
        setQuestionState(
          questionState.filter(el => el.id !== filteredData[0].id),
        );
        setQData(questionState.filter(el => el.id !== filteredData[0].id));
        setQuestionUpdateTime(Date.now());
        setShowLoader(false);
        showToast('success', 'Question Rate Updated Successfully!');
        getData();
        setShowData(false);
        setSelectShow(true);
      })
      .catch(e => {
        setShowLoader(false);
        showToast('error', 'Question Rate Updation Failed!');
        console.log(e);
      });
  };

  const closeAccepting = async () => {
    setShowLoader(true);
    await updateDocument('question_rate', questionRateState.id, {
      isAccepting: false,
    })
      .then(() => {
        let data = questionRateState;
        data.isAccepting = false;
        setQuestionRateState(data);
        setQRateData(data);
        setQuestionRateUpdateTime(Date.now());
        setShowLoader(false);
        showToast(
          'success',
          'Question Accepting Status Set Closed Successfully!',
        );
      })
      .catch(e => {
        setShowLoader(false);
        showToast('error', 'Question Rate Updation Failed!');
        console.log(e);
      });
  };
  const openAccepting = async () => {
    setShowLoader(true);
    await updateDocument('question_rate', questionRateState.id, {
      isAccepting: true,
    })
      .then(async () => {
        let data = questionRateState;
        data.isAccepting = true;
        setQuestionRateState(data);
        setQRateData(data);
        setQuestionRateUpdateTime(Date.now());
        setShowLoader(false);
        showToast(
          'success',
          'Question Accepting Status Set Opened Successfully!',
        );
      })
      .catch(e => {
        setShowLoader(false);
        showToast('error', 'Question Rate Updation Failed!');
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
  const getQuestionData = () => {
    const difference = (Date.now() - questionUpdateTime) / 1000 / 60 / 15;
    if (questionState.length === 0 || difference >= 1) {
      getData();
    } else {
      setQData(questionState);
      setFilteredData(questionState);
      setDocId(
        `questions${questionState.length + 101}-${uuid.v4().split('-')[0]}`,
      );

      setSubmitAddInputField({
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
        payment: 'Due',
        paid: '0',
        total_student: '0',
        total_rate: '0',
      });
      setShowLoader(false);
      setShowData(false);
      setSelectedSchool('Select School Name');
      setIsClicked(false);
    }
    const questionRateDifference =
      (Date.now() - questionRateUpdateTime) / 1000 / 60 / 15;
    if (questionRateDifference >= 1 || questionRateState.length === 0) {
      setQuestionRateUpdateTime(Date.now());
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

      setQuestionInputField(questionRateState);
      setOriginalQuestionInputField(questionRateState);
      setSubmitQuestionInputField(questionRateState);
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
        payment: 'Due',
        paid: '0',
        total_student: '',
        total_rate: '',
      });
    }
  };
  useEffect(() => {
    getQuestionData();
  }, [isFocused]);
  useEffect(() => {}, [
    submitQuestionInputField,
    submitAddInputField,
    originalQuestionInputField,
    docId,
    selectTerm,
    editInputField,
    qData,
    qRateData,
  ]);
  return (
    <NavigationBarContainer>
      <ScrollView nestedScrollEnabled={true}>
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'center',
          }}
        >
          {!isClicked && !showData && selectShow && user.circle === 'admin' && (
            <View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  alignSelf: 'center',
                }}
              >
                <CustomButton
                  title={'Add School'}
                  size={'small'}
                  color={'darkgreen'}
                  fontSize={12}
                  onClick={() => {
                    setShowData(false);
                    setAddSchoolVisible(true);
                    setVisible(false);
                    setSelectShow(false);
                  }}
                />
                <CustomButton
                  title={'Update Rate'}
                  size={'small'}
                  fontSize={12}
                  onClick={() => {
                    setShowData(false);
                    setAddSchoolVisible(false);
                    setVisible(true);
                    setSelectShow(false);
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
                  Close Requisition
                </Text>
                <Switch
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={
                    questionRateState.isAccepting ? '#f5dd4b' : '#f4f3f4'
                  }
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={() => {
                    if (questionRateState.isAccepting) {
                      closeAccepting();
                    } else {
                      openAccepting();
                    }
                  }}
                  value={questionRateState.isAccepting}
                />

                <Text selectable style={[styles.label, { paddingLeft: 5 }]}>
                  Open Requisition
                </Text>
              </View>
            </View>
          )}
          {!isClicked && selectShow && !showData && (
            <CustomButton
              title={'Show All Data'}
              size={'small'}
              fontSize={responsiveFontSize(1.3)}
              color={'blueviolet'}
              onClick={() => {
                navigation.navigate('AllQuestionData');
              }}
            />
          )}
        </View>
        {!isClicked && !showData && (
          <Text selectable style={styles.desc}>
            Select School Name
          </Text>
        )}
        {!visible && !addSchoolVisible && (
          <TouchableOpacity
            style={[styles.dropDownnSelector, { marginTop: 5 }]}
            onPress={() => {
              setIsClicked(!isClicked);
              setFilteredData(qData);
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
        )}
        {selectShow ? (
          <ScrollView>
            {isClicked ? (
              <ScrollView style={styles.dropDowArea}>
                <CustomTextInput
                  value={search}
                  placeholder={'Enter School Name'}
                  onChangeText={text => {
                    setSearch(text);
                    setFilteredData(
                      qData.filter(el =>
                        el.school.toLowerCase().match(text.toLowerCase()),
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
                          qData.filter(el => el.udise.match(item.udise)),
                        );
                        setSelectedSchool(`${index + 1}. ${item.school}`);
                        // setAddInputField({
                        //   ...addInputField,
                        //   school: item.school,
                        //   udise: item.udise,
                        //   gp: item.gp,
                        //   id: docId,
                        //   sl: serial,
                        // });
                        setSearch('');
                        setIndexNumber(index + 1);
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

            {showData && selectShow && (
              <ScrollView style={{ marginTop: responsiveHeight(0.5) }}>
                <View
                  style={{
                    backgroundColor: 'white',
                    borderRadius: responsiveWidth(3),
                    padding: responsiveWidth(3),
                    width: responsiveWidth(95),
                    alignSelf: 'center',
                  }}
                >
                  <View style={styles.itemView}>
                    <Text selectable style={styles.text}>
                      Scan Here
                    </Text>
                    <Image
                      source={{
                        uri: `https://api.qrserver.com/v1/create-qr-code/?data=Amta West Circle, ${
                          qRateData.term
                        } Summative Exam, ${qRateData.year},\n${
                          filteredData[0].school
                        },  GP: ${filteredData[0].gp}, PP Students ${
                          filteredData[0].cl_pp_student
                        }, Amount Rs. ₹ ${round2dec(
                          filteredData[0].cl_pp_student * qRateData.pp_rate,
                        )}, Class I Students ${
                          filteredData[0].cl_1_student
                        }, Amount Rs. ₹ ${round2dec(
                          filteredData[0].cl_1_student * qRateData.i_rate,
                        )}, Class II Students ${
                          filteredData[0].cl_2_student
                        }, Amount Rs. ₹ ${round2dec(
                          filteredData[0].cl_2_student * qRateData.ii_rate,
                        )}, Class III Students ${
                          filteredData[0].cl_3_student
                        }, Amount Rs. ₹ ${round2dec(
                          filteredData[0].cl_3_student * qRateData.iii_rate,
                        )}, Class IV Students ${
                          filteredData[0].cl_4_student
                        }, Amount Rs. ₹ ${round2dec(
                          filteredData[0].cl_4_student * qRateData.iv_rate,
                        )}, Class V Students ${
                          filteredData[0].cl_5_student
                        }, Amount Rs. ₹ ${round2dec(
                          filteredData[0].cl_5_student * qRateData.v_rate,
                        )}, Total Student. ${
                          filteredData[0].total_student
                        }, Total Amount ₹ ${round5(
                          filteredData[0].cl_pp_student * qRateData.pp_rate +
                            filteredData[0].cl_1_student * qRateData.i_rate +
                            filteredData[0].cl_2_student * qRateData.ii_rate +
                            filteredData[0].cl_3_student * qRateData.iii_rate +
                            filteredData[0].cl_4_student * qRateData.iv_rate +
                            filteredData[0].cl_5_student * qRateData.v_rate,
                        )}.&amp;size=400x400`,
                      }}
                      style={{
                        width: responsiveHeight(15),
                        height: responsiveHeight(15),
                      }}
                      alt="QRCode"
                    />
                  </View>
                  <View style={styles.itemView}>
                    <Text selectable style={styles.text}>
                      Sl No.: {indexNumber}
                    </Text>
                    <Text selectable style={styles.text}>
                      ID.: {filteredData[0].id}
                    </Text>
                    <Text selectable style={styles.text}>
                      School Name:
                    </Text>
                    <Text selectable style={styles.text}>
                      {filteredData[0].school}
                    </Text>
                    <Text selectable style={styles.text}>
                      GP: {filteredData[0].gp}
                    </Text>
                    <Text selectable style={styles.text}>
                      UDISE: {filteredData[0].udise}
                    </Text>
                  </View>
                  <View style={styles.itemView}>
                    <Text selectable style={styles.text}>
                      Class PP Students: {filteredData[0].cl_pp_student}
                    </Text>
                    <Text selectable style={styles.text}>
                      Class I Students: {filteredData[0].cl_1_student}
                    </Text>
                    <Text selectable style={styles.text}>
                      Class II Students: {filteredData[0].cl_2_student}
                    </Text>
                    <Text selectable style={styles.text}>
                      Class III Students: {filteredData[0].cl_3_student}
                    </Text>
                    <Text selectable style={styles.text}>
                      Class IV Students: {filteredData[0].cl_4_student}
                    </Text>
                    {filteredData[0].cl_5_student > 0 && (
                      <Text selectable style={styles.text}>
                        Class V Students: {filteredData[0].cl_5_student}
                      </Text>
                    )}
                    <Text selectable style={styles.text}>
                      Total Students: {filteredData[0].total_student}
                    </Text>
                  </View>
                  <View style={styles.itemView}>
                    <Text selectable style={styles.text}>
                      Class PP Cost:{' ₹ '}
                      {round2dec(
                        filteredData[0].cl_pp_student * qRateData.pp_rate,
                      )}
                    </Text>
                    <Text selectable style={styles.text}>
                      Class I Cost:{' ₹ '}
                      {round2dec(
                        filteredData[0].cl_1_student * qRateData.i_rate,
                      )}
                    </Text>
                    <Text selectable style={styles.text}>
                      Class II Cost:{' ₹ '}
                      {round2dec(
                        filteredData[0].cl_2_student * qRateData.ii_rate,
                      )}
                    </Text>
                    <Text selectable style={styles.text}>
                      Class III Cost:{' ₹ '}
                      {round2dec(
                        filteredData[0].cl_3_student * qRateData.iii_rate,
                      )}
                    </Text>
                    <Text selectable style={styles.text}>
                      Class IV Cost:{' ₹ '}
                      {round2dec(
                        filteredData[0].cl_4_student * qRateData.iv_rate,
                      )}
                    </Text>
                    {filteredData[0].cl_5_student > 0 && (
                      <Text selectable style={styles.text}>
                        Class V Cost:{' ₹ '}
                        {round2dec(
                          filteredData[0].cl_5_student * qRateData.v_rate,
                        )}
                      </Text>
                    )}
                    <Text selectable style={styles.text}>
                      Total Cost:{' ₹ '}
                      {round5(
                        filteredData[0].cl_pp_student * qRateData.pp_rate +
                          filteredData[0].cl_1_student * qRateData.i_rate +
                          filteredData[0].cl_2_student * qRateData.ii_rate +
                          filteredData[0].cl_3_student * qRateData.iii_rate +
                          filteredData[0].cl_4_student * qRateData.iv_rate +
                          filteredData[0].cl_5_student * qRateData.v_rate,
                      )}
                    </Text>
                  </View>
                </View>
                <View style={styles.itemView}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                      alignSelf: 'center',
                    }}
                  >
                    <CustomButton
                      title={'Edit'}
                      color={'blueviolet'}
                      size={'small'}
                      onClick={() => {
                        setEditInputField(filteredData[0]);
                        setOrgSchoolField(filteredData[0]);
                        setShowEditView(true);
                      }}
                    />
                    <CustomButton
                      title={'Delete'}
                      color={'red'}
                      size={'small'}
                      onClick={() => {
                        deleteSchoolDialog();
                      }}
                    />
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {/* <TouchableOpacity
                    style={{
                      alignSelf: 'center',
                      backgroundColor: THEME_COLOR,
                      borderRadius: 5,
                      padding: 10,
                      marginTop: responsiveHeight(1),
                      marginBottom: responsiveHeight(1),
                    }}
                    onPress={() => {
                      ref.current.capture().then(uri => {
                        const options = {
                          url: uri,
                          message: '',
                        };
                        Share.open(options)
                          .then(() => console.log('Shared'))
                          .catch(e => console.log(e));
                      });
                    }}>
                    <Text selectable style={{color: 'white', fontSize: 18}}>
                      Share As Image
                    </Text>
                  </TouchableOpacity> */}
                  <TouchableOpacity
                    style={{
                      alignSelf: 'center',
                      backgroundColor: 'chocolate',
                      borderRadius: 5,
                      padding: 10,
                      marginTop: responsiveHeight(1),
                      marginBottom: responsiveHeight(1),
                      marginLeft: responsiveWidth(5),
                    }}
                    onPress={() => {
                      setIsClicked(false);
                      setFilteredData(qData);
                      setSelectedSchool('Select School Name');
                      setShowData(false);
                    }}
                  >
                    <Text
                      selectable
                      style={{
                        color: 'white',
                        fontSize: responsiveFontSize(2),
                      }}
                    >
                      Close
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </ScrollView>
        ) : null}

        <ReactNativeModal
          isVisible={showEditView}
          onBackdropPress={() => setShowEditView(false)}
        >
          <ScrollView
            style={{ marginTop: responsiveHeight(1) }}
            contentContainerStyle={{
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'center',
            }}
          >
            <View style={[styles.mainView, { padding: 10 }]}>
              <Text
                selectable
                style={{
                  fontSize: responsiveFontSize(3),
                  fontWeight: '500',
                  textAlign: 'center',
                  color: THEME_COLOR,
                }}
              >
                Edit School
              </Text>
              <CustomTextInput
                placeholder={'School Name'}
                value={editInputField.school.toString()}
                onChangeText={text => {
                  setEditInputField({
                    ...editInputField,
                    school: text,
                  });
                }}
              />
              <CustomTextInput
                placeholder={'UDISE'}
                type={'number-pad'}
                value={editInputField.udise.toString()}
                onChangeText={text => {
                  setEditInputField({
                    ...editInputField,
                    udise: text,
                  });
                }}
              />

              <CustomTextInput
                placeholder={'PP Student'}
                type={'number-pad'}
                value={editInputField.cl_pp_student.toString()}
                onChangeText={text => {
                  setEditInputField({
                    ...editInputField,
                    cl_pp_student: text,
                  });
                }}
              />
              <CustomTextInput
                placeholder={'Class I Student'}
                type={'number-pad'}
                value={editInputField.cl_1_student.toString()}
                onChangeText={text => {
                  setEditInputField({
                    ...editInputField,
                    cl_1_student: text,
                  });
                }}
              />
              <CustomTextInput
                placeholder={'Class II Student'}
                type={'number-pad'}
                value={editInputField.cl_2_student.toString()}
                onChangeText={text => {
                  setEditInputField({
                    ...editInputField,
                    cl_2_student: text,
                  });
                }}
              />
              <CustomTextInput
                placeholder={'Class III Student'}
                type={'number-pad'}
                value={editInputField.cl_3_student.toString()}
                onChangeText={text => {
                  setEditInputField({
                    ...editInputField,
                    cl_3_student: text,
                  });
                }}
              />
              <CustomTextInput
                placeholder={'Class IV Student'}
                type={'number-pad'}
                value={editInputField.cl_4_student.toString()}
                onChangeText={text => {
                  setEditInputField({
                    ...editInputField,
                    cl_4_student: text,
                  });
                }}
              />
              <CustomTextInput
                placeholder={'Class V Student'}
                type={'number-pad'}
                value={editInputField.cl_5_student.toString()}
                onChangeText={text => {
                  setEditInputField({
                    ...editInputField,
                    cl_5_student: text,
                  });
                }}
              />

              <CustomButton
                title={'Submit'}
                onClick={() => {
                  setShowEditView(false);
                  updateSchool();
                }}
              />
              <CustomButton
                title={'Close'}
                color={'purple'}
                onClick={() => {
                  setShowEditView(false);
                  setGpClicked(false);
                  setSelectShow(true);
                }}
              />
            </View>
          </ScrollView>
        </ReactNativeModal>
      </ScrollView>
      {visible && (
        <ScrollView style={{ marginTop: responsiveHeight(1) }}>
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
                Update Question Rate
              </Text>
              <CustomTextInput
                placeholder={'PP Rate'}
                type={'number-pad'}
                value={questionInputField.pp_rate.toString()}
                onChangeText={text => {
                  setQuestionInputField({
                    ...questionInputField,
                    pp_rate: text,
                  });
                  setSubmitQuestionInputField({
                    ...submitQuestionInputField,

                    pp_rate: parseFloat(text),
                  });
                }}
              />
              <CustomTextInput
                placeholder={'Class I Rate'}
                type={'number-pad'}
                value={questionInputField.i_rate.toString()}
                onChangeText={text => {
                  setQuestionInputField({
                    ...questionInputField,
                    i_rate: text,
                  });
                  setSubmitQuestionInputField({
                    ...submitQuestionInputField,
                    i_rate: parseFloat(text),
                  });
                }}
              />
              <CustomTextInput
                placeholder={'Class II Rate'}
                type={'number-pad'}
                value={questionInputField.ii_rate.toString()}
                onChangeText={text => {
                  setQuestionInputField({
                    ...questionInputField,
                    ii_rate: text,
                  });
                  setSubmitQuestionInputField({
                    ...submitQuestionInputField,
                    ii_rate: parseFloat(text),
                  });
                }}
              />
              <CustomTextInput
                placeholder={'Class III Rate'}
                type={'number-pad'}
                value={questionInputField.iii_rate.toString()}
                onChangeText={text => {
                  setQuestionInputField({
                    ...questionInputField,
                    iii_rate: text,
                  });
                  setSubmitQuestionInputField({
                    ...submitQuestionInputField,
                    iii_rate: parseFloat(text),
                  });
                }}
              />
              <CustomTextInput
                placeholder={'Class IV Rate'}
                type={'number-pad'}
                value={questionInputField.iv_rate.toString()}
                onChangeText={text => {
                  setQuestionInputField({
                    ...questionInputField,
                    iv_rate: text,
                  });
                  setSubmitQuestionInputField({
                    ...submitQuestionInputField,
                    iv_rate: parseFloat(text),
                  });
                }}
              />
              <CustomTextInput
                placeholder={'Class V Rate'}
                type={'number-pad'}
                value={questionInputField.v_rate.toString()}
                onChangeText={text => {
                  setQuestionInputField({
                    ...questionInputField,
                    v_rate: text,
                  });
                  setSubmitQuestionInputField({
                    ...submitQuestionInputField,
                    v_rate: parseFloat(text),
                  });
                }}
              />
              <CustomTextInput
                placeholder={'Year'}
                type={'number-pad'}
                value={questionInputField.year.toString()}
                onChangeText={text => {
                  setQuestionInputField({
                    ...questionInputField,
                    year: text,
                  });
                  setSubmitQuestionInputField({
                    ...submitQuestionInputField,
                    year: parseInt(text),
                  });
                }}
              />

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  alignSelf: 'center',
                  margin: responsiveWidth(2),
                }}
              >
                <Text
                  selectable
                  style={[
                    styles.label,
                    {
                      marginBottom: responsiveHeight(1),
                      paddingRight: responsiveWidth(2),
                      fontSize: responsiveFontSize(1.8),
                    },
                  ]}
                >
                  Select Term:{' '}
                </Text>

                <ScrollView horizontal>
                  {selectTerm.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-evenly',
                        alignItems: 'center',
                        alignSelf: 'center',
                        height: responsiveHeight(4),
                        borderColor: THEME_COLOR,
                        borderWidth: 1,
                        borderRadius: responsiveWidth(2),
                        width: responsiveWidth(15),
                        marginBottom: responsiveHeight(1),
                        marginRight: responsiveWidth(2),
                        padding: responsiveWidth(1),
                        backgroundColor: item.selected
                          ? 'rgba(0,255,0,.1)'
                          : 'white',
                      }}
                      onPress={() => {
                        onSelect(index);
                      }}
                    >
                      <MaterialIcons
                        name={
                          item.selected
                            ? 'radio-button-checked'
                            : 'radio-button-unchecked'
                        }
                        size={20}
                        color={THEME_COLOR}
                      />
                      <Text
                        selectable
                        style={[
                          styles.label,
                          { paddingLeft: responsiveWidth(2) },
                        ]}
                      >
                        {item.term}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <CustomButton
                title={'Submit'}
                onClick={() => {
                  setVisible(false);

                  updateQrateData();
                }}
              />
              <CustomButton
                title={'Close'}
                color={'purple'}
                onClick={() => {
                  setVisible(false);
                  setSelectShow(true);
                }}
              />
            </View>
          </View>
        </ScrollView>
      )}
      {addSchoolVisible && (
        <ScrollView style={{ marginTop: responsiveHeight(1) }}>
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
                Add New School
              </Text>
              <CustomTextInput
                placeholder={'School Name'}
                value={addInputField.school}
                onChangeText={text => {
                  setAddInputField({
                    ...addInputField,
                    school: text,
                  });
                  setSubmitAddInputField({
                    ...submitAddInputField,
                    school: text,
                  });
                }}
              />
              <CustomTextInput
                placeholder={'UDISE'}
                type={'number-pad'}
                value={addInputField.udise}
                onChangeText={text => {
                  setAddInputField({
                    ...addInputField,
                    udise: text,
                  });
                  setSubmitAddInputField({
                    ...submitAddInputField,
                    udise: text,
                  });
                }}
              />

              <TouchableOpacity
                style={[styles.gpDropDownnSelector, { marginTop: 5 }]}
                onPress={() => {
                  setGpClicked(!gpClicked);
                  setGp(unfgp);
                }}
              >
                {gpClicked ? (
                  <AntDesign name="up" size={30} color={THEME_COLOR} />
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
                      {selectedGp}
                    </Text>

                    <AntDesign name="down" size={30} color={THEME_COLOR} />
                  </View>
                )}
              </TouchableOpacity>
              {gpClicked ? (
                <View style={styles.gpDropDowArea}>
                  {gp.map((item, index) => {
                    return (
                      <TouchableOpacity
                        key={index}
                        style={styles.gpAdminName}
                        onPress={() => {
                          setGpClicked(false);
                          setSelectedGp(
                            gp.filter(el => el.gp.match(item.gp))[0].gp,
                          );
                          setAddInputField({
                            ...addInputField,
                            gp: gp.filter(el => el.gp.match(item.gp))[0].gp,
                          });
                          setSubmitAddInputField({
                            ...submitAddInputField,
                            gp: gp.filter(el => el.gp.match(item.gp))[0].gp,
                          });
                          setGp(gp.filter(el => el.gp.match(item.gp)));
                        }}
                      >
                        <Text selectable style={styles.dropDownText}>
                          {item.gp}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : null}

              <CustomTextInput
                placeholder={'PP Student'}
                type={'number-pad'}
                value={addInputField.cl_pp_student}
                onChangeText={text => {
                  setAddInputField({
                    ...addInputField,
                    cl_pp_student: text,
                  });
                  setSubmitAddInputField({
                    ...submitAddInputField,
                    cl_pp_student: parseInt(text),
                  });
                }}
              />
              <CustomTextInput
                placeholder={'Class I Student'}
                type={'number-pad'}
                value={addInputField.cl_1_student}
                onChangeText={text => {
                  setAddInputField({
                    ...addInputField,
                    cl_1_student: text,
                  });
                  setSubmitAddInputField({
                    ...submitAddInputField,
                    cl_1_student: parseInt(text),
                  });
                }}
              />
              <CustomTextInput
                placeholder={'Class II Student'}
                type={'number-pad'}
                value={addInputField.cl_2_student}
                onChangeText={text => {
                  setAddInputField({
                    ...addInputField,
                    cl_2_student: text,
                  });
                  setSubmitAddInputField({
                    ...submitAddInputField,
                    cl_2_student: parseInt(text),
                  });
                }}
              />
              <CustomTextInput
                placeholder={'Class III Student'}
                type={'number-pad'}
                value={addInputField.cl_3_student}
                onChangeText={text => {
                  setAddInputField({
                    ...addInputField,
                    cl_3_student: text,
                  });
                  setSubmitAddInputField({
                    ...submitAddInputField,
                    cl_3_student: parseInt(text),
                  });
                }}
              />
              <CustomTextInput
                placeholder={'Class IV Student'}
                type={'number-pad'}
                value={addInputField.cl_4_student}
                onChangeText={text => {
                  setAddInputField({
                    ...addInputField,
                    cl_4_student: text,
                  });
                  setSubmitAddInputField({
                    ...submitAddInputField,
                    cl_4_student: parseInt(text),
                  });
                }}
              />
              <CustomTextInput
                placeholder={'Class V Student'}
                type={'number-pad'}
                value={addInputField.cl_5_student}
                onChangeText={text => {
                  setAddInputField({
                    ...addInputField,
                    cl_5_student: text,
                  });
                  setSubmitAddInputField({
                    ...submitAddInputField,
                    cl_5_student: parseInt(text),
                  });
                }}
              />

              <CustomButton
                title={'Submit'}
                onClick={() => {
                  setAddSchoolVisible(false);

                  addNewSchool();
                }}
              />
              <CustomButton
                title={'Close'}
                color={'purple'}
                onClick={() => {
                  setAddSchoolVisible(false);
                  setGpClicked(false);
                  setSelectShow(true);
                }}
              />
            </View>
          </View>
        </ScrollView>
      )}

      <Loader visible={showLoader} />
    </NavigationBarContainer>
  );
};

export default QuestionSection;

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
    alignItems: 'center',
    backgroundColor: 'white',
  },
});
