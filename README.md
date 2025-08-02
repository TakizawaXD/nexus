# Nexo - Red Social Minimalista

Bienvenido a Nexo, una plataforma social minimalista y moderna construida con las últimas tecnologías web. Inspirada en plataformas como X (Twitter), Nexo ofrece una experiencia de usuario limpia, rápida y en tiempo real.

![Nexo Screenshot](https://placehold.co/800x400.png)

## 🎨 Características Principales

-   **🚀 Stack Moderno**: Construida con **Next.js (App Router)** y **TypeScript** para un rendimiento y escalabilidad excepcionales.
-   **🔒 Autenticación Segura**: Sistema completo de registro e inicio de sesión con email/contraseña y proveedores como Google, todo gestionado por **Supabase Auth**.
-   **✍️ Gestión de Perfiles**: Los usuarios pueden personalizar su perfil, incluyendo nombre, biografía, foto de perfil y un banner único, con subida de imágenes a **Supabase Storage**.
-   **🌐 Feed en Tiempo Real**: El feed principal y las páginas de publicaciones se actualizan instantáneamente con nuevos posts, comentarios y "me gusta" gracias a **Supabase Realtime**.
-   **❤️ Interactividad Social**: Funcionalidad completa para crear, leer, actualizar y eliminar publicaciones. Los usuarios pueden dar "me gusta", comentar y seguir a otros usuarios.
-   **🌙 Modo Oscuro/Claro**: Tema dual con un interruptor para que los usuarios elijan su experiencia visual preferida, con persistencia gracias a `next-themes`.
-   **📱 Diseño Responsivo**: Interfaz totalmente adaptable que se ve y funciona de maravilla en cualquier dispositivo, desde móviles hasta ordenadores de escritorio.
-   **⚡ Experiencia de Usuario Optimizada**: Uso de **Actualizaciones Optimistas** para que acciones como dar "me gusta" o seguir a alguien se sientan instantáneas.

## 🔧 Pila Tecnológica

-   **Framework**: [Next.js](https://nextjs.org/) (App Router)
-   **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
-   **Base de Datos y Backend**: [Supabase](https://supabase.io/)
    -   **Base de Datos**: Supabase Postgres
    -   **Autenticación**: Supabase Auth
    -   **Almacenamiento**: Supabase Storage
    -   **Realtime**: Supabase Realtime Subscriptions
-   **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
-   **Componentes UI**: [shadcn/ui](https://ui.shadcn.com/)
-   **Gestión de Formularios**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
-   **Iconos**: [Lucide React](https://lucide.dev/guide/packages/lucide-react)

## 🚀 Cómo Empezar

Sigue estos pasos para tener una copia del proyecto funcionando en tu máquina local.

### Prerrequisitos

-   Node.js (v18 o superior)
-   npm, yarn, o pnpm
-   Una cuenta de [Supabase](https://supabase.com/)

### 1. Configura tu Proyecto de Supabase

1.  Ve a [Supabase](https://app.supabase.io/) y crea un nuevo proyecto.
2.  Una vez creado el proyecto, navega a la sección **SQL Editor**.
3.  Copia todo el contenido del archivo `supabase/migrations/0000_initial_schema.sql` que se encuentra en este repositorio.
4.  Pega el código SQL en el editor y ejecútalo para crear todas las tablas, funciones y políticas de seguridad necesarias.
5.  Ve a **Project Settings** -> **API**. Necesitarás dos valores de esta página:
    -   Project URL
    -   Project API Keys -> `anon` `public` key

### 2. Configuración Local

1.  **Clona el repositorio:**
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd nexo
    ```

2.  **Instala las dependencias:**
    ```bash
    npm install
    ```

3.  **Configura las variables de entorno:**
    Crea un archivo llamado `.env.local` en la raíz de tu proyecto. Puedes copiar el archivo de ejemplo:
    ```bash
    cp .env.example .env.local
    ```
    Abre `.env.local` y añade tus credenciales de Supabase:
    ```
    NEXT_PUBLIC_SUPABASE_URL=TU_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_SUPABASE_ANON_KEY
    ```

4.  **Ejecuta el servidor de desarrollo:**
    ```bash
    npm run dev
    ```

¡Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación en acción!

## 📦 Despliegue

Esta aplicación está optimizada para desplegarse en [Vercel](https://vercel.com/).

1.  Sube tu código a un repositorio de Git (GitHub, GitLab, etc.).
2.  Crea una cuenta en Vercel y conecta tu repositorio.
3.  Vercel detectará automáticamente que es un proyecto de Next.js.
4.  En la configuración del proyecto en Vercel, añade las mismas variables de entorno que usaste en `.env.local` (`NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
5.  ¡Despliega! Vercel se encargará del resto.
