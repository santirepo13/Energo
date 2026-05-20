// Request Screen Container - orchestration and prop mapping
import React, { useCallback, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/AppNavigator';
import RequestScreen from '../DataRequestScreen';
import { useRequestLogic } from '../../components/Datarequest/Datarequest.logic';
import { meGetProfile } from '../../api/profile';

type RequestNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Request'>;

export default function RequestScreenContainer() {
  const navigation = useNavigation<RequestNavigationProp>();
  const logic = useRequestLogic();

  useEffect(() => {
    const check = async () => {
      try {
        const pr = await meGetProfile();
        if (pr.personal_data_filled) {
          navigation.navigate('Confirmation');
        }
      } catch (e) {
        // ignore
      }
    };
    check();
  }, [navigation]);

  const onSubmit = useCallback(async () => {
    const success = await logic.handleSubmit();
    if (success) {
      navigation.navigate('Confirmation');
    }
  }, [logic.handleSubmit, navigation]);

  return (
    <RequestScreen
      name={logic.name}
      surname={logic.surname}
      phone={logic.phone}
      email={logic.email}
      address={logic.address}
      reason={logic.reason}
      loading={logic.loading}
      error={logic.error}
      setName={logic.setName}
      setSurname={logic.setSurname}
      setPhone={logic.setPhone}
      setEmail={logic.setEmail}
      setAddress={logic.setAddress}
      setReason={logic.setReason}
      onSubmit={onSubmit}
    />
  );
}