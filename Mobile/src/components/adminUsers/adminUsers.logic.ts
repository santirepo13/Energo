// Admin Users Logic Hook - business logic for admin users list
import { useState, useCallback, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { adminListUsers, AdminUserRow } from '../../api/client';

export interface AdminUsersLogicResult {
  users: AdminUserRow[];
  filteredUsers: AdminUserRow[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  fetchUsers: () => Promise<void>;
}

export function getStatusColor(status: string | null): string {
  switch (status?.toLowerCase()) {
    case 'activo':
      return '#4caf50';
    case 'pausa':
      return '#ff9800';
    case 'deshabilitado':
      return '#f44336';
    case 'suspendido':
      return '#9c27b0';
    default:
      return '#999';
  }
}

export function useAdminUsersLogic(): AdminUsersLogicResult {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminListUsers();
      setUsers(data.users || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [fetchUsers])
  );

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(user =>
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.id.toString().includes(query) ||
      (user.status && user.status.toLowerCase().includes(query))
    );
  }, [users, searchQuery]);

  return {
    users,
    filteredUsers,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    fetchUsers,
  };
}