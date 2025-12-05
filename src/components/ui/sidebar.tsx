import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Stethoscope, 
  FileText, 
  LogOut 
} from 'lucide-react';
import { useApp } from '@/state/AppContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export const Sidebar = () => {
  const { currentUser, logout } = useApp();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Principal', path: '/dashboard' },
    { icon: Users, label: 'Pacientes', path: '/pacientes' },
    { icon: Stethoscope, label: 'Servicios', path: '/servicios' },
    { icon: FileText, label: 'Cotizaciones', path: '/cotizaciones' },
  ];

  return (
    // "hidden lg:flex" significa: Oculto en móvil, Flexible en pantallas grandes
    <aside className="hidden lg:flex flex-col w-64 h-screen bg-card border-r border-border fixed left-0 top-0 z-40">
      
      {/* Header del Sidebar */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground mr-3">
            <Stethoscope className="h-5 w-5" />
        </div>
        <span className="text-xl font-bold text-foreground">ClauDent</span>
      </div>

      {/* Navegación */}
      <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Footer del Sidebar (Usuario + Logout) */}
      <div className="p-4 border-t border-border bg-muted/20">
        <div className="flex items-center gap-3 mb-4">
            <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {currentUser?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate text-foreground">{currentUser?.email}</p>
                <p className="text-xs text-muted-foreground">Dentista</p>
            </div>
        </div>
        <Button 
            variant="outline" 
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            onClick={logout}
        >
          <LogOut size={16} className="mr-2" />
          Cerrar Sesión
        </Button>
      </div>
    </aside>
  );
};