# Nexo - A Minimalist Social Network

Welcome to Nexo! This is a minimalist social network application built with a modern tech stack, designed for performance, scalability, and a great user experience.

## 🎨 Features

-   **Authentication**: Secure user registration and login with Email/Password and Google, powered by Supabase Auth.
-   **Public Feed**: A real-time public feed on the main page.
-   **User Profiles**: Dynamic user profiles displaying user information and their posts.
-   **Post Management**: Full CRUD (Create, Read, Update, Delete) for text-based posts (up to 280 characters).
-   **Likes**: Users can like and unlike posts.
-   **Real-time Updates**: The feed updates in real-time using Supabase Realtime subscriptions.
-   **Protected Routes**: Middleware ensures that only authenticated users can perform certain actions.
-   **Responsive Design**: A mobile-first design that looks great on all devices.

## 🔧 Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Authentication & Database**: [Supabase](https://supabase.io/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
-   **Deployment**: Ready for [Vercel](https://vercel.com/)

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   Node.js (v18 or later)
-   npm, yarn, or pnpm
-   A Supabase account

### 1. Set up Your Supabase Project

1.  Go to [Supabase](https://app.supabase.io/) and create a new project.
2.  Navigate to the **SQL Editor** in your new project.
3.  Copy the entire content of `supabase/migrations/0000_initial_schema.sql` and run it to set up your database tables, policies, and triggers.
4.  In your Supabase project, go to **Authentication** -> **Providers** and enable **Google**. You will need to provide a Client ID and Secret from your Google Cloud Console. Make sure to add the correct redirect URI to your Google Cloud OAuth credentials, which you can find in your Supabase Auth settings.
5.  Go to **Project Settings** -> **API**. Find your Project URL and the `anon` public key. You will need these for your environment variables.

### 2. Local Development Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Set up environment variables:**
    Create a file named `.env.local` in the root of your project by copying the example file:
    ```bash
    cp .env.example .env.local
    ```
    Now, open `.env.local` and add your Supabase project credentials:
    ```
    NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📦 Deployment

This application is optimized for deployment on [Vercel](https://vercel.com/).

1.  Push your code to a Git repository (e.g., GitHub).
2.  Sign up for a Vercel account and connect your Git repository.
3.  Vercel will automatically detect that you are using Next.js.
4.  Add your Supabase environment variables (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the Vercel project settings.
5.  Deploy! Vercel will handle the build and deployment process for you.

---

Happy coding!
