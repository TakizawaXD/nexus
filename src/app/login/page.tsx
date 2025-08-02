import AuthForm from '@/components/auth/AuthForm';
import { NexoLogo } from '@/components/shared/NexoLogo';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
            <Link href="/" className="flex items-center gap-2">
                <NexoLogo className="h-10 w-10 text-primary" />
                <span className="text-3xl font-bold">Nexo</span>
            </Link>
        </div>
        <h1 className="mb-2 text-center text-2xl font-bold">
          Inicia sesión en tu cuenta
        </h1>
        <p className="mb-6 text-center text-muted-foreground">
          Introduce tus datos para acceder a la plataforma
        </p>
        <AuthForm mode="login" />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          ¿No tienes una cuenta?{' '}
          <Link
            href="/register"
            className="font-semibold text-primary hover:underline"
          >
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
