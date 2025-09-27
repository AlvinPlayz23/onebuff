import { z } from 'zod'

// Core tool interfaces for OneBuff
export interface ToolDefinition {
  name: string
  description: string
  parameters: z.ZodSchema
  handler: ToolHandler
}

export interface ToolHandler {
  (params: any, context: ToolContext): Promise<ToolResult>
}

export interface ToolContext {
  workingDirectory: string
  projectRoot: string
  agent?: {
    id: string
    displayName: string
  }
}

export interface ToolResult {
  success: boolean
  data?: any
  error?: string
  message?: string
}

// File content schema
export const FileContentSchema = z.object({
  path: z.string(),
  content: z.string(),
  size: z.number().optional(),
  modified: z.date().optional()
})

// Tool parameter schemas based on codebuff
export const ReadFilesSchema = z.object({
  paths: z.array(z.string()).min(1)
})

export const WriteFileSchema = z.object({
  path: z.string().min(1),
  content: z.string(),
  instructions: z.string().optional()
})

export const StrReplaceSchema = z.object({
  path: z.string().min(1),
  replacements: z.array(z.object({
    old: z.string().min(1),
    new: z.string(),
    allowMultiple: z.boolean().optional().default(false)
  })).min(1)
})

export const RunTerminalCommandSchema = z.object({
  command: z.string().min(1),
  cwd: z.string().optional(),
  timeout: z.number().optional().default(30),
  processType: z.enum(['SYNC', 'BACKGROUND']).optional().default('SYNC')
})

export const CodeSearchSchema = z.object({
  pattern: z.string().min(1),
  flags: z.string().optional(),
  cwd: z.string().optional(),
  maxResults: z.number().optional().default(30)
})

export const SpawnAgentsSchema = z.object({
  agents: z.array(z.object({
    agentType: z.string(),
    prompt: z.string().optional(),
    params: z.record(z.any()).optional()
  }))
})

export type FileContent = z.infer<typeof FileContentSchema>
export type ReadFilesParams = z.infer<typeof ReadFilesSchema>
export type WriteFileParams = z.infer<typeof WriteFileSchema>
export type StrReplaceParams = z.infer<typeof StrReplaceSchema>
export type RunTerminalCommandParams = z.infer<typeof RunTerminalCommandSchema>
export type CodeSearchParams = z.infer<typeof CodeSearchSchema>
export type SpawnAgentsParams = z.infer<typeof SpawnAgentsSchema>