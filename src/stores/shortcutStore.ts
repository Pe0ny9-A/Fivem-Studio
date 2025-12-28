import { create } from 'zustand'
import { storageService } from '@/services/storageService'

export interface Shortcut {
  id: string
  name: string
  description: string
  defaultKey: string
  customKey?: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
}

const defaultShortcuts: Shortcut[] = [
  {
    id: 'file-search',
    name: '文件搜索',
    description: '快速搜索和打开文件',
    defaultKey: 'p',
    ctrl: true,
  },
  {
    id: 'command-palette',
    name: '命令面板',
    description: '打开命令面板',
    defaultKey: 'k',
    ctrl: true,
  },
  {
    id: 'save-file',
    name: '保存文件',
    description: '保存当前文件',
    defaultKey: 's',
    ctrl: true,
  },
  {
    id: 'new-file',
    name: '新建文件',
    description: '创建新文件',
    defaultKey: 'n',
    ctrl: true,
  },
  {
    id: 'close-file',
    name: '关闭文件',
    description: '关闭当前文件',
    defaultKey: 'w',
    ctrl: true,
  },
]

interface ShortcutState {
  shortcuts: Shortcut[]
  isLoading: boolean
  
  loadShortcuts: () => Promise<void>
  updateShortcut: (id: string, updates: Partial<Shortcut>) => Promise<void>
  resetShortcut: (id: string) => Promise<void>
  resetAllShortcuts: () => Promise<void>
  getShortcut: (id: string) => Shortcut | undefined
}

export const useShortcutStore = create<ShortcutState>((set, get) => ({
  shortcuts: defaultShortcuts,
  isLoading: false,

  loadShortcuts: async () => {
    set({ isLoading: true })
    try {
      const customShortcuts = await storageService.getSetting<Shortcut[]>('customShortcuts')
      if (customShortcuts) {
        // 合并默认快捷键和自定义快捷键
        const merged = defaultShortcuts.map(defaultShortcut => {
          const custom = customShortcuts.find(s => s.id === defaultShortcut.id)
          return custom ? { ...defaultShortcut, ...custom } : defaultShortcut
        })
        set({ shortcuts: merged })
      }
    } catch (error) {
      console.error('Failed to load shortcuts:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  updateShortcut: async (id: string, updates: Partial<Shortcut>) => {
    const { shortcuts } = get()
    const newShortcuts = shortcuts.map(s => 
      s.id === id ? { ...s, ...updates } : s
    )
    await storageService.saveSetting('customShortcuts', newShortcuts)
    set({ shortcuts: newShortcuts })
  },

  resetShortcut: async (id: string) => {
    const { shortcuts } = get()
    const defaultShortcut = defaultShortcuts.find(s => s.id === id)
    if (defaultShortcut) {
      const newShortcuts = shortcuts.map(s => 
        s.id === id ? defaultShortcut : s
      )
      await storageService.saveSetting('customShortcuts', newShortcuts)
      set({ shortcuts: newShortcuts })
    }
  },

  resetAllShortcuts: async () => {
    await storageService.saveSetting('customShortcuts', defaultShortcuts)
    set({ shortcuts: defaultShortcuts })
  },

  getShortcut: (id: string) => {
    return get().shortcuts.find(s => s.id === id)
  },
}))

