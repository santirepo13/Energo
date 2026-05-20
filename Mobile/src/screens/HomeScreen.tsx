// Home Screen - Purely presentational
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import { homeStyles } from '../components/home/home.styles';
import commonStyles from '../components/common/commonStyles';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';

interface HomeScreenPresentationalProps {
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
  showWelcomeText: boolean;
  userName: string;
  onGetStarted: () => void;
  // Sidebar props
  sidebarOpen: boolean;
  onSidebarClose: () => void;
  onSidebarMenuPress: () => void;
  sidebarUser: { username: string | null | undefined; status: string | null | undefined; role: string | null | undefined };
  onProfilePress: () => void;
  onSecurityPress: () => void;
  onSignOut: () => void;
  screenTitle: string;
}

export default function HomeScreen({
  fadeAnim,
  slideAnim,
  showWelcomeText,
  userName,
  onGetStarted,
  sidebarOpen,
  onSidebarClose,
  onSidebarMenuPress,
  sidebarUser,
  onProfilePress,
  onSecurityPress,
  onSignOut,
  screenTitle
}: HomeScreenPresentationalProps) {

  return (
    <View style={commonStyles.container}>
      <ScrollView style={commonStyles.scrollView}>
        <Header onMenuPress={onSidebarMenuPress} />

        <Animated.View
          style={[
            homeStyles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Logo placeholder - in production would use actual logo */}
          <View style={homeStyles.logoContainer}>
            <Text style={homeStyles.logoText}>⚡</Text>
          </View>

          <Text style={homeStyles.title}>EnergoMobile</Text>
          <Text style={homeStyles.tagline}>Energía prepago a un solo clic!</Text>

          {showWelcomeText && (
            <Text style={homeStyles.welcomeText}>
              Bienvenido, {userName}
            </Text>
          )}

          <TouchableOpacity style={homeStyles.button} onPress={onGetStarted}>
            <Text style={homeStyles.buttonText}>
              Ir al Dashboard
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      <Sidebar
        screenTitle={screenTitle}
        isOpen={sidebarOpen}
        onClose={onSidebarClose}
        user={sidebarUser}
        onProfilePress={onProfilePress}
        onSecurityPress={onSecurityPress}
        onSignOut={onSignOut}
      />
    </View>
  );
}
