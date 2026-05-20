// PausaRestore Screen Container - orchestration and prop mapping
import React, { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AppNavigator';
import PausaRestoreScreen from '../PausaRestoreScreen';
import { usePausaRestoreLogic } from '../../components/pausaRestore/pausaRestore.logic';

type PausaRestoreNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'PausaRestore'>;

export default function PausaRestoreScreenContainer() {
  const navigation = useNavigation<PausaRestoreNavigationProp>();
  const logic = usePausaRestoreLogic();

  const handleVerify = useCallback(async () => {
    await logic.handleVerify();
  }, [logic.handleVerify]);

  const onNavigateToLogin = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <PausaRestoreScreen
      username={logic.username}
      loading={logic.loading}
      error={logic.error}
      verificationSuccess={logic.verificationSuccess}
      setUsername={logic.setUsername}
      handleVerify={handleVerify}
      onNavigateToLogin={onNavigateToLogin}
    />
  );
}
