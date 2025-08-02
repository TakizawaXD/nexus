'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { AtSign, KeyRound, Loader2, User } from 'lucide-react';
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { NexoLogo } from '../shared/NexoLogo';

export default function AuthForm({ message }: { message?: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const supabase = createClient();

  const handleAuthAction = async (formData: FormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (isSignUp) {
      const username = formData.get('username') as string;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
            // You can add full_name and avatar_url here if you have fields for them
          },
        },
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccessMessage('Check your email for the confirmation link.');
      }
    } else { // Sign In
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        window.location.href = '/';
      }
    }
    setIsSubmitting(false);
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="items-center text-center">
        <NexoLogo className="h-12 w-12 text-primary mb-2" />
        <CardTitle className="text-2xl font-bold">
          {isSignUp ? 'Create an account' : 'Welcome to Nexo'}
        </CardTitle>
        <CardDescription>
          {isSignUp
            ? 'Enter your details to create your account.'
            : 'Sign in to continue.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {message && <p className="mb-4 rounded-md bg-muted/50 p-3 text-center text-sm text-foreground">{message}</p>}
        {error && <p className="mb-4 rounded-md bg-destructive/10 p-3 text-center text-sm text-destructive">{error}</p>}
        {successMessage && <p className="mb-4 rounded-md bg-green-500/10 p-3 text-center text-sm text-green-500">{successMessage}</p>}
        <form
          className="flex flex-col gap-4"
          action={handleAuthAction}
        >
          {isSignUp && (
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input id="username" name="username" placeholder="your_username" required className="pl-8" />
              </div>
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <AtSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input id="email" name="email" type="email" placeholder="m@example.com" required className="pl-8" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <KeyRound className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input id="password" name="password" type="password" required className="pl-8" placeholder="••••••••" minLength={6} />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </Button>
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          <Button variant="outline" type="button" onClick={handleGoogleSignIn} disabled={isSubmitting}>
            {isSubmitting ? ( <Loader2 className="mr-2 h-4 w-4 animate-spin" />) : (
                <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4">
                    <title>Google</title>
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.9 2.04-7.07 2.04-5.87 0-10.6-4.87-10.6-10.88s4.73-10.88 10.6-10.88c3.28 0 5.6 1.36 6.9 2.62l2.5-2.5C20.4 1.37 17.1.22 12.48.22 5.6 0 0 5.6 0 12.5S5.6 25 12.48 25c7.3 0 11.9-4.4 11.9-12.2 0-.76-.08-1.53-.2-2.28z" fill="#4285F4"/>
                </svg>
            )}
            Google
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => setIsSignUp(!isSignUp)} className="font-semibold text-primary hover:underline" disabled={isSubmitting}>
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
