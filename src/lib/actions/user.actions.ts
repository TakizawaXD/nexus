'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export async function toggleFollow(profileId: string, isFollowing: boolean) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  if (isFollowing) {
    // Unfollow
    const { error } = await supabase
      .from('followers')
      .delete()
      .match({ follower_id: user.id, following_id: profileId });

    if (error) {
      console.error('Error unfollowing user:', error);
      return { success: false, error: error.message };
    }
  } else {
    // Follow
    const { error } = await supabase
      .from('followers')
      .insert({ follower_id: user.id, following_id: profileId });

    if (error) {
      console.error('Error following user:', error);
      return { success: false, error: error.message };
    }
  }

  // Revalidate the profile page to update follower count and button state
  const { data: profile } = await supabase.from('profiles').select('username').eq('id', profileId).single();
  if (profile) {
    revalidatePath(`/u/${profile.username}`);
  }
  revalidatePath('/');
  
  return { success: true };
}
