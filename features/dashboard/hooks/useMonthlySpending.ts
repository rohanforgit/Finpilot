import { useQuery } from '@tanstack/react-query';
import { getCurrentMonthSpent } from '@/services/api/transactions';
import { useUserStore } from '@/stores/useUserStore';

export function useMonthlySpending() {
  const { user } = useUserStore();

  return useQuery({
    queryKey: ['monthlySpending', user?.id],
    queryFn: () => {
      if (!user?.id) throw new Error("User not found");
      return getCurrentMonthSpent(user.id);
    },
    enabled: !!user?.id,
  });
}
