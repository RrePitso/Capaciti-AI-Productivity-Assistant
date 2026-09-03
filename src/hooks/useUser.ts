// src/hooks/useUser.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { Profile } from '@/types/database';

interface MeResponse {
  data: {
    user: { id: string; email: string | null };
    profile: Profile;
  };
}

export function useUser() {
  const query = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const { data } = await axios.get<MeResponse>('/api/auth/me');
      return data.data;
    },
    retry: false,
  });

  return {
    user: query.data?.user,
    profile: query.data?.profile,
    role: query.data?.profile.role,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
