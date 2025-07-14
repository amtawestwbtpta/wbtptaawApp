import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  BackHandler,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { THEME_COLOR } from '../utils/Colors';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import {
  getSubmitYearInput,
  getMonthDays,
} from '../modules/calculatefunctions';
import DateTimePickerAndroid from '@react-native-community/datetimepicker';
import { useGlobalContext } from '../context/Store';
import CustomButton from '../components/CustomButton';
import CircularProgress from 'react-native-circular-progress-indicator';

const DateCalculator = () => {
  const [showEndDate, setShowEndDate] = useState(false);
  const { setActiveTab } = useGlobalContext();
  const [retirementDate, setRetirementDate] = useState('');
  const [fontColor, setFontColor] = useState(THEME_COLOR);
  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [showData, setShowData] = useState(false);
  const calculateAgeOnSameDay = (event, selectedDate) => {
    const currentSelectedDate = selectedDate || date;
    setOpen('');
    setDate(currentSelectedDate);
    setShowData(true);
    setFontColor('black');
    calculateRetirementDate(new Date(currentSelectedDate).toLocaleDateString());
  };
  const calculateRetirementDate = input => {
    const jdate = getSubmitYearInput(input);
    const joinedYear = parseInt(jdate.substring(0, 4), 10);
    const joinedMonth = parseInt(jdate.substring(5, 7), 10);
    const currentYear = new Date().getFullYear();
    const retirementYear = joinedYear + 60;

    let retirementMonth = joinedMonth;
    let retirementDay = new Date(retirementYear, retirementMonth, 0).getDate();

    if (currentYear >= retirementYear) {
      retirementMonth = 12;
      retirementDay = new Date(retirementYear, retirementMonth, 0).getDate();
    }
    if (new Date(jdate).getDate() === 1 && retirementMonth == 1) {
      setRetirementDate(
        `${retirementDay.toString().padStart(2, '0')}-12-${retirementYear - 1}`,
      );
    } else if (new Date(jdate).getDate() === 1 && retirementMonth == 2) {
      setRetirementDate(`31-01-${retirementYear}`);
    } else if (
      new Date(jdate).getDate() === 1 &&
      retirementMonth == 3 &&
      (retirementYear / 4) % 1 === 0
    ) {
      setRetirementDate(`29-02-${retirementYear}`);
    } else if (new Date(jdate).getDate() === 1 && retirementMonth == 3) {
      setRetirementDate(`28-02-${retirementYear}`);
    } else if (new Date(jdate).getDate() === 1 && retirementMonth == 12) {
      setRetirementDate(`30-11-${retirementYear}`);
    } else if (new Date(jdate).getDate() === 1) {
      setRetirementDate(
        `${getMonthDays[retirementMonth]}-${(retirementMonth - 1)
          .toString()
          .padStart(2, '0')}-${retirementYear}`,
      );
    } else {
      setRetirementDate(
        `${retirementDay.toString().padStart(2, '0')}-${retirementMonth
          .toString()
          .padStart(2, '0')}-${retirementYear}`,
      );
    }
  };

  const [startDate, setStartDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [days, setDays] = useState('');
  const [endDate, setEndDate] = useState(null);
  const [error, setError] = useState('');
  const [resultShown, setResultShown] = useState(false);
  const [timer, setTimer] = useState(10);
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const calculateEndDate = () => {
    // Reset previous results
    setError('');
    setEndDate(null);
    setTimer(10);
    // Input validation
    if (!days || isNaN(days) || parseInt(days) <= 0) {
      setError('Please enter a valid positive number of days');
      return;
    }

    try {
      // Calculate new date
      const daysToAdd = parseInt(days);
      const resultDate = new Date(startDate);
      resultDate.setDate(resultDate.getDate() + daysToAdd - 1);
      setResultShown(true);
      setEndDate(resultDate);
      const myInterval = setInterval(() => setTimer(time => time - 1), 1000);
      setTimeout(() => {
        setResultShown(false);
        setDays('');
        setStartDate(new Date());
        clearInterval(myInterval);
      }, 10000);
    } catch (err) {
      setError('Failed to calculate date');
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
  useEffect(() => {}, [retirementDate, timer]);
  useEffect(() => {}, [timer]);
  return (
    <View style={styles.container}>
      <CustomButton
        title={showEndDate ? 'End Date Calculator' : 'Retirement Calculator'}
        onClick={() => setShowEndDate(!showEndDate)}
        color={showEndDate ? 'green' : 'blueviolet'}
      />

      {showEndDate ? (
        <View>
          <Text selectable style={styles.title}>
            Retirement Date Calculator
          </Text>
          <Text selectable style={styles.desc}>
            Select Date of Birth
          </Text>
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
                  fontSize: responsiveFontSize(2),
                  color: fontColor,
                  textAlign: 'center',
                }}
              >
                {date
                  .toISOString()
                  .split('T')[0]
                  .split('-')
                  .reverse()
                  .join('-')}
              </Text>
            </TouchableOpacity>

            {open && (
              <DateTimePickerAndroid
                testID="dateTimePicker"
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={calculateAgeOnSameDay}
              />
            )}
          </View>
          {showData ? (
            <View style={[styles.itemView, { marginTop: responsiveHeight(8) }]}>
              <Text selectable style={styles.title}>
                Retirement Date is {retirementDate}
              </Text>
            </View>
          ) : null}
        </View>
      ) : (
        <View>
          <Text selectable style={styles.title}>
            End Date Calculator
          </Text>
          {/* Start Date Picker */}
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
            onPress={() => setShowDatePicker(true)}
          >
            <Text
              selectable
              style={{
                fontSize: responsiveFontSize(2),
                color: fontColor,
                textAlign: 'center',
              }}
            >
              {startDate
                .toISOString()
                .split('T')[0]
                .split('-')
                .reverse()
                .join('-')}
            </Text>
          </TouchableOpacity>
          <Text style={styles.label}>Tap to change start date</Text>

          {/* Days Input */}
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Enter number of days"
            placeholderTextColor={THEME_COLOR}
            value={days}
            onChangeText={setDays}
          />

          {/* Calculate Button */}
          <TouchableOpacity
            style={[
              styles.calculateButton,
              { backgroundColor: !days ? 'red' : '#198754' },
            ]}
            onPress={calculateEndDate}
            disabled={!days}
          >
            <Text style={styles.buttonText}>Calculate End Date</Text>
          </TouchableOpacity>

          {/* Error Message */}
          {error ? <Text style={styles.error}>{error}</Text> : null}

          {/* Result Display */}
          {endDate && resultShown && (
            <View style={styles.itemView}>
              <Text style={styles.resultText}>
                Start Date:{' '}
                {startDate
                  .toISOString()
                  .split('T')[0]
                  .split('-')
                  .reverse()
                  .join('-')}
              </Text>
              <Text style={styles.resultText}>Days Added: {days}</Text>
              <Text style={[styles.resultText, styles.bold]}>
                End Date:{' '}
                {endDate
                  .toISOString()
                  .split('T')[0]
                  .split('-')
                  .reverse()
                  .join('-')}
              </Text>
              <CircularProgress
                value={0}
                initialValue={timer}
                progressValueColor={'cyan'}
                circleBackgroundColor={'#fff'}
                activeStrokeColor={'#2465FD'}
                activeStrokeSecondaryColor={'#C3305D'}
                inActiveStrokeColor={'white'}
                progressFormatter={value => {
                  'worklet';
                  return value.toFixed(2); // 2 decimal places
                }}
                duration={10000}
                radius={40}
              />
            </View>
          )}

          {/* Date Picker */}
          {showDatePicker && (
            <DateTimePickerAndroid
              value={startDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
            />
          )}
        </View>
      )}
    </View>
  );
};

export default DateCalculator;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#212529',
  },
  desc: {
    textAlign: 'center',
    fontSize: responsiveFontSize(2.5),
    fontWeight: '500',
    paddingLeft: responsiveWidth(5),
    paddingRight: responsiveWidth(5),
    color: THEME_COLOR,
  },

  itemView: {
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'white',
    width: responsiveWidth(90),
    borderRadius: responsiveWidth(2),
    padding: responsiveWidth(2),
    elevation: 5,
    margin: responsiveHeight(2),
  },
  label: {
    fontSize: 14,
    color: THEME_COLOR,
    textAlign: 'center',
    marginVertical: 20,
  },
  dateButton: {
    backgroundColor: '#0d6efd',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 5,
  },
  calculateButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    width: responsiveWidth(78),
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    height: 50,
    borderColor: 'skyblue',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: 'white',
    marginBottom: 20,
    width: responsiveWidth(78),
    alignSelf: 'center',
    color: THEME_COLOR,
  },
  resultContainer: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#e2e3e5',
    borderRadius: 8,
  },
  resultText: {
    fontSize: 16,
    marginBottom: 8,
    color: THEME_COLOR,
  },
  bold: {
    fontWeight: 'bold',
  },
  error: {
    color: '#dc3545',
    marginTop: 10,
    textAlign: 'center',
    fontSize: 16,
  },
});
