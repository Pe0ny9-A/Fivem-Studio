import { create } from 'zustand'
import { EditorConfig } from '@/types/editor'

interface SettingsState {
  theme: 'light' | 'dark'
  editorSettings: EditorConfig
  uiPreferences: {
    sidebarWidth: number
    fontSize: number
  }
  
  setTheme: (theme: 'light' | 'dark') => void
  updateEditorSettings: (settings: Partial<EditorConfig>) => void
  updateUIPreferences: (preferences: Partial<SettingsState['uiPreferences']>) => void
}

const defaultEditorSettings: EditorConfig = {
  fontSize: 14,
  tabSize: 2,
  wordWrap: 'on',
  minimap: true,
  theme: 'vs-dark',
}

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: 'dark',
  editorSettings: defaultEditorSettings,
  uiPreferences: {
    sidebarWidth: 256,
    fontSize: 14,
  },

  setTheme: (theme) => {
    set({ theme })
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  },

  updateEditorSettings: (settings) => set((state) => ({
    editorSettings: { ...state.editorSettings, ...settings },
  })),

  updateUIPreferences: (preferences) => set((state) => ({
    uiPreferences: { ...state.uiPreferences, ...preferences },
  })),
}))

