import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Users, Stethoscope, FileText, LogOut } from "lucide-react";
import { useApp } from "@/state/AppContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const location = useLocation();
  const { logout, currentUser } = useApp();

  const items = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "Pacientes", url: "/pacientes", icon: Users },
    { title: "Servicios", url: "/servicios", icon: Stethoscope },
    { title: "Cotizaciones", url: "/cotizaciones", icon: FileText },
  ];

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2 font-bold text-xl text-primary">
          <Stethoscope className="h-6 w-6" />
          <span className="group-data-[collapsible=icon]:hidden">ClauDent</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <div className="flex flex-col gap-2">
          <div className="text-xs text-muted-foreground truncate group-data-[collapsible=icon]:hidden">
            {currentUser?.email}
          </div>
          <SidebarMenu>
             <SidebarMenuItem>
                <SidebarMenuButton onClick={logout} className="text-destructive hover:text-destructive">
                   <LogOut />
                   <span className="group-data-[collapsible=icon]:hidden">Cerrar Sesión</span>
                </SidebarMenuButton>
             </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}