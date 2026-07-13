import { useQuery } from '@tanstack/react-query';
import { getCurrentMonthlyPlan } from '@/services/api/monthly-plan';
import { useUserStore } from '@/stores/useUserStore';

export function useMonthlyPlan() {
  const { user } = useUserStore();

  return useQuery({
    queryKey: ['monthlyPlan', user?.id],
    queryFn: () => {
      if (!user?.id) throw new Error("User not found");
      return getCurrentMonthlyPlan(user.id);
    },
    enabled: !!user?.id,
  });
}
