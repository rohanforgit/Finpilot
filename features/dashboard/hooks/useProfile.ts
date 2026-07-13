import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserProfile, updateUserProfile } from '@/services/api/profiles';
import { useUserStore } from '@/stores/useUserStore';

export function useProfile() {
  const { user, setUser } = useUserStore();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => {
      if (!user?.id) throw new Error("User not found");
      return getUserProfile(user.id);
    },
    enabled: !!user?.id,
  });

  const mutation = useMutation({
    mutationFn: (data: Parameters<typeof updateUserProfile>[1]) => {
      if (!user?.id) throw new Error("User not found");
      return updateUserProfile(user.id, data);
    },
    onSuccess: (updatedProfile) => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      if (updatedProfile) {
        setUser({
          ...user,
          name: `${updatedProfile.first_name || ""} ${updatedProfile.last_name || ""}`.trim() || user.email,
          monthly_income: updatedProfile.monthly_income,
        });
      }
    },
  });

  return {
    profile: query.data,
    isLoading: query.isLoading,
    error: query.error,
    updateProfile: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
}
