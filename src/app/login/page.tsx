import AuthForm from '@/components/auth/AuthForm';

export const metadata = {
  title: 'Login',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { message: string };
}) {

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="w-full max-w-sm p-4">
        <AuthForm message={searchParams.message} />
      </div>
    </div>
  );
}
