import { useMutation, useQuery } from '@tanstack/react-query';
import { authAPI } from '../services/api';

export const useCheckAdminExists = () => {
  return useQuery({
    queryKey: ['admin-exists'],
    queryFn: () => authAPI.checkAdminExists(),
    retry: 1,
    staleTime: 0,
  });
};

export const useCreateInitialAdmin = () => {
  return useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      authAPI.createInitialAdmin(username, password),
  });
};
