import React from 'react';
import { AppHeader } from './ui/AppHeader'; // Importa el componente móvil
import { Sidebar } from './ui/sidebar';     // Importa el componente escritorio

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50/50">
      
      {/* 1. MÓVIL Y TABLET: Se encarga el AppHeader (Arriba y Abajo) */}
      <AppHeader />

      {/* 2. ESCRITORIO: Se encarga el Sidebar (Izquierda) */}
      <Sidebar />

      {/* 3. CONTENIDO PRINCIPAL */}
      <main 
        className="
          min-h-screen w-full transition-all duration-300
          
          /* === AJUSTES PARA MÓVIL (< 1024px) === */
          pt-20       /* Espacio arriba para el Header */
          pb-24       /* Espacio abajo para el Menú Nav */
          px-4        /* Márgenes laterales */
          
          /* === AJUSTES PARA ESCRITORIO (>= 1024px) === */
          lg:pl-64    /* Deja espacio a la izquierda para el Sidebar */
          lg:pt-8     /* Padding superior normal */
          lg:pb-8     /* Padding inferior normal */
          lg:px-8     /* Padding lateral más amplio */
        "
      >
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
};

export default Layout;