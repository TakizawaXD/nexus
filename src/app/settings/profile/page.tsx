import { Separator } from "@/components/ui/separator"
import { ProfileForm } from "../_components/profile-form"
import { createServerClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"

export default async function SettingsProfilePage() {
    const supabase = createServerClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (!profile) {
        notFound()
    }
    
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Perfil</h3>
                <p className="text-sm text-muted-foreground">
                    Así es como otros te verán en el sitio.
                </p>
            </div>
            <Separator />
            <ProfileForm profile={profile} />
        </div>
    )
}
