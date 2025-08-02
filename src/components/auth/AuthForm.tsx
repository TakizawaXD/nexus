'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AtSign, KeyRound, Loader2, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { NexoLogo } from '../shared/NexoLogo';
import { login, signup, signInWithGoogle } from '@/lib/actions/auth.actions';
import { useFormState, useFormStatus } from 'react-dom';

function AuthSubmitButton({ isSignUp }: { isSignUp: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isSignUp ? 'Registrarse' : 'Iniciar Sesión'}
    </Button>
  );
}

function GoogleSignInButton() {
    const { pending } = useFormStatus();
    return (
        <Button variant="outline" type="submit" disabled={pending} formAction={signInWithGoogle} className="w-full">
             {pending ? ( <Loader2 className="mr-2 h-4 w-4 animate-spin" />) : (
                <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4">
                    <title>Google</title>
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.9 2.04-7.07 2.04-5.87 0-10.6-4.87-10.6-10.88s4.73-10.88 10.6-10.88c3.28 0 5.6 1.36 6.9 2.62l2.5-2.5C20.4 1.37 17.1.22 12.48.22 5.6 0 0 5.6 0 12.5S5.6 25 12.48 25c7.3 0 11.9-4.4 11.9-12.2 0-.76-.08-1.53-.2-2.28z" fill="#4285F4"/>
                </svg>
            )}
            Google
        </Button>
    )
}

export default function AuthForm({ searchParams }: { searchParams: { message: string, code: string, next: string } }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loginState, loginAction] = useFormState(login, { message: '' });
  const [signupState, signupAction] = useFormState(signup, { message: '', success: false, errors: null });

  const [message, setMessage] = useState(searchParams.message || '');
  const [isSuccess, setIsSuccess] = useState(signupState.success);
  const [errors, setErrors] = useState<any | null>(null);

  useEffect(() => {
    if (loginState?.message) {
      setMessage(loginState.message);
      setIsSuccess(false);
      setErrors(null);
    }
  }, [loginState]);

  useEffect(() => {
    if (signupState?.message) {
        setMessage(signupState.message);
        setIsSuccess(signupState.success);
        setErrors(signupState.errors);
        if(signupState.success) {
            setIsSignUp(false);
        }
    }
  }, [signupState]);


  return (
    <Card className="w-full animate-in fade-in-0 zoom-in-95">
      <CardHeader className="items-center text-center">
        <NexoLogo className="h-12 w-12 text-primary mb-2" />
        <CardTitle className="text-2xl font-bold">
          {isSignUp ? 'Crear una cuenta' : 'Bienvenido a Nexo'}
        </CardTitle>
        <CardDescription>
          {isSignUp
            ? 'Ingresa tus datos para crear tu cuenta.'
            : 'Inicia sesión para continuar.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {message && (
          <p className={`mb-4 rounded-md p-3 text-center text-sm ${isSuccess ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'}`}>
            {message}
          </p>
        )}
        <form className="flex flex-col gap-4" action={isSignUp ? signupAction : loginAction}>
          {isSignUp && (
            <div className="grid gap-2">
              <Label htmlFor="username">Usuario</Label>
              <div className="relative">
                <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input id="username" name="username" placeholder="tu_usuario" required className="pl-8" />
              </div>
              {errors?.username && <p className="text-sm font-medium text-destructive">{errors.username[0]}</p>}
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <AtSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input id="email" name="email" type="email" placeholder="m@ejemplo.com" required className="pl-8" />
            </div>
             {errors?.email && <p className="text-sm font-medium text-destructive">{errors.email[0]}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <KeyRound className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input id="password" name="password" type="password" required className="pl-8" placeholder="••••••••" minLength={6} />
            </div>
             {errors?.password && <p className="text-sm font-medium text-destructive">{errors.password[0]}</p>}
          </div>
          <AuthSubmitButton isSignUp={isSignUp} />
        </form>
        <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">O continuar con</span>
            </div>
        </div>
        <form action={signInWithGoogle}>
            <GoogleSignInButton />
        </form>
        <div className="mt-4 text-center text-sm">
          {isSignUp ? '¿Ya tienes una cuenta?' : '¿No tienes una cuenta?'}{' '}
          <button onClick={() => { 
              setIsSignUp(!isSignUp);
              setMessage('');
              setErrors(null);
            }} 
            className="font-semibold text-primary hover:underline">
            {isSignUp ? 'Iniciar Sesión' : 'Registrarse'}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
