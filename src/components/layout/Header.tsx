import { Moon, Sun } from 'lucide-react'
import { useSettingsStore } from '@/stores/settingsStore'
import { Button } from '@/components/ui/button'

export default function Header() {
  const { theme, setTheme } = useSettingsStore()

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  return (
    <header className="h-12 border-b border-border bg-card flex items-center justify-between px-4">
      <h1 className="text-lg font-semibold">FiveM Studio</h1>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="h-8 w-8"
      >
        {theme === 'dark' ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </Button>
    </header>
  )
}

