import type { User as SupabaseUser } from '@supabase/supabase-js';

// Now Profile is the main source of truth for user-related data in the app
export type Profile = {
  id: string;
  updated_at?: string | null;
  username: string;
  full_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  banner_url?: string | null;
  followers_count?: number;
  following_count?: number;
};

// We can keep the Supabase user type if we need to access auth-specific details
export type User = SupabaseUser;

export type Post = {
  id: string;
  created_at: string;
  content: string;
  author_id: string;
  image_url?: string | null;
};

export type Like = {
  id: string;
  user_id: string;
  post_id: string;
};

export type Comment = {
  id: string;
  created_at: string;
  content: string;
  author_id: string;
  post_id: string;
};

// These composite types are very useful for joining data
export type PostWithAuthor = Post & {
  author: Profile;
  likes_count: number;
  comments_count: number;
  user_has_liked_post: boolean;
};

export type CommentWithAuthor = Comment & {
  author: Profile;
};
