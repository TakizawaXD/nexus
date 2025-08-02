'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { login, signup } from '@/lib/actions/auth.actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { useEffect, useState } from 'react';

function SubmitButton({ type }: { type: 'login' | 'register' }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {type === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
    </Button>
  );
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          {state?.error && (
            <p className="text-sm font-medium text-destructive">{state.error}</p>
          )}
          <SubmitButton type={type} />
        </form>
      </CardContent>
    </Card>
  );
}
