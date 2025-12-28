import { ReactNode, useState } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import FileSearch from '@/features/explorer/FileSearch'
import CommandPalette from '@/features/command/CommandPalette'
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isCommandOpen, setIsCommandOpen] = useState(false)

  useKeyboardShortcut('p', () => setIsSearchOpen(true), { ctrl: true })
  useKeyboardShortcut('k', () => setIsCommandOpen(true), { ctrl: true })

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
      <FileSearch open={isSearchOpen} onOpenChange={setIsSearchOpen} />
      <CommandPalette open={isCommandOpen} onOpenChange={setIsCommandOpen} />
    </div>
  )
}

