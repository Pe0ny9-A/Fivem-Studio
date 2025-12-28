import { useState } from 'react'
import { useEditorStore } from '@/stores/editorStore'
import MonacoEditor from '@/features/editor/MonacoEditor'
import EditorTabs from '@/features/editor/EditorTabs'
import SnippetManager from '@/features/editor/SnippetManager'
import FileHistory from '@/features/editor/FileHistory'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function Editor() {
  const { activeFileId } = useEditorStore()
  const [activeTab, setActiveTab] = useState('editor')

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
      <div className="border-b border-border px-6 pt-4">
        <TabsList>
          <TabsTrigger value="editor">编辑器</TabsTrigger>
          <TabsTrigger value="snippets">代码片段</TabsTrigger>
          <TabsTrigger value="history">历史版本</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="editor" className="flex-1 flex flex-col overflow-hidden">
        <EditorTabs />
        <div className="flex-1 overflow-hidden">
          <MonacoEditor fileId={activeFileId} />
        </div>
      </TabsContent>
      <TabsContent value="snippets" className="flex-1 overflow-hidden">
        <SnippetManager />
      </TabsContent>
      <TabsContent value="history" className="flex-1 overflow-hidden">
        <FileHistory fileId={activeFileId} />
      </TabsContent>
    </Tabs>
  )
}

