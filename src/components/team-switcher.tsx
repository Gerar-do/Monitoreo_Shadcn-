import { Moon, Sun, LucideIcon } from "lucide-react"
import { useTheme } from "./theme-provider"
import { Button } from "@/components/ui/button"

interface Team {
  name: string
  logo: LucideIcon
  plan: string
}

export function TeamSwitcher({ teams }: { teams: Team[] }) {
  const { theme, setTheme } = useTheme()
  const selectedTeam = teams[0]

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        <div className="size-5 flex items-center justify-center rounded-md bg-primary/10">
          {selectedTeam.logo && (
            <selectedTeam.logo className="h-3 w-3 flex-shrink-0" />
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <span className="text-xs font-medium truncate block">{selectedTeam.name}</span>
      </div>
      
      {/* Botón de cambio de tema - solo visible en sidebar expandido */}
      <Button 
        variant="ghost" 
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        className="h-5 w-5 p-0 ml-auto hidden data-[state=open]:flex"
      >
        {theme === "dark" ? (
          <Sun className="h-3 w-3" />
        ) : (
          <Moon className="h-3 w-3" />
        )}
      </Button>
    </div>
  )
}