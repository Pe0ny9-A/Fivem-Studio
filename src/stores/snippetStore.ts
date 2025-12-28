import { create } from 'zustand'
import { CodeSnippet } from '@/types/snippet'
import { storageService } from '@/services/storageService'

interface SnippetState {
  customSnippets: CodeSnippet[]
  isLoading: boolean
  
  loadCustomSnippets: () => Promise<void>
  addCustomSnippet: (snippet: CodeSnippet) => Promise<void>
  updateCustomSnippet: (id: string, snippet: Partial<CodeSnippet>) => Promise<void>
  deleteCustomSnippet: (id: string) => Promise<void>
  exportSnippets: () => string
  importSnippets: (json: string) => Promise<void>
}

export const useSnippetStore = create<SnippetState>((set, get) => ({
  customSnippets: [],
  isLoading: false,

  loadCustomSnippets: async () => {
    set({ isLoading: true })
    try {
      const snippets = await storageService.getSetting<CodeSnippet[]>('customSnippets') || []
      set({ customSnippets: snippets })
    } catch (error) {
      console.error('Failed to load custom snippets:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  addCustomSnippet: async (snippet: CodeSnippet) => {
    const { customSnippets } = get()
    const newSnippets = [...customSnippets, snippet]
    await storageService.saveSetting('customSnippets', newSnippets)
    set({ customSnippets: newSnippets })
  },

  updateCustomSnippet: async (id: string, updates: Partial<CodeSnippet>) => {
    const { customSnippets } = get()
    const newSnippets = customSnippets.map(s => 
      s.id === id ? { ...s, ...updates } : s
    )
    await storageService.saveSetting('customSnippets', newSnippets)
    set({ customSnippets: newSnippets })
  },

  deleteCustomSnippet: async (id: string) => {
    const { customSnippets } = get()
    const newSnippets = customSnippets.filter(s => s.id !== id)
    await storageService.saveSetting('customSnippets', newSnippets)
    set({ customSnippets: newSnippets })
  },

  exportSnippets: () => {
    const { customSnippets } = get()
    return JSON.stringify(customSnippets, null, 2)
  },

  importSnippets: async (json: string) => {
    try {
      const snippets = JSON.parse(json) as CodeSnippet[]
      await storageService.saveSetting('customSnippets', snippets)
      set({ customSnippets: snippets })
    } catch (error) {
      throw new Error('Invalid snippets JSON')
    }
  },
}))

