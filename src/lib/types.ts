import type { User as SupabaseUser } from '@supabase/supabase-js';

// Re-defining basic types as Supabase types are no longer the source of truth
export type User = SupabaseUser;

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

export type PostWithAuthor = Post & {
  author: Profile;
  likes_count: number;
  comments_count: number;
  user_has_liked_post: boolean;
};

export type CommentWithAuthor = Comment & {
  author: Profile;
};

// MockUser can be removed if not needed elsewhere, but it's good for local testing.
export interface MockUser extends User {
  username: string;
  full_name: string;
  avatar_url: string;
}
