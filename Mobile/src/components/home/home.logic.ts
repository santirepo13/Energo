import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export interface HomeLogicResult {
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
  isAuthenticated: boolean;
  showWelcomeText: boolean;
  userName: string;
}

export function useHomeLogic(): HomeLogicResult {
  const { isAuthenticated, user } = useAuth();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const showWelcomeText = isAuthenticated && !!user;
  const userName = user?.username || '';

  return {
    fadeAnim,
    slideAnim,
    isAuthenticated,
    showWelcomeText,
    userName,
  };
}