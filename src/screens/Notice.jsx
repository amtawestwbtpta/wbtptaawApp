import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Dimensions,
  BackHandler,
  Image,
  Switch,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { THEME_COLOR } from '../utils/Colors';
import CustomButton from '../components/CustomButton';
import CustomTextInput from '../components/CustomTextInput';
import storage from '@react-native-firebase/storage';
import Loader from '../components/Loader';
import uuid from 'react-native-uuid';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import { differenceInDays } from '../modules/calculatefunctions';
import { pick, types } from '@react-native-documents/picker';
import ImagePicker from 'react-native-image-crop-picker';
import { Image as Img } from 'react-native-compressor';
import { useGlobalContext } from '../context/Store';
import {
  deleteDocument,
  getCollection,
  setDocument,
  updateDocument,
} from '../firebase/firestoreHelper';
import { showToast } from '../modules/Toaster';
const { width, height } = Dimensions.get('window');
const Notice = () => {
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const {
    state,
    noticeState,
    setNoticeState,
    setStateObject,
    noticeUpdateTime,
    setNoticeUpdateTime,
    setActiveTab,
  } = useGlobalContext();
  const user = state.USER;
  const docId = uuid.v4().split('-')[0];
  const [showLoader, setShowLoader] = useState(false);
  const [showAddNotice, setshowAddNotice] = useState(true);
  const [allNotices, setAllNotices] = useState([]);
  const [title, setTitle] = useState('');
  const [addImage, setAddImage] = useState(false);
  const [noticeText, setNoticeText] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editNoticeText, setEditNoticeText] = useState('');
  const [editID, setEditID] = useState('');
  const [visible, setVisible] = useState(false);
  const [type, setType] = useState('');
  const [photoName, setPhotoName] = useState('');
  const [uri, setUri] = useState('');
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
  const addNotice = async () => {
    if (title !== '' && noticeText !== '') {
      setShowLoader(true);
      if (photoName) {
        const reference = storage().ref(
          `/noticeImages/${docId + '-' + photoName}`,
        );
        const result = await Img.compress(uri, {
          progressDivider: 10,
          downloadProgress: progress => {
            console.log('downloadProgress: ', progress);
          },
        }).catch(e => console.log(e));

        const pathToFile = type.split('/')[0] === 'image' ? result : uri;
        // uploads file
        await reference.putFile(pathToFile);
        const url = await storage()
          .ref(`/noticeImages/${docId + '-' + photoName}`)
          .getDownloadURL();
        await setDocument('notices', docId, {
          id: docId,
          date: Date.now(),
          addedBy: user.tname,
          title: title,
          noticeText: noticeText,
          url: url,
          photoName: docId + '-' + photoName,
          type: type,
        })
          .then(async () => {
            let newData = [
              ...noticeState,
              {
                id: docId,
                date: Date.now(),
                addedBy: user.tname,
                title: title,
                noticeText: noticeText,
                url: url,
                photoName: docId + '-' + photoName,
                type: type,
              },
            ];
            newData = newData.sort((a, b) => b.date - a.date);
            setNoticeState(newData);
            setAllNotices(newData);
            setNoticeUpdateTime(Date.now());
            setNoticeText('');
            setShowLoader(false);
            setshowAddNotice(true);
            showToast('success', 'Notice Added Successfully!');
            getNoticeData();
            setPhotoName('');
            setUri('');
          })
          .catch(e => {
            setShowLoader(false);
            showToast('error', 'Notice Addition Failed!');
            setVisible(false);
            console.log(e);
          });
      } else {
        await setDocument('notices', docId, {
          id: docId,
          date: Date.now(),
          addedBy: user.tname,
          title: title,
          noticeText: noticeText,
          url: '',
          photoName: '',
          type: '',
        })
          .then(async () => {
            let newData = [
              ...noticeState,
              {
                id: docId,
                date: Date.now(),
                addedBy: user.tname,
                title: title,
                noticeText: noticeText,
                url: '',
                photoName: '',
                type: '',
              },
            ];
            newData = newData.sort((a, b) => b.date - a.date);
            setNoticeState(newData);
            setAllNotices(newData);
            setNoticeUpdateTime(Date.now());
            setNoticeText('');
            setShowLoader(false);
            setshowAddNotice(true);
            showToast('success', 'Notice Added Successfully!');
            getNoticeData();
            setPhotoName('');
            setUri('');
            setType('');
          })
          .catch(e => {
            setShowLoader(false);
            showToast('error', 'Notice Addition Failed!');
            setVisible(false);
            console.log(e);
          });
      }
    } else {
      showToast('error', 'No Data');
    }
  };
  const getNotices = async () => {
    setShowLoader(true);
    await getCollection('notices')
      .then(snapshot => {
        const newData = snapshot.sort((a, b) => b.date - a.date);
        setShowLoader(false);
        setAllNotices(newData);
        setNoticeState(newData);
        setNoticeUpdateTime(Date.now());
      })
      .catch(e => {
        setShowLoader(false);
        showToast('error', e);
      });
  };

  const showConfirmDialog = el => {
    return Alert.alert('Hold On!', 'Are You Sure To Delete This Notice?', [
      // The "No" button
      // Does nothing but dismiss the dialog when tapped
      {
        text: 'No',
        onPress: () => showToast('success', 'Notice Not Deleted!'),
      },
      // The "Yes" button
      {
        text: 'Yes',
        onPress: () => {
          deleteData(el);
        },
      },
    ]);
  };
  const deleteData = async el => {
    setShowLoader(true);
    await deleteDocument('notices', el.id)
      .then(async () => {
        setNoticeState(noticeState.filter(item => item.id !== el.id));
        setAllNotices(allNotices.filter(item => item.id !== el.id));
        setNoticeUpdateTime(Date.now());
        try {
          await storage()
            .ref('/noticeImages/' + el.photoName)
            .delete();
        } catch (e) {
          console.log(e);
        }
        setShowLoader(false);
        showToast('success', 'Notice Deleted Successfully');

        getNoticeData();
      })
      .catch(e => {
        setShowLoader(false);
        showToast('error', 'Deletation Failed');
        console.log(e);
      });
  };
  const updateData = async () => {
    if (editTitle !== '' && editNoticeText !== '') {
      setShowLoader(true);

      await updateDocument('notices', editID, {
        title: editTitle,
        noticeText: editNoticeText,
        date: Date.now(),
        addedBy: user.tname,
      }).then(async () => {
        let x = noticeState.filter(el => el.id === editID)[0];
        let y = noticeState.filter(el => el.id !== editID);
        y = [
          ...y,
          {
            id: editID,
            date: Date.now(),
            addedBy: user.tname,
            title: editTitle,
            noticeText: editNoticeText,
            url: x.url,
            photoName: x.photoName,
            type: x.type,
          },
        ];
        let newData = y.sort((a, b) => b.date - a.date);
        setNoticeState(newData);
        setAllNotices(newData);
        setNoticeUpdateTime(Date.now());
        setShowLoader(false);
        setVisible(false);
        showToast('success', 'Details Updated Successfully');
        getNoticeData();
      });
    } else {
      showToast('error', 'Invalid Data');
    }
  };

  const getNoticeData = () => {
    const difference = (Date.now() - noticeUpdateTime) / 1000 / 60 / 15;
    if (noticeState.length === 0 || difference >= 1) {
      getNotices();
    } else {
      let newData = noticeState.sort((a, b) => b.date - a.date);
      setShowLoader(false);
      setAllNotices(newData);
    }
  };
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
  useEffect(() => {
    getNoticeData();
  }, [isFocused]);
  useEffect(() => {}, [addImage, photoName, uri, noticeState, allNotices]);

  return (
    <View style={{ flex: 1, alignSelf: 'center' }}>
      <Text selectable style={styles.title}>
        Notices
      </Text>
      {user.circle === 'admin' ? (
        <TouchableOpacity
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            alignSelf: 'center',
            justifyContent: 'center',

            marginBottom: responsiveHeight(1.5),
          }}
          onPress={() => {
            setshowAddNotice(!showAddNotice);
          }}
        >
          <Feather
            name={!showAddNotice ? 'minus-circle' : 'plus-circle'}
            size={20}
            color={THEME_COLOR}
          />
          <Text selectable style={styles.title}>
            {!showAddNotice ? 'Hide Add Notice' : 'Add New Notice'}
          </Text>
        </TouchableOpacity>
      ) : null}
      {user.circle === 'admin' && !showAddNotice ? (
        <View
          style={{
            marginBottom: responsiveHeight(15),
          }}
        >
          <CustomTextInput
            placeholder={'Enter Title'}
            value={title}
            onChangeText={text => setTitle(text)}
          />
          <CustomTextInput
            placeholder={'Enter Notice'}
            multiline={true}
            value={noticeText}
            size={'large'}
            onChangeText={text => setNoticeText(text)}
          />
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
              style={[styles.title, { paddingRight: responsiveWidth(1.5) }]}
            >
              Without Image/File
            </Text>
            <Switch
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={addImage ? '#f5dd4b' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={() => {
                setAddImage(!addImage);
                if (addImage == true) {
                  setPhotoName('');
                  setUri('');
                  setType('');
                }
              }}
              value={addImage}
            />

            <Text selectable style={[styles.title, { paddingLeft: 5 }]}>
              With Image/File
            </Text>
          </View>
          {addImage ? (
            <View style={{ margin: responsiveHeight(1) }}>
              <Text selectable style={[styles.label, { marginBottom: 5 }]}>
                Upload Notice Picture
              </Text>

              {uri == '' ? (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'center',
                  }}
                >
                  <TouchableOpacity
                    onPress={async () => {
                      await ImagePicker.openCamera({
                        // width: 400,
                        // height: 400,
                        cropping: true,
                        mediaType: 'photo',
                      })
                        .then(image => {
                          console.log(image);
                          setUri(image.path);
                          setPhotoName(
                            image.path.substring(
                              image.path.lastIndexOf('/') + 1,
                            ),
                          );
                          setType(image.mime);
                        })
                        .catch(async e => {
                          console.log(e);

                          await ImagePicker.clean()
                            .then(() => {
                              console.log(
                                'removed all tmp images from tmp directory',
                              );
                            })
                            .catch(e => {
                              console.log(e);
                            });
                        });
                    }}
                  >
                    <Image
                      source={require('../assets/images/camera.png')}
                      style={{
                        width: responsiveWidth(10),
                        height: responsiveWidth(10),
                        alignSelf: 'center',
                        tintColor: THEME_COLOR,
                      }}
                    />
                    <Text selectable style={styles.icon}>
                      Camera
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={async () => {
                      await ImagePicker.openPicker({
                        // width: 400,
                        // height: 400,
                        cropping: true,
                        mediaType: 'photo',
                      })
                        .then(image => {
                          console.log(image);
                          setUri(image.path);
                          setPhotoName(
                            image.path.substring(
                              image.path.lastIndexOf('/') + 1,
                            ),
                          );
                          setType(image.mime);
                        })
                        .catch(async e => {
                          console.log(e);

                          await ImagePicker.clean()
                            .then(() => {
                              console.log(
                                'removed all tmp images from tmp directory',
                              );
                            })
                            .catch(e => {
                              console.log(e);
                            });
                        });
                    }}
                    style={{ paddingLeft: responsiveWidth(5) }}
                  >
                    <Image
                      source={require('../assets/images/gallery.png')}
                      style={{
                        width: responsiveWidth(12),
                        height: responsiveWidth(12),
                        alignSelf: 'center',
                        tintColor: THEME_COLOR,
                      }}
                    />
                    <Text selectable style={styles.icon}>
                      Gallery
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={async () => {
                      try {
                        const [res] = await pick({
                          presentationStyle: 'fullScreen',
                          type: [types.allFiles],
                        });
                        let fileCopyUri = res.uri;
                        const filename = res.name;
                        setType(res.type);
                        setPhotoName(filename);
                        setUri(fileCopyUri);
                      } catch (e) {
                        console.log(e);
                      }
                    }}
                    style={{ paddingLeft: responsiveWidth(5) }}
                  >
                    <Image
                      source={require('../assets/images/file.png')}
                      style={{
                        width: responsiveWidth(11),
                        height: responsiveWidth(11),
                        alignSelf: 'center',
                        tintColor: THEME_COLOR,
                      }}
                    />
                    <Text selectable style={styles.icon}>
                      File
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={{
                    width: responsiveWidth(20),
                    height: responsiveHeight(3),

                    alignSelf: 'center',
                  }}
                  onPress={async () => {
                    await ImagePicker.openPicker({
                      // width: 400,
                      // height: 400,
                      cropping: true,
                      mediaType: 'photo',
                    })
                      .then(image => {
                        console.log(image);
                        setUri(image.path);
                        setPhotoName(
                          image.path.substring(image.path.lastIndexOf('/') + 1),
                        );
                        setType(image.mime);
                      })
                      .catch(async e => {
                        console.log(e);

                        await ImagePicker.clean()
                          .then(() => {
                            console.log(
                              'removed all tmp images from tmp directory',
                            );
                          })
                          .catch(e => {
                            console.log(e);
                          });
                      });
                  }}
                >
                  <View style={{ flexDirection: 'row' }}>
                    <View>
                      {type.split('/')[0] === 'image' ? (
                        <Image
                          source={{ uri: uri }}
                          style={{
                            width: 50,
                            height: 50,
                            alignSelf: 'center',
                            borderRadius: 5,
                          }}
                        />
                      ) : type.split('/')[1] === 'pdf' ? (
                        <Image
                          source={require('../assets/images/pdf.png')}
                          style={{
                            width: 50,
                            height: 50,
                            alignSelf: 'center',
                            borderRadius: 5,
                          }}
                        />
                      ) : (
                        <Ionicons name="document" color={'navy'} size={30} />
                      )}
                    </View>
                    <View>
                      <TouchableOpacity
                        onPress={async () => {
                          setPhotoName('');
                          setUri('');
                          setType('');
                          setAddImage(false);
                          await ImagePicker.clean()
                            .then(() => {
                              console.log(
                                'removed all tmp images from tmp directory',
                              );
                            })
                            .catch(e => {
                              console.log(e);
                            });
                        }}
                      >
                        <Text selectable style={{ color: 'red' }}>
                          <MaterialIcons name="cancel" size={20} />
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          ) : null}
          <CustomButton
            marginTop={responsiveHeight(2)}
            marginBottom={responsiveHeight(1)}
            title={'Add Notice'}
            onClick={addNotice}
          />

          <CustomButton
            title={'Cancel'}
            color={'darkred'}
            onClick={() => {
              setshowAddNotice(true);
              setAddImage(false);
              setNoticeText('');
              setPhotoName('');
              setUri('');
            }}
          />
        </View>
      ) : null}
      {
        <ScrollView>
          {showAddNotice && (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                margin: responsiveHeight(1),
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
              {visibleItems < allNotices.length && (
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
          )}
          {showAddNotice && allNotices.length
            ? allNotices.slice(firstData, visibleItems).map((el, ind) => {
                let diff = differenceInDays(el.date, Date.now());
                let showNoticeIcon;
                if (diff < 2) {
                  showNoticeIcon = true;
                } else {
                  showNoticeIcon = false;
                }
                return (
                  <ScrollView key={ind}>
                    <TouchableOpacity
                      style={styles.itemView}
                      onPress={() => {
                        navigation.navigate('NoticeDetails');
                        setStateObject(el);
                      }}
                    >
                      {showNoticeIcon ? (
                        <Image
                          source={require('../assets/images/new.png')}
                          style={{
                            width: responsiveWidth(10),
                            height: responsiveHeight(5),
                            alignSelf: 'flex-end',
                          }}
                        />
                      ) : null}
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          alignSelf: 'center',
                          paddingLeft: responsiveWidth(5),
                          paddingRight: responsiveWidth(5),
                        }}
                      >
                        {el.url ? (
                          el.type.split('/')[0] === 'image' ? (
                            <Image
                              source={{ uri: el.url }}
                              style={{
                                width: responsiveWidth(15),
                                height: responsiveWidth(15),
                                borderRadius: responsiveWidth(5),
                              }}
                            />
                          ) : (
                            <Image
                              source={require('../assets/images/pdf.png')}
                              style={{
                                width: responsiveWidth(15),
                                height: responsiveWidth(15),
                                borderRadius: responsiveWidth(5),
                              }}
                            />
                          )
                        ) : (
                          <Image
                            source={require('../assets/images/notice.png')}
                            style={{
                              width: responsiveWidth(15),
                              height: responsiveWidth(15),
                              borderRadius: responsiveWidth(5),
                            }}
                          />
                        )}
                        <View style={{ paddingLeft: 5, paddingRight: 5 }}>
                          <Text
                            selectable
                            style={[
                              styles.label,
                              { paddingLeft: responsiveWidth(5) },
                            ]}
                          >
                            ({ind + 1}) {el.title.slice(0, 30) + '...'}
                          </Text>
                          <Text
                            selectable
                            style={[
                              styles.label,
                              { paddingLeft: responsiveWidth(5) },
                            ]}
                          >
                            {el.noticeText.length < 50
                              ? el.noticeText
                              : el.noticeText.slice(0, 50) + '...'}
                          </Text>
                        </View>
                      </View>

                      {user.circle === 'admin' ? (
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            alignSelf: 'center',
                            padding: responsiveWidth(2),
                          }}
                        >
                          <TouchableOpacity
                            onPress={() => {
                              setVisible(true);
                              setEditID(el.id);
                              setEditNoticeText(el.noticeText);
                              setEditTitle(el.title);
                            }}
                          >
                            <Text selectable>
                              <FontAwesome5
                                name="edit"
                                size={20}
                                color="blue"
                              />
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={{ paddingLeft: responsiveHeight(2) }}
                            onPress={() => {
                              showConfirmDialog(el);
                            }}
                          >
                            <Text selectable>
                              <Ionicons
                                name="trash-bin"
                                size={20}
                                color="red"
                              />
                            </Text>
                          </TouchableOpacity>
                        </View>
                      ) : null}
                    </TouchableOpacity>
                  </ScrollView>
                );
              })
            : null}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              margin: responsiveHeight(1),
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
            {visibleItems < allNotices.length && (
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
        </ScrollView>
      }
      <Loader visible={showLoader} />
      <Modal animationType="slide" visible={visible} transparent>
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
              Edit Notice
            </Text>

            <CustomTextInput
              placeholder={'Edit Title'}
              value={editTitle}
              onChangeText={text => {
                setEditTitle(text);
              }}
            />
            <CustomTextInput
              placeholder={'Edit Notice'}
              size={'large'}
              value={editNoticeText}
              onChangeText={text => {
                setEditNoticeText(text);
              }}
            />
            <CustomButton
              marginTop={responsiveHeight(1)}
              title={'Update'}
              onClick={updateData}
            />
            <CustomButton
              marginTop={responsiveHeight(1)}
              title={'Close'}
              color={'purple'}
              onClick={() => setVisible(false)}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Notice;

const styles = StyleSheet.create({
  title: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(2),
    fontWeight: '500',
    paddingLeft: 5,
    color: THEME_COLOR,
  },
  label: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(2),
    fontWeight: '500',
    marginTop: responsiveHeight(0.2),
    color: THEME_COLOR,
    textAlign: 'center',
    fontFamily: 'kalpurush',
  },
  icon: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(1.5),
    fontWeight: '500',
    marginTop: responsiveHeight(0.2),
    color: THEME_COLOR,
    textAlign: 'center',
    fontFamily: 'kalpurush',
  },
  itemView: {
    width: responsiveWidth(92),
    backgroundColor: 'white',

    alignSelf: 'center',
    borderRadius: responsiveWidth(2),
    marginTop: responsiveHeight(0.5),
    marginBottom: responsiveHeight(0.5),
    padding: responsiveWidth(2),
    shadowColor: 'black',
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
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
    height: responsiveWidth(80),
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  dropDownText: {
    fontSize: responsiveFontSize(1.8),
    color: 'royalblue',
    alignSelf: 'center',
    textAlign: 'center',
  },
});
