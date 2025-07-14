import React, { createContext, useContext, useState } from 'react';

const GlobalContext = createContext({
  state: {
    USER: {},
    TEACHER: {},
    TOKEN: '',
    LOGGEDAT: '',
  },
  setState: () => {},
  activeTab: 0,
  setActiveTab: () => '',
  stateArray: [],
  setStateArray: () => [],
  stateObject: {},
  setStateObject: () => {},
  teachersState: [],
  setTeachersState: () => [],
  schoolState: [],
  setSchoolState: () => [],
  slideState: [],
  setSlideState: () => [],
  userState: [],
  setUserState: () => [],
  noticeState: [],
  setNoticeState: () => [],
  memoState: [],
  setMemoState: () => [],
  teacherUpdateTime: '',
  setTeacherUpdateTime: () => '',
  schoolUpdateTime: '',
  setSchoolUpdateTime: () => '',
  slideUpdateTime: '',
  setSlideUpdateTime: () => '',
  noticeUpdateTime: '',
  setNoticeUpdateTime: () => '',
  memoUpdateTime: '',
  setMemoUpdateTime: () => '',
  questionState: [],
  setQuestionState: () => [],
  questionUpdateTime: '',
  setQuestionUpdateTime: () => '',
  questionRateState: {
    id: '',
    pp_rate: '',
    i_rate: '',
    ii_rate: '',
    iii_rate: '',
    iv_rate: '',
    v_rate: '',
    term: '1st',
    year: new Date().getFullYear(),
    isAccepting: false,
  },
  setQuestionRateState: () => {},
  questionRateUpdateTime: '',
  setQuestionRateUpdateTime: () => {},
  location: '',
  setLocation: () => '',
  locatitionTime: Date.now() - 1000,
  setLocationTime: () => '',
  navState: false,
  setNavState: () => false,
  leaveState: [],
  setLeaveState: () => [],
});

export const GlobalContextProvider = ({ children }) => {
  const [state, setState] = useState({
    USER: {},
    TEACHER: {},
    TOKEN: '',
    LOGGEDAT: '',
  });
  const [activeTab, setActiveTab] = useState(0);
  const [stateArray, setStateArray] = useState([]);
  const [stateObject, setStateObject] = useState({});
  const [teachersState, setTeachersState] = useState([]);
  const [userState, setUserState] = useState([]);
  const [schoolState, setSchoolState] = useState([]);
  const [slideState, setSlideState] = useState([]);
  const [noticeState, setNoticeState] = useState([]);
  const [memoState, setMemoState] = useState([]);
  const [teacherUpdateTime, setTeacherUpdateTime] = useState(Date.now() - 1000);
  const [schoolUpdateTime, setSchoolUpdateTime] = useState(Date.now() - 1000);
  const [slideUpdateTime, setSlideUpdateTime] = useState(Date.now() - 1000);
  const [noticeUpdateTime, setNoticeUpdateTime] = useState(Date.now() - 1000);
  const [memoUpdateTime, setMemoUpdateTime] = useState(Date.now() - 1000);
  const [questionState, setQuestionState] = useState([]);
  const [questionUpdateTime, setQuestionUpdateTime] = useState(
    Date.now() - 1000,
  );
  const [questionRateState, setQuestionRateState] = useState({
    id: '',
    pp_rate: '',
    i_rate: '',
    ii_rate: '',
    iii_rate: '',
    iv_rate: '',
    v_rate: '',
    term: '1st',
    year: new Date().getFullYear(),
    isAccepting: false,
  });
  const [questionRateUpdateTime, setQuestionRateUpdateTime] = useState('');
  const [location, setLocation] = useState(false);
  const [locationTime, setLocationTime] = useState(Date.now() - 1000);
  const [navState, setNavState] = useState(false);
  const [leaveState, setLeaveState] = useState([]);
  return (
    <GlobalContext.Provider
      value={{
        state,
        setState,
        activeTab,
        setActiveTab,
        stateArray,
        setStateArray,
        stateObject,
        setStateObject,
        teachersState,
        setTeachersState,
        userState,
        setUserState,
        schoolState,
        setSchoolState,
        slideState,
        setSlideState,
        noticeState,
        setNoticeState,
        memoState,
        setMemoState,
        teacherUpdateTime,
        setTeacherUpdateTime,
        schoolUpdateTime,
        setSchoolUpdateTime,
        slideUpdateTime,
        setSlideUpdateTime,
        noticeUpdateTime,
        setNoticeUpdateTime,
        memoUpdateTime,
        setMemoUpdateTime,
        questionState,
        setQuestionState,
        questionUpdateTime,
        setQuestionUpdateTime,
        questionRateState,
        setQuestionRateState,
        questionRateUpdateTime,
        setQuestionRateUpdateTime,
        location,
        setLocation,
        locationTime,
        setLocationTime,
        navState,
        setNavState,
        leaveState,
        setLeaveState,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);
