import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AuthForm from '@/components/auth/AuthForm';

export const metadata = {
  title: 'Login',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { message: string };
}) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect('/');
  }

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="w-full max-w-sm p-4">
        <AuthForm message={searchParams.message} />
      </div>
    </div>
  );
}
