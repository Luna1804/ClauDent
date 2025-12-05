import React from 'react';
import { Search, User, LogOut, Stethoscope } from 'lucide-react';

interface AppHeaderProps {
  userEmail?: string;
  onSearch?: (query: string) => void;
  onLogout?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ 
  userEmail = "doctor@clinica.com", 
  onSearch,
  onLogout 
}) => {
  return (
    <header className="bg-white border-b border-gray-200 h-16 sticky top-0 z-30 shadow-sm w-full">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between gap-4">
        
        {/* 1. LOGO / BRANDING (Izquierda) */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Stethoscope className="h-6 w-6 text-purple-600" />
          </div>
          {/* Texto solo visible en tablets/PC para ahorrar espacio en móvil */}
          <span className="hidden md:block font-bold text-xl text-gray-800 tracking-tight">
            Consultorio<span className="text-purple-600">Dental</span>
          </span>
        </div>

        {/* 2. BUSCADOR GLOBAL (Centro/Expandido) */}
        {/* Visible en Móvil y PC como pediste. Ocupa el espacio disponible (flex-1) */}
        <div className="flex-1 max-w-2xl">
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
            </span>
            <input
              type="text"
              placeholder="Buscar paciente, cita, historial..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 sm:text-sm transition-all duration-200"
              onChange={(e) => onSearch && onSearch(e.target.value)}
            />
          </div>
        </div>

        {/* 3. ÁREA DERECHA (Solo Escritorio) */}
        {/* En móvil se oculta (hidden) porque el logout y perfil van en tu barra de abajo */}
        <div className="hidden md:flex items-center gap-4 ml-2">
          
          {/* Correo del Usuario */}
          <div className="flex items-center gap-2 text-sm text-gray-600 font-medium bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
            <User className="h-4 w-4 text-purple-600" />
            <span>{userEmail}</span>
          </div>

          <div className="h-6 w-px bg-gray-300"></div>

          {/* Botón Cerrar Sesión (Escritorio) */}
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-gray-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-md transition-colors text-sm font-medium"
            title="Cerrar Sesión"
          >
            <LogOut className="h-5 w-5" />
            <span>Salir</span>
          </button>
        </div>

      </div>
    </header>
  );
};