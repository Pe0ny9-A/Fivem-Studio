import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ManifestGenerator from '@/features/generator/ManifestGenerator'
import ResourceTemplate from '@/features/generator/ResourceTemplate'

export default function Generator() {
  return (
    <Tabs defaultValue="generator" className="h-full flex flex-col">
      <div className="border-b border-border px-6 pt-4">
        <TabsList>
          <TabsTrigger value="generator">配置生成器</TabsTrigger>
          <TabsTrigger value="templates">资源模板</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="generator" className="flex-1 overflow-hidden">
        <ManifestGenerator />
      </TabsContent>
      <TabsContent value="templates" className="flex-1 overflow-hidden">
        <ResourceTemplate />
      </TabsContent>
    </Tabs>
  )
}


