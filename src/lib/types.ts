import type { User as SupabaseUser } from '@supabase/supabase-js';
import { Database } from './database.types';

export type User = SupabaseUser;

export type Profile = Database['public']['Tables']['profiles']['Row'];

export type Post = Database['public']['Tables']['posts']['Row'];

export type Like = Database['public']['Tables']['likes']['Row'];

export type Comment = Database['public']['Tables']['comments']['Row'];

export type PostWithAuthor = Database['public']['Views']['posts_with_author']['Row'];

export type CommentWithAuthor = Database['public']['Views']['comments_with_author']['Row'];

// MockUser can be removed if not needed elsewhere, but it's good for local testing.
export interface MockUser extends User {
  username: string;
  full_name: string;
  avatar_url: string;
}
