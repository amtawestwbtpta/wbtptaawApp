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

export const uploadFileToGithub = async (uploadFile, fileName, repoName) => {
  // Suppose uploadFile.uri looks like "file:///storage/emulated/0/Download/test.pdf"
  const filePath = uploadFile.startsWith('file://')
    ? uploadFile.replace('file://', '')
    : uploadFile.replace('content://', '');

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
