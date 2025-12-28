import { Manifest } from './manifest'

export interface FileNode {
  id: string
  name: string
  type: 'file' | 'folder'
  path: string
  children?: FileNode[]
  content?: string
  parentId?: string
}

export interface Resource {
  id: string
  name: string
  path: string
  manifest?: Manifest
  files: FileNode[]
}

export interface Project {
  id: string
  name: string
  resources: Resource[]
  createdAt: number
  updatedAt: number
}

