import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ConsoleViewer from '@/features/debugger/ConsoleViewer'
import PerformanceMonitor from '@/features/debugger/PerformanceMonitor'

export default function Debugger() {
  return (
    <Tabs defaultValue="console" className="h-full flex flex-col">
      <div className="border-b border-border px-6 pt-4">
        <TabsList>
          <TabsTrigger value="console">控制台</TabsTrigger>
          <TabsTrigger value="performance">性能监控</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="console" className="flex-1 overflow-hidden">
        <ConsoleViewer />
      </TabsContent>
      <TabsContent value="performance" className="flex-1 overflow-hidden">
        <PerformanceMonitor />
      </TabsContent>
    </Tabs>
  )
}

