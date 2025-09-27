import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'
import { OnebuffConfig } from './types.js'
import { OnebuffConfigManager } from './onebuff-config.js'

export class ConfigManager {
  private configDir: string
  private configFile: string
  private onebuffConfig: OnebuffConfigManager

  constructor() {
    this.configDir = join(homedir(), '.onebuff')
    this.configFile = join(this.configDir, 'config.json')
    this.onebuffConfig = new OnebuffConfigManager()
    
    // Ensure config directory exists
    if (!existsSync(this.configDir)) {
      mkdirSync(this.configDir, { recursive: true })
    }
  }

  loadConfig(): OnebuffConfig {
    if (!existsSync(this.configFile)) {
      return {}
    }

    try {
      const content = readFileSync(this.configFile, 'utf8')
      return JSON.parse(content)
    } catch (error) {
      console.warn('Warning: Could not parse config file, using defaults')
      return {}
    }
  }

  saveConfig(config: OnebuffConfig): void {
    try {
      writeFileSync(this.configFile, JSON.stringify(config, null, 2))
    } catch (error) {
      throw new Error(`Failed to save config: ${error}`)
    }
  }

  getApiKey(): string | undefined {
    // Use OneBuff config manager for better API key handling
    try {
      return this.onebuffConfig.getApiKey()
    } catch {
      return undefined
    }
  }

  setApiKey(apiKey: string): void {
    // Save to OneBuff config instead of legacy config
    this.onebuffConfig.setApiKey(apiKey)
  }

  getBaseUrl(): string {
    // Get base URL from OneBuff config
    return this.onebuffConfig.getBaseUrl()
  }

  getDefaultModel(): string {
    // Use OneBuff config manager for model selection
    return this.onebuffConfig.getModel()
  }

  setDefaultModel(model: string): void {
    // Save to OneBuff config
    this.onebuffConfig.setModel(model)
  }
  
  // Delegate to OneBuff config manager
  getOnebuffConfig(): OnebuffConfigManager {
    return this.onebuffConfig
  }
}