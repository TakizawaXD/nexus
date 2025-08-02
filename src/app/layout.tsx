import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Sidebar from '@/components/layout/Sidebar';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme/ThemeProvider';

export const metadata: Metadata = {
  title: {
    default: 'Nexo',
    template: '%s | Nexo',
  },
  description: 'Una red social minimalista construida con Next.js.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn(
          "min-h-screen bg-background font-body antialiased"
        )}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen w-full">
            <div className="flex-1 flex justify-center">
              <Sidebar />
              <main className="flex w-full max-w-2xl flex-col border-x border-border">
                {children}
              </main>
              <div className="hidden lg:block w-80">
                {/* El contenido de la barra lateral derecha puede ir aquí */}
              </div>
            </div>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
