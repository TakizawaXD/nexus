import { Separator } from "@/components/ui/separator"
import { SidebarNav } from "./_components/sidebar-nav"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Configuración",
  description: "Administra la configuración de tu cuenta y del sitio.",
}

const sidebarNavItems = [
  {
    title: "Perfil",
    href: "/settings/profile",
  },
]

interface SettingsLayoutProps {
  children: React.ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <>
      <div className="space-y-6 p-10 pb-16">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Configuración</h2>
          <p className="text-muted-foreground">
            Administra la configuración de tu cuenta y del sitio.
          </p>
        </div>
        <Separator className="my-6" />
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="-mx-4 lg:w-1/5">
            <SidebarNav items={sidebarNavItems} />
          </aside>
          <div className="flex-1 lg:max-w-2xl">{children}</div>
        </div>
      </div>
    </>
  )
}
