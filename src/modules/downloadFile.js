import ReactNativeBlobUtil from 'react-native-blob-util';
import RNFS from 'react-native-fs';
export const downloadFile = async (url, fileName) => {
  const {config, fs} = ReactNativeBlobUtil;

  return config({
    // add this option that makes response data to be stored as a file,
    // this is much more performant.
    fileCache: true,
    addAndroidDownloads: {
      useDownloadManager: true,
      notification: true,
      mediaScannable: true,
      path: RNFS.DownloadDirectoryPath + '/' + fileName,
      // path: downloads + '../../../../downloads' + fileName,
    },
  })
    .fetch('GET', url)
    .then(res => {
      // the temp file path
      console.log('The file saved to ', res.path());
    })
    .catch(err => {
      console.log(err);
    });
};
export const createDownloadLink = async (data, fileName) => {
  // Convert the array to a JSON string
  const jsonString = JSON.stringify(data, null, 2);

  // Create a temporary file path
  const tempFilePath = `${RNFS.TemporaryDirectoryPath}/data.json`;

  try {
    // Write the JSON string to the temporary file
    await RNFS.writeFile(tempFilePath, jsonString, 'utf8');

    // Now download the file using the downloadFile function
    await downloadFile(tempFilePath, `${fileName}.json`);
    console.log('Download', 'File is being downloaded...');
  } catch (error) {
    console.log('Error', 'Failed to download the file: ' + error.message);
  }
};
