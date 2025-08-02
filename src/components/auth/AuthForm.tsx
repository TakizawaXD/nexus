'use client';

import { useActionState, useFormStatus } from 'react-dom';
import { login, signup, signInWithGoogle } from '@/lib/actions/auth.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';

function SubmitButton({ mode }: { mode: 'login' | 'register' }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {mode === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
    </Button>
  );
}

function GoogleButton() {
    const { pending } = useFormStatus();
    return (
        <Button variant="outline" className="w-full" disabled={pending}>
            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.2 64.5C308.6 106.5 280.2 96 248 96c-88.8 0-160 71.9-160 160s71.2 160 160 160c98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path>
            </svg>
            Continuar con Google
        </Button>
    )
}

export default function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const { toast } = useToast();
  const action = mode === 'login' ? login : signup;
  const [state, formAction] = useActionState(action, { message: '', errors: null });

  useEffect(() => {
    if (state.message && !state.errors) {
      toast({
        title: 'Error de autenticación',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, toast]);

  return (
    <div className="space-y-6">
        <form action={signInWithGoogle} className="w-full">
            <GoogleButton />
        </form>

        <div className="flex items-center gap-4">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">O CONTINÚA CON</span>
            <Separator className="flex-1" />
        </div>

      <form action={formAction} className="space-y-4">
        {state.message && state.errors && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input id="email" name="email" type="email" placeholder="tu@email.com" required />
          {state?.errors?.email && <p className="text-sm font-medium text-destructive">{state.errors.email}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input id="password" name="password" type="password" required />
          {state?.errors?.password && <p className="text-sm font-medium text-destructive">{state.errors.password}</p>}
        </div>
        {mode === 'register' && (
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" required />
            {state?.errors?.confirmPassword && <p className="text-sm font-medium text-destructive">{state.errors.confirmPassword}</p>}
          </div>
        )}
        <SubmitButton mode={mode} />
      </form>
    </div>
  );
}
