// App Navigator - handles authentication flow and role-based navigation
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useAuth, normalizeRole } from '../context/AuthContext';

// Screen imports
import LoginScreenContainer from '../screens/containers/LoginScreenContainer';
import RegisterScreenContainer from '../screens/containers/RegisterScreenContainer';
import ResetPasswordContainer from '../screens/containers/ResetPasswordContainer';
import PausaRestoreScreenContainer from '../screens/containers/PausaRestoreScreenContainer';

import DashboardContainer from '../screens/containers/DashboardContainer';
import HomeScreenContainer from '../screens/containers/HomeScreenContainer';
import ProfileScreenContainer from '../screens/containers/ProfileScreenContainer';
import SecurityScreenContainer from '../screens/containers/SecurityScreenContainer';
import AdminUsersScreenContainer from '../screens/containers/AdminUsersScreenContainer';
import AdminUserDetailScreenContainer from '../screens/containers/AdminUserDetailScreenContainer';
import AuditEmployeesScreenContainer from '../screens/containers/AuditEmployeesScreenContainer';
import AuditAdminDetailScreenContainer from '../screens/containers/AuditAdminDetailScreenContainer';
import DataRequestScreenContainer from '../screens/containers/DataRequestScreenContainer';
import DataConfirmationScreenContainer from '../screens/containers/DataConfirmationScreenContainer';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ResetPassword: { token?: string } | undefined;
  PausaRestore: { username?: string };
};

export type MainStackParamList = {
    Home: undefined;
    MainTabs: undefined;
    Profile: undefined;
    Security: undefined;
    AdminUsers: undefined;
    AdminUserDetail: { userId: number };
    AuditEmployees: undefined;
    AuditAdminDetail: { userId: number };
    Request: undefined;
    Confirmation: undefined;
};

const RootStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator<MainStackParamList>();
const MainTabs = createBottomTabNavigator();

function MainTabsNavigator() {
  return (
    <MainTabs.Navigator
      id="mainTabs"
      initialRouteName="Dashboard"
      screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}
    >
      <MainTabs.Screen
        name="Dashboard"
        component={DashboardContainer}
        options={{
          tabBarIcon: () => null,
          tabBarLabel: '',
        }}
      />
    </MainTabs.Navigator>
  );
}

function MainNavigator() {
  const { user } = useAuth();
  const role = normalizeRole(user?.role ?? null);
  const isRegularUser = role === 'user';
  const needsPersonalData = isRegularUser && user?.personalDataFilled === false;

  return (
    <MainStack.Navigator
      id="mainStack"
      initialRouteName={needsPersonalData ? "Profile" : "MainTabs"}
      screenOptions={{
        headerShown: false,
      }}
    >

      <MainStack.Screen name="Home" component={HomeScreenContainer} />
      <MainStack.Screen name="MainTabs" component={MainTabsNavigator} />
      <MainStack.Screen name="Profile" component={ProfileScreenContainer} />
      <MainStack.Screen name="Security" component={SecurityScreenContainer} />
      <MainStack.Screen name="Request" component={DataRequestScreenContainer} />
      <MainStack.Screen name="Confirmation" component={DataConfirmationScreenContainer} />
      {/* Admin screens */}
      {role === 'admin' && (
        <>
          <MainStack.Screen name="AdminUsers" component={AdminUsersScreenContainer} />
          <MainStack.Screen name="AdminUserDetail" component={AdminUserDetailScreenContainer} />
        </>
      )}
      {/* Audit screens - only for audit role, not admin */}
      {role === 'audit' && (
        <>
          <MainStack.Screen name="AuditEmployees" component={AuditEmployeesScreenContainer} />
          <MainStack.Screen name="AuditAdminDetail" component={AuditAdminDetailScreenContainer} />
        </>
      )}
    </MainStack.Navigator>
  );
}

function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <RootStack.Screen name="Main" component={MainNavigator} />
      ) : (
        <>
          <RootStack.Screen name="Login" component={LoginScreenContainer} />
          <RootStack.Screen name="Register" component={RegisterScreenContainer} />
          <RootStack.Screen name="ResetPassword" component={ResetPasswordContainer} />
          <RootStack.Screen name="PausaRestore" component={PausaRestoreScreenContainer} />
        </>
      )}
    </RootStack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}
