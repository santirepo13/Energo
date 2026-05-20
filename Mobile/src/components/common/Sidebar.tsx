import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import commonStyles from './commonStyles';

interface SidebarProps {
  screenTitle: string;
  isOpen: boolean;
  onClose: () => void;
  user: { username: string | null | undefined; status: string | null | undefined; role: string | null | undefined };
  onProfilePress: () => void;
  onSecurityPress: () => void;
  onRechargePress?: () => void;
  onSignOut: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ screenTitle, isOpen, user, onClose, onProfilePress, onSecurityPress, onRechargePress, onSignOut }) => {
  if (!isOpen) return null;

  const getRechargeButtonText = () => {
    const role = user.role?.toLowerCase();
    if (role === 'admin' || role === 'administrator' || role === 'administrador') return 'Admin';
    if (role === 'audit' || role === 'auditor' || role === 'auditoría' || role === 'auditoria') return 'Auditor';
    return 'Panel de recargas';
  };

  return (
    <View style={commonStyles.sidebarOverlay}>
      <TouchableOpacity style={commonStyles.sidebarBackdrop} onPress={onClose} />
      <View style={commonStyles.sidebar}>
        <Text style={{ alignSelf: 'center', fontSize: 24, fontWeight: 'bold', color: '#2E7D32', marginBottom: 8, marginTop: -20 }}>Energo</Text>
        <View style={commonStyles.separator} />
        <Text style={commonStyles.sidebarTitle}>{screenTitle}</Text>
        {onRechargePress && (
          <TouchableOpacity style={commonStyles.sidebarButton} onPress={() => { onClose(); onRechargePress(); }}>
            <Text style={commonStyles.sidebarButtonText}>{getRechargeButtonText()}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={commonStyles.sidebarButton} onPress={() => { onClose(); onProfilePress(); }}>
          <Text style={commonStyles.sidebarButtonText}>Perfil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={commonStyles.sidebarButton} onPress={() => { onClose(); onSecurityPress(); }}>
          <Text style={commonStyles.sidebarButtonText}>Seguridad</Text>
        </TouchableOpacity>
        {user.status === 'Pausa' && <Text style={commonStyles.sidebarPaused}>⚠️ Cuenta en Pausa</Text>}
        <View style={{ flex: 1 }} />
        <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: 32 }}>
          <View style={commonStyles.sidebarUserContainer}>
            <Text style={commonStyles.sidebarUser}>{user.username ?? ''}</Text>
          </View>
          <TouchableOpacity 
            style={{ backgroundColor: '#000000', padding: 16, borderRadius: 8, alignItems: 'center' }} 
            onPress={() => { onClose(); onSignOut(); }}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Cerrar Sesion</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Sidebar;