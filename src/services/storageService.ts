import { openDB, DBSchema, IDBPDatabase } from 'idb'
import { Project } from '@/types/resource'

interface FivemDevToolDB extends DBSchema {
  projects: {
    key: string
    value: Project
    indexes: { 'by-name': string }
  }
  files: {
    key: string
    value: {
      id: string
      content: string
      updatedAt: number
    }
  }
  templates: {
    key: string
    value: {
      id: string
      name: string
      content: string
      type: 'manifest' | 'script' | 'client' | 'server'
      createdAt: number
    }
  }
  settings: {
    key: string
    value: {
      key: string
      value: unknown
    }
  }
}

class StorageService {
  private db: IDBPDatabase<FivemDevToolDB> | null = null
  private dbName = 'fivem-dev-tool'
  private version = 1

  async init(): Promise<void> {
    this.db = await openDB<FivemDevToolDB>(this.dbName, this.version, {
      upgrade(db) {
        // Projects store
        if (!db.objectStoreNames.contains('projects')) {
          const projectStore = db.createObjectStore('projects', {
            keyPath: 'id',
          })
          projectStore.createIndex('by-name', 'name')
        }

        // Files store
        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files', {
            keyPath: 'id',
          })
        }

        // Templates store
        if (!db.objectStoreNames.contains('templates')) {
          db.createObjectStore('templates', {
            keyPath: 'id',
          })
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', {
            keyPath: 'key',
          })
        }
      },
    })
  }

  // Projects
  async saveProject(project: Project): Promise<void> {
    if (!this.db) await this.init()
    await this.db!.put('projects', {
      ...project,
      updatedAt: Date.now(),
    })
  }

  async getProject(id: string): Promise<Project | undefined> {
    if (!this.db) await this.init()
    return await this.db!.get('projects', id)
  }

  async getAllProjects(): Promise<Project[]> {
    if (!this.db) await this.init()
    return await this.db!.getAll('projects')
  }

  async deleteProject(id: string): Promise<void> {
    if (!this.db) await this.init()
    await this.db!.delete('projects', id)
  }

  // Files
  async saveFileContent(fileId: string, content: string): Promise<void> {
    if (!this.db) await this.init()
    await this.db!.put('files', {
      id: fileId,
      content,
      updatedAt: Date.now(),
    })
  }

  async getFileContent(fileId: string): Promise<string | undefined> {
    if (!this.db) await this.init()
    const file = await this.db!.get('files', fileId)
    return file?.content
  }

  async deleteFileContent(fileId: string): Promise<void> {
    if (!this.db) await this.init()
    await this.db!.delete('files', fileId)
  }

  // Templates
  async saveTemplate(template: {
    id: string
    name: string
    content: string
    type: 'manifest' | 'script' | 'client' | 'server'
  }): Promise<void> {
    if (!this.db) await this.init()
    await this.db!.put('templates', {
      ...template,
      createdAt: Date.now(),
    })
  }

  async getTemplate(id: string): Promise<FivemDevToolDB['templates']['value'] | undefined> {
    if (!this.db) await this.init()
    return await this.db!.get('templates', id)
  }

  async getAllTemplates(): Promise<FivemDevToolDB['templates']['value'][]> {
    if (!this.db) await this.init()
    return await this.db!.getAll('templates')
  }

  async deleteTemplate(id: string): Promise<void> {
    if (!this.db) await this.init()
    await this.db!.delete('templates', id)
  }

  // Settings
  async saveSetting(key: string, value: unknown): Promise<void> {
    if (!this.db) await this.init()
    await this.db!.put('settings', { key, value })
  }

  async getSetting<T>(key: string): Promise<T | undefined> {
    if (!this.db) await this.init()
    const setting = await this.db!.get('settings', key)
    return setting?.value as T | undefined
  }

  async deleteSetting(key: string): Promise<void> {
    if (!this.db) await this.init()
    await this.db!.delete('settings', key)
  }

  // Export/Import
  async exportProject(projectId: string): Promise<string> {
    const project = await this.getProject(projectId)
    if (!project) throw new Error('Project not found')

    const exportData = {
      project,
      version: '1.0.0',
      exportedAt: Date.now(),
    }

    return JSON.stringify(exportData, null, 2)
  }

  async importProject(jsonData: string): Promise<Project> {
    const data = JSON.parse(jsonData)
    if (!data.project) throw new Error('Invalid project data')

    const project: Project = {
      ...data.project,
      id: `imported-${Date.now()}`,
      updatedAt: Date.now(),
    }

    await this.saveProject(project)
    return project
  }
}

export const storageService = new StorageService()

