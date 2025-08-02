// This represents the currently logged-in user.
// In a real app, this would be based on your auth session.
export type MockUser = {
  id: string;
  email?: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
} | null;

export type Profile = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  followers_count?: number;
  following_count?: number;
};

export type PostWithAuthor = {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  author: Profile;
  user_has_liked_post: boolean;
  likes_count: number;
  comments_count: number;
};

export type CommentWithAuthor = {
  id: string;
  post_id: string;
  content: string;
  created_at: string;
  author: Profile;
};
