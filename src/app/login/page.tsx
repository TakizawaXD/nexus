import AuthForm from '@/components/auth/AuthForm';

export const metadata = {
  title: 'Iniciar Sesión',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { message: string, code: string, next: string };
}) {

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="w-full max-w-sm p-4">
        <AuthForm searchParams={searchParams} />
      </div>
    </div>
  );
}
