import { openDB, DBSchema, IDBPDatabase } from 'idb'

interface FileHistoryDB extends DBSchema {
  fileHistory: {
    key: string
    value: {
      fileId: string
      version: number
      content: string
      timestamp: number
      description?: string
    }
    indexes: { 'by-fileId': string; 'by-timestamp': number }
  }
}

class FileHistoryService {
  private db: IDBPDatabase<FileHistoryDB> | null = null
  private dbName = 'file-history'
  private version = 1

  async init(): Promise<void> {
    this.db = await openDB<FileHistoryDB>(this.dbName, this.version, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('fileHistory')) {
          const store = db.createObjectStore('fileHistory', {
            keyPath: ['fileId', 'version'],
          })
          store.createIndex('by-fileId', 'fileId')
          store.createIndex('by-timestamp', 'timestamp')
        }
      },
    })
  }

  async saveVersion(
    fileId: string,
    content: string,
    description?: string
  ): Promise<void> {
    if (!this.db) await this.init()

    const versions = await this.getVersions(fileId)
    const nextVersion = versions.length > 0 ? versions[0].version + 1 : 1

    await this.db!.put('fileHistory', {
      fileId,
      version: nextVersion,
      content,
      timestamp: Date.now(),
      description,
    })

    // 只保留最近50个版本
    if (versions.length >= 50) {
      const oldestVersion = versions[versions.length - 1]
      await this.db!.delete('fileHistory', [fileId, oldestVersion.version])
    }
  }

  async getVersions(fileId: string) {
    if (!this.db) await this.init()

    const index = this.db!.index('fileHistory', 'by-fileId')
    const versions = await index.getAll(fileId)
    return versions.sort((a, b) => b.timestamp - a.timestamp)
  }

  async getVersion(fileId: string, version: number) {
    if (!this.db) await this.init()
    return await this.db!.get('fileHistory', [fileId, version])
  }

  async deleteVersion(fileId: string, version: number): Promise<void> {
    if (!this.db) await this.init()
    await this.db!.delete('fileHistory', [fileId, version])
  }

  async deleteAllVersions(fileId: string): Promise<void> {
    if (!this.db) await this.init()
    const versions = await this.getVersions(fileId)
    await Promise.all(
      versions.map(v => this.deleteVersion(fileId, v.version))
    )
  }
}

export const fileHistoryService = new FileHistoryService()

