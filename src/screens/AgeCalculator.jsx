import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  BackHandler,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {THEME_COLOR} from '../utils/Colors';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import CustomButton from '../components/CustomButton';
import {useGlobalContext} from '../context/Store';
const AgeCalculator = () => {
  const [fontColor, setFontColor] = useState(THEME_COLOR);
  const {setActiveTab} = useGlobalContext();
  const [open, setOpen] = useState(false);
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [showData, setShowData] = useState(false);
  const [showBetweenAge, setShowBetweenAge] = useState(false);
  const [showSameDate, setShowSameDate] = useState(true);
  const [showJanDate, setShowJanDate] = useState(false);
  const [showJanuaryData, setShowJanuaryData] = useState(false);
  const [date, setDate] = useState(new Date());
  const [date1, setDate1] = useState(new Date());
  const [date2, setDate2] = useState(new Date());
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [age, setAge] = useState({years: 0, months: 0, days: 0});
  const [janDate, setJanDate] = useState(new Date());
  const [firstJanuary, setFirstJanuary] = useState(new Date());
  const firstJanuaryYear = firstJanuary.getFullYear();
  const firstJanuaryMonth = firstJanuary.getMonth() + 1;
  const january1st =
    firstJanuaryMonth < 6 ? firstJanuaryYear : firstJanuaryYear + 1;
  const [showCalculateBtn, setShowCalculateBtn] = useState(false);
  const [showSecondDate, setShowSecondDate] = useState(false);

  const calculateAgeOnSameDay = birthDate => {
    const currentDate = new Date();
    let ageYears = currentDate.getFullYear() - birthDate.getFullYear();
    let ageMonths = currentDate.getMonth() - birthDate.getMonth();
    let ageDays = currentDate.getDate() - birthDate.getDate() + 1;

    if (ageDays < 0) {
      ageMonths -= 1;
      const daysInPreviousMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        0,
      ).getDate();
      ageDays += daysInPreviousMonth;
    }

    if (ageMonths < 0) {
      ageYears -= 1;
      ageMonths += 12;
    }
    setAge({years: ageYears, months: ageMonths, days: ageDays});
    setShowData(true);
  };

  const calculateAgeBetweenDates = () => {
    const startDateObj = startDate;
    const endDateObj = endDate;

    let ageYears = endDateObj.getFullYear() - startDateObj.getFullYear();
    let ageMonths = endDateObj.getMonth() - startDateObj.getMonth();
    let ageDays = endDateObj.getDate() - startDateObj.getDate() + 1;

    if (ageDays < 0) {
      ageMonths -= 1;
      const daysInPreviousMonth = new Date(
        endDateObj.getFullYear(),
        endDateObj.getMonth(),
        0,
      ).getDate();
      ageDays += daysInPreviousMonth;
    }

    if (ageMonths < 0) {
      ageYears -= 1;
      ageMonths += 12;
    }
    setShowBetweenAge(true);
    setAge({years: ageYears, months: ageMonths, days: ageDays});
  };

  const calculateAgeOnJanDay = birthDate => {
    const currentDate = new Date(`${january1st}-01-01`);
    let ageYears = currentDate.getFullYear() - birthDate.getFullYear();
    let ageMonths = currentDate.getMonth() - birthDate.getMonth();
    let ageDays = currentDate.getDate() - birthDate.getDate() + 1;

    if (ageDays < 0) {
      ageMonths -= 1;
      const daysInPreviousMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        0,
      ).getDate();
      ageDays += daysInPreviousMonth;
    }

    if (ageMonths < 0) {
      ageYears -= 1;
      ageMonths += 12;
    }
    setAge({years: ageYears, months: ageMonths, days: ageDays});
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

  useEffect(() => {}, [age, date, date1, date2]);
  return (
    <View style={styles.container}>
      <Text selectable style={styles.title}>
        Age Calculator
      </Text>
      <View
        style={{
          marginTop: responsiveHeight(2),
          marginBottom: responsiveHeight(2),
        }}>
        {!showSameDate && (
          <CustomButton
            title={'Age as on Today'}
            color={'darkgreen'}
            onClick={() => {
              setShowSameDate(true);
              setShowJanDate(false);
              setAge({years: 0, months: 0, days: 0});
              setShowData(false);
              setShowCalculateBtn(false);
              setShowSecondDate(false);
              setShowBetweenAge(false);
              setShowJanuaryData(false);
              setDate(new Date());
              setDate1(new Date());
              setDate2(new Date());
            }}
          />
        )}
        {showSameDate && (
          <CustomButton
            title={'Age Between Given Two Dates'}
            color={'darkorchid'}
            onClick={() => {
              setShowSameDate(false);
              setShowJanDate(false);
              setAge({years: 0, months: 0, days: 0});
              setShowData(false);
              setShowCalculateBtn(false);
              setShowSecondDate(false);
              setShowBetweenAge(false);
              setShowJanuaryData(false);
              setDate(new Date());
              setDate1(new Date());
              setDate2(new Date());
            }}
          />
        )}
        {!showJanDate && (
          <CustomButton
            title={`Age As On 1st January ${january1st}`}
            onClick={() => {
              setShowSameDate(false);
              setShowJanDate(true);
            }}
          />
        )}
      </View>
      {showSameDate && !showJanDate && (
        <View>
          <Text selectable style={styles.title}>
            Age as on Today
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
              onPress={() => setOpen(true)}>
              <Text
                selectable
                style={{
                  fontSize: responsiveFontSize(1.6),
                  color: fontColor,
                  paddingLeft: 14,
                }}>
                {date.getDate() < 10 ? '0' + date.getDate() : date.getDate()}-
                {date.getMonth() + 1 < 10
                  ? `0${date.getMonth() + 1}`
                  : date.getMonth() + 1}
                -{date.getFullYear()}
              </Text>
            </TouchableOpacity>

            {/* {open && (
              <DateTimePickerAndroid
                testID="dateTimePicker"
                value={date}
                mode="date"
                // maximumDate={Date.parse(new Date())}
                minimumDate={new Date(`${date.getFullYear() + 1}-01-01`)}
                display="spinner"
                onChange={calculateDate}
              />
            )} */}
            <DateTimePickerModal
              isVisible={open}
              mode="date"
              // maximumDate={new Date()}
              // minimumDate={new Date(`01-01-${new Date().getFullYear()}`)}
              // minimumDate={new Date(`${date.getFullYear() + 1}-01-01`)}
              onConfirm={date => {
                setOpen(false);
                setDate(date);
                setFontColor('black');
                calculateAgeOnSameDay(date);
              }}
              onCancel={() => {
                setOpen(false);
                setShowData(false);
                setFontColor(THEME_COLOR);
              }}
            />
          </View>
          {showData ? (
            <View style={[styles.itemView, {marginTop: responsiveHeight(8)}]}>
              <Text selectable style={styles.title}>
                Age on Same Day:
              </Text>
              <Text selectable style={styles.title}>
                {age.years} years, {age.months} months, {age.days} days
              </Text>
            </View>
          ) : null}
        </View>
      )}

      {!showSameDate && !showJanDate && (
        <View>
          <View>
            <Text selectable style={styles.title}>
              Age Between Given Two Dates
            </Text>
            <Text selectable style={styles.desc}>
              Start Date
            </Text>
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
              onPress={() => setOpen1(true)}>
              <Text
                selectable
                style={{
                  fontSize: responsiveFontSize(1.6),
                  color: fontColor,
                  paddingLeft: 14,
                }}>
                {date1.getDate() < 10 ? '0' + date1.getDate() : date1.getDate()}
                -
                {date1.getMonth() + 1 < 10
                  ? `0${date1.getMonth() + 1}`
                  : date1.getMonth() + 1}
                -{date1.getFullYear()}
              </Text>
            </TouchableOpacity>

            {/* {open1 && (
              <DateTimePickerAndroid
                testID="dateTimePicker"
                value={date1}
                mode="date"
                maximumDate={Date.parse(new Date())}
                minimumDate={new Date(`${date.getFullYear() + 1}-01-01`)}
                display="spinner"
                onChange={calculateDate1}
              />
            )} */}
            <DateTimePickerModal
              isVisible={open1}
              mode="date"
              // maximumDate={new Date()}
              // minimumDate={new Date(`01-01-${new Date().getFullYear()}`)}
              // minimumDate={new Date(`${date.getFullYear() + 1}-01-01`)}
              onConfirm={date => {
                setOpen1(false);
                setDate1(date);
                setStartDate(date);
                setShowSecondDate(true);
                setFontColor('black');
              }}
              onCancel={() => {
                setOpen1(false);
              }}
            />
          </View>
          {showSecondDate ? (
            <View>
              <View style={{marginTop: responsiveHeight(2)}}>
                <Text selectable style={styles.desc}>
                  End Date
                </Text>
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
                  onPress={() => setOpen2(true)}>
                  <Text
                    selectable
                    style={{
                      fontSize: responsiveFontSize(1.6),
                      color: fontColor,
                      paddingLeft: 14,
                    }}>
                    {date2.getDate() < 10
                      ? '0' + date2.getDate()
                      : date2.getDate()}
                    -
                    {date2.getMonth() + 1 < 10
                      ? `0${date2.getMonth() + 1}`
                      : date2.getMonth() + 1}
                    -{date2.getFullYear()}
                  </Text>
                </TouchableOpacity>

                {/* {open2 && (
                  <DateTimePickerAndroid
                    testID="dateTimePicker"
                    value={date2}
                    mode="date"
                    // maximumDate={Date.parse(new Date())}
                    minimumDate={Date.parse(date1)}
                    display="spinner"
                    onChange={calculateDate2}
                  />
                )} */}
                <DateTimePickerModal
                  isVisible={open2}
                  mode="date"
                  // maximumDate={new Date()}
                  // minimumDate={new Date(`01-01-${new Date().getFullYear()}`)}
                  minimumDate={Date.parse(date1)}
                  onConfirm={date => {
                    setOpen2(false);
                    setDate2(date);
                    setEndDate(date);
                    setShowCalculateBtn(true);
                    setFontColor('black');
                  }}
                  onCancel={() => {
                    setOpen2(false);
                  }}
                />
              </View>
              {showCalculateBtn && (
                <View style={{marginTop: responsiveHeight(2)}}>
                  <CustomButton
                    title={'Calculate Age'}
                    color={'darkorchid'}
                    onClick={calculateAgeBetweenDates}
                  />
                </View>
              )}
              {showBetweenAge ? (
                <View
                  style={[styles.itemView, {marginTop: responsiveHeight(4)}]}>
                  <Text selectable style={styles.title}>
                    Age on Same Day:
                  </Text>
                  <Text selectable style={styles.title}>
                    {age.years} years, {age.months} months, {age.days} days
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
      )}
      {showJanDate && (
        <View>
          <Text selectable style={styles.title}>
            Age as on First January {january1st}
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
              onPress={() => setOpen(true)}>
              <Text
                selectable
                style={{
                  fontSize: responsiveFontSize(1.6),
                  color: fontColor,
                  paddingLeft: 14,
                }}>
                {janDate.getDate() < 10
                  ? '0' + janDate.getDate()
                  : janDate.getDate()}
                -
                {janDate.getMonth() + 1 < 10
                  ? `0${janDate.getMonth() + 1}`
                  : janDate.getMonth() + 1}
                -{janDate.getFullYear()}
              </Text>
            </TouchableOpacity>

            {/* {open && (
              <DateTimePickerAndroid
                testID="dateTimePicker"
                value={date}
                mode="date"
                maximumDate={new Date(`${janDate.getFullYear() + 1}-01-01`)}
                display="spinner"
                onChange={calculateJanDate}
              />
            )} */}
            <DateTimePickerModal
              isVisible={open}
              mode="date"
              maximumDate={new Date(`${firstJanuary.getFullYear() + 1}-01-01`)}
              onConfirm={date => {
                setOpen(false);
                setJanDate(date);
                setShowJanuaryData(true);
                setFontColor('black');
                calculateAgeOnJanDay(date);
              }}
              onCancel={() => {
                setOpen(false);
                setFontColor(THEME_COLOR);
                setShowJanuaryData(false);
              }}
            />
          </View>
          {showJanuaryData ? (
            <View style={[styles.itemView, {marginTop: responsiveHeight(8)}]}>
              <Text selectable style={styles.title}>
                Age as on First January {january1st}
              </Text>
              <Text selectable style={styles.title}>
                {age.years} years, {age.months} months, {age.days} days
              </Text>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
};

export default AgeCalculator;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    textAlign: 'center',
    fontSize: responsiveFontSize(3),
    fontWeight: '700',
    paddingLeft: responsiveWidth(5),
    paddingRight: responsiveWidth(5),
    color: THEME_COLOR,
  },
  desc: {
    textAlign: 'center',
    fontSize: responsiveFontSize(2.5),
    fontWeight: '500',
    paddingLeft: responsiveWidth(5),
    paddingRight: responsiveWidth(5),
    color: THEME_COLOR,
  },
  text: {
    textAlign: 'center',
    fontSize: responsiveFontSize(2),
    fontWeight: '500',
    paddingLeft: responsiveWidth(5),
    paddingRight: responsiveWidth(5),
    color: THEME_COLOR,
  },
  dropDownnSelector: {
    width: responsiveWidth(90),
    height: responsiveHeight(7),
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: THEME_COLOR,
    alignSelf: 'center',
    marginTop: responsiveHeight(15),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: responsiveWidth(5),
    paddingRight: responsiveWidth(5),
  },
  dropDowArea: {
    width: responsiveWidth(80),

    borderRadius: responsiveWidth(2),
    marginTop: responsiveHeight(1),
    backgroundColor: '#fff',
    elevation: 5,
    alignSelf: 'center',
    marginBottom: responsiveHeight(10),
  },
  AdminName: {
    width: responsiveWidth(80),
    height: responsiveHeight(7),
    borderBottomWidth: 0.2,
    borderBottomColor: THEME_COLOR,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  dropDownText: {
    fontSize: responsiveFontSize(2),
    color: THEME_COLOR,
    alignSelf: 'center',
    textAlign: 'center',
    fontFamily: 'kalpurush',
  },
  membership: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(3),
    fontWeight: '500',
    padding: responsiveWidth(2),
    color: 'darkgreen',
    marginTop: responsiveHeight(1),
    textAlign: 'center',
    fontFamily: 'kalpurush',
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
    margin: responsiveWidth(1),
  },
  label: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(1.5),
    fontWeight: '500',
    marginTop: responsiveHeight(0.2),
    color: THEME_COLOR,
    textAlign: 'center',
  },
});
