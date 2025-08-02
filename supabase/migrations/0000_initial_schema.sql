-- Create Profiles Table
-- This table will store user profile information.
create table
  public.profiles (
    id uuid not null,
    username text not null,
    full_name text null,
    avatar_url text null,
    updated_at timestamp with time zone null,
    constraint profiles_pkey primary key (id),
    constraint profiles_username_key unique (username),
    constraint profiles_id_fkey foreign key (id) references auth.users (id) on delete cascade,
    constraint username_length check (char_length(username) >= 3)
  ) tablespace pg_default;

-- Create Posts Table
-- This table will store all the posts created by users.
create table
  public.posts (
    id uuid not null default gen_random_uuid (),
    user_id uuid not null,
    content text not null,
    image_url text null,
    created_at timestamp with time zone not null default now(),
    constraint posts_pkey primary key (id),
    constraint posts_user_id_fkey foreign key (user_id) references public.profiles (id) on delete cascade,
    constraint content_length check (char_length(content) <= 280)
  ) tablespace pg_default;

-- Create Comments Table
-- This table stores comments on posts.
create table
  public.comments (
    id uuid not null default gen_random_uuid (),
    user_id uuid not null,
    post_id uuid not null,
    content text not null,
    created_at timestamp with time zone not null default now(),
    constraint comments_pkey primary key (id),
    constraint comments_post_id_fkey foreign key (post_id) references public.posts (id) on delete cascade,
    constraint comments_user_id_fkey foreign key (user_id) references public.profiles (id) on delete cascade
  ) tablespace pg_default;
  
-- Create Likes Table
-- This table tracks which users have liked which posts.
create table
  public.likes (
    user_id uuid not null,
    post_id uuid not null,
    created_at timestamp with time zone not null default now(),
    constraint likes_pkey primary key (user_id, post_id),
    constraint likes_post_id_fkey foreign key (post_id) references public.posts (id) on delete cascade,
    constraint likes_user_id_fkey foreign key (user_id) references public.profiles (id) on delete cascade
  ) tablespace pg_default;

-- Create Follows Table
-- This table tracks follower relationships.
create table
  public.follows (
    follower_id uuid not null,
    following_id uuid not null,
    created_at timestamp with time zone not null default now(),
    constraint follows_pkey primary key (follower_id, following_id),
    constraint follows_follower_id_fkey foreign key (follower_id) references public.profiles (id) on delete cascade,
    constraint follows_following_id_fkey foreign key (following_id) references public.profiles (id) on delete cascade
  ) tablespace pg_default;
  
-- Set up Row Level Security (RLS)
-- See https://supabase.com/docs/guides/auth/row-level-security
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.follows enable row level security;

-- Policies for Profiles Table
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid () = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid () = id);

-- Policies for Posts Table
create policy "Posts are viewable by everyone." on public.posts for select using (true);
create policy "Users can insert their own posts." on public.posts for insert with check (auth.uid () = user_id);
create policy "Users can update their own posts." on public.posts for update with check (auth.uid () = user_id);
create policy "Users can delete their own posts." on public.posts for delete using (auth.uid () = user_id);

-- Policies for Comments Table
create policy "Comments are viewable by everyone." on public.comments for select using (true);
create policy "Users can insert comments." on public.comments for insert with check (auth.uid () = user_id);
create policy "Users can delete their own comments." on public.comments for delete using (auth.uid () = user_id);

-- Policies for Likes Table
create policy "Likes are viewable by everyone." on public.likes for select using (true);
create policy "Users can insert their own likes." on public.likes for insert with check (auth.uid () = user_id);
create policy "Users can delete their own likes." on public.likes for delete using (auth.uid () = user_id);

-- Policies for Follows Table
create policy "Follows are viewable by everyone." on public.follows for select using (true);
create policy "Users can insert their own follow records." on public.follows for insert with check (auth.uid () = follower_id);
create policy "Users can delete their own follow records." on public.follows for delete using (auth.uid () = follower_id);


-- Trigger to create a profile for a new user
-- This trigger automatically creates a profile row when a new user signs up.
create function public.handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users for each row
execute procedure public.handle_new_user();

-- Stored procedure to get posts with author info and like/comment counts
create or replace function get_posts_with_details(auth_user_id uuid)
returns table (
    id uuid,
    content text,
    image_url text,
    created_at timestamp with time zone,
    author json,
    user_has_liked_post boolean,
    likes_count bigint,
    comments_count bigint
) as $$
begin
    return query
    select
        p.id,
        p.content,
        p.image_url,
        p.created_at,
        json_build_object(
            'id', pr.id,
            'username', pr.username,
            'full_name', pr.full_name,
            'avatar_url', pr.avatar_url
        ),
        exists(select 1 from likes l where l.post_id = p.id and l.user_id = auth_user_id),
        (select count(*) from likes l where l.post_id = p.id),
        (select count(*) from comments c where c.post_id = p.id)
    from
        posts p
    join
        profiles pr on p.user_id = pr.id
    order by
        p.created_at desc;
end;
$$ language plpgsql;

-- Stored procedure to get user profile details with follow counts
create or replace function get_profile_with_details(p_username text, auth_user_id uuid)
returns table (
    id uuid,
    username text,
    full_name text,
    avatar_url text,
    followers_count bigint,
    following_count bigint,
    is_following boolean
) as $$
begin
    return query
    select
        pr.id,
        pr.username,
        pr.full_name,
        pr.avatar_url,
        (select count(*) from follows f where f.following_id = pr.id),
        (select count(*) from follows f where f.follower_id = pr.id),
        exists(select 1 from follows f where f.follower_id = auth_user_id and f.following_id = pr.id)
    from
        profiles pr
    where
        pr.username = p_username;
end;
$$ language plpgsql;
