import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminAPI, otpAPI } from '../services/api';

export const useOTPs = () => {
  return useQuery({
    queryKey: ['otps'],
    queryFn: otpAPI.getOTPs,
    refetchInterval: 30000,
  });
};

export const useMarkOTPAsUsed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => otpAPI.markAsUsed(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['otps'] });
      queryClient.invalidateQueries({ queryKey: ['admin-otps'] });
    },
  });
};

export const useAdminOTPs = (filters?: { status?: 'used' | 'unused'; search?: string }) => {
  return useQuery({
    queryKey: ['admin-otps', filters],
    queryFn: () => adminAPI.getAllOTPs(filters),
  });
};

export const useImportOTPs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (codes: string[]) => adminAPI.importOTPs(codes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['otps'] });
      queryClient.invalidateQueries({ queryKey: ['admin-otps'] });
    },
  });
};

export const useImportOTPsFromFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, vendorType }: { file: File; vendorType: string }) =>
      adminAPI.importOTPsFromFile(file, vendorType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['otps'] });
      queryClient.invalidateQueries({ queryKey: ['admin-otps'] });
    },
  });
};

export const useDeleteOTP = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminAPI.deleteOTP(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['otps'] });
      queryClient.invalidateQueries({ queryKey: ['admin-otps'] });
    },
  });
};

export const useDeleteBulkOTPs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: number[]) => adminAPI.deleteBulkOTPs(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['otps'] });
      queryClient.invalidateQueries({ queryKey: ['admin-otps'] });
    },
  });
};

export const useMarkBulkOTPsAsUsed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: number[]) => adminAPI.markBulkOTPsAsUsed(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['otps'] });
      queryClient.invalidateQueries({ queryKey: ['admin-otps'] });
    },
  });
};
