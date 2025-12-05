import React from 'react';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { BottomNav } from "./BottomNav";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useApp } from '@/state/AppContext';
import { useNavigate } from 'react-router-dom';

export default function LayoutV2({ children }: { children: React.ReactNode }) {
  const { setSearchQuery } = useApp();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/pacientes');
  };

  return (
    <SidebarProvider>
      {/* 1. Sidebar: Solo visible en escritorio (hidden md:flex) */}
      <div className="hidden md:flex h-screen sticky top-0">
        <AppSidebar />
      </div>

      <div className="flex-1 flex flex-col min-h-screen bg-muted/10 w-full relative">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px]">
          {/* Trigger (botón hamburguesa) solo visible en escritorio para colapsar sidebar */}
          <div className="hidden md:block">
            <SidebarTrigger />
          </div>
          
          {/* Título solo visible en móvil */}
          <div className="md:hidden font-bold text-lg text-primary flex items-center gap-2">
            ClauDent
          </div>

          {/* Buscador Global */}
          <div className="w-full flex-1">
            <form onSubmit={handleSearch}>
              <div className="relative w-full max-w-md mx-auto md:mx-0">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar pacientes..."
                  className="w-full appearance-none bg-background pl-8 shadow-none"
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
          </div>
        </header>

        {/* Contenido Principal */}
        <main className="flex-1 p-4 pb-20 md:pb-6 overflow-y-auto w-full max-w-7xl mx-auto">
           {children}
        </main>

        {/* 2. Barra Inferior: Solo visible en móvil (md:hidden) */}
        <div className="md:hidden block">
          <BottomNav />
        </div>
      </div>
    </SidebarProvider>
  );
}