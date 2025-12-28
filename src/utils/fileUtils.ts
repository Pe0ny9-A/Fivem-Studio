import { FileNode } from '@/types/resource'

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function createFileNode(
  name: string,
  type: 'file' | 'folder',
  parentId?: string,
  content: string = ''
): FileNode {
  return {
    id: generateId(),
    name,
    type,
    path: name,
    content: type === 'file' ? content : undefined,
    children: type === 'folder' ? [] : undefined,
    parentId,
  }
}

export function findNodeById(nodes: FileNode[], id: string): FileNode | null {
  for (const node of nodes) {
    if (node.id === id) {
      return node
    }
    if (node.children) {
      const found = findNodeById(node.children, id)
      if (found) return found
    }
  }
  return null
}

export function updateNodeInTree(
  nodes: FileNode[],
  id: string,
  updates: Partial<FileNode>
): FileNode[] {
  return nodes.map(node => {
    if (node.id === id) {
      return { ...node, ...updates }
    }
    if (node.children) {
      return {
        ...node,
        children: updateNodeInTree(node.children, id, updates),
      }
    }
    return node
  })
}

export function removeNodeFromTree(
  nodes: FileNode[],
  id: string
): FileNode[] {
  return nodes
    .filter(node => node.id !== id)
    .map(node => {
      if (node.children) {
        return {
          ...node,
          children: removeNodeFromTree(node.children, id),
        }
      }
      return node
    })
}

export function addNodeToTree(
  nodes: FileNode[],
  parentId: string | undefined,
  newNode: FileNode
): FileNode[] {
  if (!parentId) {
    return [...nodes, newNode]
  }

  return nodes.map(node => {
    if (node.id === parentId && node.type === 'folder') {
      return {
        ...node,
        children: [...(node.children || []), newNode],
      }
    }
    if (node.children) {
      return {
        ...node,
        children: addNodeToTree(node.children, parentId, newNode),
      }
    }
    return node
  })
}

export async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      resolve(e.target?.result as string)
    }
    reader.onerror = reject
    reader.readAsText(file)
  })
}

export function createFileNodeFromFile(file: File, parentId?: string): Promise<FileNode> {
  return readFileAsText(file).then(content => {
    return createFileNode(file.name, 'file', parentId, content)
  })
}

