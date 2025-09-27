// Basic types for OneBuff
export interface OnebuffConfig {
  openrouterApiKey?: string
  defaultModel?: string
  workingDirectory?: string
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
  timestamp?: Date
}

export interface AgentDefinition {
  id: string
  displayName: string
  model?: string
  purpose: string
  tools: string[]
  spawnable?: string[]
}

export type ModelProvider = 'openrouter'

export interface ModelConfig {
  provider: ModelProvider
  model: string
  apiKey: string
}