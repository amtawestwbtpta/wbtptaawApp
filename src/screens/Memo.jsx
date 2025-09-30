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
import {
  dateObjToDateFormat,
  dateStringToDateObj,
  differenceInDays,
  getCurrentDateInput,
} from '../modules/calculatefunctions';
import { pick, types } from '@react-native-documents/picker';
import ImagePicker from 'react-native-image-crop-picker';
import { Image as Img } from 'react-native-compressor';
const { width, height } = Dimensions.get('window');
import DateTimePickerAndroid from '@react-native-community/datetimepicker';
import { useGlobalContext } from '../context/Store';
import {
  deleteDocument,
  getCollection,
  setDocument,
  updateDocument,
} from '../firebase/firestoreHelper';
import { showToast } from '../modules/Toaster';
import {
  deleteFileFromGithub,
  uploadFileToGithub,
} from '../modules/gitFileHndler';
const Memo = () => {
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const {
    state,
    memoState,
    setMemoState,
    setStateObject,
    memoUpdateTime,
    setMemoUpdateTime,
    setActiveTab,
  } = useGlobalContext();
  const user = state.USER;
  const docId = uuid.v4().split('-')[0];
  const [showLoader, setShowLoader] = useState(false);
  const [showAddmemo, setshowAddmemo] = useState(true);
  const [allmemos, setAllmemos] = useState([]);
  const [title, setTitle] = useState('');
  const [memoNumber, setMemoNumber] = useState('');
  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [fontColor, setFontColor] = useState(THEME_COLOR);
  const [addImage, setAddImage] = useState(false);
  const [memoText, setmemoText] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editmemoText, setEditmemoText] = useState('');
  const [editMemoNumber, setEditMemoNumber] = useState('');
  const [editMemoDate, setEditMemoDate] = useState(new Date());
  const [editOpen, setEditOpen] = useState(false);
  const [editID, setEditID] = useState('');
  const [visible, setVisible] = useState(false);

  const [photoName, setPhotoName] = useState('');
  const [uri, setUri] = useState('');
  const [type, setType] = useState('');

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

  const calculateDate = (event, selectedDate) => {
    const currentSelectedDate = selectedDate || date;
    setOpen('');
    setDate(currentSelectedDate);
    setFontColor('black');
  };
  const calculateEditDate = (event, selectedDate) => {
    const currentSelectedDate = selectedDate || date;
    setEditOpen('');
    setEditMemoDate(currentSelectedDate);
    setFontColor('black');
  };

  const addmemo = async () => {
    if (title !== '' && memoText !== '') {
      setShowLoader(true);
      if (photoName) {
        const uploadableFileName = docId + '-' + photoName;

        const reference = storage().ref(`/memoImages/${uploadableFileName}`);
        const result = await Img.compress(uri, {
          progressDivider: 10,
          downloadProgress: progress => {
            console.log('downloadProgress: ', progress);
          },
        }).catch(e => console.log(e));

        const pathToFile = type.split('/')[0] === 'image' ? result : uri;
        // uploads file
        const githubUrl = await uploadFileToGithub(
          pathToFile,
          uploadableFileName,
          'memoFiles',
        );
        await reference.putFile(pathToFile);
        const url = await storage()
          .ref(`/memoImages/${uploadableFileName}`)
          .getDownloadURL();
        await setDocument('memos', docId, {
          id: docId,
          date: Date.now(),
          addedBy: user.tname,
          title: title,
          memoNumber: memoNumber,
          memoDate: dateObjToDateFormat(date),
          memoText: memoText,
          url: url,
          githubUrl,
          photoName: uploadableFileName,
          type: type,
        })
          .then(async () => {
            let x = memoState;
            x = [
              ...x,
              {
                id: docId,
                date: Date.now(),
                addedBy: user.tname,
                title: title,
                memoNumber: memoNumber,
                memoDate: dateObjToDateFormat(date),
                memoText: memoText,
                url: url,
                githubUrl,
                photoName: uploadableFileName,
                type: type,
              },
            ];
            x = x.sort(
              (a, b) =>
                Date.parse(getCurrentDateInput(b.memoDate)) -
                Date.parse(getCurrentDateInput(a.memoDate)),
            );

            setMemoState(x);
            setAllmemos(x);
            setMemoUpdateTime(Date.now());
            setmemoText('');
            setShowLoader(false);
            setshowAddmemo(true);
            showToast('success', 'memo Added Successfully!');
            setPhotoName('');
            setUri('');
          })
          .catch(e => {
            setShowLoader(false);
            showToast('error', 'memo Addition Failed!');
            setVisible(false);
            console.log(e);
          });
      } else {
        await setDocument('memos', docId, {
          id: docId,
          date: Date.now(),
          addedBy: user.tname,
          title: title,
          memoNumber: memoNumber,
          memoDate: dateObjToDateFormat(date),
          memoText: memoText,
          url: '',
          githubUrl,
          photoName: '',
          type: '',
        })
          .then(async () => {
            let x = memoState;
            x = [
              ...x,
              {
                id: docId,
                date: Date.now(),
                addedBy: user.tname,
                title: title,
                memoNumber: memoNumber,
                memoDate: dateObjToDateFormat(date),
                memoText: memoText,
                url: '',
                githubUrl,
                photoName: '',
                type: '',
              },
            ];
            x = x.sort(
              (a, b) =>
                Date.parse(getCurrentDateInput(b.memoDate)) -
                Date.parse(getCurrentDateInput(a.memoDate)),
            );
            setMemoState(x);
            setAllmemos(x);
            setMemoUpdateTime(Date.now());
            setmemoText('');
            setShowLoader(false);
            setshowAddmemo(true);
            showToast('success', 'memo Added Successfully!');
            setPhotoName('');
            setUri('');
          })
          .catch(e => {
            setShowLoader(false);
            showToast('error', 'memo Addition Failed!');
            setVisible(false);
            console.log(e);
          });
      }
    } else {
      showToast('error', 'No Data');
    }
  };
  const getmemos = async () => {
    setShowLoader(true);
    await getCollection('memos')
      .then(data => {
        let newData = data.sort(
          (a, b) =>
            Date.parse(getCurrentDateInput(b.memoDate)) -
            Date.parse(getCurrentDateInput(a.memoDate)),
        );
        setShowLoader(false);
        setAllmemos(newData);
        setMemoState(newData);
        setMemoUpdateTime(Date.now());
      })
      .catch(e => {
        setShowLoader(false);
        showToast('error', e);
      });
  };
  const showConfirmDialog = el => {
    return Alert.alert('Hold On!', 'Are You Sure To Delete This memo?', [
      // The "No" button
      // Does nothing but dismiss the dialog when tapped
      {
        text: 'No',
        onPress: () => showToast('success', 'memo Not Deleted!'),
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
    await deleteDocument('memos', el.id)
      .then(async () => {
        setMemoState(memoState.filter(item => item.id !== el.id));
        setAllmemos(memoState.filter(item => item.id !== el.id));
        setMemoUpdateTime(Date.now());
        showToast('success', `Reply Memo Deleted Successfully`);
        try {
          const isDelFromGithub = await deleteFileFromGithub(
            el.photoName,
            'memoImages',
          );
          if (isDelFromGithub) {
            showToast('success', 'File deleted successfully From Github!');
          } else {
            showToast('error', 'Error Deleting File From Github!');
          }
          await storage()
            .ref('/memoImages/' + el.photoName)
            .delete();
        } catch (e) {
          console.log(e);
        }
        setShowLoader(false);
        showToast('success', 'memo Deleted Successfully');
      })
      .catch(e => {
        setShowLoader(false);
        showToast('error', 'Deletation Failed');
        console.log(e);
      });
  };
  const updateData = async () => {
    if (editTitle !== '' && editmemoText !== '') {
      setShowLoader(true);

      await updateDocument('memos', editID, {
        title: editTitle,
        memoText: editmemoText,
        memoNumber: editMemoNumber,
        memoDate: dateObjToDateFormat(editMemoDate),
        date: Date.now(),
        addedBy: user.tname,
      }).then(async () => {
        let x = memoState.filter(el => el.id === editID)[0];
        let y = memoState.filter(el => el.id !== editID);
        y = [
          ...y,
          {
            id: editID,
            date: Date.now(),
            addedBy: user.tname,
            title: editTitle,
            memoText: editmemoText,
            memoNumber: editMemoNumber,
            memoDate: dateObjToDateFormat(editMemoDate),
            url: x.url,
            photoName: x.photoName,
            type: x.type,
          },
        ];

        let newData = y.sort(
          (a, b) =>
            Date.parse(getCurrentDateInput(b.memoDate)) -
            Date.parse(getCurrentDateInput(a.memoDate)),
        );
        setMemoState(newData);
        setAllmemos(newData);
        setMemoUpdateTime(Date.now());
        setShowLoader(false);
        setVisible(false);

        showToast('success', 'Details Updated Successfully');
      });
    } else {
      showToast('error', 'Invalid Data');
    }
  };

  const getMemoData = () => {
    const difference = (Date.now() - memoUpdateTime) / 1000 / 60 / 15;
    if (memoState.length === 0 || difference >= 1) {
      getmemos();
    } else {
      let newData = memoState.sort(
        (a, b) =>
          Date.parse(getCurrentDateInput(b.memoDate)) -
          Date.parse(getCurrentDateInput(a.memoDate)),
      );
      setShowLoader(false);
      setAllmemos(newData);
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
    getMemoData();
  }, [isFocused]);
  useEffect(() => {}, [addImage, photoName, uri, type, memoState]);

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <ScrollView
        contentContainerStyle={{
          justifyContent: 'center',
          alignItems: 'center',
          alignSelf: 'center',
        }}
      >
        <Text selectable style={styles.title}>
          Memo Numbers
        </Text>
        {user.circle === 'admin' || user.question === 'admin' ? (
          <TouchableOpacity
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              alignSelf: 'center',
              justifyContent: 'center',

              marginBottom: responsiveHeight(1.5),
            }}
            onPress={() => {
              setshowAddmemo(!showAddmemo);
            }}
          >
            <Feather
              name={!showAddmemo ? 'minus-circle' : 'plus-circle'}
              size={20}
              color={THEME_COLOR}
            />
            <Text selectable style={styles.title}>
              {!showAddmemo ? 'Hide Add Memo' : 'Add New Memo'}
            </Text>
          </TouchableOpacity>
        ) : null}
        {(user.circle === 'admin' || user.question === 'admin') &&
        !showAddmemo ? (
          <ScrollView>
            <CustomTextInput
              placeholder={'Enter Title'}
              value={title}
              onChangeText={text => setTitle(text)}
            />
            <CustomTextInput
              placeholder={'Enter Memo Number'}
              value={memoNumber}
              onChangeText={text => setMemoNumber(text)}
            />
            <View>
              <TouchableOpacity
                style={{
                  marginTop: 10,
                  borderColor: 'skyblue',
                  borderWidth: 1,
                  width: responsiveWidth(76),
                  height: 50,
                  alignSelf: 'center',
                  borderRadius: responsiveWidth(3),
                  justifyContent: 'center',
                }}
                onPress={() => setOpen(true)}
              >
                <Text
                  selectable
                  style={{
                    fontSize: responsiveFontSize(1.6),
                    color: fontColor,
                    paddingLeft: 14,
                  }}
                >
                  {date.getDate() < 10 ? '0' + date.getDate() : date.getDate()}-
                  {date.getMonth() + 1 < 10
                    ? `0${date.getMonth() + 1}`
                    : date.getMonth() + 1}
                  -{date.getFullYear()}
                </Text>
              </TouchableOpacity>

              {open && (
                <DateTimePickerAndroid
                  testID="dateTimePicker"
                  value={date}
                  mode="date"
                  display="spinner"
                  maximumDate={Date.parse(new Date())}
                  minimumDate={new Date(`01-01-${new Date().getFullYear()}`)}
                  onChange={calculateDate}
                />
              )}
            </View>
            <CustomTextInput
              placeholder={'Enter Memo Description'}
              multiline={true}
              numberOfLines={editmemoText.length / 42}
              value={memoText}
              size={'large'}
              onChangeText={text => setmemoText(text)}
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
                Without Image/ File
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

              <Text selectable style={[styles.title, { paddingRight: 5 }]}>
                With Image/ File
              </Text>
            </View>
            {addImage ? (
              <View style={{ margin: responsiveHeight(1) }}>
                <Text selectable style={[styles.label, { marginBottom: 5 }]}>
                  Upload memo Picture
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
                          width: responsiveWidth(12),
                          height: responsiveWidth(12),
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
                            setAddImage(false);
                            setType('');
                            await ImagePicker.clean()
                              .then(() => {
                                console.log(
                                  'removed all tmp images from tmp directory',
                                );
                              })
                              .catch(e => {
                                console.log(e);
                              });
                            try {
                            } catch (error) {}
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
              title={'Add memo'}
              onClick={addmemo}
            />

            <CustomButton
              title={'Cancel'}
              color={'darkred'}
              onClick={() => {
                setshowAddmemo(true);
                setAddImage(false);
                setmemoText('');
                setPhotoName('');
                setUri('');
                setMemoNumber('');
                setDate(new Date());
                setType('');
              }}
            />
          </ScrollView>
        ) : null}
        {
          <ScrollView
            style={{
              marginBottom: responsiveHeight(1),
            }}
          >
            {showAddmemo && (
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
                {visibleItems < allmemos.length && (
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
            {showAddmemo && allmemos.length
              ? allmemos.slice(firstData, visibleItems).map((el, ind) => {
                  let diff = differenceInDays(el.date, Date.now());
                  let showmemoIcon;
                  if (diff < 2) {
                    showmemoIcon = true;
                  } else {
                    showmemoIcon = false;
                  }
                  return (
                    <ScrollView key={ind}>
                      <TouchableOpacity
                        style={styles.itemView}
                        onPress={() => {
                          navigation.navigate('MemoDetails');
                          setStateObject({
                            data: el,
                            navigation: navigation,
                          });
                        }}
                      >
                        {showmemoIcon ? (
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
                          {el.githubUrl !== '' &&
                          el.type.split('/')[0] === 'image' ? (
                            <Image
                              source={{ uri: el.githubUrl }}
                              style={{
                                width: responsiveWidth(15),
                                height: responsiveWidth(15),
                                borderRadius: responsiveWidth(5),
                              }}
                            />
                          ) : el.githubUrl === '' ? (
                            <Image
                              source={require('../assets/images/memo.png')}
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
                              {el.memoText.length < 50
                                ? el.memoText
                                : el.memoText.slice(0, 50) + '...'}
                            </Text>
                          </View>
                        </View>

                        {user.circle === 'admin' ||
                        user.question === 'admin' ? (
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
                                setEditmemoText(el.memoText);
                                setEditTitle(el.title);
                                setEditMemoNumber(el.memoNumber);
                                setEditMemoDate(
                                  dateStringToDateObj(el.memoDate),
                                );
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
              {visibleItems < allmemos.length && (
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
                Edit memo
              </Text>

              <CustomTextInput
                placeholder={'Edit Title'}
                value={editTitle}
                onChangeText={text => {
                  setEditTitle(text);
                }}
              />
              <CustomTextInput
                placeholder={'Edit Memo Number'}
                value={editMemoNumber}
                onChangeText={text => {
                  setEditMemoNumber(text);
                }}
              />
              <View>
                <TouchableOpacity
                  style={{
                    marginTop: 10,
                    borderColor: 'skyblue',
                    borderWidth: 1,
                    width: responsiveWidth(76),
                    height: 50,
                    alignSelf: 'center',
                    borderRadius: responsiveWidth(3),
                    justifyContent: 'center',
                  }}
                  onPress={() => setEditOpen(true)}
                >
                  <Text
                    selectable
                    style={{
                      fontSize: responsiveFontSize(1.6),
                      color: fontColor,
                      paddingLeft: 14,
                    }}
                  >
                    {editMemoDate.getDate() < 10
                      ? '0' + editMemoDate.getDate()
                      : editMemoDate.getDate()}
                    -
                    {editMemoDate.getMonth() + 1 < 10
                      ? `0${editMemoDate.getMonth() + 1}`
                      : editMemoDate.getMonth() + 1}
                    -{editMemoDate.getFullYear()}
                  </Text>
                </TouchableOpacity>

                {editOpen && (
                  <DateTimePickerAndroid
                    testID="dateTimePicker"
                    value={editMemoDate}
                    mode="date"
                    display="spinner"
                    maximumDate={Date.parse(new Date())}
                    minimumDate={new Date(`01-01-${new Date().getFullYear()}`)}
                    onChange={calculateEditDate}
                  />
                )}
              </View>
              <CustomTextInput
                placeholder={'Edit Memo Description'}
                size={'large'}
                value={editmemoText}
                multiline={true}
                numberOfLines={editmemoText.length / 42}
                onChangeText={text => {
                  setEditmemoText(text);
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
      </ScrollView>
    </View>
  );
};

export default Memo;

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
