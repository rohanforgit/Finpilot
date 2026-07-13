import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSavingsBuckets, createSavingsBucket, updateSavingsBucket, deleteSavingsBucket } from '@/services/api/savings-buckets';
import { useUserStore } from '@/stores/useUserStore';

export function useSavingsBuckets() {
  const { user } = useUserStore();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['savingsBuckets', user?.id],
    queryFn: () => {
      if (!user?.id) throw new Error("User not found");
      return getSavingsBuckets(user.id);
    },
    enabled: !!user?.id,
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<Parameters<typeof createSavingsBucket>[0], 'user_id'>) => {
      if (!user?.id) throw new Error("User not found");
      return createSavingsBucket({
        ...data,
        user_id: user.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savingsBuckets', user?.id] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ bucketId, data }: { bucketId: string, data: Parameters<typeof updateSavingsBucket>[1] }) => {
      return updateSavingsBucket(bucketId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savingsBuckets', user?.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (bucketId: string) => {
      return deleteSavingsBucket(bucketId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savingsBuckets', user?.id] });
    },
  });

  return {
    buckets: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    createBucket: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateBucket: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteBucket: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
