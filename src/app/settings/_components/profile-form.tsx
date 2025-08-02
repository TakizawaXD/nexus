'use client'

import { useActionState } from 'react'
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
    const [state, formAction] = useActionState(updateProfile, initialState);
    
    const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url);
    const avatarFileInputRef = useRef<HTMLInputElement>(null);

    const [bannerPreview, setBannerPreview] = useState<string | null>(profile.banner_url);
    const bannerFileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (state.message) {
            toast({
                title: state.success ? "Éxito" : "Error",
                description: state.message,
                variant: state.success ? "default" : "destructive",
            });
        }
    }, [state, toast]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if(type === 'avatar') {
                    setAvatarPreview(reader.result as string);
                } else {
                    setBannerPreview(reader.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };
    
    return (
        <form action={formAction} className="space-y-8">
            <div>
                <Label htmlFor="banner">Banner</Label>
                 <div className="mt-2 aspect-video w-full max-w-lg overflow-hidden rounded-lg border">
                    <img 
                        src={bannerPreview || 'https://placehold.co/600x200.png'} 
                        alt="Banner preview" 
                        className="h-full w-full object-cover" 
                    />
                </div>
                <input
                    type="file"
                    id="banner"
                    name="banner"
                    accept="image/png, image/jpeg"
                    className="hidden"
                    ref={bannerFileInputRef}
                    onChange={(e) => handleFileChange(e, 'banner')}
                />
                <Button type="button" variant="outline" className="mt-2" onClick={() => bannerFileInputRef.current?.click()}>
                    Cambiar banner
                </Button>
            </div>

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
                        ref={avatarFileInputRef}
                        onChange={(e) => handleFileChange(e, 'avatar')}
                    />
                    <Button type="button" variant="outline" onClick={() => avatarFileInputRef.current?.click()}>
                        Cambiar foto
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
