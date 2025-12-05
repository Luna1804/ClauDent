import React, { useState } from 'react';
import { Menu, Stethoscope, User } from 'lucide-react';
import { AppHeader } from './ui/AppHeader'; // Tu componente móvil
import { Sidebar } from './ui/sidebar';     // Tu sidebar de escritorio
import { Button } from '@/components/ui/button';
import { useApp } from '@/state/AppContext';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  // Estado para controlar el sidebar en Desktop
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { currentUser } = useApp();

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      
      {/* =========================================================
          1. ZONA MÓVIL/TABLET (< 1024px)
          Se encarga el AppHeader de todo.
      ========================================================= */}
      <AppHeader />


      {/* =========================================================
          2. ZONA ESCRITORIO (>= 1024px)
          Header superior con botón de menú + Sidebar lateral
      ========================================================= */}
      
      {/* Header Desktop (Solo visible en LG) */}
      <header className="hidden lg:flex h-16 border-b border-border bg-card items-center justify-between px-6 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center gap-4">
          {/* Botón para Abrir/Cerrar Sidebar */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo Desktop */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                <Stethoscope className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-foreground">ClauDent</span>
          </div>
        </div>

        {/* Info Usuario Desktop */}
        <div className="flex items-center gap-3">
            <div className="text-right">
                <p className="text-sm font-medium">{currentUser?.email}</p>
                <p className="text-xs text-muted-foreground">Dentista</p>
            </div>
            <div className="h-9 w-9 bg-secondary/20 rounded-full flex items-center justify-center text-primary">
                <User className="h-5 w-5" />
            </div>
        </div>
      </header>

      {/* Sidebar Desktop (Controlado por sidebarOpen) */}
      <aside 
        className={cn(
          "hidden lg:block fixed left-0 top-16 bottom-0 z-40 transition-all duration-300 ease-in-out border-r border-border bg-card overflow-hidden",
          sidebarOpen ? "w-64" : "w-0 border-none"
        )}
      >
        <Sidebar />
      </aside>


      {/* =========================================================
          3. CONTENIDO PRINCIPAL (MAIN)
          Se ajusta automáticamente
      ========================================================= */}
      <main 
        className={cn(
          "flex-1 w-full transition-all duration-300",
          
          /* MÓVIL: Padding para las barras AppHeader */
          "pt-20 pb-24 px-4", 
          
          /* DESKTOP: Padding para el Header superior + Espacio del Sidebar */
          "lg:pt-20 lg:pb-8 lg:px-8",
          sidebarOpen ? "lg:pl-64" : "lg:pl-0"
        )}
      >
        <div className="max-w-7xl mx-auto h-full">
          {children}
        </div>
      </main>

    </div>
  );
};

export default Layout;