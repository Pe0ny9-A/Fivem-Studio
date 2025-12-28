import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileCode, Settings, Network, Bug, BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function Home() {
  const features = [
    {
      title: '代码编辑器',
      description: '强大的Monaco编辑器，支持Lua和JavaScript语法高亮',
      icon: FileCode,
      link: '/editor',
    },
    {
      title: '配置生成器',
      description: '快速生成fxmanifest.lua配置文件',
      icon: Settings,
      link: '/generator',
    },
    {
      title: '依赖分析器',
      description: '分析和可视化资源依赖关系',
      icon: Network,
      link: '/analyzer',
    },
    {
      title: '调试工具',
      description: '控制台日志和性能监控',
      icon: Bug,
      link: '/debugger',
    },
    {
      title: 'FiveM 文档',
      description: '完整的FiveM开发文档和教程，新手友好',
      icon: BookOpen,
      link: '/docs',
    },
  ]

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">FiveM Studio</h1>
          <p className="text-muted-foreground text-lg">
            专业的FiveM资源开发工具集 - 让开发更简单
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </div>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to={feature.link}>
                    <Button variant="outline" className="w-full">
                      开始使用
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>快速开始</CardTitle>
            <CardDescription>开始使用FiveM Studio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">1. 创建或导入项目</h3>
              <p className="text-sm text-muted-foreground">
                在资源管理器中创建新文件或上传现有项目文件
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">2. 编辑代码</h3>
              <p className="text-sm text-muted-foreground">
                使用强大的代码编辑器编写和编辑Lua/JavaScript代码
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">3. 生成配置</h3>
              <p className="text-sm text-muted-foreground">
                使用配置生成器快速创建fxmanifest.lua文件
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">4. 分析依赖</h3>
              <p className="text-sm text-muted-foreground">
                使用依赖分析器检查资源依赖关系和循环依赖
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">5. 查阅文档</h3>
              <p className="text-sm text-muted-foreground">
                遇到问题？查看完整的FiveM开发文档和教程
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              新手入门指南
            </CardTitle>
            <CardDescription>
              第一次使用FiveM开发？从这里开始
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">
              我们的文档系统包含了完整的FiveM开发指南，从基础概念到高级技巧，帮助你快速上手。
            </p>
            <Link to="/docs">
              <Button className="w-full">
                查看文档
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

