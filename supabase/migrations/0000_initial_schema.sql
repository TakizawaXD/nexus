-- 1. Create Profiles Table
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  bio text,
  banner_url text,

  primary key (id),
  unique(username),
  constraint username_length check (char_length(username) >= 3)
);
-- Set up Row Level Security (RLS)
alter table public.profiles
  enable row level security;

-- Policies for Profiles
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update their own profile." on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- 2. Create Posts Table
create table public.posts (
    id uuid not null default gen_random_uuid(),
    created_at timestamp with time zone not null default now(),
    content text not null,
    author_id uuid not null,
    image_url text,

    primary key (id),
    constraint fk_author foreign key (author_id) references public.profiles (id) on delete cascade
);
-- RLS for Posts
alter table public.posts
    enable row level security;

create policy "Posts are viewable by everyone." on public.posts
    for select using (true);

create policy "Users can insert their own posts." on public.posts
    for insert with check (auth.uid() = author_id);

create policy "Users can update their own posts." on public.posts
    for update using (auth.uid() = author_id) with check (auth.uid() = author_id);

create policy "Users can delete their own posts." on public.posts
    for delete using (auth.uid() = author_id);

-- 3. Create Likes Table
create table public.likes (
    id uuid not null default gen_random_uuid(),
    user_id uuid not null,
    post_id uuid not null,

    primary key (id),
    constraint fk_user foreign key (user_id) references auth.users (id) on delete cascade,
    constraint fk_post foreign key (post_id) references public.posts (id) on delete cascade,
    unique(user_id, post_id)
);
-- RLS for Likes
alter table public.likes
    enable row level security;

create policy "Likes are viewable by everyone." on public.likes
    for select using (true);
    
create policy "Users can insert their own likes." on public.likes
    for insert with check (auth.uid() = user_id);

create policy "Users can delete their own likes." on public.likes
    for delete using (auth.uid() = user_id);
    
-- 4. Create Comments Table
create table public.comments (
    id uuid not null default gen_random_uuid(),
    created_at timestamp with time zone not null default now(),
    content text not null,
    author_id uuid not null,
    post_id uuid not null,

    primary key (id),
    constraint fk_author foreign key (author_id) references public.profiles (id) on delete cascade,
    constraint fk_post foreign key (post_id) references public.posts (id) on delete cascade
);
-- RLS for Comments
alter table public.comments
    enable row level security;

create policy "Comments are viewable by everyone." on public.comments
    for select using (true);

create policy "Users can insert their own comments." on public.comments
    for insert with check (auth.uid() = author_id);

create policy "Users can update their own comments." on public.comments
    for update using (auth.uid() = author_id) with check (auth.uid() = author_id);
    
create policy "Users can delete their own comments." on public.comments
    for delete using (auth.uid() = author_id);

-- 5. Create Followers Table
create table public.followers (
    id uuid not null default gen_random_uuid(),
    follower_id uuid not null,
    followed_id uuid not null,

    primary key (id),
    constraint fk_follower foreign key (follower_id) references public.profiles (id) on delete cascade,
    constraint fk_followed foreign key (followed_id) references public.profiles (id) on delete cascade,
    unique(follower_id, followed_id)
);
-- RLS for Followers
alter table public.followers
    enable row level security;
    
create policy "Follower relationships are viewable by everyone." on public.followers
    for select using (true);
    
create policy "Users can follow other users." on public.followers
    for insert with check (auth.uid() = follower_id);
    
create policy "Users can unfollow other users." on public.followers
    for delete using (auth.uid() = follower_id);

-- 6. Create Tables for Realtime Chat
create table public.conversations (
    id uuid not null default gen_random_uuid(),
    created_at timestamp with time zone not null default now(),
    
    primary key (id)
);
-- RLS for Conversations
alter table public.conversations
    enable row level security;
    
create table public.conversation_participants (
    id uuid not null default gen_random_uuid(),
    conversation_id uuid not null,
    user_id uuid not null,
    
    primary key (id),
    constraint fk_conversation foreign key (conversation_id) references public.conversations (id) on delete cascade,
    constraint fk_user foreign key (user_id) references public.profiles (id) on delete cascade,
    unique(conversation_id, user_id)
);
-- RLS for Conversation Participants
alter table public.conversation_participants
    enable row level security;
    
create table public.messages (
    id uuid not null default gen_random_uuid(),
    created_at timestamp with time zone not null default now(),
    content text not null,
    sender_id uuid not null,
    conversation_id uuid not null,
    
    primary key (id),
    constraint fk_sender foreign key (sender_id) references public.profiles (id) on delete cascade,
    constraint fk_conversation foreign key (conversation_id) references public.conversations (id) on delete cascade
);
-- RLS for Messages
alter table public.messages
    enable row level security;

-- Policies for Chat
create policy "Participants can view their conversations." on public.conversations
    for select using (exists (
        select 1 from public.conversation_participants
        where conversation_id = id and user_id = auth.uid()
    ));
    
create policy "Participants can view other participants." on public.conversation_participants
    for select using (exists (
        select 1 from public.conversation_participants as p
        where p.conversation_id = conversation_participants.conversation_id and p.user_id = auth.uid()
    ));

create policy "Participants can view messages in their conversations." on public.messages
    for select using (exists (
        select 1 from public.conversation_participants
        where conversation_id = messages.conversation_id and user_id = auth.uid()
    ));
    
create policy "Participants can send messages in their conversations." on public.messages
    for insert with check (
        auth.uid() = sender_id and
        exists (
            select 1 from public.conversation_participants
            where conversation_id = messages.conversation_id and user_id = auth.uid()
        )
    );

-- 7. Set up Storage
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values 
    ('avatars', 'avatars', true, 5242880, '{"image/jpeg","image/png","image/webp"}'),
    ('banners', 'banners', true, 5242880, '{"image/jpeg","image/png","image/webp"}');

create policy "Avatar images are publicly accessible." on storage.objects
  for select using (bucket_id = 'avatars');

create policy "Anyone can upload an avatar." on storage.objects
  for insert with check (bucket_id = 'avatars');
  
create policy "Users can update their own avatar." on storage.objects
    for update using (auth.uid() = (storage.foldername(name))[1]::uuid);

create policy "Banner images are publicly accessible." on storage.objects
  for select using (bucket_id = 'banners');
  
create policy "Anyone can upload a banner." on storage.objects
  for insert with check (bucket_id = 'banners');
  
create policy "Users can update their own banner." on storage.objects
    for update using (auth.uid() = (storage.foldername(name))[1]::uuid);


-- 8. Create a function to handle new user sign-ups
create or replace function public.handle_new_user()
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
-- Create a trigger to call the function when a new user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 9. Create SQL Views for easier data fetching
create or replace view public.profiles_with_follow_counts as
select
    p.*,
    (select count(*) from followers where followed_id = p.id) as followers_count,
    (select count(*) from followers where follower_id = p.id) as following_count
from
    profiles p;

create or replace view public.posts_with_details as
select
    p.id,
    p.created_at,
    p.content,
    p.image_url,
    p.author_id,
    (select count(*) from likes where post_id = p.id) as likes_count,
    (select count(*) from comments where post_id = p.id) as comments_count,
    case when auth.uid() is not null then
        exists(select 1 from likes where post_id = p.id and user_id = auth.uid())
    else
        false
    end as user_has_liked_post,
    jsonb_build_object(
        'id', prof.id,
        'username', prof.username,
        'full_name', prof.full_name,
        'avatar_url', prof.avatar_url
    ) as author
from
    posts p
join
    profiles prof on p.author_id = prof.id;

create or replace view public.comments_with_author as
select
    c.id,
    c.created_at,
    c.content,
    c.post_id,
    c.author_id,
    jsonb_build_object(
        'id', prof.id,
        'username', prof.username,
        'full_name', prof.full_name,
        'avatar_url', prof.avatar_url
    ) as author
from
    comments c
join
    profiles prof on c.author_id = prof.id;