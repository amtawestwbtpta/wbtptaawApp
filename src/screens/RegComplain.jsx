import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ScrollView,
  BackHandler,
  TouchableOpacity,
  Alert,
} from 'react-native';
import React, { useEffect, useState } from 'react';

import { THEME_COLOR } from '../utils/Colors';
import CustomTextInput from '../components/CustomTextInput';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import Loader from '../components/Loader';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AnimatedSeacrch from '../components/AnimatedSeacrch';
import CustomButton from '../components/CustomButton';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import uuid from 'react-native-uuid';
import { isEmpty } from '../modules/calculatefunctions';
import {
  getDay,
  getFullYear,
  getMonthName,
} from '../modules/calculatefunctions';
import { useGlobalContext } from '../context/Store';
import {
  deleteDocument,
  getCollection,
  getDocumentByField,
  setDocument,
} from '../firebase/firestoreHelper';
import { showToast } from '../modules/Toaster';
const RegComplain = () => {
  const navigation = useNavigation();
  const { state, setActiveTab, setStateObject } = useGlobalContext();
  const user = state.USER;
  const teacher = state.TEACHER;
  const complainId = user.id + '-' + uuid.v4().split('-')[0];

  const isFocused = useIsFocused();
  const [search, setSearch] = useState('');
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [showLoader, setShowLoader] = useState(false);
  const [inputField, setInputField] = useState({
    title: '',
    complain: '',
  });
  const [showAddComplain, setShowAddComplain] = useState(false);

  const [firstData, setFirstData] = useState(0);
  const [visibleItems, setVisibleItems] = useState(10);
  const loadPrev = () => {
    setVisibleItems(prevVisibleItems => prevVisibleItems - 10);
    setFirstData(firstData - 10);
  };
  const loadMore = () => {
    setVisibleItems(prevVisibleItems => prevVisibleItems + 10);
    setFirstData(firstData + 10);
  };

  const getComplains = async () => {
    setShowLoader(true);
    await getCollection('complains')
      .then(data => {
        let newData = data.sort((a, b) => b.date - a.date);
        setData(newData);
        setFilteredData(newData);
        setShowLoader(false);
      })
      .catch(e => {
        setShowLoader(false);
        showToast('error', e);
      });
  };

  const addComplain = async () => {
    setShowLoader(true);

    if (
      !isEmpty({
        id: complainId,
        token: state.TOKEN,
        username: user.username,
        tname: user.tname,
        school: user.school,
        gp: teacher.gp,
        association: teacher.association,
        email: user.email,
        phone: user.phone,
        title: inputField.title,
        complain: inputField.complain,
        date: Date.now(),
      })
    ) {
      await setDocument('complains', complainId, {
        id: complainId,
        token: state.TOKEN,
        username: user.username,
        tname: user.tname,
        school: user.school,
        gp: teacher.gp,
        association: teacher.association,
        email: user.email,
        phone: user.phone,
        title: inputField.title,
        complain: inputField.complain,
        date: Date.now(),
      })
        .then(async () => {
          setShowLoader(false);
          showToast('success', 'Complain Added Successfully');
          getComplains();
          setInputField({
            title: '',
            complain: '',
          });
          setShowAddComplain(false);
        })
        .catch(e => {
          setShowLoader(false);
          showToast('error', 'Complain Addition Failed');
          console.log(e);
        });
    } else {
      setShowLoader(false);
      showToast('error', 'Form Is Invalid');
    }
  };

  const showConfirmDialog = id => {
    return Alert.alert('Hold On!', `Are You Sure To Delete This Complain?`, [
      // The "No" button
      // Does nothing but dismiss the dialog when tapped
      {
        text: 'No',
        onPress: () => showToast('success', 'Complain Not Deleted!'),
      },
      // The "Yes" button
      {
        text: 'Yes',
        onPress: () => {
          delComplain(id);
        },
      },
    ]);
  };

  const delComplain = async id => {
    setShowLoader(true);
    await deleteDocument('complains', id)
      .then(async () => {
        try {
          await getDocumentByField('complainsReply', 'complainId', id)
            .then(data => {
              data.map(
                async el => await deleteDocument('complainsReply', el.id),
              );
              setShowLoader(false);
              showToast('success', 'Complain Deleted Successfully');
              getComplains();
            })
            .catch(e => {
              setShowLoader(false);
              showToast('error', e);
            });
        } catch (e) {
          setShowLoader(false);
          showToast('success', 'Complain Deleted Successfully');
          getComplains();
        }
      })
      .catch(e => {
        setShowLoader(false);
        showToast('error', 'Complain Deltation Failed');
      });
  };

  useEffect(() => {
    getComplains();
  }, [isFocused]);
  useEffect(() => {
    const result = data.filter(el => {
      return el.complain.toLowerCase().match(search.toLowerCase());
    });
    setFilteredData(result);
  }, [search]);
  useEffect(() => {}, [complainId, data, inputField]);
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
        style={{ marginBottom: responsiveHeight(1) }}
        nestedScrollEnabled={true}
      >
        <TouchableOpacity
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            alignSelf: 'center',
            justifyContent: 'center',
            marginBottom: responsiveHeight(1),
            marginTop: responsiveHeight(1),
          }}
          onPress={() => {
            setShowAddComplain(!showAddComplain);
          }}
        >
          <Feather
            name={showAddComplain ? 'minus-circle' : 'plus-circle'}
            size={20}
            color={THEME_COLOR}
          />
          <Text selectable style={styles.text}>
            {showAddComplain ? 'Hide Add Complain' : 'Add New Complain'}
          </Text>
        </TouchableOpacity>
        <View>
          {showAddComplain ? (
            <View>
              <CustomTextInput
                placeholder={'Enter Title'}
                value={inputField.title}
                onChangeText={text =>
                  setInputField({ ...inputField, title: text })
                }
              />
              <CustomTextInput
                placeholder={'Enter Complain'}
                size={'large'}
                value={inputField.complain}
                onChangeText={text =>
                  setInputField({ ...inputField, complain: text })
                }
              />

              <CustomButton title={'Add Complain'} onClick={addComplain} />

              <CustomButton
                title={'Cancel'}
                color={'darkred'}
                onClick={() => {
                  setShowAddComplain(false);
                  setInputField({
                    title: '',
                    complain: '',
                  });
                }}
              />
            </View>
          ) : null}
        </View>
        {!showAddComplain && (
          <View>
            <Text selectable style={styles.title}>
              Teachers Complains
            </Text>
            <AnimatedSeacrch
              value={search}
              onChangeText={text => setSearch(text)}
              func={() => {
                setSearch('');
                setFirstData(0);
                setVisibleItems(10);
              }}
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
            </View>
            <ScrollView
              style={{ alignSelf: 'center' }}
              horizontal={true}
              contentContainerStyle={{
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {filteredData.length ? (
                <FlatList
                  data={filteredData.slice(firstData, visibleItems)}
                  renderItem={({ item }) => (
                    <ScrollView
                      style={{
                        marginBottom: responsiveHeight(1),

                        padding: responsiveWidth(5),
                        width: responsiveWidth(95),
                        elevation: 5,
                        backgroundColor: 'white',
                        borderRadius: responsiveWidth(3),
                      }}
                    >
                      <Text selectable style={styles.text}>
                        Name: {item.tname}
                      </Text>
                      <Text selectable style={styles.text}>
                        Complain: {item.title}
                      </Text>
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
                          Posted On: {getDay(item.date)}
                        </Text>
                        <Text selectable style={styles.dropDownText}>
                          {' '}
                          {getMonthName(item.date)}
                        </Text>
                        <Text selectable style={styles.dropDownText}>
                          {' '}
                          {getFullYear(item.date)}
                        </Text>
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
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            alignSelf: 'center',
                          }}
                          onPress={() => {
                            navigation.navigate('ComplainDetails');
                            setStateObject(item);
                          }}
                        >
                          <Text
                            selectable
                            style={[styles.text, { color: 'darkred' }]}
                          >
                            Reply to This Problem
                          </Text>
                          <FontAwesome
                            name={'mail-reply'}
                            size={20}
                            color={'darkred'}
                          />
                        </TouchableOpacity>
                        {item.username === user.username ||
                        user.circle === 'admin' ? (
                          <TouchableOpacity
                            onPress={() => {
                              showConfirmDialog(item.id);
                            }}
                            style={{
                              paddingLeft: responsiveWidth(8),
                              justifyContent: 'center',
                              alignItems: 'center',
                              alignSelf: 'center',
                            }}
                          >
                            <Ionicons name="trash-bin" size={25} color="red" />
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    </ScrollView>
                  )}
                />
              ) : (
                <Text selectable style={styles.text}>
                  No Complain
                </Text>
              )}
            </ScrollView>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: responsiveHeight(0.5),
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
            </View>
          </View>
        )}
      </ScrollView>
      <Loader visible={showLoader} />
    </View>
  );
};

export default RegComplain;

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
  },
  label: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(1.5),
    fontWeight: '500',
    marginTop: responsiveHeight(0.2),
    color: THEME_COLOR,
    textAlign: 'center',
  },
  dateView: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
});
