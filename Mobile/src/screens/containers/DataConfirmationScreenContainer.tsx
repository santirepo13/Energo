// Confirmation Screen Container - orchestration and prop mapping
import React, { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/AppNavigator';
import ConfirmationScreen from '../DataConfirmationScreen';
import { useConfirmationLogic } from '../../components/Datarequest/confirmation/Dataconfirmation.logic';

type ConfirmationNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Confirmation'>;

export default function ConfirmationScreenContainer() {
  const navigation = useNavigation<ConfirmationNavigationProp>();

  const onCountdownEnd = useCallback(() => {
    navigation.navigate('MainTabs'); // Navigate to recharge panel (Dashboard)
  }, [navigation]);

  const logic = useConfirmationLogic(onCountdownEnd);

  return (
    <ConfirmationScreen
      countdown={logic.countdown}
    />
  );
}