import { useEditorStore } from '@/stores/editorStore'
import MonacoEditor from '@/features/editor/MonacoEditor'
import EditorTabs from '@/features/editor/EditorTabs'

export default function Editor() {
  const { activeFileId } = useEditorStore()

  return (
    <div className="flex flex-col h-full">
      <EditorTabs />
      <div className="flex-1 overflow-hidden">
        <MonacoEditor fileId={activeFileId} />
      </div>
    </div>
  )
}

