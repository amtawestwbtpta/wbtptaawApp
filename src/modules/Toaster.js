import Toast from 'react-native-toast-message';
export const showToast = (type, text1, text2, position) => {
  Toast.show({
    type: type,
    text1: text1,
    text2: text2,
    visibilityTime: 1500,
    position: position ? position : 'top',
    topOffset: 500,
  });
};
