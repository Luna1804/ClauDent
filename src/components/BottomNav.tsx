import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Users, Stethoscope, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const location = useLocation();

  const items = [
    { title: "Inicio", url: "/dashboard", icon: Home },
    { title: "Pacientes", url: "/pacientes", icon: Users },
    { title: "Servicios", url: "/servicios", icon: Stethoscope },
    { title: "Cotiza", url: "/cotizaciones", icon: FileText },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border h-16 flex items-center justify-around px-2 pb-safe shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
      {items.map((item) => {
        const isActive = location.pathname === item.url;
        const Icon = item.icon;
        
        return (
          <Link
            key={item.title}
            to={item.url}
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-full h-full text-[10px] font-medium transition-colors",
              isActive 
                ? "text-primary" 
                : "text-muted-foreground hover:text-primary/70"
            )}
          >
            <Icon className={cn("h-5 w-5", isActive && "fill-current/20")} />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </div>
  );
}