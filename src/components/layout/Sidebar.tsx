import { Link, useLocation } from 'react-router-dom'
import { FileCode, Settings, Network, Bug, Home, FolderOpen, BookOpen, Github, Wrench } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import ResourceExplorer from '@/features/explorer/ResourceExplorer'

const navigation = [
  { name: '首页', href: '/', icon: Home },
  { name: '编辑器', href: '/editor', icon: FileCode },
  { name: '配置生成器', href: '/generator', icon: Settings },
  { name: '依赖分析器', href: '/analyzer', icon: Network },
  { name: '调试工具', href: '/debugger', icon: Bug },
  { name: '工具集', href: '/tools', icon: Wrench },
  { name: '文档', href: '/docs', icon: BookOpen },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col">
      <div className="p-4 border-b border-border">
        <nav className="space-y-1">
          <div className="text-sm font-medium text-muted-foreground mb-4 px-3">
            导航
          </div>
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>
        <div className="mt-4 pt-4 border-t border-border">
          <a
            href="https://github.com/Pe0ny9-A/Fivem-Studio"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Github className="h-4 w-4" />
            GitHub
          </a>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="explorer" className="h-full flex flex-col">
          <TabsList className="mx-2 mt-2">
            <TabsTrigger value="explorer" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              <span>资源管理器</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="explorer" className="flex-1 overflow-hidden mt-2">
            <ResourceExplorer />
          </TabsContent>
        </Tabs>
      </div>
    </aside>
  )
}

