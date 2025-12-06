import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  Search, 
  Stethoscope, 
  LogOut,
  User
} from 'lucide-react';
import { SidebarProvider, SidebarInset, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { BottomNav } from "./BottomNav";
import { useApp } from '@/state/AppContext';
import { Button } from '@/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

// Componente Header Interno con Buscador Inteligente (Command Palette)
const HeaderOriginal = () => {
  const { toggleSidebar } = useSidebar(); 
  const { currentUser, logout, patients } = useApp();
  const navigate = useNavigate();
  
  // Estado para el Command Palette
  const [open, setOpen] = useState(false);

  // Atajo de teclado: Ctrl+K o Cmd+K para abrir buscador
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSelectPatient = (patientId: string) => {
    setOpen(false); // Cerrar el modal
    navigate(`/pacientes/${patientId}`); // Ir a la ficha
  };

  return (
    <>
      <header className="h-16 border-b border-border bg-card sticky top-0 z-40 flex items-center px-4 gap-4 w-full">
        {/* Botón Menú: Solo visible en PC */}
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

        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Stethoscope className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-lg font-semibold text-foreground">ClauDent</h1>
        </div>

        {/* --- BUSCADOR TIPO BOTÓN --- */}
        <div className="flex-1 max-w-md mx-auto">
          <Button
            variant="outline"
            className="relative h-9 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
            onClick={() => setOpen(true)}
          >
            <Search className="mr-2 h-4 w-4" />
            <span className="hidden lg:inline-flex">Buscar paciente...</span>
            <span className="inline-flex lg:hidden">Buscar...</span>
            <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        </div>

        {/* Usuario y Logout (PC) */}
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

      {/* --- EL MODAL DE BÚSQUEDA INTELIGENTE --- */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Escribe el nombre del paciente..." />
        <CommandList>
          <CommandEmpty>No se encontraron resultados.</CommandEmpty>
          <CommandGroup heading="Pacientes">
            {patients.map((patient) => (
              <CommandItem
                key={patient.id}
                value={`${patient.nombres} ${patient.apellidos}`} // Esto permite buscar por nombre completo
                onSelect={() => handleSelectPatient(patient.id)}
              >
                <User className="mr-2 h-4 w-4" />
                <span>{patient.nombres} {patient.apellidos}</span>
                {patient.curp && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({patient.curp})
                  </span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};

// Layout Principal
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="hidden lg:block">
        <AppSidebar />
      </div>

      <SidebarInset className="bg-background flex flex-col min-h-screen w-full overflow-x-hidden">
        <HeaderOriginal />
        <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6 w-full max-w-full overflow-y-auto">
           {children}
        </main>
        <div className="lg:hidden block">
          <BottomNav />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;
