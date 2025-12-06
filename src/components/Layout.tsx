import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  Search, 
  Stethoscope, 
  LogOut 
} from 'lucide-react';
import { SidebarProvider, SidebarInset, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { BottomNav } from "./BottomNav";
import { useApp } from '@/state/AppContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Componente Header Interno
const HeaderOriginal = () => {
  const { toggleSidebar } = useSidebar(); 
  const { currentUser, logout, setSearchQuery } = useApp();
  const [searchInput, setSearchInput] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    navigate('/pacientes');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 border-b border-border bg-card sticky top-0 z-40 flex items-center px-4 gap-4 w-full">
      {/* Botón Menú: Solo visible en PC (lg:block) */}
      <div className="hidden lg:block">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
          <Stethoscope className="h-5 w-5 text-primary-foreground" />
        </div>
        <h1 className="text-lg font-semibold text-foreground hidden sm:block">ClauDent</h1>
      </div>

      <form onSubmit={handleSearch} className="flex-1 max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
            aria-label="Buscar pacientes"
          />
        </div>
      </form>

      <div className="hidden lg:flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-foreground">{currentUser?.email}</p>
          <p className="text-xs text-muted-foreground">Dentista</p> 
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          aria-label="Cerrar sesión"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};

// Layout Principal
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SidebarProvider defaultOpen={true}>
      {/* 1. Sidebar: Solo visible en pantallas GRANDES */}
      <div className="hidden lg:block">
        <AppSidebar />
      </div>

      {/* 2. Contenido Principal */}
      {/* AGREGADO: overflow-x-hidden para evitar que tablas rompan el ancho */}
      <SidebarInset className="bg-background flex flex-col min-h-screen w-full overflow-x-hidden">
        
        <HeaderOriginal />

        {/* AGREGADO: max-w-full para forzar a los hijos (tablas/grids) a respetar el ancho
        */}
        <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6 w-full max-w-full overflow-y-auto">
            {children}
        </main>

        {/* 3. Barra Inferior: Dentro del flujo pero solo móvil */}
        <div className="lg:hidden block">
          <BottomNav />
        </div>

      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;
