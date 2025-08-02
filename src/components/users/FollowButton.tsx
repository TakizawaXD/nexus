'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { toggleFollow } from '@/lib/actions/user.actions';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function FollowButton({ profileId, isFollowing }: { profileId: string; isFollowing: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [isFollowingOptimistic, setIsFollowingOptimistic] = useState(isFollowing);
  const { toast } = useToast();

  const handleFollow = () => {
    startTransition(async () => {
      const currentFollowingStatus = isFollowingOptimistic;
      setIsFollowingOptimistic((prev) => !prev);
      const result = await toggleFollow(profileId, currentFollowingStatus);
      if (!result.success) {
        setIsFollowingOptimistic(currentFollowingStatus);
        toast({
            variant: "destructive",
            title: "Error",
            description: result.error || "Could not update follow status.",
        });
      }
    });
  };

  return (
    <Button 
      onClick={handleFollow} 
      variant={isFollowingOptimistic ? 'outline' : 'default'} 
      disabled={isPending}
      className="w-28"
    >
      {isPending ? (
        <Loader2 className="animate-spin" />
      ) : isFollowingOptimistic ? (
        'Following'
      ) : (
        'Follow'
      )}
    </Button>
  );
}
