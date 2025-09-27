import { z } from 'zod';
export declare const OnebuffConfigSchema: z.ZodObject<{
    default_model: z.ZodDefault<z.ZodString>;
    cost_mode: z.ZodDefault<z.ZodEnum<["lite", "normal", "max", "experimental"]>>;
    spawnable_agents: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    max_tokens: z.ZodDefault<z.ZodNumber>;
    temperature: z.ZodDefault<z.ZodNumber>;
    ignore_patterns: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    api_key: z.ZodOptional<z.ZodString>;
    base_url: z.ZodDefault<z.ZodString>;
    project_detection: z.ZodDefault<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        auto_context: z.ZodDefault<z.ZodBoolean>;
        max_depth: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        auto_context: boolean;
        max_depth: number;
    }, {
        enabled?: boolean | undefined;
        auto_context?: boolean | undefined;
        max_depth?: number | undefined;
    }>>;
    tool_settings: z.ZodDefault<z.ZodObject<{
        max_file_size: z.ZodDefault<z.ZodNumber>;
        command_timeout: z.ZodDefault<z.ZodNumber>;
        search_max_results: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        max_file_size: number;
        command_timeout: number;
        search_max_results: number;
    }, {
        max_file_size?: number | undefined;
        command_timeout?: number | undefined;
        search_max_results?: number | undefined;
    }>>;
    agent_settings: z.ZodDefault<z.ZodObject<{
        max_rounds: z.ZodDefault<z.ZodNumber>;
        enable_streaming: z.ZodDefault<z.ZodBoolean>;
        auto_spawn: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        max_rounds: number;
        enable_streaming: boolean;
        auto_spawn: boolean;
    }, {
        max_rounds?: number | undefined;
        enable_streaming?: boolean | undefined;
        auto_spawn?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    default_model: string;
    cost_mode: "lite" | "normal" | "max" | "experimental";
    spawnable_agents: string[];
    max_tokens: number;
    temperature: number;
    ignore_patterns: string[];
    base_url: string;
    project_detection: {
        enabled: boolean;
        auto_context: boolean;
        max_depth: number;
    };
    tool_settings: {
        max_file_size: number;
        command_timeout: number;
        search_max_results: number;
    };
    agent_settings: {
        max_rounds: number;
        enable_streaming: boolean;
        auto_spawn: boolean;
    };
    api_key?: string | undefined;
}, {
    default_model?: string | undefined;
    cost_mode?: "lite" | "normal" | "max" | "experimental" | undefined;
    spawnable_agents?: string[] | undefined;
    max_tokens?: number | undefined;
    temperature?: number | undefined;
    ignore_patterns?: string[] | undefined;
    api_key?: string | undefined;
    base_url?: string | undefined;
    project_detection?: {
        enabled?: boolean | undefined;
        auto_context?: boolean | undefined;
        max_depth?: number | undefined;
    } | undefined;
    tool_settings?: {
        max_file_size?: number | undefined;
        command_timeout?: number | undefined;
        search_max_results?: number | undefined;
    } | undefined;
    agent_settings?: {
        max_rounds?: number | undefined;
        enable_streaming?: boolean | undefined;
        auto_spawn?: boolean | undefined;
    } | undefined;
}>;
export type OnebuffConfig = z.infer<typeof OnebuffConfigSchema>;
export declare const FREE_MODELS: {
    'grok-4-fast': string;
    'llama-3.2-3b': string;
    'llama-3.2-1b': string;
    'llama-3.1-8b': string;
    'mistral-7b': string;
    'mixtral-8x7b': string;
    'phi-3-mini': string;
    'phi-3-medium': string;
    'gemma-7b': string;
    'gemma-2b': string;
};
export declare class OnebuffConfigManager {
    private configPath;
    private defaultConfigPath;
    constructor(projectRoot?: string);
    /**
     * Load configuration with fallbacks
     */
    loadConfig(): OnebuffConfig;
    /**
     * Save configuration to project-local file
     */
    saveConfig(config: Partial<OnebuffConfig>): void;
    /**
     * Initialize default config file if it doesn't exist
     */
    initConfig(force?: boolean): OnebuffConfig;
    /**
     * Get model with free model fallback
     */
    getModel(): string;
    /**
     * Set model
     */
    setModel(model: string): void;
    /**
     * Get API key from config, environment, or throw error
     */
    getApiKey(): string;
    /**
     * Get base URL from config
     */
    getBaseUrl(): string;
    /**
     * Set API key and save configuration
     */
    setApiKey(apiKey: string): void;
    /**
     * Set base URL and save configuration
     */
    setBaseUrl(baseUrl: string): void;
    /**
     * Check if using a free model
     */
    isFreeModel(model?: string): boolean;
    /**
     * Get recommended model based on usage
     */
    getRecommendedModel(usage: 'testing' | 'development' | 'production'): string;
    /**
     * List available free models
     */
    getFreeModels(): Record<string, string>;
    /**
     * Get tool settings
     */
    getToolSettings(): {
        max_file_size: number;
        command_timeout: number;
        search_max_results: number;
    };
    /**
     * Get agent settings
     */
    getAgentSettings(): {
        max_rounds: number;
        enable_streaming: boolean;
        auto_spawn: boolean;
    };
    /**
     * Get ignore patterns for file operations
     */
    getIgnorePatterns(): string[];
    /**
     * Get max tokens from config
     */
    getSafeMaxTokens(): number;
    /**
     * Get recommended settings
     */
    getFreeModelSettings(): Partial<OnebuffConfig>;
    exportConfig(): Record<string, any>;
}
