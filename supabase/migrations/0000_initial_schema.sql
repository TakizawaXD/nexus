
-- #############################################################################
-- 1. TABLAS
-- #############################################################################

-- Tabla para perfiles de usuario
-- Esta tabla almacena información pública del perfil de cada usuario.
-- Está vinculada al usuario de autenticación a través del ID.
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  updated_at timestamp with time zone,
  username text not null unique,
  full_name text,
  avatar_url text,
  bio text,
  banner_url text,

  primary key (id),
  constraint username_length check (char_length(username) >= 3)
);

-- Tabla para publicaciones (posts)
-- Almacena el contenido principal que los usuarios publican.
create table public.posts (
    id uuid not null default gen_random_uuid(),
    created_at timestamp with time zone not null default now(),
    content text not null,
    author_id uuid not null references public.profiles(id) on delete cascade,
    image_url text,

    primary key (id),
    constraint content_length check (char_length(content) > 0 and char_length(content) <= 280)
);

-- Tabla para comentarios en las publicaciones
create table public.comments (
    id uuid not null default gen_random_uuid(),
    created_at timestamp with time zone not null default now(),
    content text not null,
    author_id uuid not null references public.profiles(id) on delete cascade,
    post_id uuid not null references public.posts(id) on delete cascade,

    primary key (id),
    constraint content_length check (char_length(content) > 0 and char_length(content) <= 280)
);

-- Tabla para "me gusta" (likes)
-- Registra qué usuario ha dado "me gusta" a qué publicación.
create table public.likes (
    id uuid not null default gen_random_uuid(),
    created_at timestamp with time zone not null default now(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    post_id uuid not null references public.posts(id) on delete cascade,

    primary key(id),
    -- Un usuario solo puede dar "me gusta" una vez a una publicación
    unique(user_id, post_id)
);

-- Tabla de seguidores (followers)
-- Almacena las relaciones de seguimiento entre usuarios.
create table public.followers (
    id uuid not null default gen_random_uuid(),
    created_at timestamp with time zone not null default now(),
    follower_id uuid not null references public.profiles(id) on delete cascade,
    followed_id uuid not null references public.profiles(id) on delete cascade,

    primary key(id),
    -- Un usuario no puede seguir a otro más de una vez
    unique(follower_id, followed_id),
    -- Un usuario no puede seguirse a sí mismo
    constraint user_cannot_follow_themselves check (follower_id <> followed_id)
);


-- #############################################################################
-- 2. ALMACENAMIENTO (STORAGE)
-- #############################################################################

-- Bucket para avatares de usuario
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true);

-- Bucket para banners de perfil de usuario
insert into storage.buckets (id, name, public)
values ('banners', 'banners', true);


-- #############################################################################
-- 3. POLÍTICAS DE SEGURIDAD (ROW LEVEL SECURITY - RLS)
-- #############################################################################

-- Habilitar RLS para todas las tablas
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.followers enable row level security;

-- Políticas para la tabla `profiles`
create policy "Los perfiles son visibles para todos."
  on public.profiles for select using (true);

create policy "Los usuarios pueden insertar su propio perfil."
  on public.profiles for insert with check (auth.uid() = id);

create policy "Los usuarios pueden actualizar su propio perfil."
  on public.profiles for update using (auth.uid() = id);

-- Políticas para la tabla `posts`
create policy "Las publicaciones son visibles para todos."
  on public.posts for select using (true);

create policy "Los usuarios autenticados pueden crear publicaciones."
  on public.posts for insert with check (auth.role() = 'authenticated');

create policy "Los usuarios pueden eliminar sus propias publicaciones."
  on public.posts for delete using (auth.uid() = author_id);

-- Políticas para la tabla `comments`
create policy "Los comentarios son visibles para todos."
  on public.comments for select using (true);

create policy "Los usuarios autenticados pueden crear comentarios."
  on public.comments for insert with check (auth.role() = 'authenticated');

create policy "Los usuarios pueden eliminar sus propios comentarios."
  on public.comments for delete using (auth.uid() = author_id);

-- Políticas para la tabla `likes`
create policy "Los 'me gusta' son visibles para todos."
  on public.likes for select using (true);

create policy "Los usuarios autenticados pueden dar/quitar 'me gusta'."
  on public.likes for insert with check (auth.uid() = user_id);

create policy "Los usuarios pueden eliminar sus propios 'me gusta'."
  on public.likes for delete using (auth.uid() = user_id);

-- Políticas para la tabla `followers`
create policy "Las relaciones de seguimiento son visibles para todos."
  on public.followers for select using (true);

create policy "Los usuarios autenticados pueden seguir a otros."
  on public.followers for insert with check (auth.uid() = follower_id);

create policy "Los usuarios pueden dejar de seguir a otros."
  on public.followers for delete using (auth.uid() = follower_id);

-- Políticas para el almacenamiento `avatars`
create policy "Los avatares son públicos."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Cualquier usuario autenticado puede subir un avatar."
  on storage.objects for insert
  with check ( bucket_id = 'avatars' and auth.role() = 'authenticated' );

create policy "Los usuarios pueden actualizar su propio avatar."
  on storage.objects for update
  using ( auth.uid() = owner )
  with check ( bucket_id = 'avatars' );

-- Políticas para el almacenamiento `banners`
create policy "Los banners son públicos."
  on storage.objects for select
  using ( bucket_id = 'banners' );

create policy "Cualquier usuario autenticado puede subir un banner."
  on storage.objects for insert
  with check ( bucket_id = 'banners' and auth.role() = 'authenticated' );

create policy "Los usuarios pueden actualizar su propio banner."
  on storage.objects for update
  using ( auth.uid() = owner )
  with check ( bucket_id = 'banners' );


-- #############################################################################
-- 4. FUNCIONES Y DISPARADORES (TRIGGERS)
-- #############################################################################

-- Función para crear un perfil automáticamente al registrar un nuevo usuario
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

-- Trigger que llama a la función `handle_new_user` después de cada nuevo registro
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- #############################################################################
-- 5. VISTAS (VIEWS)
-- #############################################################################

-- Vista para obtener el conteo de seguidores y seguidos de cada perfil
create or replace view public.profiles_with_follow_counts as
select
    p.*,
    (select count(*) from public.followers where followed_id = p.id) as followers_count,
    (select count(*) from public.followers where follower_id = p.id) as following_count
from
    public.profiles p;

-- Vista para obtener las publicaciones con detalles adicionales (autor, conteo de likes y comentarios)
create or replace view public.posts_with_details as
select
    p.*,
    (select count(*) from public.likes where post_id = p.id) as likes_count,
    (select count(*) from public.comments where post_id = p.id) as comments_count,
    (
      auth.uid() is not null and 
      exists (
        select 1 from public.likes 
        where post_id = p.id and user_id = auth.uid()
      )
    ) as user_has_liked_post,
    row_to_json(a) as author
from
    public.posts p
join
    public.profiles a on p.author_id = a.id;

-- Vista para obtener los comentarios con los detalles de su autor
create or replace view public.comments_with_author as
select
    c.*,
    row_to_json(a) as author
from
    public.comments c
join
    public.profiles a on c.author_id = a.id;

-- FIN DEL SCRIPT
