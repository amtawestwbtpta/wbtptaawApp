import ReactNativeBlobUtil from 'react-native-blob-util';
import RNFS from 'react-native-fs';
import { Platform } from 'react-native';

const getMimeType = fileName => {
  const extension = fileName.split('.').pop().toLowerCase();

  const mimeTypes = {
    // Images
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    bmp: 'image/bmp',

    // Documents
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    txt: 'text/plain',
    csv: 'text/csv',
    rtf: 'application/rtf',

    // Archives
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    tar: 'application/x-tar',
    gz: 'application/gzip',

    // Audio/Video
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    mp4: 'video/mp4',
    mkv: 'video/x-matroska',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',

    // Code
    html: 'text/html',
    htm: 'text/html',
    js: 'text/javascript',
    json: 'application/json',
    css: 'text/css',
    xml: 'application/xml',
  };

  return mimeTypes[extension] || 'application/octet-stream';
};

export const downloadFile = async (url, fileName) => {
  try {
    const mimeType = getMimeType(fileName);
    const downloadsDir = Platform.select({
      android: RNFS.DownloadDirectoryPath,
      ios: RNFS.DocumentDirectoryPath,
    });

    const filePath = `${downloadsDir}/${fileName}`;

    // Android-specific download options
    const androidOptions =
      Platform.OS === 'android'
        ? {
            addAndroidDownloads: {
              useDownloadManager: true,
              notification: true,
              mediaScannable: true,
              mime: mimeType,
              title: fileName,
              description: 'File downloaded by app',
              path: filePath,
            },
          }
        : {};

    const configOptions = {
      fileCache: true,
      path: filePath,
      ...androidOptions,
    };

    const response = await ReactNativeBlobUtil.config(configOptions).fetch(
      'GET',
      url,
    );

    // For iOS, move the file from cache to permanent location
    if (Platform.OS === 'ios') {
      const tempPath = response.path();
      await RNFS.moveFile(tempPath, filePath);
      await RNFS.unlink(tempPath);
    }

    console.log(`Download complete: ${filePath}`);
    return filePath;
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
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
