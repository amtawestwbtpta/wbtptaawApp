import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  BackHandler,
  Alert,
  Modal,
  Linking,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import storage from '@react-native-firebase/storage';
import { THEME_COLOR } from '../utils/Colors';
import CustomButton from '../components/CustomButton';
import { useIsFocused } from '@react-navigation/native';
import Loader from '../components/Loader';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import AnimatedSeacrch from '../components/AnimatedSeacrch';
import { downloadFile } from '../modules/downloadFile';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { pick, types } from '@react-native-documents/picker';
import uuid from 'react-native-uuid';
import CustomTextInput from '../components/CustomTextInput';
import { useGlobalContext } from '../context/Store';
import { AndroidAppLink } from '../modules/constants';
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
const Downloads = () => {
  const isFocused = useIsFocused();

  const docId = uuid.v4().split('-')[0];
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [showLoader, setShowLoader] = useState(false);
  const [fileName, setFileName] = useState('');
  const [addFile, setAddFile] = useState(true);
  const { state, setActiveTab } = useGlobalContext();
  const user = state.USER;
  const [visible, setVisible] = useState(false);
  const [fileType, setFileType] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [documentUri, setDocumentUri] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [originalFileName, setOriginalFileName] = useState('');
  const [editFileName, setEditFileName] = useState('');
  const [editFileId, setEditFileId] = useState('');
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

  const getData = async () => {
    setShowLoader(true);
    await getCollection('downloads')
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
  const uploadFile = async () => {
    const githubUrl = await uploadFileToGithub(
      pathToFile,
      documentName,
      'files',
    );
    setShowLoader(true);
    const reference = storage().ref(`/files/${documentName}`);
    const pathToFile = documentUri;

    // uploads file
    await reference
      .putFile(pathToFile)
      .then(task => console.log(task))
      .catch(e => console.log(e));
    let url = await storage().ref(`/files/${documentName}`).getDownloadURL();
    await setDocument('downloads', docId, {
      id: docId,
      date: Date.now(),
      addedBy: user.tname,
      url: url,
      githubUrl,
      fileName: uploadedFileName,
      fileType: fileType,
      originalFileName: originalFileName,
    })
      .then(async () => {
        setShowLoader(false);
        showToast('success', 'File Uploaded Successfully!');
        getData();
        setFileType('');
        setDocumentName('');
        setDocumentUri('');
        setAddFile(true);
        setUploadedFileName('');
        setOriginalFileName('');
      })
      .catch(e => {
        setShowLoader(false);
        showToast('error', 'File Addition Failed!');
        setVisible(false);
        console.log(e);
      });
  };
  const updateData = async () => {
    setShowLoader(true);
    await updateDocument('downloads', editFileId, {
      fileName: editFileName,
    })
      .then(async () => {
        setShowLoader(false);
        showToast('success', 'File Name Changed Successfully!');
        getData();
        setEditFileName('');
        setEditFileId('');
        setVisible(false);
      })
      .catch(e => {
        setShowLoader(false);
        showToast('error', 'File Name Change Failed!');
        setVisible(false);
        console.log(e);
      });
  };
  const showConfirmDialog = el => {
    return Alert.alert('Hold On!', 'Are You Sure To Delete This File?', [
      // The "No" button
      // Does nothing but dismiss the dialog when tapped
      {
        text: 'No',
        onPress: () => showToast('success', 'File Not Deleted!'),
      },
      // The "Yes" button
      {
        text: 'Yes',
        onPress: () => {
          delFile(el);
        },
      },
    ]);
  };
  const delFile = async item => {
    setShowLoader(true);
    try {
      const isDelFromGithub = await deleteFileFromGithub(
        item.originalFileName,
        'files',
      );
      if (isDelFromGithub) {
        showToast('success', 'File deleted successfully From Github!');
      } else {
        showToast('error', 'Error Deleting File From Github!');
      }
      await storage()
        .ref('/files/' + item.originalFileName)
        .delete()
        .then(async () => {
          await deleteDocument('downloads', item.id)
            .then(() => {
              setShowLoader(false);
              showToast('success', 'File Deleted Successfully!');
              getData();
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

  useEffect(() => {
    getData();
  }, [isFocused]);
  useEffect(() => {}, [uploadedFileName]);
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
    <View style={{ flex: 1 }}>
      <ScrollView>
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
              {!addFile ? 'Hide Upload File' : 'Upload New File'}
            </Text>
          </TouchableOpacity>
        ) : null}

        {addFile ? (
          <View>
            <Text
              selectable
              style={[styles.title, { marginBottom: responsiveHeight(1) }]}
            >
              Downloads
            </Text>
            <View style={{ marginBottom: responsiveHeight(1) }}>
              <AnimatedSeacrch
                value={fileName}
                placeholder={'Serch File Name'}
                onChangeText={text => {
                  setFileName(text);
                  let newData = data.filter(el => {
                    return el.fileName.toLowerCase().match(text.toLowerCase());
                  });

                  setFilteredData(newData);
                }}
                func={() => {
                  setFilteredData(data);
                  setFileName('');
                  setFirstData(0);
                }}
              />
            </View>
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
            <View
              style={[
                styles.itemView,
                {
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                },
              ]}
            >
              <Text selectable style={styles.label}>
                1) Our Android App
              </Text>
              <Text selectable style={styles.label}>
                Format: APK
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
                  onPress={async () => {
                    const supported = await Linking.canOpenURL(AndroidAppLink); //To check if URL is supported or not.
                    if (supported) {
                      await Linking.openURL(AndroidAppLink); // It will open the URL on browser.
                    }
                  }}
                >
                  <Text selectable style={[styles.label, { color: 'purple' }]}>
                    Download
                  </Text>
                </TouchableOpacity>
              </View>
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
                      <Text selectable style={styles.label}>
                        {`${ind + 2}) ${el.fileName}`}
                      </Text>
                      <Text selectable style={styles.label}>
                        Format:{' '}
                        {el.fileType === 'application/pdf'
                          ? 'PDF'
                          : el.fileType === 'application/msword'
                            ? 'WORD'
                            : el.fileType ===
                                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                              ? 'WORD'
                              : el.fileType ===
                                  'application/vnd.openxmlformats-officedocument.presentationml.presentation'
                                ? 'POWERPOINT'
                                : el.fileType === 'application/vnd.ms-excel'
                                  ? 'EXCEL'
                                  : el.fileType ===
                                      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                                    ? 'EXCEL'
                                    : el.fileType ===
                                        'application/vnd.ms-excel.sheet.macroEnabled.12'
                                      ? 'EXCEL'
                                      : el.fileType ===
                                          'application/vnd.ms-powerpoint'
                                        ? 'EXCEL'
                                        : el.fileType === 'application/zip'
                                          ? 'ZIP'
                                          : el.fileType ===
                                              'application/vnd.rar'
                                            ? 'RAR'
                                            : el.fileType === 'text/csv'
                                              ? 'CSV'
                                              : el.fileType ===
                                                  'application/vnd.openxmlformats-officedocument.presentationml.presentation'
                                                ? 'POWERPOINT'
                                                : ''}
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
                          <View
                            style={{
                              justifyContent: 'center',
                              alignItems: 'center',
                              alignSelf: 'center',
                              flexDirection: 'row',
                            }}
                          >
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
                            <TouchableOpacity
                              style={{ paddingLeft: responsiveWidth(5) }}
                              onPress={() => {
                                setVisible(true);
                                setEditFileName(el.fileName);
                                setEditFileId(el.id);
                              }}
                            >
                              <Text
                                selectable
                                style={[styles.label, { color: 'blueviolet' }]}
                              >
                                Edit File Name
                              </Text>
                            </TouchableOpacity>
                          </View>
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
          <TouchableOpacity
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'center',
            }}
            onPress={async () => {
              try {
                const [res] = await pick({
                  presentationStyle: 'fullScreen',
                  type: [types.allFiles],
                });
                let fileCopyUri = res.uri;
                const filename = res.name;
                setFileType(res.type);
                setDocumentName(filename);
                setOriginalFileName(filename);
                setDocumentUri(fileCopyUri);
                setUploadedFileName(fileName);
              } catch (e) {
                if (DocumentPicker.isCancel(e)) {
                  console.log('User Cancelled The Upload', e);
                } else {
                  console.log(e);
                }
              }
            }}
          >
            {documentUri == '' ? (
              <View
                style={{
                  width: responsiveWidth(80),
                  height: responsiveHeight(6),
                  borderRadius: responsiveWidth(2),
                  borderWidth: responsiveWidth(0.1),
                  borderColor: THEME_COLOR,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'white',
                  elevation: 5,
                }}
              >
                <Text
                  selectable
                  style={{
                    fontSize: responsiveFontSize(2),
                    fontWeight: '600',
                    color: THEME_COLOR,
                  }}
                >
                  Select File
                </Text>
              </View>
            ) : (
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  alignSelf: 'center',
                  marginTop: responsiveHeight(2),
                }}
              >
                <TouchableOpacity
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'center',
                    flexDirection: 'row',
                  }}
                  onPress={async () => {
                    try {
                      const [res] = await pick({
                        presentationStyle: 'fullScreen',
                        type: [types.allFiles],
                      });
                      let fileCopyUri = res.uri;
                      const filename = res.name;
                      setFileType(res.type);
                      setDocumentName(filename);
                      setOriginalFileName(filename);
                      setDocumentUri(fileCopyUri);
                      setUploadedFileName(fileName);
                    } catch (e) {
                      if (DocumentPicker.isCancel(e)) {
                        console.log('User Cancelled The Upload', e);
                      } else {
                        console.log(e);
                      }
                    }
                  }}
                >
                  <View
                    style={{
                      width: responsiveWidth(12),
                      height: responsiveWidth(12),
                      borderRadius: responsiveWidth(6),
                      backgroundColor: 'royalblue',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Ionicons name="document" color={'white'} size={20} />
                  </View>
                  <Text
                    selectable
                    style={[styles.label, { paddingLeft: responsiveWidth(2) }]}
                  >
                    {documentName}
                  </Text>
                </TouchableOpacity>
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'center',
                    margin: responsiveHeight(1),
                  }}
                >
                  <CustomTextInput
                    title={'Enter File Name'}
                    color={'blue'}
                    value={uploadedFileName}
                    onChangeText={text => {
                      setUploadedFileName(text);
                    }}
                  />
                </View>
                <CustomButton
                  title={'Upload File'}
                  onClick={() => {
                    if (uploadedFileName !== '') {
                      uploadFile();
                    } else {
                      showToast('error', 'Please Enter File Name');
                    }
                  }}
                />
                <CustomButton
                  title={'Cancel'}
                  color={'red'}
                  onClick={() => {
                    setFileType('');
                    setDocumentName('');
                    setDocumentUri('');
                    setAddFile(true);
                    setUploadedFileName('');
                    setOriginalFileName('');
                  }}
                />
              </View>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
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
              Edit File Name
            </Text>

            <CustomTextInput
              placeholder={'Edit Title'}
              value={editFileName}
              onChangeText={text => {
                setEditFileName(text);
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
              onClick={() => {
                setVisible(false);
                setEditFileName('');
                setEditFileId('');
              }}
            />
          </View>
        </View>
      </Modal>
      <Loader visible={showLoader} />
    </View>
  );
};

export default Downloads;

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
  titleName: {
    textAlign: 'center',
    fontSize: responsiveFontSize(2.6),
    fontWeight: '700',
    color: THEME_COLOR,
    paddingLeft: responsiveWidth(2),
  },
  itemView: {
    width: responsiveWidth(92),

    alignSelf: 'center',
    borderRadius: responsiveWidth(2),
    marginTop: responsiveHeight(0.5),
    marginBottom: responsiveHeight(0.5),
    padding: responsiveWidth(2),
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
  modalView: {
    width: responsiveWidth(100),
    height: responsiveHeight(100),
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
