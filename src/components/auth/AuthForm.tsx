'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { login, signInWithGoogle, signup } from '@/lib/actions/auth.actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { useEffect, useState } from 'react';
import { Separator } from '../ui/separator';

function SubmitButton({ type }: { type: 'login' | 'register' }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {type === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
    </Button>
  );
}

function GoogleButton() {
    const { pending } = useFormStatus();
    return (
        <Button variant="outline" className="w-full" type="submit" disabled={pending}>
             {pending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
             ) : (
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                    <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.2 64.5C308.6 102.3 280.9 92 248 92c-71 0-129.2 57.3-129.2 128s58.2 128 129.2 128c78.2 0 110.3-57.2 113.5-87.2H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                </svg>
             )}
            Continuar con Google
        </Button>
    )
}

export function AuthForm({ type }: { type: 'login' | 'register' }) {
  const action = type === 'login' ? login : signup;
  const [state, formAction] = useFormState(action, undefined);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (type === 'register' && state?.success) {
      setShowConfirmation(true);
    }
  }, [state, type]);

  if (showConfirmation) {
    return (
        <Alert>
            <AlertTitle>¡Revisa tu correo!</AlertTitle>
            <AlertDescription>
            Hemos enviado un enlace de confirmación a tu correo electrónico para completar el registro.
            </AlertDescription>
        </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{type === 'login' ? 'Bienvenido de Nuevo' : 'Crea tu Cuenta'}</CardTitle>
        <CardDescription>
          {type === 'login'
            ? 'Ingresa tus credenciales para acceder a tu cuenta.'
            : 'Completa los campos para registrarte.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input id="email" name="email" type="email" placeholder="tu@email.com" required />
            {state?.errors?.email && <p className="text-sm font-medium text-destructive">{state.errors.email}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" name="password" type="password" required />
            {state?.errors?.password && <p className="text-sm font-medium text-destructive">{state.errors.password}</p>}
          </div>
          {type === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" required />
              {state?.errors?.confirmPassword && <p className="text-sm font-medium text-destructive">{state.errors.confirmPassword}</p>}
            </div>
          )}
          {state?.error && !state.errors &&(
            <p className="text-sm font-medium text-destructive">{state.error}</p>
          )}
          <SubmitButton type={type} />
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">O continúa con</span>
          </div>
        </div>

        <form action={signInWithGoogle}>
            <GoogleButton />
        </form>
      </CardContent>
    </Card>
  );
}
