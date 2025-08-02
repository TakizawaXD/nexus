
-- ### TABLES ###

-- Profiles Table: Stores public user data
create table public.profiles (
  id uuid not null primary key,
  updated_at timestamp with time zone,
  username text not null unique,
  full_name text,
  avatar_url text,
  bio text,
  banner_url text
);
alter table public.profiles enable row level security;

-- Posts Table: Stores all posts
create table public.posts (
  id uuid not null primary key default uuid_generate_v4(),
  created_at timestamp with time zone not null default now(),
  content text not null,
  author_id uuid not null references public.profiles(id) on delete cascade,
  image_url text
);
alter table public.posts enable row level security;

-- Comments Table: Stores comments on posts
create table public.comments (
  id uuid not null primary key default uuid_generate_v4(),
  created_at timestamp with time zone not null default now(),
  content text not null,
  author_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade
);
alter table public.comments enable row level security;

-- Likes Table: Tracks likes on posts
create table public.likes (
  id uuid not null primary key default uuid_generate_v4(),
  created_at timestamp with time zone not null default now(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  unique(user_id, post_id)
);
alter table public.likes enable row level security;

-- Followers Table: Tracks user follow relationships
create table public.followers (
  id uuid not null primary key default uuid_generate_v4(),
  created_at timestamp with time zone not null default now(),
  follower_id uuid not null references public.profiles(id) on delete cascade,
  followed_id uuid not null references public.profiles(id) on delete cascade,
  unique(follower_id, followed_id)
);
alter table public.followers enable row level security;

-- Conversations Table: Manages chat sessions
create table public.conversations (
    id uuid not null primary key default uuid_generate_v4(),
    created_at timestamp with time zone not null default now()
);
alter table public.conversations enable row level security;

-- Conversation Participants Table: Links users to conversations
create table public.conversation_participants (
    id uuid not null primary key default uuid_generate_v4(),
    conversation_id uuid not null references public.conversations(id) on delete cascade,
    participant_id uuid not null references public.profiles(id) on delete cascade,
    unique(conversation_id, participant_id)
);
alter table public.conversation_participants enable row level security;

-- Messages Table: Stores individual chat messages
create table public.messages (
    id uuid not null primary key default uuid_generate_v4(),
    created_at timestamp with time zone not null default now(),
    sender_id uuid not null references public.profiles(id) on delete cascade,
    conversation_id uuid not null references public.conversations(id) on delete cascade,
    content text not null
);
alter table public.messages enable row level security;


-- ### SECURITY POLICIES (RLS) ###

-- Profiles Policies
create policy "Allow public read access on profiles" on public.profiles for select using (true);
create policy "Allow individual update access" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "Allow authenticated users to create their profile" on public.profiles for insert with check (auth.uid() = id);

-- Posts Policies
create policy "Allow public read access on posts" on public.posts for select using (true);
create policy "Allow authenticated users to create posts" on public.posts for insert with check (auth.uid() = author_id);
create policy "Allow users to update their own posts" on public.posts for update using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy "Allow users to delete their own posts" on public.posts for delete using (auth.uid() = author_id);

-- Comments Policies
create policy "Allow public read access on comments" on public.comments for select using (true);
create policy "Allow authenticated users to create comments" on public.comments for insert with check (auth.uid() = author_id);
create policy "Allow users to update their own comments" on public.comments for update using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy "Allow users to delete their own comments" on public.comments for delete using (auth.uid() = author_id);

-- Likes Policies
create policy "Allow public read access on likes" on public.likes for select using (true);
create policy "Allow authenticated users to create likes" on public.likes for insert with check (auth.uid() = user_id);
create policy "Allow users to delete their own likes" on public.likes for delete using (auth.uid() = user_id);

-- Followers Policies
create policy "Allow public read access on followers" on public.followers for select using (true);
create policy "Allow authenticated users to follow/unfollow" on public.followers for all using (auth.uid() = follower_id) with check (auth.uid() = follower_id);

-- Conversations Policies
create policy "Allow users to see their own conversations" on public.conversations for select using (
    id in (
        select conversation_id from public.conversation_participants where participant_id = auth.uid()
    )
);
create policy "Allow users to create conversations" on public.conversations for insert with check (true);

-- Conversation Participants Policies
create policy "Allow users to manage their own participation" on public.conversation_participants for all using (participant_id = auth.uid()) with check (participant_id = auth.uid());
create policy "Allow participants to see other participants" on public.conversation_participants for select using (
    conversation_id in (
        select conversation_id from public.conversation_participants where participant_id = auth.uid()
    )
);

-- Messages Policies
create policy "Allow participants to read messages in their conversations" on public.messages for select using (
    conversation_id in (
        select conversation_id from public.conversation_participants where participant_id = auth.uid()
    )
);
create policy "Allow participants to send messages in their conversations" on public.messages for insert with check (
    sender_id = auth.uid() and conversation_id in (
        select conversation_id from public.conversation_participants where participant_id = auth.uid()
    )
);


-- ### FUNCTIONS & TRIGGERS ###

-- Function to create a profile for a new user
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'user_name',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

-- Trigger to call the function when a new user signs up
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ### VIEWS ###

-- View to get posts with author details and counts
create view public.posts_with_details as
select
    p.id,
    p.created_at,
    p.content,
    p.author_id,
    p.image_url,
    coalesce(pr.username, 'unknown') as author_username,
    coalesce(pr.full_name, 'Unknown User') as author_full_name,
    pr.avatar_url as author_avatar_url,
    (select count(*) from public.likes l where l.post_id = p.id) as likes_count,
    (select count(*) from public.comments c where c.post_id = p.id) as comments_count,
    (select exists(select 1 from public.likes l where l.post_id = p.id and l.user_id = auth.uid())) as user_has_liked_post,
    pr as author
from public.posts p
left join public.profiles pr on p.author_id = pr.id;


-- View to get comments with author details
create view public.comments_with_author as
select
    c.id,
    c.created_at,
    c.content,
    c.author_id,
    c.post_id,
    pr as author
from public.comments c
left join public.profiles pr on c.author_id = pr.id;

-- View for profiles with follower/following counts
create view public.profiles_with_follow_counts as
select
    p.*,
    (select count(*) from public.followers f where f.follower_id = p.id) as following_count,
    (select count(*) from public.followers f where f.followed_id = p.id) as followers_count
from public.profiles p;


-- ### STORAGE ###

-- Avatars Bucket
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Allow public read access on avatars" on storage.objects for select using (bucket_id = 'avatars');
create policy "Allow authenticated users to upload avatars" on storage.objects for insert with check (bucket_id = 'avatars' and auth.uid() = (storage.foldername(name))[1]::uuid);
create policy "Allow authenticated users to update their own avatar" on storage.objects for update with check (bucket_id = 'avatars' and auth.uid() = (storage.foldername(name))[1]::uuid);

-- Banners Bucket
insert into storage.buckets (id, name, public)
values ('banners', 'banners', true)
on conflict (id) do nothing;

create policy "Allow public read access on banners" on storage.objects for select using (bucket_id = 'banners');
create policy "Allow authenticated users to upload banners" on storage.objects for insert with check (bucket_id = 'banners' and auth.uid() = (storage.foldername(name))[1]::uuid);
create policy "Allow authenticated users to update their own banner" on storage.objects for update with check (bucket_id = 'banners' and auth.uid() = (storage.foldername(name))[1]::uuid);
