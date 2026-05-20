import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import commonStyles from '../../common/commonStyles';
import adminStyles from './adminDashboard.styles';

interface AdminNavigationProps {
  isAdmin: boolean;
  isAudit: boolean;
  onAdminUsersPress: () => void;
  onAuditEmployeesPress: () => void;
}

const AdminNavigation: React.FC<AdminNavigationProps> = ({ isAdmin, isAudit, onAdminUsersPress, onAuditEmployeesPress }) => {
  if (!isAdmin && !isAudit) return null;

  return (
    <View style={commonStyles.section}>
      <Text style={commonStyles.sectionTitle}>Administración</Text>
      {isAdmin && (
        <TouchableOpacity
          style={commonStyles.navButton}
          onPress={onAdminUsersPress}
        >
          <Text style={adminStyles.navButtonText}>Gestionar Usuarios</Text>
        </TouchableOpacity>
      )}
      {(isAdmin || isAudit) && (
        <TouchableOpacity
          style={commonStyles.navButton}
          onPress={onAuditEmployeesPress}
        >
          <Text style={adminStyles.navButtonText}>Empleados y Códigos</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default AdminNavigation;