import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Splash from '../screens/Splash';
import Home from './Home';
import Login from '../screens/Login';
import SignUp from '../screens/SignUp';
import { navigationRef } from './NavigationUtil';
import OTPForm from '../screens/OTPForm';
import ChangePhoto from '../screens/ChangePhoto';
import YearwiseTeachers from '../screens/YearwiseTeachers';
import RegUsers from '../screens/RegUsers';
import ChangeUserPhoto from '../screens/ChangeUserPhoto';
import TeacherServiceLife from '../screens/TeacherServiceLife';
import Retirement from '../screens/Retirement';
import QuestionSection from '../screens/QuestionSection';
import QuestionRequisition from '../screens/QuestionRequisition';
import AllQuestionData from '../screens/AllQuestionData';
import NoticeDetails from '../screens/NoticeDetails';
import MemoDetails from '../screens/MemoDetails';
import AllTeachersSalary from '../screens/AllTeachersSalary';
import EditDetails from '../screens/EditDetails';
import ViewDetails from '../screens/ViewDetails';
import ComplainDetails from '../screens/ComplainDetails';
import UpdateSlides from '../screens/UpdateSlides';
import ITReloaded from '../screens/ITReloaded';
import WebViewScreen from '../components/WebViewScreen';
import FileListScreen from '../screens/FileListScreen';
import Website from '../components/Website';

const Stack = createStackNavigator();

function AppNavigator() {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen
          name="Splash"
          component={Splash}
          options={{
            headerShown: false,
            drawerItemStyle: { height: 0 },
            animation: 'reveal_from_bottom',
          }}
        />
        <Stack.Screen
          name="Home"
          component={Home}
          options={{
            headerShown: false,
            drawerItemStyle: { height: 0 },
            animation: 'reveal_from_bottom',
          }}
        />
        <Stack.Screen
          name="Login"
          component={Login}
          options={{
            headerShown: false,
            drawerItemStyle: { height: 0 },
            animation: 'reveal_from_bottom',
          }}
        />
        <Stack.Screen
          name="SignUp"
          component={SignUp}
          options={{
            headerShown: false,
            drawerItemStyle: { height: 0 },
            animation: 'reveal_from_bottom',
          }}
        />
        <Stack.Screen
          name="OTPForm"
          component={OTPForm}
          options={{
            headerShown: false,
            drawerItemStyle: { height: 0 },
            animation: 'reveal_from_bottom',
          }}
        />
        <Stack.Screen
          name="ChangePhoto"
          component={ChangePhoto}
          options={{
            headerShown: false,
            drawerItemStyle: { height: 0 },
            animation: 'reveal_from_bottom',
          }}
        />
        <Stack.Screen
          name="ChangeUserPhoto"
          component={ChangeUserPhoto}
          options={{
            headerShown: false,
            drawerItemStyle: { height: 0 },
            animation: 'reveal_from_bottom',
          }}
        />
        <Stack.Screen
          name="RegUsers"
          component={RegUsers}
          options={{
            headerShown: false,
            drawerItemStyle: { height: 0 },
            animation: 'reveal_from_bottom',
          }}
        />
        <Stack.Screen
          name="YearwiseTeachers"
          component={YearwiseTeachers}
          options={{
            headerShown: false,
            drawerItemStyle: { height: 0 },
            animation: 'reveal_from_bottom',
          }}
        />
        <Stack.Screen
          name="TeacherServiceLife"
          component={TeacherServiceLife}
          options={{
            headerShown: false,
            drawerItemStyle: { height: 0 },
            animation: 'reveal_from_bottom',
          }}
        />
        <Stack.Screen
          name="Retirement"
          component={Retirement}
          options={{
            headerShown: false,
            drawerItemStyle: { height: 0 },
            animation: 'reveal_from_bottom',
          }}
        />
        <Stack.Screen
          name="QuestionSection"
          component={QuestionSection}
          options={{
            headerShown: false,
            drawerItemStyle: { height: 0 },
            animation: 'reveal_from_bottom',
          }}
        />
        <Stack.Screen
          name="QuestionRequisition"
          component={QuestionRequisition}
          options={{
            headerShown: false,
            drawerItemStyle: { height: 0 },
            animation: 'reveal_from_bottom',
          }}
        />
        <Stack.Screen
          name="AllQuestionData"
          component={AllQuestionData}
          options={{
            headerShown: false,
            drawerItemStyle: { height: 0 },
            animation: 'reveal_from_bottom',
          }}
        />
        <Stack.Screen
          name="NoticeDetails"
          component={NoticeDetails}
          options={{
            headerShown: false,
            drawerItemStyle: { height: 0 },
            animation: 'reveal_from_bottom',
          }}
        />
        <Stack.Screen
          name="MemoDetails"
          component={MemoDetails}
          options={{
            headerShown: false,
            drawerItemStyle: { height: 0 },
            animation: 'reveal_from_bottom',
          }}
        />
        <Stack.Screen
          name="AllTeachersSalary"
          component={AllTeachersSalary}
          options={{
            headerShown: false,
            drawerItemStyle: { height: 0 },
            animation: 'reveal_from_bottom',
          }}
        />
        <Stack.Screen
          name="EditDetails"
          component={EditDetails}
          options={{
            headerShown: false,
            drawerItemStyle: { height: 0 },
            animation: 'reveal_from_bottom',
          }}
        />
        <Stack.Screen
          name="ViewDetails"
          component={ViewDetails}
          options={{
            headerShown: false,
            drawerItemStyle: { height: 0 },
            animation: 'reveal_from_bottom',
          }}
        />
        <Stack.Screen
          name="ComplainDetails"
          component={ComplainDetails}
          options={{
            headerShown: false,
            drawerItemStyle: { height: 0 },
            animation: 'reveal_from_bottom',
          }}
        />
        <Stack.Screen
          name="UpdateSlides"
          component={UpdateSlides}
          options={{
            headerShown: false,
            drawerItemStyle: { height: 0 },
            animation: 'reveal_from_bottom',
          }}
        />
        <Stack.Screen
          name="ITReloaded"
          component={ITReloaded}
          options={{
            headerShown: false,
            drawerItemStyle: { height: 0 },
            animation: 'reveal_from_bottom',
          }}
        />
        <Stack.Screen
          name="FileListScreen"
          component={FileListScreen}
          options={{
            headerShown: false,
            drawerItemStyle: { height: 0 },
            animation: 'reveal_from_bottom',
          }}
        />
        <Stack.Screen
          name="WebViewScreen"
          component={WebViewScreen}
          options={{
            headerShown: false,
            drawerItemStyle: { height: 0 },
            animation: 'reveal_from_bottom',
          }}
        />
        <Stack.Screen
          name="Website"
          component={Website}
          options={{
            headerShown: false,
            drawerItemStyle: { height: 0 },
            animation: 'reveal_from_bottom',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;
