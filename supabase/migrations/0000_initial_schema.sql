-- Tabla de Perfiles de Usuario
-- Almacena información pública de los perfiles de usuario.
create table
  public.profiles (
    id uuid not null primary key,
    updated_at timestamp with time zone null,
    username text not null,
    full_name text null,
    avatar_url text null,
    bio text null,
    banner_url text null,
    constraint profiles_id_fkey foreign key (id) references auth.users (id) on delete cascade,
    constraint username_length check (char_length(username) >= 3),
    constraint username_unique unique (username)
  );

-- Políticas de Seguridad para Perfiles
-- 1. Permite a los usuarios leer todos los perfiles.
-- 2. Permite a los usuarios crear su propio perfil.
-- 3. Permite a los usuarios actualizar su propio perfil.
alter table public.profiles enable row level security;
create policy "Los perfiles son visibles para todos." on public.profiles for select using (true);
create policy "Los usuarios pueden insertar su propio perfil." on public.profiles for insert with check (auth.uid() = id);
create policy "Los usuarios pueden actualizar su propio perfil." on public.profiles for update using (auth.uid() = id);

-- Función para Crear Perfil de Usuario Automáticamente
-- Se dispara cuando un nuevo usuario se registra en auth.users.
create function public.handle_new_user() returns trigger as $$
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
$$ language plpgsql security definer;

-- Trigger para la Función handle_new_user
-- Se activa después de cada inserción en la tabla auth.users.
create trigger on_auth_user_created
after insert on auth.users for each row
execute procedure public.handle_new_user();

-- Almacenamiento de Avatares
-- Bucket público para las imágenes de perfil de los usuarios.
insert into
  storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true);

-- Políticas de Seguridad para Avatares
-- 1. Permite a cualquiera ver los avatares.
-- 2. Permite a los usuarios autenticados subir su propio avatar.
-- 3. Permite a los usuarios autenticados actualizar su propio avatar.
create policy "Los avatares son visibles públicamente." on storage.objects for select using (bucket_id = 'avatars');
create policy "Cualquier usuario autenticado puede subir un avatar." on storage.objects for insert with check (bucket_id = 'avatars' and auth.uid() is not null);
create policy "Un usuario puede actualizar su propio avatar." on storage.objects for update with check (bucket_id = 'avatars' and auth.uid() = owner);


-- Almacenamiento de Banners
-- Bucket público para las imágenes de banner de los perfiles.
insert into
  storage.buckets (id, name, public)
values
  ('banners', 'banners', true);

-- Políticas de Seguridad para Banners
-- 1. Permite a cualquiera ver los banners.
-- 2. Permite a los usuarios autenticados subir su propio banner.
-- 3. Permite a los usuarios autenticados actualizar su propio banner.
create policy "Los banners son visibles públicamente." on storage.objects for select using (bucket_id = 'banners');
create policy "Cualquier usuario autenticado puede subir un banner." on storage.objects for insert with check (bucket_id = 'banners' and auth.uid() is not null);
create policy "Un usuario puede actualizar su propio banner." on storage.objects for update with check (bucket_id = 'banners' and auth.uid() = owner);


-- Tabla de Publicaciones (Posts)
create table
  public.posts (
    id uuid not null default gen_random_uuid() primary key,
    created_at timestamp with time zone not null default now(),
    content text not null,
    author_id uuid not null,
    image_url text null,
    constraint posts_author_id_fkey foreign key (author_id) references public.profiles (id) on delete cascade
  );
  
-- Políticas de Seguridad para Publicaciones
alter table public.posts enable row level security;
create policy "Las publicaciones son visibles para todos." on public.posts for select using (true);
create policy "Los usuarios pueden crear publicaciones." on public.posts for insert with check (auth.uid() = author_id);
create policy "Los usuarios pueden eliminar sus propias publicaciones." on public.posts for delete using (auth.uid() = author_id);
create policy "Los usuarios pueden actualizar sus propias publicaciones." on public.posts for update using (auth.uid() = author_id);

-- Tabla de "Me Gusta" (Likes)
create table
  public.likes (
    id uuid not null default gen_random_uuid() primary key,
    user_id uuid not null,
    post_id uuid not null,
    constraint likes_user_id_fkey foreign key (user_id) references public.profiles (id) on delete cascade,
    constraint likes_post_id_fkey foreign key (post_id) references public.posts (id) on delete cascade,
    constraint likes_unique unique (user_id, post_id)
  );

-- Políticas de Seguridad para "Me Gusta"
alter table public.likes enable row level security;
create policy "Los likes son visibles para todos." on public.likes for select using (true);
create policy "Los usuarios pueden dar me gusta." on public.likes for insert with check (auth.uid() = user_id);
create policy "Los usuarios pueden quitar su me gusta." on public.likes for delete using (auth.uid() = user_id);


-- Tabla de Comentarios (Comments)
create table
  public.comments (
    id uuid not null default gen_random_uuid() primary key,
    created_at timestamp with time zone not null default now(),
    content text not null,
    author_id uuid not null,
    post_id uuid not null,
    constraint comments_author_id_fkey foreign key (author_id) references public.profiles (id) on delete cascade,
    constraint comments_post_id_fkey foreign key (post_id) references public.posts (id) on delete cascade
  );

-- Políticas de Seguridad para Comentarios
alter table public.comments enable row level security;
create policy "Los comentarios son visibles para todos." on public.comments for select using (true);
create policy "Los usuarios pueden crear comentarios." on public.comments for insert with check (auth.uid() = author_id);
create policy "Los usuarios pueden eliminar sus propios comentarios." on public.comments for delete using (auth.uid() = author_id);


-- Tabla de Seguidores (Followers)
create table
  public.followers (
    follower_id uuid not null,
    followed_id uuid not null,
    created_at timestamp with time zone not null default now(),
    primary key (follower_id, followed_id),
    constraint followers_follower_id_fkey foreign key (follower_id) references public.profiles (id) on delete cascade,
    constraint followers_followed_id_fkey foreign key (followed_id) references public.profiles (id) on delete cascade
  );

-- Políticas de Seguridad para Seguidores
alter table public.followers enable row level security;
create policy "Las relaciones de seguimiento son visibles para todos." on public.followers for select using (true);
create policy "Los usuarios pueden seguir a otros." on public.followers for insert with check (auth.uid() = follower_id);
create policy "Los usuarios pueden dejar de seguir a otros." on public.followers for delete using (auth.uid() = follower_id);


-- Vista para Posts con Detalles Adicionales
-- Incluye el autor, conteo de likes, conteo de comentarios y si el usuario actual ha dado like.
create or replace view
  public.posts_with_details as
select
  p.*,
  pr.username as author_username,
  pr.full_name as author_full_name,
  pr.avatar_url as author_avatar_url,
  (
    select
      count(*)
    from
      likes
    where
      post_id = p.id
  ) as likes_count,
  (
    select
      count(*)
    from
      comments
    where
      post_id = p.id
  ) as comments_count,
  exists (
    select
      1
    from
      likes
    where
      post_id = p.id and user_id = auth.uid()
  ) as user_has_liked_post,
  pr as author
from
  posts p
  left join profiles pr on p.author_id = pr.id;

-- Vista para Comentarios con Autor
-- Une los comentarios con la información de perfil de su autor.
create or replace view
  public.comments_with_author as
select
  c.*,
  p.username,
  p.full_name,
  p.avatar_url
from
  comments c
  left join profiles p on c.author_id = p.id;
  
-- Vista para Perfiles con Conteo de Seguidores/Seguidos
create or replace view
  public.profiles_with_follow_counts as
select
    p.*,
    (select count(*) from followers where followed_id = p.id) as followers_count,
    (select count(*) from followers where follower_id = p.id) as following_count
from
    profiles p;

-- Realtime: Habilitar para tablas
-- Replica los cambios en tiempo real a los clientes suscritos.
alter publication supabase_realtime add table public.posts, public.comments, public.likes, public.followers;


-- Tablas de Chat
-- 1. Tabla de Conversaciones
create table public.conversations (
    id uuid not null default gen_random_uuid() primary key,
    created_at timestamp with time zone not null default now()
);

-- RLS para Conversaciones
alter table public.conversations enable row level security;
create policy "Los usuarios solo pueden ver las conversaciones en las que participan."
on public.conversations for select
using (
  id in (
    select conversation_id from public.conversation_participants where user_id = auth.uid()
  )
);

-- 2. Tabla de Participantes de Conversación
create table public.conversation_participants (
    conversation_id uuid not null,
    user_id uuid not null,
    created_at timestamp with time zone not null default now(),
    primary key (conversation_id, user_id),
    constraint conversation_participants_conversation_id_fkey foreign key (conversation_id) references public.conversations (id) on delete cascade,
    constraint conversation_participants_user_id_fkey foreign key (user_id) references public.profiles (id) on delete cascade
);

-- RLS para Participantes de Conversación
alter table public.conversation_participants enable row level security;
create policy "Los usuarios pueden ver los participantes de sus propias conversaciones."
on public.conversation_participants for select
using (
  conversation_id in (
    select conversation_id from public.conversation_participants where user_id = auth.uid()
  )
);
create policy "Los usuarios pueden añadirse a una conversación."
on public.conversation_participants for insert
with check (
  user_id = auth.uid()
);

-- 3. Tabla de Mensajes
create table public.messages (
    id uuid not null default gen_random_uuid() primary key,
    created_at timestamp with time zone not null default now(),
    content text not null,
    author_id uuid not null,
    conversation_id uuid not null,
    constraint messages_author_id_fkey foreign key (author_id) references public.profiles (id) on delete cascade,
    constraint messages_conversation_id_fkey foreign key (conversation_id) references public.conversations (id) on delete cascade
);

-- RLS para Mensajes
alter table public.messages enable row level security;
create policy "Los usuarios pueden ver los mensajes de sus conversaciones."
on public.messages for select
using (
  conversation_id in (
    select conversation_id from public.conversation_participants where user_id = auth.uid()
  )
);
create policy "Los usuarios pueden enviar mensajes en sus conversaciones."
on public.messages for insert
with check (
  author_id = auth.uid() and
  conversation_id in (
    select conversation_id from public.conversation_participants where user_id = auth.uid()
  )
);

-- Habilitar Realtime para tablas de chat
alter publication supabase_realtime add table public.messages, public.conversations, public.conversation_participants;
