import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, Search } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface LogEntry {
  id: string
  timestamp: number
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  source?: string
}

export default function ConsoleViewer() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [filter, setFilter] = useState<'all' | 'info' | 'warn' | 'error' | 'debug'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [autoScroll, setAutoScroll] = useState(true)
  const logsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs, autoScroll])

  const addLog = (entry: Omit<LogEntry, 'id' | 'timestamp'>) => {
    const newLog: LogEntry = {
      ...entry,
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    }
    setLogs(prev => [...prev, newLog])
  }

  const clearLogs = () => {
    setLogs([])
  }

  const filteredLogs = logs.filter(log => {
    if (filter !== 'all' && log.level !== filter) return false
    if (searchTerm && !log.message.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    return true
  })

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return 'text-destructive'
      case 'warn':
        return 'text-yellow-500'
      case 'debug':
        return 'text-blue-500'
      default:
        return 'text-foreground'
    }
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const timeStr = date.toLocaleTimeString('zh-CN', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    const ms = date.getMilliseconds().toString().padStart(3, '0')
    return `${timeStr}.${ms}`
  }

  // 模拟日志（用于演示）
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const levels: LogEntry['level'][] = ['info', 'warn', 'error', 'debug']
        const level = levels[Math.floor(Math.random() * levels.length)]
        const messages = [
          '资源加载完成',
          '客户端脚本初始化',
          '服务端事件触发',
          '数据库查询执行',
          '配置文件解析成功',
        ]
        addLog({
          level,
          message: messages[Math.floor(Math.random() * messages.length)],
          source: 'fivem-resource',
        })
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="h-full flex flex-col p-6">
      <div className="max-w-6xl mx-auto w-full space-y-4 flex flex-col flex-1">
        <div>
          <h1 className="text-2xl font-bold">控制台日志</h1>
          <p className="text-muted-foreground">查看和管理应用日志</p>
        </div>

        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>日志输出</CardTitle>
                <CardDescription>实时查看应用日志信息</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={clearLogs}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  清空
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col space-y-4">
            <div className="flex gap-2">
              <div className="flex gap-1 border rounded-md">
                <Button
                  variant={filter === 'all' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  全部
                </Button>
                <Button
                  variant={filter === 'info' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter('info')}
                >
                  信息
                </Button>
                <Button
                  variant={filter === 'warn' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter('warn')}
                >
                  警告
                </Button>
                <Button
                  variant={filter === 'error' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter('error')}
                >
                  错误
                </Button>
                <Button
                  variant={filter === 'debug' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter('debug')}
                >
                  调试
                </Button>
              </div>
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="搜索日志..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoScroll"
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="autoScroll" className="text-sm">
                  自动滚动
                </label>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-muted/30 rounded-md p-4 font-mono text-sm">
              {filteredLogs.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  暂无日志
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className={cn(
                        "flex items-start gap-3 p-2 rounded hover:bg-muted/50",
                        getLevelColor(log.level)
                      )}
                    >
                      <span className="text-muted-foreground text-xs min-w-[80px]">
                        {formatTime(log.timestamp)}
                      </span>
                      <span className="min-w-[60px] text-xs font-semibold uppercase">
                        {log.level}
                      </span>
                      <span className="flex-1">{log.message}</span>
                      {log.source && (
                        <span className="text-xs text-muted-foreground">
                          [{log.source}]
                        </span>
                      )}
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              )}
            </div>

            <div className="text-xs text-muted-foreground">
              共 {logs.length} 条日志，显示 {filteredLogs.length} 条
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

