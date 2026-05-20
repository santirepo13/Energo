// AuditEmployees Logic Hook - business logic for AuditEmployees screen
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert } from 'react-native';
import { AdminUserRow } from '../../api/shared-types';
import { auditGetEmployees, auditGetEmployeeCodes, auditGenerateEmployeeCode } from '../../api/audit';
import { formatDate } from '../../utils/validation';

export interface EmployeeCodeDisplay {
  id: number;
  code: string;
  role: string | null;
  used: number | boolean;
  created_at: string;
  used_at: string | null;
  used_by_username?: string | null;
  formattedCreatedAt: string;
  formattedUsedAt: string | null;
}

export interface AuditEmployeesLogicResult {
  // Data state
  employees: AdminUserRow[];
  codes: EmployeeCodeDisplay[];
  loading: boolean;
  generating: boolean;

  // Form state
  selectedRole: 'admin' | 'audit';
  setSelectedRole: (role: 'admin' | 'audit') => void;

  // Handlers
  fetchData: () => Promise<void>;
  handleGenerateCode: () => Promise<void>;

  // Derived/utility
  getStatusColor: (status: string | null) => string;
}

export function useAuditEmployeesLogic(): AuditEmployeesLogicResult {
  const [employees, setEmployees] = useState<AdminUserRow[]>([]);
  const [codes, setCodes] = useState<EmployeeCodeDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'audit'>('admin');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [empResult, codesResult] = await Promise.all([
        auditGetEmployees(),
        auditGetEmployeeCodes(),
      ]);
      setEmployees(empResult.employees || []);
      // Transform codes with formatted dates (UI-ready values)
      const rawCodes = codesResult.codes || [];
      const transformedCodes: EmployeeCodeDisplay[] = rawCodes.map(code => ({
        ...code,
        formattedCreatedAt: code.created_at ? formatDate(code.created_at) : 'N/A',
        formattedUsedAt: code.used_at ? formatDate(code.used_at) : null,
      }));
      setCodes(transformedCodes);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const handleGenerateCode = useCallback(async () => {
    setGenerating(true);
    try {
      const result = await auditGenerateEmployeeCode(selectedRole);
      Alert.alert(
        'Código Generado',
        `Código: ${result.code}\nRol: ${result.role}\n\nEste código es de un solo uso.`,
        [{ text: 'OK', onPress: () => fetchData() }]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Error al generar código');
    } finally {
      setGenerating(false);
    }
  }, [selectedRole, fetchData]);

  function getStatusColor(status: string | null): string {
    switch (status?.toLowerCase()) {
      case 'activo':
        return '#4caf50';
      case 'deshabilitado':
        return '#f44336';
      default:
        return '#999';
    }
  }

  return {
    employees,
    codes,
    loading,
    generating,
    selectedRole,
    setSelectedRole,
    fetchData,
    handleGenerateCode,
    getStatusColor,
  };
}
