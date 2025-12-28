import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ManifestParser from '@/features/analyzer/ManifestParser'
import DependencyGraph from '@/features/analyzer/DependencyGraph'

export default function Analyzer() {
  return (
    <Tabs defaultValue="parser" className="h-full flex flex-col">
      <div className="border-b border-border px-6 pt-4">
        <TabsList>
          <TabsTrigger value="parser">配置解析器</TabsTrigger>
          <TabsTrigger value="graph">依赖关系图</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="parser" className="flex-1 overflow-hidden">
        <ManifestParser />
      </TabsContent>
      <TabsContent value="graph" className="flex-1 overflow-hidden">
        <DependencyGraph />
      </TabsContent>
    </Tabs>
  )
}

