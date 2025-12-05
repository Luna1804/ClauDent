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

// Eliminamos la lógica de posición fija aquí, el Layout se encargará de mostrarlo/ocultarlo
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
    <div className="flex flex-col h-full bg-card border-r border-border">
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

      {/* Footer del Sidebar */}
      <div className="p-4 border-t border-border bg-muted/20">
        <Button 
            variant="outline" 
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            onClick={logout}
        >
          <LogOut size={16} className="mr-2" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
};