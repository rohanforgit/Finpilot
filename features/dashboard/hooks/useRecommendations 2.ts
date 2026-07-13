import { useQuery } from '@tanstack/react-query';
import { getRecommendations } from '@/services/api/recommendations';
import { useUserStore } from '@/stores/useUserStore';

export function useRecommendations() {
  const { user } = useUserStore();

  return useQuery({
    queryKey: ['recommendations', user?.id],
    queryFn: () => {
      if (!user?.id) throw new Error("User not found");
      return getRecommendations(user.id);
    },
    enabled: !!user?.id,
  });
}
