import React, { useState } from 'react';
import { Menu, X, Search, Bell, User } from 'lucide-react';

interface AppHeaderProps {
  userEmail?: string;
  onSearch?: (query: string) => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ 
  userEmail = "usuario@estudioelegante.com", // Valor por defecto como ejemplo
  onSearch 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* --- HEADER PRINCIPAL --- */}
      <header className="bg-white border-b border-gray-200 h-16 fixed top-0 w-full z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between gap-4">
          
          {/* 1. Logo / Branding */}
          <div className="flex-shrink-0 font-bold text-2xl text-purple-700 tracking-tight">
            Estudio<span className="text-gray-900">Elegante</span>
          </div>

          {/* 2. Buscador Global (MANTENIDO) */}
          <div className="flex-1 max-w-2xl mx-4">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </span>
              <input
                type="text"
                placeholder="Buscar globalmente..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 sm:text-sm transition duration-150 ease-in-out"
                onChange={(e) => onSearch && onSearch(e.target.value)}
              />
            </div>
          </div>

          {/* 3. Área Derecha: Correo y Menú */}
          <div className="flex items-center gap-4">
            
            {/* Correo del Usuario (RESTAURADO AQUÍ) */}
            {/* Hidden en móvil muy pequeño, visible en tablet/PC */}
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 font-medium bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
              <User className="h-4 w-4 text-purple-600" />
              <span>{userEmail}</span>
            </div>

            {/* Separador visual opcional */}
            <div className="h-6 w-px bg-gray-300 hidden md:block"></div>

            {/* Botón para abrir el Menú */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 rounded-md text-gray-500 hover:text-purple-600 hover:bg-purple-50 focus:outline-none transition-colors"
              aria-label="Abrir menú"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* --- MENÚ LATERAL (OVERLAY) --- */}
      {/* Fondo oscuro (Overlay) */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          aria-hidden="true"
          // Si quieres que SOLO se cierre con la X, quita el onClick de aquí.
          // Si prefieres que también cierre al dar clic fuera, déjalo.
          // Por tu petición de "solo cerrar con X", lo dejaremos sin acción de cierre aquí.
        />
      )}

      {/* Panel del Menú */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Cabecera del Menú Lateral */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Menú</h2>
            
            {/* Botón de CERRAR (X) - CRÍTICO PARA PC */}
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Contenido del Menú */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            <a href="#" className="block px-4 py-3 rounded-lg hover:bg-purple-50 hover:text-purple-700 font-medium text-gray-700 transition-colors">
              Inicio
            </a>
            <a href="#" className="block px-4 py-3 rounded-lg hover:bg-purple-50 hover:text-purple-700 font-medium text-gray-700 transition-colors">
              Mis Proyectos
            </a>
            <a href="#" className="block px-4 py-3 rounded-lg hover:bg-purple-50 hover:text-purple-700 font-medium text-gray-700 transition-colors">
              Configuración
            </a>
            {/* Más opciones aquí */}
          </nav>

          {/* Footer del menú (Opcional, para cerrar sesión, etc.) */}
          <div className="p-4 border-t border-gray-100 bg-gray-50">
             <button className="w-full text-center text-sm text-red-500 font-medium hover:underline">
               Cerrar Sesión
             </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AppHeader;