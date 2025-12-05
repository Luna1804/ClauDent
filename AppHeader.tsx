import React from 'react';
import { Search, LogOut, Stethoscope, User } from 'lucide-react';

interface AppHeaderProps {
  userEmail?: string;
  userRole?: string;
  onSearch?: (query: string) => void;
  onLogout?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ 
  userEmail = "claudentconsultorio@gmail.com", 
  userRole = "Dentista",
  onSearch,
  onLogout 
}) => {
  return (
    <header className="bg-white border-b border-gray-200 h-16 sticky top-0 z-30 w-full font-sans">
      <div className="w-full px-4 h-full flex items-center justify-between gap-4">
        
        {/* 1. LOGO (ClauDent) */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="bg-sky-500 p-1.5 rounded-lg text-white">
            <Stethoscope className="h-6 w-6" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-xl text-gray-800 tracking-tight hidden xs:block">
            ClauDent
          </span>
        </div>

        {/* 2. BUSCADOR GLOBAL (Visible en Movil y PC) */}
        <div className="flex-1 max-w-xl mx-2 lg:mx-8">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </span>
            <input
              type="text"
              placeholder="Buscar..."
              className="block w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full bg-gray-50 text-sm focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
              onChange={(e) => onSearch && onSearch(e.target.value)}
            />
          </div>
        </div>

        {/* 3. ÁREA DERECHA (Solo PC) */}
        {/* En móvil se oculta (hidden) para que uses tu barra inferior */}
        <div className="hidden md:flex items-center gap-6">
          
          {/* Info Usuario */}
          <div className="text-right hidden lg:block">
            <div className="text-sm font-semibold text-gray-800 leading-none">
              {userEmail}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {userRole}
            </div>
          </div>

          {/* Botón Salir */}
          <button
            onClick={onLogout}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Cerrar Sesión"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>

      </div>
    </header>
  );
};