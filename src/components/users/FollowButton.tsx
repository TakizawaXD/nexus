'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import * as userActions from '@/lib/actions/user.actions';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function FollowButton({ profileId, isFollowing }: { profileId: string; isFollowing: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [isFollowingOptimistic, setIsFollowingOptimistic] = useState(isFollowing);
  const { toast } = useToast();
  const router = useRouter();

  const handleFollow = () => {
    startTransition(async () => {
      const currentFollowingStatus = isFollowingOptimistic;
      setIsFollowingOptimistic((prev) => !prev);
      const result = await userActions.toggleFollow(profileId, currentFollowingStatus);
      if (!result.success) {
        setIsFollowingOptimistic(currentFollowingStatus);
        toast({
            variant: "destructive",
            title: "Error",
            description: result.error || "No se pudo actualizar el estado de seguimiento.",
        });
      }
      // Revalidate the path to update follower counts on the profile page
      router.refresh();
    });
  };

  return (
    <Button 
      onClick={handleFollow} 
      variant={isFollowingOptimistic ? 'outline' : 'default'} 
      disabled={isPending}
      className="w-28 transition-all"
    >
      {isPending ? (
        <Loader2 className="animate-spin" />
      ) : isFollowingOptimistic ? (
        'Siguiendo'
      ) : (
        'Seguir'
      )}
    </Button>
  );
}
