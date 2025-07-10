export interface DashboardConfig {
  id: string
  title: string
  description?: string
  widgets: Widget[]
  layout: "grid" | "freeform"
  theme: "light" | "dark" | "custom"
  customTheme?: CustomTheme
  createdAt: number
  updatedAt: number
}

export interface CustomTheme {
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  textColor: string
  accentColor: string
}

export interface Widget {
  id: string
  type: string
  title: string
  description?: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  config: any
  dataSource: DataSource
  refreshInterval?: number // in seconds
  lastRefreshed?: number
}

export interface DataSource {
  type: "static" | "api" | "function" | "database"
  config: any
  data?: any
}

export interface WidgetTemplate {
  type: string
  name: string
  icon: string
  description: string
  defaultSize: { width: number; height: number }
  defaultConfig: any
  configOptions: ConfigOption[]
  dataOptions: DataOption[]
  component: string
}

export interface ConfigOption {
  key: string
  label: string
  type: "text" | "number" | "boolean" | "select" | "color" | "json"
  defaultValue: any
  options?: { label: string; value: any }[]
  required?: boolean
  min?: number
  max?: number
}

export interface DataOption {
  key: string
  label: string
  type: "string" | "number" | "boolean" | "array" | "object"
  required?: boolean
  description?: string
}

export interface WidgetAction {
  type: string
  payload: any
}

export interface DashboardUser {
  id: string
  name: string
  email: string
  role: "admin" | "editor" | "viewer"
}
