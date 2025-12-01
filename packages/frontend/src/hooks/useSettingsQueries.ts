import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../services/api';

export const useSettings = () => {
  return useQuery({
    queryKey: ['settings'],
    queryFn: adminAPI.getSettings,
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: Record<string, string>) => adminAPI.updateSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
};
