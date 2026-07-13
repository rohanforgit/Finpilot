import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCurrentMonthlyPlan, updateMonthlyPlan } from '@/services/api/monthly-plan';
import { useUserStore } from '@/stores/useUserStore';

export function useMonthlyPlan() {
  const { user } = useUserStore();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['monthlyPlan', user?.id],
    queryFn: () => {
      if (!user?.id) throw new Error("User not found");
      return getCurrentMonthlyPlan(user.id);
    },
    enabled: !!user?.id,
  });

  const updateMutation = useMutation({
    mutationFn: ({ planId, data }: { planId: string, data: Parameters<typeof updateMonthlyPlan>[1] }) => {
      return updateMonthlyPlan(planId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthlyPlan', user?.id] });
    },
  });

  return {
    plan: query.data,
    isLoading: query.isLoading,
    error: query.error,
    updatePlan: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}

