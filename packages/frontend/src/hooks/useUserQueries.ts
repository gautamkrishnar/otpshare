import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../services/api';
import type { CreateUserInput, UpdateUserInput } from '../types';

export const useUsers = (filters?: { page?: number; perPage?: number }) => {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => adminAPI.getUsers(filters),
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateUserInput) => adminAPI.createUser(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateUserInput }) =>
      adminAPI.updateUser(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminAPI.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
