import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal } from 'react-native';
import commonStyles from '../../common/commonStyles';

interface PriceUpdateModalProps {
  visible: boolean;
  onClose: () => void;
  newPrice: string;
  onNewPriceChange: (price: string) => void;
  onConfirm: () => void;
}

const PriceUpdateModal: React.FC<PriceUpdateModalProps> = ({ visible, onClose, newPrice, onNewPriceChange, onConfirm }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={commonStyles.modalOverlay}>
        <View style={commonStyles.modalContent}>
          <Text style={commonStyles.modalTitle}>Actualizar Precio kWh</Text>
          <TextInput
            style={commonStyles.modalInput}
            value={newPrice}
            onChangeText={onNewPriceChange}
            keyboardType="numeric"
            placeholder="Nuevo precio"
          />
          <View style={commonStyles.modalButtons}>
            <TouchableOpacity
              style={commonStyles.modalCancelButton}
              onPress={onClose}
            >
              <Text style={commonStyles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={commonStyles.modalConfirmButton}
              onPress={onConfirm}
            >
              <Text style={commonStyles.modalConfirmText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default PriceUpdateModal;