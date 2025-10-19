import { myAPIKey, githubUsername } from './constants';
import { decryptData } from './encryption';
import RNFS from 'react-native-fs';
const token = decryptData(myAPIKey);

export const viewGithubFiles = async repoName => {
  const res = await fetch(
    `https://api.github.com/repos/${githubUsername}/${repoName}/contents?ref='main'`,
    {
      headers: { Authorization: `token ${token}` },
    },
  );

  if (!res.ok) {
    return [];
  } else {
    const files = await res.json();
    return files;
  }
};
const resolveFilePath = async (uri, name) => {
  if (uri.startsWith('content://')) {
    // Copy content URI into app's cache dir
    const destPath = `${RNFS.CachesDirectoryPath}/${Date.now()}_${name}`;
    try {
      await RNFS.copyFile(uri, destPath);
      return destPath;
    } catch (err) {
      console.warn('⚠️ RNFS.copyFile failed, fallback to blob fetch', err);
      // Fallback: try fetching content URI as blob and writing manually
      const response = await fetch(uri);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await RNFS.writeFile(destPath, buffer.toString('base64'), 'base64');
      return destPath;
    }
  } else if (uri.startsWith('file://')) {
    return uri.replace('file://', '');
  } else {
    throw new Error(`Unsupported URI format: ${uri}`);
  }
};
export const uploadFileToGithub = async (uploadFile, fileName, repoName) => {
  // Suppose uploadFile.uri looks like "file:///storage/emulated/0/Download/test.pdf"
  const filePath = await resolveFilePath(uploadFile, fileName);
  console.log('filePath', filePath);
  // Read the file as base64
  const content = await RNFS.readFile(filePath, 'base64');

  const url = `https://api.github.com/repos/${githubUsername}/${repoName}/contents/${fileName}`;
  let sha = null;

  try {
    const check = await fetch(url, {
      headers: { Authorization: `token ${token}` },
    });

    if (check.ok) {
      const data = await check.json();
      sha = data.sha;
    }
  } catch (error) {
    console.log('Error checking file existence:', error);
  }

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: sha
        ? 'Edit file via React Native app'
        : 'Upload file via React Native app',
      branch: 'main',
      content: content,
      sha: sha || undefined,
    }),
  });

  const data = await res.json();
  const download_url = data?.content?.download_url;
  return download_url;
};

export const deleteFileFromGithub = async (fileName, repoName) => {
  const url = `https://api.github.com/repos/${githubUsername}/${repoName}/contents/${fileName}`;
  let data = { sha: null };
  try {
    const check = await fetch(url, {
      headers: { Authorization: `token ${token}` },
    });
    if (!check.ok) {
      return false;
    }
    data = await check.json();
  } catch (error) {
    console.log(error);
    return false;
  }

  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: 'Delete file via Next.js app',
      branch: 'main',
      sha: data.sha,
    }),
  });
  if (!res.ok) {
    return false;
  } else {
    return true;
  }
};
