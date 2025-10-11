import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  BackHandler,
  Alert,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import storage from '@react-native-firebase/storage';
import { THEME_COLOR } from '../utils/Colors';
import CustomButton from '../components/CustomButton';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import Loader from '../components/Loader';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import uuid from 'react-native-uuid';
import CustomTextInput from '../components/CustomTextInput';
import ImagePicker from 'react-native-image-crop-picker';
import Feather from 'react-native-vector-icons/Feather';
import { Image as Img } from 'react-native-compressor';
import { downloadFile } from '../modules/downloadFile';
import { useGlobalContext } from '../context/Store';
import {
  deleteDocument,
  setDocument,
  updateDocument,
} from '../firebase/firestoreHelper';
import { showToast } from '../modules/Toaster';
import NavigationBarContainer from '../navigation/NavigationBarContainer';
import {
  deleteFileFromGithub,
  uploadFileToGithub,
} from '../modules/gitFileHndler';
const UpdateSlides = () => {
  const isFocused = useIsFocused();

  const navigation = useNavigation();
  const docId = uuid.v4().split('-')[0];
  const [showLoader, setShowLoader] = useState(false);
  const { state, slideState, setSlideState } = useGlobalContext();
  const user = state.USER;
  const [addFile, setAddFile] = useState(true);
  const [filteredData, setFilteredData] = useState([]);
  const [firstData, setFirstData] = useState(0);
  const [visibleItems, setVisibleItems] = useState(10);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photoName, setPhotoName] = useState('');
  const [uri, setUri] = useState('');
  const [fileType, setFileType] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [originalTitle, setOriginalTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [originalDescription, setOriginalDescription] = useState('');
  const [editPhotoName, setEditPhotoName] = useState('');
  const [originalPhotoName, setOriginalPhotoName] = useState('');
  const [editUri, setEditUri] = useState('');
  const [originalUri, setOriginalUri] = useState('');
  const [editPhotoID, setEditPhotoID] = useState('');
  const [eidtFileType, setEditFileType] = useState('');
  const [showEditView, setShowEditView] = useState(false);
  const [disable, setDisable] = useState(true);
  const loadPrev = () => {
    setVisibleItems(prevVisibleItems => prevVisibleItems - 10);
    setFirstData(firstData - 10);
  };
  const loadMore = () => {
    setVisibleItems(prevVisibleItems => prevVisibleItems + 10);
    setFirstData(firstData + 10);
  };

  const getphotos = async () => {
    setFilteredData(slideState);
  };
  const uploadFile = async () => {
    setShowLoader(true);
    const reference = storage().ref(`/slides/${photoName}`);
    const result = await Img.compress(uri, {
      progressDivider: 10,
      downloadProgress: progress => {
        console.log('downloadProgress: ', progress);
      },
    });

    try {
      await uploadFileToGithub(result, photoName, 'slides').then(
        async githubUrl => {
          await reference
            .putFile(result)
            .then(task => console.log(task))
            .catch(e => console.log(e));
          let url = await storage()
            .ref(`/slides/${photoName}`)
            .getDownloadURL();
          await setDocument('slides', docId, {
            id: docId,
            date: Date.now(),
            addedBy: user.tname,
            url: url,
            githubUrl,
            fileName: photoName,
            fileType: fileType,
            title: title,
            description: description,
          })
            .then(async () => {
              setShowLoader(false);
              showToast('success', 'Image Uploaded Successfully!');
              let x = slideState;
              x = [
                ...x,
                {
                  id: docId,
                  date: Date.now(),
                  addedBy: user.tname,
                  url: url,
                  githubUrl,
                  fileName: photoName,
                  fileType: fileType,
                  title: title,
                  description: description,
                },
              ];
              setSlideState(x);
              setFilteredData(x);
              getphotos();
              setUri('');
              setPhotoName('');
              setFileType('');
              setAddFile(true);
              setTitle('');
              setDescription('');
              await ImagePicker.clean()
                .then(() => {
                  console.log('removed all tmp images from tmp directory');
                })
                .catch(e => {
                  console.log(e);
                });
            })
            .catch(e => {
              setShowLoader(false);
              showToast('error', 'Image Addition Failed!');
              console.log(e);
            });
        },
      );
    } catch (error) {
      console.log(error);
      setShowLoader(false);
      showToast('error', 'Image Addition Failed!');
    }
  };
  const showConfirmDialog = el => {
    return Alert.alert('Hold On!', 'Are You Sure To Delete This Image?', [
      // The "No" button
      // Does nothing but dismiss the dialog when tapped
      {
        text: 'No',
        onPress: () => showToast('success', 'Image Not Deleted!'),
      },
      // The "Yes" button
      {
        text: 'Yes',
        onPress: () => {
          delImage(el);
        },
      },
    ]);
  };
  const delImage = async item => {
    setShowLoader(true);
    try {
      const isDelFromGithub = await deleteFileFromGithub(
        item.fileName,
        'slides',
      );
      if (isDelFromGithub) {
        showToast('success', 'File deleted successfully From Github!');
      } else {
        showToast('error', 'Error Deleting File From Github!');
      }
      await storage()
        .ref('/slides/' + item.fileName)
        .delete()
        .then(async () => {
          await deleteDocument('slides', item.id)
            .then(() => {
              let y = slideState.filter(el => el.id !== item.id);
              setSlideState(y);
              setFilteredData(y);
              setShowLoader(false);
              showToast('success', 'File Deleted Successfully!');
              getphotos();
            })
            .catch(e => console.log(e));
        })
        .catch(e => {
          setShowLoader(false);
          showToast('error', 'File Deletation Failed!');
          console.log(e);
        });
    } catch (error) {
      console.log(error);
    }
  };

  const updateEditPhoto = async () => {
    if (
      originalTitle === editTitle &&
      originalDescription === editDescription &&
      originalUri === editUri
    ) {
      showToast('error', 'Nothing to Change!');
    } else {
      setShowLoader(true);
      if (originalUri === editUri) {
        await updateDocument('slides', editPhotoID, {
          title: editTitle,
          description: editDescription,
        })
          .then(async () => {
            showToast('success', 'Details Updated Successfully!');
            setShowLoader(false);
            let x = slideState.filter(el => el.id === editPhotoID)[0];
            x = { ...x, title: editTitle, description: editDescription };
            let y = slideState.filter(el => el.id !== editPhotoID);
            y = [...y, x];
            setSlideState(y);
            setFilteredData(y);
            getphotos();
            setEditUri('');
            setEditPhotoName('');
            setEditFileType('');
            setAddFile(true);
            setShowEditView(false);
            setDisable(true);
          })
          .catch(e => {
            setShowLoader(false);
            showToast('error', 'Updation Failed!');
            console.log(e);
          });
      } else {
        try {
          const isDelFromGithub = await deleteFileFromGithub(
            originalPhotoName,
            'slides',
          );
          if (isDelFromGithub) {
            showToast('success', 'File deleted successfully From Github!');
          } else {
            showToast('error', 'Error Deleting File From Github!');
          }
          await storage()
            .ref('/slides/' + originalPhotoName)
            .delete()
            .then(async () => {
              const reference = storage().ref(`/slides/${editPhotoName}`);
              const result = await Img.compress(editUri, {
                progressDivider: 10,
                downloadProgress: progress => {
                  console.log('downloadProgress: ', progress);
                },
              });
              const pathToFile = result;

              // uploads file
              const githubUrl = await uploadFileToGithub(
                pathToFile,
                editPhotoName,
                'slides',
              );
              await reference
                .putFile(pathToFile)
                .then(task => console.log(task))
                .catch(e => console.log(e));
              let url = await storage()
                .ref(`/slides/${editPhotoName}`)
                .getDownloadURL();
              await updateDocument('slides', editPhotoID, {
                addedBy: user.tname,
                url: url,
                githubUrl,
                fileName: editPhotoName,
                fileType: eidtFileType,
                title: editTitle,
                description: editDescription,
              })
                .then(async () => {
                  setShowLoader(false);
                  showToast('success', 'Details Updated Successfully!');
                  let y = slideState.filter(el => el.id !== editPhotoID);
                  y = [
                    ...y,
                    {
                      addedBy: user.tname,
                      url: url,
                      githubUrl,
                      fileName: editPhotoName,
                      fileType: eidtFileType,
                      title: editTitle,
                      description: editDescription,
                      id: editPhotoID,
                    },
                  ];
                  setSlideState(y);
                  setFilteredData(y);
                  setEditUri('');
                  setEditPhotoName('');
                  setEditFileType('');
                  setAddFile(true);
                  setShowEditView(false);
                  setDisable(true);
                })
                .catch(e => {
                  setShowLoader(false);
                  showToast('error', 'Updation Failed!');
                  console.log(e);
                });
            })
            .catch(e => {
              setShowLoader(false);
              showToast('error', 'Updation Failed!');
              console.log(e);
            });
        } catch (error) {
          console.log(error);
        }
      }
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
  }, []);
  useEffect(() => {
    getphotos();
  }, [isFocused]);

  return (
    <NavigationBarContainer>
      <ScrollView style={{ marginTop: responsiveHeight(1) }}>
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
              setAddFile(!addFile);
            }}
          >
            <Feather
              name={!addFile ? 'minus-circle' : 'plus-circle'}
              size={20}
              color={THEME_COLOR}
            />
            <Text selectable style={[styles.label, { paddingLeft: 5 }]}>
              {!addFile ? 'Hide Upload Image' : 'Upload New Image'}
            </Text>
          </TouchableOpacity>
        ) : null}

        {!showEditView ? (
          addFile ? (
            <View>
              <Text
                selectable
                style={[styles.title, { marginBottom: responsiveHeight(1) }]}
              >
                Slide Photos
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  marginBottom: 5,
                  alignSelf: 'center',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {firstData >= 10 && (
                  <View style={{ marginBottom: 10 }}>
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
                  <View style={{ marginBottom: 10 }}>
                    <CustomButton
                      title={'Next'}
                      onClick={loadMore}
                      size={'small'}
                      fontSize={14}
                    />
                  </View>
                )}
              </View>
              {filteredData.length > 0 ? (
                filteredData.slice(firstData, visibleItems).map((el, ind) => {
                  return (
                    <ScrollView key={ind}>
                      <View
                        style={[
                          styles.itemView,
                          {
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                          },
                        ]}
                      >
                        <Image
                          source={{ uri: el.githubUrl }}
                          style={{
                            width: responsiveWidth(30),
                            height: responsiveHeight(10),
                            alignSelf: 'center',
                            borderRadius: responsiveWidth(1),
                          }}
                        />
                        <Text selectable style={styles.label}>
                          {`${ind + 1}) Title: ${el.title}`}
                        </Text>
                        <Text selectable style={styles.label}>
                          Description: {el.description}
                        </Text>

                        <View
                          style={{
                            justifyContent: 'center',
                            alignItems: 'center',
                            alignSelf: 'center',
                            flexDirection: 'row',
                          }}
                        >
                          <TouchableOpacity
                            onPress={() =>
                              downloadFile(el.githubUrl, el.fileName)
                            }
                          >
                            <Text
                              selectable
                              style={[styles.label, { color: 'purple' }]}
                            >
                              Download
                            </Text>
                          </TouchableOpacity>
                          {user.circle == 'admin' && (
                            <TouchableOpacity
                              style={{ paddingLeft: responsiveWidth(5) }}
                              onPress={() => showConfirmDialog(el)}
                            >
                              <Text
                                selectable
                                style={[styles.label, { color: 'red' }]}
                              >
                                Delete
                              </Text>
                            </TouchableOpacity>
                          )}
                          {user.circle == 'admin' && (
                            <TouchableOpacity
                              style={{ paddingLeft: responsiveWidth(5) }}
                              onPress={() => {
                                setEditTitle(el.title);
                                setOriginalTitle(el.title);
                                setEditDescription(el.description);
                                setOriginalDescription(el.description);
                                setEditUri(el.url);
                                setOriginalUri(el.url);
                                setEditPhotoID(el.id);
                                setShowEditView(true);
                                setDisable(true);
                                setOriginalPhotoName(el.photoName);
                              }}
                            >
                              <Text
                                selectable
                                style={[styles.label, { color: 'darkgreen' }]}
                              >
                                Edit
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    </ScrollView>
                  );
                })
              ) : (
                <Text selectable style={styles.label}>
                  File Not Found
                </Text>
              )}
              <View
                style={{
                  flexDirection: 'row',
                  marginBottom: 5,
                  alignSelf: 'center',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {firstData >= 10 && (
                  <View style={{ marginBottom: 10 }}>
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
                  <View style={{ marginBottom: 10 }}>
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
          ) : (
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'center',
              }}
            >
              <CustomTextInput
                placeholder={'Enter Title'}
                value={title}
                onChangeText={txt => setTitle(txt)}
              />
              <CustomTextInput
                placeholder={'Enter Description'}
                value={description}
                onChangeText={txt => setDescription(txt)}
              />

              {uri == '' ? (
                <TouchableOpacity
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: responsiveHeight(1),
                    flexDirection: 'row',
                  }}
                  onPress={async () => {
                    await ImagePicker.openPicker({
                      width: 4640,
                      height: 3472,
                      cropping: true,
                      mediaType: 'photo',
                    })
                      .then(image => {
                        setUri(image.path);
                        setPhotoName(
                          image.path.substring(image.path.lastIndexOf('/') + 1),
                        );
                        setFileType(image.mime);
                      })
                      .catch(async e => {
                        console.log(e);

                        await ImagePicker.clean()
                          .then(() => {
                            console.log(
                              'removed all tmp images from tmp directory',
                            );
                            setUri('');
                            setPhotoName('');
                            setFileType('');
                          })
                          .catch(e => {
                            console.log(e);
                          });
                      });
                  }}
                >
                  <View
                    style={{
                      width: responsiveWidth(12),
                      height: responsiveWidth(12),
                      borderRadius: responsiveWidth(6),
                      backgroundColor: 'deeppink',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Image
                      source={require('../assets/images/gallery.png')}
                      style={{
                        width: responsiveWidth(8),
                        height: responsiveWidth(8),
                        borderRadius: responsiveWidth(4),
                        tintColor: 'white',
                      }}
                    />
                  </View>
                  <Text
                    selectable
                    style={[styles.title, { paddingLeft: responsiveWidth(2) }]}
                  >
                    Select Photo
                  </Text>
                </TouchableOpacity>
              ) : (
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'center',
                    marginTop: responsiveHeight(1),
                  }}
                >
                  <TouchableOpacity
                    onPress={async () => {
                      await ImagePicker.openPicker({
                        width: 4640,
                        height: 3472,
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
                          setFileType(image.mime);
                        })
                        .catch(async e => {
                          console.log(e);

                          await ImagePicker.clean()
                            .then(() => {
                              console.log(
                                'removed all tmp images from tmp directory',
                              );
                              setUri('');
                              setPhotoName('');
                              setFileType('');
                            })
                            .catch(e => {
                              console.log(e);
                            });
                        });
                    }}
                  >
                    <Image
                      source={{ uri: uri }}
                      style={{
                        width: responsiveWidth(30),
                        height: responsiveHeight(10),
                        borderRadius: responsiveWidth(4),
                      }}
                    />
                  </TouchableOpacity>
                  <CustomButton title={'Upload File'} onClick={uploadFile} />
                  <CustomButton
                    title={'Cancel'}
                    color={'red'}
                    onClick={() => {
                      setUri('');
                      setPhotoName('');
                      setFileType('');
                      setAddFile(true);
                      setTitle('');
                      setDescription('');
                    }}
                  />
                </View>
              )}
            </View>
          )
        ) : (
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'center',
              marginTop: responsiveHeight(1),
            }}
          >
            <Text
              selectable
              style={[styles.label, { paddingLeft: responsiveWidth(2) }]}
            >
              Edit Title
            </Text>
            <CustomTextInput
              placeholder={'Edit Title'}
              value={editTitle}
              onChangeText={text => {
                setEditTitle(text);
                setDisable(false);
              }}
            />
            <Text
              selectable
              style={[styles.label, { paddingLeft: responsiveWidth(2) }]}
            >
              Edit Description
            </Text>
            <CustomTextInput
              placeholder={'Edit Description'}
              value={editDescription}
              onChangeText={text => {
                setEditDescription(text);
                setDisable(false);
              }}
            />
            <Text
              selectable
              style={[styles.label, { paddingLeft: responsiveWidth(2) }]}
            >
              Edit Photo
            </Text>
            <TouchableOpacity
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'center',
                marginTop: responsiveHeight(1),
              }}
              onPress={async () => {
                await ImagePicker.openPicker({
                  width: 4640,
                  height: 3472,
                  cropping: true,
                  mediaType: 'photo',
                })
                  .then(image => {
                    setEditUri(image.path);
                    setEditPhotoName(
                      image.path.substring(image.path.lastIndexOf('/') + 1),
                    );
                    setEditFileType(image.mime);
                    setDisable(false);
                  })
                  .catch(async e => {
                    console.log(e);

                    await ImagePicker.clean()
                      .then(() => {
                        console.log(
                          'removed all tmp images from tmp directory',
                        );
                        setShowEditView(false);
                        setEditUri(originalUri);
                        setEditPhotoName('');
                        setEditFileType('');
                        setAddFile(true);
                        setDisable(true);
                      })
                      .catch(e => {
                        console.log(e);
                      });
                  });
              }}
            >
              <Image
                source={{ uri: editUri }}
                style={{
                  width: responsiveWidth(30),
                  height: responsiveHeight(10),
                  borderRadius: responsiveWidth(4),
                }}
              />
            </TouchableOpacity>
            <CustomButton
              title={'Update File'}
              onClick={() => {
                updateEditPhoto();
              }}
              btnDisable={disable}
            />
            <CustomButton
              title={'Cancel'}
              color={'red'}
              onClick={() => {
                setEditUri(originalUri);
                setEditPhotoName('');
                setEditFileType('');
                setAddFile(true);
                setShowEditView(false);
                setDisable(true);
              }}
            />
          </View>
        )}
      </ScrollView>
      <Loader visible={showLoader} />
    </NavigationBarContainer>
  );
};

export default UpdateSlides;

const styles = StyleSheet.create({
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
    color: THEME_COLOR,
  },
  itemView: {
    width: responsiveWidth(92),

    alignSelf: 'center',
    borderRadius: responsiveWidth(2),
    marginTop: responsiveHeight(0.5),
    marginBottom: responsiveHeight(0.5),
    padding: responsiveWidth(4),
    shadowColor: 'black',
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  label: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(1.5),
    fontWeight: '500',
    marginTop: responsiveHeight(0.2),
    color: THEME_COLOR,
    textAlign: 'center',
  },
  btnText: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(1),
    fontWeight: '500',
    marginTop: responsiveHeight(0.2),
    color: THEME_COLOR,
    textAlign: 'center',
  },
  text: {
    fontSize: responsiveFontSize(2),
    textAlign: 'center',
    color: THEME_COLOR,
  },
});
