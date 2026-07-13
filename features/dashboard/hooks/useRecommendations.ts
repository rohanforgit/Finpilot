import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRecommendations, updateRecommendation } from '@/services/api/recommendations';
import { useUserStore } from '@/stores/useUserStore';

export function useRecommendations() {
  const { user } = useUserStore();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['recommendations', user?.id],
    queryFn: () => {
      if (!user?.id) throw new Error("User not found");
      return getRecommendations(user.id);
    },
    enabled: !!user?.id,
  });

  const mutation = useMutation({
    mutationFn: ({ recId, update }: { recId: string; update: Parameters<typeof updateRecommendation>[1] }) => {
      return updateRecommendation(recId, update);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['monthlyPlan', user?.id] });
    },
  });

  return {
    recommendations: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    updateRecommendation: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
}

