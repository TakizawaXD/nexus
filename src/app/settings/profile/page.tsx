import { Separator } from "@/components/ui/separator"
import { ProfileForm } from "../_components/profile-form"
import { MOCK_USER } from "@/lib/mock-data"
import { Profile } from "@/lib/types"

export default async function SettingsProfilePage() {
    const profile = MOCK_USER as Profile;
    
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
