import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface PerformanceMetrics {
  timestamp: number
  memory: {
    used: number
    total: number
  }
  fps: number
  cpu: number
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([])
  const [currentMetrics, setCurrentMetrics] = useState<PerformanceMetrics | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      // 获取性能指标（模拟数据）
      const performance = (window.performance as any)
      const memory = performance.memory || { usedJSHeapSize: 0, totalJSHeapSize: 0 }
      
      const newMetrics: PerformanceMetrics = {
        timestamp: Date.now(),
        memory: {
          used: Math.round(memory.usedJSHeapSize / 1048576), // MB
          total: Math.round(memory.totalJSHeapSize / 1048576), // MB
        },
        fps: Math.round(60 - Math.random() * 10), // 模拟FPS
        cpu: Math.round(Math.random() * 30), // 模拟CPU使用率
      }

      setCurrentMetrics(newMetrics)
      setMetrics(prev => {
        const updated = [...prev, newMetrics]
        // 只保留最近100条记录
        return updated.slice(-100)
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const getMemoryPercentage = () => {
    if (!currentMetrics) return 0
    return Math.round((currentMetrics.memory.used / currentMetrics.memory.total) * 100)
  }

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">性能监控</h1>
          <p className="text-muted-foreground">实时监控应用性能指标</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>内存使用</CardTitle>
              <CardDescription>JavaScript堆内存</CardDescription>
            </CardHeader>
            <CardContent>
              {currentMetrics ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {currentMetrics.memory.used} MB
                    </span>
                    <span className="text-sm text-muted-foreground">
                      / {currentMetrics.memory.total} MB
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${getMemoryPercentage()}%` }}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    使用率: {getMemoryPercentage()}%
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground">加载中...</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>FPS</CardTitle>
              <CardDescription>帧率</CardDescription>
            </CardHeader>
            <CardContent>
              {currentMetrics ? (
                <div className="space-y-2">
                  <div className="text-4xl font-bold">
                    {currentMetrics.fps}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {currentMetrics.fps >= 55 ? '优秀' : 
                     currentMetrics.fps >= 30 ? '良好' : '需要优化'}
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground">加载中...</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>CPU使用率</CardTitle>
              <CardDescription>处理器使用情况</CardDescription>
            </CardHeader>
            <CardContent>
              {currentMetrics ? (
                <div className="space-y-2">
                  <div className="text-4xl font-bold">
                    {currentMetrics.cpu}%
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${currentMetrics.cpu}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground">加载中...</div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>性能历史</CardTitle>
            <CardDescription>最近100次采样数据</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.length > 0 ? (
              <div className="space-y-4">
                <div className="h-64 flex items-end gap-1">
                  {metrics.slice(-50).map((metric, index) => (
                    <div
                      key={index}
                      className="flex-1 bg-primary/30 rounded-t hover:bg-primary/50 transition-colors"
                      style={{
                        height: `${(metric.memory.used / metric.memory.total) * 100}%`,
                      }}
                      title={`${metric.memory.used} MB`}
                    />
                  ))}
                </div>
                <div className="text-sm text-muted-foreground text-center">
                  内存使用趋势（最近50次采样）
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                暂无数据
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

