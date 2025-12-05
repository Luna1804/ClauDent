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
      {/* Botón Menú: Solo visible en PC */}
      <div className="hidden md:block">
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
        <h1 className="text-lg font-semibold text-foreground">ClauDent</h1>
      </div>

      <form onSubmit={handleSearch} className="flex-1 max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar pacientes..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
            aria-label="Buscar pacientes"
          />
        </div>
      </form>

      <div className="hidden md:flex items-center gap-3">
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
      {/* 1. Sidebar: Solo escritorio */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      {/* 2. Contenido Principal (SidebarInset) */}
      <SidebarInset className="bg-background flex flex-col min-h-screen mb-16 md:mb-0"> 
        {/* ^^^ OJO: Agregué mb-16 en móvil para que el contenido no quede tapado por la barra */}
        
        <HeaderOriginal />

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
           {children}
        </main>
      </SidebarInset>

      {/* 3. Barra Inferior: FUERA del SidebarInset */}
      <div className="md:hidden block">
        <BottomNav />
      </div>

    </SidebarProvider>
  );
};

export default Layout;