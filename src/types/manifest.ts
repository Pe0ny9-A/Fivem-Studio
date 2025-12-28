export interface Manifest {
  fx_version?: string
  game?: string
  author?: string
  description?: string
  version?: string
  shared_scripts?: string[]
  client_scripts?: string[]
  server_scripts?: string[]
  files?: string[]
  dependencies?: string[]
  ui_page?: string
  loadscreen?: string
  [key: string]: unknown
}

