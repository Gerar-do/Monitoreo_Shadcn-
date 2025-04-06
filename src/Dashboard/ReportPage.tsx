import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Moon, Sun } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import AnomaliesReport from "./AnomaliesReport"

export default function ReportPage() {
  const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected'>('connected');
  const { theme, setTheme } = useTheme();

  // Verificar el estado de conexión con la API
  useEffect(() => {
    const checkAPIConnection = async () => {
      try {
        const response = await fetch('http://3.226.1.115:8029/datos', {
          method: 'GET',
          signal: AbortSignal.timeout(5000), // 5 segundos máximo
        });
        
        setApiStatus(response.ok ? 'connected' : 'disconnected');
      } catch (error) {
        console.error('Error al verificar conexión con API:', error);
        setApiStatus('disconnected');
      }
    };

    // Verificar inmediatamente
    checkAPIConnection();

    // Verificar periódicamente
    const intervalId = setInterval(checkAPIConnection, 30000); // cada 30 segundos
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar apiStatus={apiStatus} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4 w-full">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Reporte de Anomalías</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            
            {/* Botón de tema en la barra superior */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 ml-auto"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <AnomaliesReport />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 