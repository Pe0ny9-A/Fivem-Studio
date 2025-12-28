import { useState, useEffect, useRef } from 'react'
import { Search, FileCode, Settings, Network, Bug, BookOpen, Home, Github } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/utils/cn'
import Fuse from 'fuse.js'

interface Command {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  action: () => void
  category: string
  keywords: string[]
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  const commands: Command[] = [
    {
      id: 'home',
      name: '首页',
      description: '返回首页',
      icon: Home,
      category: '导航',
      keywords: ['home', '首页', '主页'],
      action: () => navigate('/'),
    },
    {
      id: 'editor',
      name: '编辑器',
      description: '打开代码编辑器',
      icon: FileCode,
      category: '导航',
      keywords: ['editor', '编辑器', '代码'],
      action: () => navigate('/editor'),
    },
    {
      id: 'generator',
      name: '配置生成器',
      description: '生成fxmanifest.lua配置',
      icon: Settings,
      category: '导航',
      keywords: ['generator', '生成器', '配置'],
      action: () => navigate('/generator'),
    },
    {
      id: 'analyzer',
      name: '依赖分析器',
      description: '分析资源依赖关系',
      icon: Network,
      category: '导航',
      keywords: ['analyzer', '分析器', '依赖'],
      action: () => navigate('/analyzer'),
    },
    {
      id: 'debugger',
      name: '调试工具',
      description: '查看控制台和性能',
      icon: Bug,
      category: '导航',
      keywords: ['debugger', '调试', '控制台'],
      action: () => navigate('/debugger'),
    },
    {
      id: 'docs',
      name: '文档',
      description: '查看FiveM开发文档',
      icon: BookOpen,
      category: '导航',
      keywords: ['docs', '文档', '帮助'],
      action: () => navigate('/docs'),
    },
    {
      id: 'github',
      name: 'GitHub',
      description: '在GitHub上查看项目',
      icon: Github,
      category: '外部',
      keywords: ['github', 'git', '仓库'],
      action: () => window.open('https://github.com/Pe0ny9-A/Fivem-Studio', '_blank'),
    },
  ]

  const fuse = new Fuse(commands, {
    keys: ['name', 'description', 'keywords'],
    threshold: 0.3,
    includeScore: true,
  })

  const results = query
    ? fuse.search(query).map((result: Fuse.FuseResult<Command>) => result.item)
    : commands

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (results[selectedIndex]) {
          results[selectedIndex].action()
          onOpenChange(false)
        }
      } else if (e.key === 'Escape') {
        onOpenChange(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, results, selectedIndex, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="输入命令... (Ctrl+K)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-0 focus-visible:ring-0"
            />
          </div>
        </div>
        <div className="max-h-[400px] overflow-auto">
          {results.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              没有找到命令
            </div>
          ) : (
            <div className="py-2">
              {Object.entries(
                results.reduce((acc: Record<string, Command[]>, cmd: Command) => {
                  if (!acc[cmd.category]) acc[cmd.category] = []
                  acc[cmd.category].push(cmd)
                  return acc
                }, {} as Record<string, Command[]>)
              ).map(([category, cmds]: [string, Command[]]) => (
                <div key={category} className="mb-4">
                  <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">
                    {category}
                  </div>
                  {cmds.map((cmd: Command) => {
                    const globalIndex = results.indexOf(cmd)
                    const Icon = cmd.icon
                    return (
                      <button
                        key={cmd.id}
                        onClick={() => {
                          cmd.action()
                          onOpenChange(false)
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-accent transition-colors",
                          globalIndex === selectedIndex && "bg-accent"
                        )}
                      >
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="font-medium">{cmd.name}</div>
                          <div className="text-sm text-muted-foreground">{cmd.description}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-2 border-t text-xs text-muted-foreground text-center">
          使用 ↑↓ 导航，Enter 执行，Esc 关闭
        </div>
      </DialogContent>
    </Dialog>
  )
}

