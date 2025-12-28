import { create } from 'zustand'
import { EditorFile } from '@/types/editor'

interface EditorState {
  openFiles: EditorFile[]
  activeFileId: string | null
  editorContent: Record<string, string>
  unsavedChanges: Set<string>
  
  openFile: (file: EditorFile) => void
  closeFile: (fileId: string) => void
  setActiveFile: (fileId: string) => void
  updateFileContent: (fileId: string, content: string) => void
  markAsDirty: (fileId: string) => void
  markAsSaved: (fileId: string) => void
}

export const useEditorStore = create<EditorState>((set) => ({
  openFiles: [],
  activeFileId: null,
  editorContent: {},
  unsavedChanges: new Set(),

  openFile: (file) => set((state) => {
    const exists = state.openFiles.find(f => f.id === file.id)
    if (exists) {
      return { activeFileId: file.id }
    }
    return {
      openFiles: [...state.openFiles, file],
      activeFileId: file.id,
      editorContent: {
        ...state.editorContent,
        [file.id]: file.content,
      },
    }
  }),

  closeFile: (fileId) => set((state) => {
    const newOpenFiles = state.openFiles.filter(f => f.id !== fileId)
    const newContent = { ...state.editorContent }
    delete newContent[fileId]
    const newUnsaved = new Set(state.unsavedChanges)
    newUnsaved.delete(fileId)
    
    return {
      openFiles: newOpenFiles,
      activeFileId: newOpenFiles.length > 0 
        ? newOpenFiles[newOpenFiles.length - 1].id 
        : null,
      editorContent: newContent,
      unsavedChanges: newUnsaved,
    }
  }),

  setActiveFile: (fileId) => set({ activeFileId: fileId }),

  updateFileContent: (fileId, content) => set((state) => ({
    editorContent: {
      ...state.editorContent,
      [fileId]: content,
    },
  })),

  markAsDirty: (fileId) => set((state) => {
    const newUnsaved = new Set(state.unsavedChanges)
    newUnsaved.add(fileId)
    return { unsavedChanges: newUnsaved }
  }),

  markAsSaved: (fileId) => set((state) => {
    const newUnsaved = new Set(state.unsavedChanges)
    newUnsaved.delete(fileId)
    return { unsavedChanges: newUnsaved }
  }),
}))

