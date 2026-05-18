import React from 'react';
import {NavigationContainer, DefaultTheme, DarkTheme} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import HomeScreen from '../screens/HomeScreen';
import StatsScreen from '../screens/StatsScreen';
import ProblemBankScreen from '../screens/ProblemBankScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ProblemSolveScreen from '../screens/ProblemSolveScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import {useTheme} from '../theme/ThemeContext';

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Main: undefined;
  ProblemSolve: {problemId: string};
};

export type TabParamList = {
  홈: undefined;
  통계: undefined;
  '문제 은행': undefined;
  '내 정보': undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const TAB_ICON_NAMES: Record<string, string> = {
  홈: 'home',
  통계: 'bar-chart',
  '문제 은행': 'menu-book',
  '내 정보': 'person',
};

function TabNavigator() {
  const {colors} = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color}) => (
          <MaterialIcons name={TAB_ICON_NAMES[route.name]} size={focused ? 26 : 22} color={color} />
        ),
        tabBarActiveTintColor: '#2979FF',
        tabBarInactiveTintColor: '#9E9E9E',
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          paddingBottom: 4,
          height: 60,
        },
        tabBarLabelStyle: {fontSize: 11},
        headerShown: false,
      })}>
      <Tab.Screen name="홈" component={HomeScreen} />
      <Tab.Screen name="통계" component={StatsScreen} />
      <Tab.Screen name="문제 은행" component={ProblemBankScreen} />
      <Tab.Screen name="내 정보" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const {colors, isDark} = useTheme();

  const baseTheme = isDark ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: '#2979FF',
      background: colors.bg,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      notification: '#2979FF',
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{headerShown: false}} initialRouteName="Main">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="ProblemSolve" component={ProblemSolveScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
