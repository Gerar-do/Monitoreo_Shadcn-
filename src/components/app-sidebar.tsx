import * as React from "react"
import { Frame, PieChart, Menu, FileText, AlertTriangle, WifiOff } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"

// Importa el TeamSwitcher modificado con la funcionalidad de tema
import { TeamSwitcher } from "@/components/team-switcher"
import { NavProjects } from "@/components/nav-projects"
import { Button } from "@/components/ui/button"

// Esta es una muestra de datos
const data = {
  teams: [
    {
      name: "UP",
      logo: Frame,
      plan: "Universidad",
    },
  ],
  projects: [
    {
      name: "Dashboard",
      url: "/dashboard",
      icon: PieChart,
    },
    {
      name: "Reportes",
      url: "/reportes",
      icon: FileText,
    },
  ],
}

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  apiStatus?: 'connected' | 'disconnected';
}

export function AppSidebar({ apiStatus = 'connected', ...props }: AppSidebarProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const location = useLocation()
  
  // Determinar qué pestaña está activa
  const isActive = (path: string) => {
    return location.pathname === path;
  }

  return (
    <>
      {/* Header móvil */}
      <div className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between border-b bg-background px-2 lg:hidden">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Menu className="h-4 w-4" />
          </Button>
          <span className="font-semibold text-sm">Monitoreo</span>
          {apiStatus === 'disconnected' && (
            <span className="ml-1 flex items-center text-destructive">
              <WifiOff className="h-3 w-3 mr-1" />
              <span className="text-xs">Sin conexión</span>
            </span>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar 
        collapsible="icon" 
        className={`fixed inset-y-0 left-0 z-50 transform border-r bg-background transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } w-[56px] lg:w-56 overflow-hidden`}
        {...props}
      >
        <SidebarHeader className="border-b px-1 py-1">
          <TeamSwitcher teams={data.teams} />
        </SidebarHeader>
        <SidebarContent className="px-1 py-1">
          <NavProjects projects={data.projects} />
        </SidebarContent>
        
        {apiStatus === 'disconnected' && (
          <SidebarFooter className="border-t px-1 py-1">
            <div className="flex items-center gap-1 text-destructive truncate">
              <AlertTriangle className="h-3 w-3 flex-shrink-0" />
              <div className="text-[10px]">
                <span className="font-medium whitespace-nowrap">API desconectada</span>
              </div>
            </div>
          </SidebarFooter>
        )}
      </Sidebar>

      {/* Barra de navegación inferior para móvil */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background lg:hidden">
        <div className="flex h-14 items-center justify-around">
          <Link to="/dashboard" className="w-full">
            <Button 
              variant={isActive('/dashboard') ? "default" : "ghost"}
              size="icon" 
              className="w-full flex flex-col items-center gap-1 py-1 h-auto"
            >
              <PieChart className="h-4 w-4" />
              <span className="text-[10px]">Dashboard</span>
            </Button>
          </Link>
          <Link to="/reportes" className="w-full">
            <Button 
              variant={isActive('/reportes') ? "default" : "ghost"}
              size="icon" 
              className="w-full flex flex-col items-center gap-1 py-1 h-auto"
            >
              <FileText className="h-4 w-4" />
              <span className="text-[10px]">Reportes</span>
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-full flex flex-col items-center gap-1 py-1 h-auto" 
            onClick={() => setIsOpen(!isOpen)}
          >
            <Menu className="h-4 w-4" />
            <span className="text-[10px]">Menú</span>
          </Button>
        </div>
      </div>

      {/* Overlay para cerrar el sidebar en móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}