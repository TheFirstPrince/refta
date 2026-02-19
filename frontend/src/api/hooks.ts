import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type { Company, Slot, Tender, User } from '../types';

export function useLogin() {
  return useMutation({ mutationFn: (data: { email: string; password: string }) => api.post('/auth/login', data).then((r) => r.data) });
}

export function useAssignees() {
  return useQuery<User[]>({ queryKey: ['assignees'], queryFn: () => api.get('/users/assignees').then((r) => r.data) });
}

export function useUsers() {
  return useQuery<User[]>({ queryKey: ['users'], queryFn: () => api.get('/users').then((r) => r.data) });
}

export function useCompanies() {
  return useQuery<Company[]>({ queryKey: ['companies'], queryFn: () => api.get('/companies').then((r) => r.data) });
}

export function useTenders(q?: string) {
  return useQuery<Tender[]>({ queryKey: ['tenders', q], queryFn: () => api.get('/tenders', { params: { q } }).then((r) => r.data) });
}

export function useSlots(params: Record<string, string | undefined>) {
  return useQuery<Slot[]>({ queryKey: ['slots', params], queryFn: () => api.get('/slots', { params }).then((r) => r.data) });
}

export function useCreateSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: unknown) => api.post('/slots', payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['slots'] })
  });
}

export function useCreateTender() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (payload: unknown) => api.post('/tenders', payload), onSuccess: () => qc.invalidateQueries({ queryKey: ['tenders'] }) });
}

export function useCreateCompany() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (payload: unknown) => api.post('/companies', payload), onSuccess: () => qc.invalidateQueries({ queryKey: ['companies'] }) });
}

export async function checkConflict(payload: unknown) {
  return api.post('/slots/check-conflict', payload).then((r) => r.data as { conflict: boolean; conflicts: Slot[] });
}
