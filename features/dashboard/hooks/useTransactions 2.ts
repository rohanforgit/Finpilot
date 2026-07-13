import { useQuery } from '@tanstack/react-query';
import { getRecentTransactions } from '@/services/api/transactions';
import { useUserStore } from '@/stores/useUserStore';

export function useTransactions(limit = 10) {
  const { user } = useUserStore();

  return useQuery({
    queryKey: ['transactions', user?.id, limit],
    queryFn: () => {
      if (!user?.id) throw new Error("User not found");
      return getRecentTransactions(user.id, limit);
    },
    enabled: !!user?.id,
  });
}
