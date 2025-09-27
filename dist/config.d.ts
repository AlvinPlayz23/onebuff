import { OnebuffConfig } from './types.js';
import { OnebuffConfigManager } from './onebuff-config.js';
export declare class ConfigManager {
    private configDir;
    private configFile;
    private onebuffConfig;
    constructor();
    loadConfig(): OnebuffConfig;
    saveConfig(config: OnebuffConfig): void;
    getApiKey(): string | undefined;
    setApiKey(apiKey: string): void;
    getBaseUrl(): string;
    getDefaultModel(): string;
    setDefaultModel(model: string): void;
    getOnebuffConfig(): OnebuffConfigManager;
}
