import { Separator } from "@/components/ui/separator"
import { ProfileForm } from "../_components/profile-form"
import type { Profile } from "@/lib/types"
import { getAuthProfile } from "@/lib/actions/user.actions"
import { notFound } from "next/navigation";

export default async function SettingsProfilePage() {
    const profile = await getAuthProfile();

    if (!profile) {
        notFound();
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
            <ProfileForm profile={profile as Profile} />
        </div>
    )
}
