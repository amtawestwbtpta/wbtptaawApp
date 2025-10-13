import {
  FlatList,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import NavigationBarContainer from '../navigation/NavigationBarContainer';
import { useGlobalContext } from '../context/Store';
import { getCollection } from '../firebase/firestoreHelper';
import axios from 'axios';
import { IndianFormat, randBetween } from '../modules/calculatefunctions';
import Loader from '../components/Loader';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import { ColorsArray, THEME_COLOR } from '../utils/Colors';
import CustomButton from '../components/CustomButton';
import CustomTextInput from '../components/CustomTextInput';
import { DownloadWeb } from '../modules/constants';

export default function ITReloaded() {
  const { teachersState, setTeachersState, setTeacherUpdateTime, state } =
    useGlobalContext();
  const user = state.USER;
  const [salary, setSalary] = useState([]);
  const [loader, setLoader] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [search, setSearch] = useState('');
  const [schSearch, setSchSearch] = useState('');
  const [filterClicked, setFilterClicked] = useState(false);
  const yearArray = [2024, 2025, 2026];
  const [showYearSelection, setShowYearSelection] = useState(true);
  const [finYear, setFinYear] = useState('');
  const getTeacherStateData = async () => {
    setLoader(true);
    await getCollection('teachers')
      .then(data => {
        const newData = data.sort((a, b) => {
          // First, compare the "school" keys
          if (a.school < b.school) {
            return -1;
          }
          if (a.school > b.school) {
            return 1;
          }
          // If "school" keys are equal, compare the "rank" keys
          return a.rank - b.rank;
        });
        setTeachersState(newData);

        setTeacherUpdateTime(Date.now());
        setLoader(false);
      })
      .catch(e => {
        console.log('error', e);
        setLoader(false);
      });
  };
  const getSalary = async year => {
    setLoader(true);
    const respronse = await axios.get(
      `https://raw.githubusercontent.com/amtawestwbtpta/salaryRemodified/main/Salary-${year}.json`,
    );
    const data = respronse.data;

    const thisTeacher = data?.filter(teacher => teacher?.id === user.id);
    setSalary(user.circle === 'admin' ? data : thisTeacher);
    setFilteredData(user.circle === 'admin' ? data : thisTeacher);
    setLoader(false);
  };

  useEffect(() => {
    if (teachersState.length === 0) {
      getTeacherStateData();
    }
  }, []);
  useEffect(() => {}, [salary, filteredData]);
  return (
    <NavigationBarContainer>
      {loader ? (
        <Loader />
      ) : showYearSelection ? (
        <Modal animationType="slide" visible={showYearSelection} transparent>
          <View style={styles.modalView}>
            <View style={styles.mainView}>
              <Text style={styles.title}>Select Financial Year</Text>
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  alignSelf: 'center',
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  marginVertical: responsiveHeight(2),
                  gap: responsiveWidth(2),
                }}
              >
                {yearArray.slice(0, yearArray.length - 1).map((year, index) => (
                  <CustomButton
                    size={'medium'}
                    fontSize={responsiveFontSize(1.8)}
                    title={`${yearArray[index]}-${yearArray[index + 1]}`}
                    color={ColorsArray[index]}
                    onClick={() => {
                      const selectedFinYear = `${yearArray[index]}-${yearArray[index + 1]}`;
                      setFinYear(selectedFinYear);
                      setShowYearSelection(false);
                      const yearParts = selectedFinYear.split('-');
                      const startYear = parseInt(yearParts[0]);
                      getSalary(startYear);
                    }}
                    key={index}
                  />
                ))}
              </View>
            </View>
          </View>
        </Modal>
      ) : (
        <ScrollView
          contentContainerStyle={{
            gap: responsiveHeight(2),
          }}
          showsVerticalScrollIndicator={false}
          style={{ backgroundColor: 'white' }}
        >
          {user.circle === 'admin' && (
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'center',
                flexDirection: 'row',
                flexWrap: 'wrap',
                marginVertical: responsiveHeight(2),
                gap: responsiveWidth(2),
              }}
            >
              <CustomButton
                size={'medium'}
                fontSize={responsiveFontSize(1.4)}
                title={'Above Five Lakh'}
                color={'royalblue'}
                onClick={() => {
                  const fData = filteredData.filter(
                    salary => salary?.AllGross >= 500000,
                  );
                  if (fData.length !== 0) {
                    setFilteredData(fData);
                  } else {
                    setFilteredData(
                      salary.filter(salary => salary?.AllGross >= 500000),
                    );
                  }
                  setFilterClicked(true);
                }}
              />
              <CustomButton
                size={'medium'}
                fontSize={responsiveFontSize(1.4)}
                title={'Below Five Lakh'}
                color={'deeppink'}
                onClick={() => {
                  const fData = filteredData.filter(
                    salary => salary?.AllGross <= 500000,
                  );
                  if (fData.length !== 0) {
                    setFilteredData(fData);
                  } else {
                    setFilteredData(
                      salary.filter(salary => salary?.AllGross <= 500000),
                    );
                  }
                  setFilterClicked(true);
                }}
              />
              <CustomButton
                size={'medium'}
                fontSize={responsiveFontSize(1.4)}
                title={'Taxable Teachers'}
                color={'darkorange'}
                onClick={() => {
                  const fData = filteredData.filter(
                    salary => salary?.NetTax !== 0,
                  );
                  if (fData.length !== 0) {
                    setFilteredData(fData);
                  } else {
                    setFilteredData(
                      salary.filter(salary => salary?.NetTax !== 0),
                    );
                  }
                  setFilterClicked(true);
                }}
              />
              <CustomButton
                size={'medium'}
                fontSize={responsiveFontSize(1.4)}
                title={'Only WBTPTA Teachers'}
                color={'darkgreen'}
                onClick={() => {
                  const fData = filteredData.filter(
                    salary => salary?.association === 'WBTPTA',
                  );
                  if (fData.length !== 0) {
                    setFilteredData(fData);
                  } else {
                    setFilteredData(
                      salary.filter(salary => salary?.association === 'WBTPTA'),
                    );
                  }
                  setFilterClicked(true);
                }}
              />
              {salary.length !== filteredData.length && (
                <CustomButton
                  size={'medium'}
                  fontSize={responsiveFontSize(1.4)}
                  title={'Clar Filter'}
                  color={'red'}
                  onClick={() => {
                    setFilteredData(salary);
                    setFilterClicked(false);
                    setSearch('');
                    setSchSearch('');
                  }}
                />
              )}
            </View>
          )}
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'center',
              marginBottom: responsiveHeight(4),
            }}
          >
            <CustomButton
              size={'medium'}
              fontSize={responsiveFontSize(1.4)}
              title={'Change Financial Year'}
              color={'blueviolet'}
              onClick={() => {
                setShowYearSelection(true);
              }}
            />
          </View>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'center',
              marginVertical: responsiveHeight(5),
            }}
          >
            {user.circle === 'admin' ? (
              <View>
                <Text style={styles.title}>All Teacher IT Data</Text>
                <CustomTextInput
                  title="Search by Teacher"
                  placeholder="Search by Teacher"
                  value={search}
                  onChangeText={e => {
                    setSearch(e);
                    setFilteredData(
                      salary.filter(el =>
                        el.tname.toLowerCase().includes(e.toLowerCase()),
                      ),
                    );
                  }}
                />
                <CustomTextInput
                  title="Search by School"
                  placeholder="Search by School"
                  value={schSearch}
                  onChangeText={e => {
                    setSchSearch(e);
                    setFilteredData(
                      salary.filter(el =>
                        el.school.toLowerCase().includes(e.toLowerCase()),
                      ),
                    );
                  }}
                />
              </View>
            ) : (
              <Text style={styles.title}>{user.tname}'s IT Data</Text>
            )}
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'center',
                flexWrap: 'wrap',
                marginVertical: responsiveHeight(2),
                gap: responsiveWidth(2),
              }}
            >
              <FlatList
                data={filteredData}
                renderItem={({ item, index }) =>
                  item?.AllGross !== 0 &&
                  teachersState.filter(teacher => teacher.id === item.id)
                    .length > 0 && (
                    <View style={styles.dataView} key={index}>
                      <Text style={styles.label}>
                        SL:{' '}
                        {filterClicked
                          ? index + 1
                          : salary.findIndex(i => i.id === item.id) + 1}
                      </Text>
                      <Text style={styles.label}>
                        Teacher Name: {item.tname}
                      </Text>
                      <Text style={styles.label}>
                        School Name: {item.school}
                      </Text>
                      <Text style={styles.label}>
                        Gross Salary: {`₹ ${IndianFormat(item?.AllGross)}`}
                      </Text>
                      <Text style={styles.label}>
                        Gross 80C:{' '}
                        {item?.limit80C !== 0
                          ? `₹ ${IndianFormat(item?.limit80C)}`
                          : 'NIL'}
                      </Text>
                      <Text style={styles.label}>
                        Gross 80D:{' '}
                        {item?.Gross80D !== 0
                          ? `₹ ${IndianFormat(item?.Gross80D)}`
                          : 'NIL'}
                      </Text>
                      <Text style={styles.label}>
                        Taxable Income:{' '}
                        {item?.TaxableIncome !== 0
                          ? `₹ ${IndianFormat(item?.TaxableIncome)}`
                          : 'NIL'}
                      </Text>
                      <Text style={styles.label}>
                        Net Tax OLD:{' '}
                        {item?.NetTax !== 0
                          ? `₹ ${IndianFormat(item?.NetTax)}`
                          : 'NIL'}
                      </Text>
                      <Text style={styles.label}>
                        Net Tax NEW:{' '}
                        {item?.AddedEduCess !== 0
                          ? `₹ ${IndianFormat(item?.AddedEduCess)}`
                          : 'NIL'}
                      </Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'center',
                          alignItems: 'center',
                          alignSelf: 'center',
                          flexWrap: 'wrap',
                          marginVertical: responsiveHeight(2),
                          gap: responsiveWidth(2),
                        }}
                      >
                        <CustomButton
                          title={'Download New Statement'}
                          size={'medium'}
                          fontSize={responsiveFontSize(1.5)}
                          color={'chocolate'}
                          onClick={async () => {
                            const pan = teachersState.filter(
                              teacher => teacher.id === item.id,
                            )[0].pan;
                            const url = `${DownloadWeb}/DownloadNewITStatement?data=${JSON.stringify(
                              { pan, finYear },
                            )}`;
                            try {
                              await Linking.openURL(url);
                            } catch (error) {
                              console.log(error);
                            }
                          }}
                        />
                        <CustomButton
                          title={'Download Old Statement'}
                          size={'medium'}
                          fontSize={responsiveFontSize(1.5)}
                          color={'blueviolet'}
                          onClick={async () => {
                            const pan = teachersState.filter(
                              teacher => teacher.id === item.id,
                            )[0].pan;
                            const url = `${DownloadWeb}/DownloadOldITStatement?data=${JSON.stringify(
                              { pan, finYear },
                            )}`;
                            try {
                              await Linking.openURL(url);
                            } catch (error) {
                              console.log(error);
                            }
                          }}
                        />
                      </View>
                    </View>
                  )
                }
              />
            </View>
          </View>
        </ScrollView>
      )}
    </NavigationBarContainer>
  );
}

const styles = StyleSheet.create({
  modalView: {
    flex: 1,
    width: responsiveWidth(90),
    padding: responsiveHeight(2),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  mainView: {
    width: responsiveWidth(90),
    padding: responsiveHeight(2),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: 'white',
  },
  title: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(2),
    fontWeight: '500',
    marginTop: responsiveHeight(3),
    color: THEME_COLOR,
    textAlign: 'center',
    padding: 5,
  },
  label: {
    alignSelf: 'center',
    fontSize: responsiveFontSize(2),
    fontWeight: '500',
    margin: responsiveHeight(1),
    color: THEME_COLOR,
    textAlign: 'center',
  },
  dataView: {
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
    backgroundColor: 'powderblue',
    marginVertical: responsiveHeight(1),
    borderRadius: 10,
    padding: 10,
    width: responsiveWidth(90),
    elevation: 5,
  },
});
