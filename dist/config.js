import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { OnebuffConfigManager } from './onebuff-config.js';
export class ConfigManager {
    configDir;
    configFile;
    onebuffConfig;
    constructor() {
        this.configDir = join(homedir(), '.onebuff');
        this.configFile = join(this.configDir, 'config.json');
        this.onebuffConfig = new OnebuffConfigManager();
        // Ensure config directory exists
        if (!existsSync(this.configDir)) {
            mkdirSync(this.configDir, { recursive: true });
        }
    }
    loadConfig() {
        if (!existsSync(this.configFile)) {
            return {};
        }
        try {
            const content = readFileSync(this.configFile, 'utf8');
            return JSON.parse(content);
        }
        catch (error) {
            console.warn('Warning: Could not parse config file, using defaults');
            return {};
        }
    }
    saveConfig(config) {
        try {
            writeFileSync(this.configFile, JSON.stringify(config, null, 2));
        }
        catch (error) {
            throw new Error(`Failed to save config: ${error}`);
        }
    }
    getApiKey() {
        // Use OneBuff config manager for better API key handling
        try {
            return this.onebuffConfig.getApiKey();
        }
        catch {
            return undefined;
        }
    }
    setApiKey(apiKey) {
        // Save to OneBuff config instead of legacy config
        this.onebuffConfig.setApiKey(apiKey);
    }
    getBaseUrl() {
        // Get base URL from OneBuff config
        return this.onebuffConfig.getBaseUrl();
    }
    getDefaultModel() {
        // Use OneBuff config manager for model selection
        return this.onebuffConfig.getModel();
    }
    setDefaultModel(model) {
        // Save to OneBuff config
        this.onebuffConfig.setModel(model);
    }
    // Delegate to OneBuff config manager
    getOnebuffConfig() {
        return this.onebuffConfig;
    }
}
