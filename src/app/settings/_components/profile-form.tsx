'use client'

import { useFormState } from 'react-dom'
import { useEffect, useRef, useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import type { Profile } from '@/lib/types'
import { updateProfile } from '@/lib/actions/user.actions'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User } from 'lucide-react'
import { SubmitButton } from './submit-button'


export function ProfileForm({ profile }: { profile: Profile }) {
    const { toast } = useToast()
    const [initialState, setInitialState] = useState({ success: false, message: '', errors: null });
    const [state, formAction] = useFormState(updateProfile, initialState);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (state.message) {
            toast({
                title: state.success ? "Éxito" : "Error",
                description: state.message,
                variant: state.success ? "default" : "destructive",
            });
        }
    }, [state, toast]);

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    return (
        <form action={formAction} className="space-y-8">
            <div>
                <Label htmlFor="avatar">Foto de perfil</Label>
                <div className="mt-2 flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={avatarPreview ?? undefined} />
                        <AvatarFallback><User className="h-10 w-10" /></AvatarFallback>
                    </Avatar>
                    <input
                        type="file"
                        id="avatar"
                        name="avatar"
                        accept="image/png, image/jpeg"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleAvatarChange}
                    />
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                        Cambiar
                    </Button>
                </div>
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="username">Nombre de usuario</Label>
                <Input id="username" name="username" defaultValue={profile.username} required />
                {state?.errors?.username && <p className="text-sm font-medium text-destructive">{state.errors.username}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="fullName">Nombre completo</Label>
                <Input id="fullName" name="fullName" defaultValue={profile.full_name ?? ''} />
                {state?.errors?.fullName && <p className="text-sm font-medium text-destructive">{state.errors.fullName}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="bio">Biografía</Label>
                <Textarea id="bio" name="bio" defaultValue={profile.bio ?? ''} maxLength={160} />
                <p className="text-sm text-muted-foreground">
                    Tu biografía no puede tener más de 160 caracteres.
                </p>
                {state?.errors?.bio && <p className="text-sm font-medium text-destructive">{state.errors.bio}</p>}
            </div>

            <SubmitButton />
        </form>
    )
}
