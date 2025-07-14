import RazorpayCheckout from 'react-native-razorpay';
import {Alert} from 'react-native';
import {RAZORPAY_KEY} from './constants';
export const razorpayPayment = async (name, amount) => {
  var options = {
    description: 'Credits towards consultation',
    image: 'https://i.imgur.com/3g7nmJC.png',
    currency: 'INR',
    key: RAZORPAY_KEY, // Your api key
    amount: parseFloat(amount) * 100,
    name: name,
    prefill: {
      email: 'void@razorpay.com',
      contact: '9191919191',
      name: 'Razorpay Software',
    },
    theme: {color: '#F37254'},
  };
  let data = await RazorpayCheckout.open(options);
  if (data) {
    return data.razorpay_payment_id;
  } else {
    return false;
  }
};
