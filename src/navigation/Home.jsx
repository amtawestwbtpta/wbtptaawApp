import React, { useEffect } from 'react';

import { useGlobalContext } from '../context/Store';
import Dashboard from '../screens/Dashboard';
import { getCollection } from '../firebase/firestoreHelper';
import { showToast } from '../modules/Toaster';
import NavigationBarContainer from '../navigation/NavigationBarContainer';
import Notice from '../screens/Notice';
import Memo from '../screens/Memo';
import TeachersDetails from '../screens/TeachersDetails';
import StudentTeacherData from '../screens/StudentTeacherData';
import GPWiseSchoolData from '../screens/GPWiseSchoolData';
import DateCalculator from '../screens/DateCalculator';
import AgeCalculator from '../screens/AgeCalculator';
import RegComplain from '../screens/RegComplain';
import ChangeUP from '../screens/ChangeUP';
import Downloads from '../screens/Downloads';
const Home = () => {
  const {
    activeTab,
    slideState,
    setSlideState,
    slideUpdateTime,
    setSlideUpdateTime,
    questionRateState,
    setQuestionRateState,
    questionRateUpdateTime,
    setQuestionRateUpdateTime,
  } = useGlobalContext();

  const getSlides = async () => {
    try {
      const data = await getCollection('slides');
      setSlideState(data);
    } catch (e) {
      showToast('error', e);
    }
  };
  const getData = async () => {
    const difference = (slideUpdateTime - Date.now()) / 1000 / 60 / 15;
    if (difference >= 1 || slideState.length === 0) {
      setSlideUpdateTime(Date.now());
      getSlides();
    } else {
    }
    const questionRateDifference =
      (Date.now() - questionRateUpdateTime) / 1000 / 60 / 15;
    if (questionRateDifference >= 1 || questionRateState.length === 0) {
      setQuestionRateUpdateTime(Date.now());
      getQuestionRate();
    }
  };

  const getQuestionRate = async () => {
    try {
      const res = await getCollection('question_rate');
      const data = res[0];
      setQuestionRateState(data);
    } catch (e) {
      showToast('error', e);
    }
    await getCollection('question_rate')
      .then(snapshot => {
        const data = snapshot[0];
        setQuestionRateState(data);
      })
      .catch(e => {
        showToast('error', e);
      });
  };

  useEffect(() => {
    getData();
  }, []);
  return (
    <NavigationBarContainer>
      {activeTab === 0 ? (
        <Dashboard />
      ) : activeTab === 1 ? (
        <Notice />
      ) : activeTab === 2 ? (
        <Memo />
      ) : activeTab === 3 ? (
        <TeachersDetails />
      ) : activeTab === 4 ? (
        <StudentTeacherData />
      ) : activeTab === 5 ? (
        <GPWiseSchoolData />
      ) : activeTab === 6 ? (
        <DateCalculator />
      ) : activeTab === 7 ? (
        <AgeCalculator />
      ) : activeTab === 8 ? (
        <RegComplain />
      ) : activeTab === 9 ? (
        <ChangeUP />
      ) : activeTab === 10 ? (
        <Downloads />
      ) : null}
    </NavigationBarContainer>
  );
};

export default Home;
