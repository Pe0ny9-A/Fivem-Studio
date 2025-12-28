import { create } from 'zustand'
import { Project, Resource, FileNode } from '@/types/resource'

interface ProjectState {
  currentProject: Project | null
  resources: Resource[]
  fileTree: FileNode[]
  
  setCurrentProject: (project: Project | null) => void
  addResource: (resource: Resource) => void
  removeResource: (resourceId: string) => void
  updateFileTree: (fileTree: FileNode[]) => void
  updateResource: (resourceId: string, updates: Partial<Resource>) => void
}

export const useProjectStore = create<ProjectState>((set) => ({
  currentProject: null,
  resources: [],
  fileTree: [],

  setCurrentProject: (project) => set({ 
    currentProject: project,
    resources: project?.resources || [],
    fileTree: project?.resources.flatMap(r => r.files) || [],
  }),

  addResource: (resource) => set((state) => ({
    resources: [...state.resources, resource],
    fileTree: [...state.fileTree, ...resource.files],
  })),

  removeResource: (resourceId) => set((state) => {
    const resource = state.resources.find(r => r.id === resourceId)
    const resourceFileIds = resource?.files.map(f => f.id) || []
    return {
      resources: state.resources.filter(r => r.id !== resourceId),
      fileTree: state.fileTree.filter(f => !resourceFileIds.includes(f.id)),
    }
  }),

  updateFileTree: (fileTree) => set({ fileTree }),

  updateResource: (resourceId, updates) => set((state) => ({
    resources: state.resources.map(r => 
      r.id === resourceId ? { ...r, ...updates } : r
    ),
  })),
}))

