import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Stethoscope, 
  FileText, 
  LogOut,
  User as UserIcon 
} from 'lucide-react';
import { useApp } from '@/state/AppContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export const AppHeader = () => {
  const { currentUser, logout } = useApp();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Inicio', path: '/dashboard' },
    { icon: Users, label: 'Pacientes', path: '/pacientes' },
    { icon: Stethoscope, label: 'Servicios', path: '/servicios' },
    { icon: FileText, label: 'Cotizaciones', path: '/cotizaciones' },
  ];

  return (
    <>
      {/* =========================================================
          1. HEADER SUPERIOR (Solo Móvil/Tablet)
          Muestra Logo y Usuario
      ========================================================= */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4 lg:hidden">
        
        {/* Branding */}
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
            <Stethoscope className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg text-foreground">ClauDent</span>
        </div>

        {/* Perfil / Logout rápido */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-secondary/20 flex items-center justify-center text-primary">
            <span className="text-xs font-bold">
                {currentUser?.email?.charAt(0).toUpperCase() || 'D'}
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={logout} className="h-8 w-8 text-muted-foreground">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* =========================================================
          2. NAVEGACIÓN INFERIOR (Solo Móvil/Tablet)
          Menú principal al alcance del pulgar
      ========================================================= */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 lg:hidden pb-safe">
        <div className="flex justify-around items-center h-16 px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full space-y-1 active:scale-95 transition-transform",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-gray-600"
                )}
              >
                <div className={cn(
                    "p-1 rounded-full transition-colors",
                    isActive && "bg-primary/10"
                )}>
                    <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[10px] font-medium">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};