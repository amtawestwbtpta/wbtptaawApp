import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  BackHandler,
  FlatList,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import uuid from 'react-native-uuid';
import { THEME_COLOR } from '../utils/Colors';
import CustomTextInput from '../components/CustomTextInput';
import CustomButton from '../components/CustomButton';
import Loader from '../components/Loader';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import {
  getDay,
  getFullYear,
  getMonthName,
  titleCase,
} from '../modules/calculatefunctions';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import AnimatedSeacrch from '../components/AnimatedSeacrch';
import { useGlobalContext } from '../context/Store';
import {
  deleteDocument,
  getDocumentByField,
  setDocument,
  updateDocument,
} from '../firebase/firestoreHelper';
import { showToast } from '../modules/Toaster';
import NavigationBarContainer from '../navigation/NavigationBarContainer';

const ComplainDetails = () => {
  const isFocused = useIsFocused();

  const { state, stateObject } = useGlobalContext();
  const user = state.USER;
  const teacher = state.TEACHER;
  let data = stateObject;
  const navigation = useNavigation();
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [editReply, setEditReply] = useState('');
  const [reply, setReply] = useState('');
  const [showEditReply, setShowEditReply] = useState(false);
  const [editReplyObj, setEditReplyObj] = useState({});
  const [complainReplies, setComplainReplies] = useState([]);
  const [showLoader, setShowLoader] = useState(false);
  const [search, setSearch] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const complainId = user.id + '-' + uuid.v4().split('-')[0];
  const [showReplies, setShowReplies] = useState(false);
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

  const submitReply = async () => {
    setShowReplyBox(false);
    if (reply !== '') {
      await setDocument('complainsReply', complainId, {
        id: complainId,
        token: state.TOKEN,
        username: user.username,
        tname: user.tname,
        school: user.school,
        gp: teacher.gp,
        association: teacher.association,
        email: user.email,
        phone: user.phone,
        reply: reply,
        date: Date.now(),
        complainId: data.id,
      })
        .then(async () => {
          setShowLoader(false);
          showToast('success', 'Reply Added Successfully');
          getComplainReplies();
          setReply('');
          setShowReplies(true);
        })
        .catch(e => {
          setShowLoader(false);
          showToast('error', 'Reply Addition Failed');
          console.log(e);
        });
    } else {
      setShowLoader(false);
      showToast('error', 'Form Is Invalid');
    }
  };

  const getComplainReplies = async () => {
    setShowLoader(true);
    await getDocumentByField('complainsReply', 'complainId', data.id)
      .then(data => {
        let newData = data.sort((a, b) => b.date - a.date);
        setComplainReplies(newData);
        setFilteredData(newData);
        setShowLoader(false);
        setShowReplies(true);
      })
      .catch(e => {
        setShowLoader(false);
        showToast('error', e);
      });
  };
  const showConfirmDialog = id => {
    return Alert.alert('Hold On!', `Are You Sure To Delete This Reply?`, [
      // The "No" button
      // Does nothing but dismiss the dialog when tapped
      {
        text: 'No',
        onPress: () => showToast('success', 'Reply Not Deleted!'),
      },
      // The "Yes" button
      {
        text: 'Yes',
        onPress: () => {
          delReply(id);
        },
      },
    ]);
  };
  const submitEditReply = async () => {
    setShowLoader(true);
    setShowEditReply(false);
    if (editReply !== '') {
      await updateDocument('complainsReply', editReplyObj.id, {
        reply: editReply,
        updatedAt: Date.now(),
      })
        .then(async () => {
          setShowLoader(false);
          showToast('success', 'Reply Added Successfully');
          getComplainReplies();
          setEditReply('');
          setShowReplies(true);
        })
        .catch(e => {
          setShowLoader(false);
          showToast('error', 'Reply Addition Failed');
          console.log(e);
        });
    } else {
      setShowLoader(false);
      showToast('error', 'Form Is Invalid');
    }
  };
  const delReply = async id => {
    setShowLoader(true);
    await deleteDocument('complainsReply', id)
      .then(() => {
        setShowLoader(false);
        showToast('success', 'Reply Deleted Successfully');
        getComplainReplies();
        setReply('');
        setShowReplies(true);
      })
      .catch(e => {
        setShowLoader(false);
        showToast('error', 'Reply Deltation Failed');
        console.log(e);
      });
  };
  useEffect(() => {
    getComplainReplies();
  }, [isFocused]);
  useEffect(() => {}, [editReplyObj, editReply]);
  useEffect(() => {
    const result = complainReplies.filter(el => {
      return el.reply.toLowerCase().match(search.toLowerCase());
    });
    setFilteredData(result);
  }, [search]);
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        navigation.goBack();
        return true;
      },
    );
    return () => backHandler.remove();
  }, []);
  return (
    <NavigationBarContainer>
      {' '}
      <ScrollView nestedScrollEnabled={true}>
        <Image
          source={require('../assets/images/complain.jpg')}
          style={{ width: responsiveWidth(100), height: responsiveHeight(20) }}
        />

        <ScrollView>
          <View style={styles.itemView}>
            <Text
              selectable
              style={styles.dropDownText}
            >{`Name: ${data.tname},`}</Text>
            <Text
              selectable
              style={styles.dropDownText}
            >{`School: ${data.school},`}</Text>
            <Text
              selectable
              style={styles.dropDownText}
            >{`GP: ${data.gp},`}</Text>
            <Text
              selectable
              style={styles.dropDownText}
            >{`Mobile: ${data.phone},`}</Text>
            <Text
              selectable
              style={styles.dropDownText}
            >{`Email: ${data.email},`}</Text>
          </View>
          <View
            style={[
              styles.dateView,
              {
                flexDirection: 'row',
              },
            ]}
          >
            <Text selectable style={styles.dropDownText}>
              Complain Date: {getDay(data.date)}
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
          <View style={styles.itemView}>
            <Text selectable style={styles.label}>
              Complain Title: {titleCase(data.title)}
            </Text>
            <Text selectable style={styles.label}>
              Complain Details:
            </Text>
            <Text selectable style={styles.label}>
              {titleCase(data.complain)}
            </Text>
          </View>

          {showReplyBox ? (
            <View>
              <CustomTextInput
                placeholder={'Write a Reply'}
                value={reply}
                size={'large'}
                onChangeText={text => setReply(text)}
              />
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-evenly',
                  alignItems: 'center',
                  alignSelf: 'center',
                }}
              >
                <CustomButton
                  title={'Submit Reply'}
                  fontSize={13}
                  size={'small'}
                  onClick={submitReply}
                />
                <CustomButton
                  title={'Cancel'}
                  size={'small'}
                  color={'darkred'}
                  onClick={() => {
                    setShowReplyBox(false);
                    setReply('');
                    setShowReplies(true);
                  }}
                />
              </View>
            </View>
          ) : (
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
                setShowReplyBox(true);
                setReply('');
                setShowReplies(false);
              }}
            >
              <Feather name={'plus-circle'} size={20} color={'darkgreen'} />
              <Text selectable style={[styles.text, { color: 'darkgreen' }]}>
                {'Add New Reply'}
              </Text>
            </TouchableOpacity>
          )}
          {showEditReply ? (
            <View>
              <CustomTextInput
                placeholder={'Write a Reply'}
                value={editReply}
                size={'large'}
                onChangeText={text => setEditReply(text)}
              />
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-evenly',
                  alignItems: 'center',
                  alignSelf: 'center',
                }}
              >
                <CustomButton
                  title={'Submit Reply'}
                  fontSize={13}
                  size={'small'}
                  onClick={submitEditReply}
                />
                <CustomButton
                  title={'Cancel'}
                  size={'small'}
                  color={'darkred'}
                  onClick={() => {
                    setShowEditReply(false);
                    setEditReply('');
                    setShowReplies(true);
                  }}
                />
              </View>
            </View>
          ) : null}
          <View>
            {showReplies ? (
              <View>
                <Text selectable style={styles.title}>
                  Complain Replies
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
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <Text
                              selectable
                              style={styles.text}
                              onPress={() => console.log(item)}
                            >
                              Reply: {titleCase(item.reply)}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.dateView2,
                              {
                                flexDirection: 'row',
                              },
                            ]}
                          >
                            <Text selectable style={styles.dropDownText}>
                              Date: {getDay(item.date)}
                            </Text>
                            <Text selectable style={styles.dropDownText}>
                              {' '}
                              {getMonthName(item.date)}
                            </Text>
                            <Text selectable style={styles.dropDownText}>
                              {' '}
                              {getFullYear(item.date)}
                            </Text>
                            <Text selectable style={styles.dropDownText}>
                              {' , By: '}
                              {item.tname}
                            </Text>
                          </View>
                          {item.updatedAt ? (
                            <View
                              style={[
                                styles.dateView2,
                                {
                                  flexDirection: 'row',
                                },
                              ]}
                            >
                              <Text selectable style={styles.dropDownText}>
                                Updated At: {getDay(item.updatedAt)}
                              </Text>
                              <Text selectable style={styles.dropDownText}>
                                {' '}
                                {getMonthName(item.updatedAt)}
                              </Text>
                              <Text selectable style={styles.dropDownText}>
                                {' '}
                                {getFullYear(item.updatedAt)}
                              </Text>
                            </View>
                          ) : null}
                          {item.username === user.username ||
                          user.circle === 'admin' ? (
                            <View
                              style={{
                                paddingLeft: responsiveWidth(4),
                                justifyContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'center',
                                flexDirection: 'row',
                              }}
                            >
                              <TouchableOpacity
                                onPress={() => {
                                  showConfirmDialog(item.id);
                                }}
                              >
                                <Ionicons
                                  name="trash-bin"
                                  size={25}
                                  color="red"
                                />
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={{ paddingLeft: responsiveWidth(10) }}
                                onPress={() => {
                                  setEditReply(item.reply);
                                  setEditReplyObj(item);
                                  setShowEditReply(true);
                                  setShowReplies(false);
                                }}
                              >
                                <Feather
                                  name="edit"
                                  size={25}
                                  color="darkblue"
                                />
                              </TouchableOpacity>
                            </View>
                          ) : null}
                        </ScrollView>
                      )}
                    />
                  ) : (
                    <Text selectable style={styles.text}>
                      No Replies
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
            ) : null}
          </View>
        </ScrollView>
      </ScrollView>
      <Loader visible={showLoader} />
    </NavigationBarContainer>
  );
};

export default ComplainDetails;

const styles = StyleSheet.create({
  title: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(2),
    fontWeight: '500',

    color: THEME_COLOR,
  },
  label: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(1.5),
    fontWeight: '400',
    marginTop: responsiveHeight(0.3),
    color: THEME_COLOR,
    textAlign: 'center',
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
});
