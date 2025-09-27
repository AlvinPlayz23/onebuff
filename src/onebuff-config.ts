import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { z } from 'zod'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Configuration schema with validation
export const OnebuffConfigSchema = z.object({
  default_model: z.string().default('x-ai/grok-4-fast:free'),
  cost_mode: z.enum(['lite', 'normal', 'max', 'experimental']).default('normal'),
  spawnable_agents: z.array(z.string()).default(['reviewer', 'researcher', 'file-explorer']),
  max_tokens: z.number().min(100).max(32000).default(4024),
  temperature: z.number().min(0).max(2).default(0.7),
  ignore_patterns: z.array(z.string()).default([
    'node_modules', '.git', 'dist', 'build', '*.log', '__pycache__', '.vscode', '.next'
  ]),
  api_key: z.string().optional(),
  base_url: z.string().default('https://openrouter.ai/api/v1'),
  project_detection: z.object({
    enabled: z.boolean().default(true),
    auto_context: z.boolean().default(true),
    max_depth: z.number().min(1).max(10).default(3)
  }).default({}),
  tool_settings: z.object({
    max_file_size: z.number().min(1024).default(1048576), // 1MB
    command_timeout: z.number().min(5).max(300).default(30),
    search_max_results: z.number().min(5).max(1000).default(50)
  }).default({}),
  agent_settings: z.object({
    max_rounds: z.number().min(1).max(10).default(5),
    enable_streaming: z.boolean().default(true),
    auto_spawn: z.boolean().default(true)
  }).default({})
})

export type OnebuffConfig = z.infer<typeof OnebuffConfigSchema>

// Free models available on OpenRouter
export const FREE_MODELS = {
  // xAI Grok models (free tier) - NEW DEFAULT
  'grok-4-fast': 'x-ai/grok-4-fast:free',
  
  // Meta Llama models (free tier)
  'llama-3.2-3b': 'meta-llama/llama-3.2-3b-instruct:free',
  'llama-3.2-1b': 'meta-llama/llama-3.2-1b-instruct:free',
  'llama-3.1-8b': 'meta-llama/llama-3.1-8b-instruct:free',
  
  // Mistral models (free tier)
  'mistral-7b': 'mistralai/mistral-7b-instruct:free',
  'mixtral-8x7b': 'mistralai/mixtral-8x7b-instruct:free',
  
  // Phi models (free tier)  
  'phi-3-mini': 'microsoft/phi-3-mini-128k-instruct:free',
  'phi-3-medium': 'microsoft/phi-3-medium-128k-instruct:free',
  
  // Gemma models (free tier)
  'gemma-7b': 'google/gemma-7b-it:free',
  'gemma-2b': 'google/gemma-2b-it:free'
}

export class OnebuffConfigManager {
  private configPath: string
  private defaultConfigPath: string
  
  constructor(projectRoot?: string) {
    this.configPath = join(projectRoot || process.cwd(), 'onebuff-config.json')
    this.defaultConfigPath = join(__dirname, '..', 'onebuff-config.json')
  }
  
  /**
   * Load configuration with fallbacks
   */
  loadConfig(): OnebuffConfig {
    let config: any = {}
    
    // Try project-local config first
    if (existsSync(this.configPath)) {
      try {
        const content = readFileSync(this.configPath, 'utf8')
        config = JSON.parse(content)
      } catch (error) {
        console.warn(`Warning: Could not parse ${this.configPath}, using defaults`)
      }
    }
    // Try default config in onebuff directory
    else if (existsSync(this.defaultConfigPath)) {
      try {
        const content = readFileSync(this.defaultConfigPath, 'utf8')
        config = JSON.parse(content)
      } catch (error) {
        console.warn(`Warning: Could not parse default config, using built-in defaults`)
      }
    }
    
    // Validate and fill in defaults
    try {
      return OnebuffConfigSchema.parse(config)
    } catch (error) {
      console.warn('Warning: Invalid configuration, using defaults')
      return OnebuffConfigSchema.parse({})
    }
  }
  
  /**
   * Save configuration to project-local file
   */
  saveConfig(config: Partial<OnebuffConfig>): void {
    try {
      const currentConfig = this.loadConfig()
      const mergedConfig = { ...currentConfig, ...config }
      const validatedConfig = OnebuffConfigSchema.parse(mergedConfig)
      
      writeFileSync(this.configPath, JSON.stringify(validatedConfig, null, 2))
    } catch (error) {
      throw new Error(`Failed to save config: ${error}`)
    }
  }
  
  /**
   * Initialize default config file if it doesn't exist
   */
  initConfig(force: boolean = false): OnebuffConfig {
    if (!existsSync(this.configPath) || force) {
      const defaultConfig = OnebuffConfigSchema.parse({})
      writeFileSync(this.configPath, JSON.stringify(defaultConfig, null, 2))
      console.log(`✅ Created onebuff-config.json at ${this.configPath}`)
      return defaultConfig
    }
    
    return this.loadConfig()
  }
  
  /**
   * Get model with free model fallback
   */
  getModel(): string {
    const config = this.loadConfig()
    return config.default_model
  }
  
  /**
   * Set model
   */
  setModel(model: string): void {
    const config = this.loadConfig()
    config.default_model = model
    this.saveConfig(config)
  }
  
  /**
   * Get API key from config, environment, or throw error
   */
  getApiKey(): string {
    const config = this.loadConfig()
    
    // Priority: config file, then environment variable
    const apiKey = config.api_key || process.env.OPENROUTER_API_KEY || process.env.API_KEY
    
    if (!apiKey) {
      throw new Error('No API key found. Set with --set-key or API_KEY environment variable.')
    }
    
    return apiKey
  }

  /**
   * Get base URL from config
   */
  getBaseUrl(): string {
    const config = this.loadConfig()
    return config.base_url || 'https://openrouter.ai/api/v1'
  }

  /**
   * Set API key and save configuration
   */
  setApiKey(apiKey: string): void {
    const config = this.loadConfig()
    config.api_key = apiKey
    this.saveConfig(config)
  }

  /**
   * Set base URL and save configuration
   */
  setBaseUrl(baseUrl: string): void {
    const config = this.loadConfig()
    config.base_url = baseUrl
    this.saveConfig(config)
  }
  
  /**
   * Check if using a free model
   */
  isFreeModel(model?: string): boolean {
    const modelToCheck = model || this.getModel()
    return Object.values(FREE_MODELS).includes(modelToCheck) || modelToCheck.includes(':free')
  }
  
  /**
   * Get recommended model based on usage
   */
  getRecommendedModel(usage: 'testing' | 'development' | 'production'): string {
    switch (usage) {
      case 'testing':
        return FREE_MODELS['grok-4-fast'] // Fast and free for testing - NEW DEFAULT
      case 'development':  
        return FREE_MODELS['llama-3.1-8b'] // More capable for development
      case 'production':
        return 'anthropic/claude-3.5-haiku' // Paid but excellent
      default:
        return FREE_MODELS['grok-4-fast']
    }
  }
  
  /**
   * List available free models
   */
  getFreeModels(): Record<string, string> {
    return FREE_MODELS
  }
  
  /**
   * Get tool settings
   */
  getToolSettings() {
    const config = this.loadConfig()
    return config.tool_settings
  }
  
  /**
   * Get agent settings
   */
  getAgentSettings() {
    const config = this.loadConfig()
    return config.agent_settings
  }
  
  /**
   * Get ignore patterns for file operations
   */
  getIgnorePatterns(): string[] {
    const config = this.loadConfig()
    return config.ignore_patterns
  }
  
  /**
   * Get max tokens from config
   */
  getSafeMaxTokens(): number {
    const config = this.loadConfig()
    return config.max_tokens
  }

  /**
   * Get recommended settings 
   */
  getFreeModelSettings(): Partial<OnebuffConfig> {
    return {
      max_tokens: 4024,
      temperature: 0.7,
      cost_mode: 'normal' as const
    }
  }
  exportConfig(): Record<string, any> {
    const config = this.loadConfig()
    return {
      'Default Model': config.default_model + (this.isFreeModel() ? ' (FREE)' : ''),
      'Cost Mode': config.cost_mode,
      'Max Tokens': config.max_tokens,
      'Temperature': config.temperature,
      'API Key': this.getApiKey() ? 'Set' : 'Not set',
      'Project Detection': config.project_detection.enabled ? 'Enabled' : 'Disabled',
      'Spawnable Agents': config.spawnable_agents.join(', '),
      'Ignore Patterns': config.ignore_patterns.length + ' patterns'
    }
  }
}