import { useEffect, useState } from 'react'
import { storageService } from '@/services/storageService'
import { Project } from '@/types/resource'

export function useStorage() {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    storageService.init().then(() => {
      setIsReady(true)
    })
  }, [])

  return {
    isReady,
    storageService,
  }
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const { isReady } = useStorage()

  useEffect(() => {
    if (isReady) {
      loadProjects()
    }
  }, [isReady])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const allProjects = await storageService.getAllProjects()
      setProjects(allProjects)
    } catch (error) {
      console.error('Failed to load projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveProject = async (project: Project) => {
    await storageService.saveProject(project)
    await loadProjects()
  }

  const deleteProject = async (id: string) => {
    await storageService.deleteProject(id)
    await loadProjects()
  }

  return {
    projects,
    loading,
    saveProject,
    deleteProject,
    refresh: loadProjects,
  }
}

