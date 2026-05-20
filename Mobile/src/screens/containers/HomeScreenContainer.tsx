// Home Container - orchestration and prop mapping
import React, { useCallback, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { MainStackParamList } from '../../navigation/AppNavigator';
import HomeScreen from '../HomeScreen';
import { useHomeLogic } from '../../components/home/home.logic';

type HomeNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Home'>;

export default function HomeScreenContainer() {
  const navigation = useNavigation<HomeNavigationProp>();
  const { user, logout } = useAuth();
  const logic = useHomeLogic();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const onGetStarted = useCallback(() => {
    if (logic.isAuthenticated) {
      // MainTabs has Dashboard as initialRouteName, so navigating to MainTabs shows Dashboard
      navigation.navigate('MainTabs');
    }
  }, [logic.isAuthenticated, navigation]);

  const handleSidebarMenuPress = useCallback(() => {
    setSidebarOpen(true);
  }, []);

  const handleSidebarClose = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const handleProfilePress = useCallback(() => {
    navigation.navigate('Profile');
  }, [navigation]);

  const handleSecurityPress = useCallback(() => {
    navigation.navigate('Security');
  }, [navigation]);

  const handleSignOut = useCallback(async () => {
    await logout();
    // No manual navigation needed - AppNavigator's conditional rendering
    // automatically shows Auth screen when isAuthenticated becomes false
  }, [logout]);

  return (
    <HomeScreen
      fadeAnim={logic.fadeAnim}
      slideAnim={logic.slideAnim}
      showWelcomeText={logic.showWelcomeText}
      userName={logic.userName}
      onGetStarted={onGetStarted}
      sidebarOpen={sidebarOpen}
      onSidebarClose={handleSidebarClose}
      onSidebarMenuPress={handleSidebarMenuPress}
      sidebarUser={{ username: user?.username ?? null, status: user?.status ?? null, role: user?.role ?? null }}
      onProfilePress={handleProfilePress}
      onSecurityPress={handleSecurityPress}
      onSignOut={handleSignOut}
      screenTitle="Home"
    />
  );
}
