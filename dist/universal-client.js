import axios from 'axios';
import { OnebuffConfigManager } from './onebuff-config.js';
export class UniversalClient {
    configManager;
    apiKey;
    baseURL;
    constructor() {
        this.configManager = new OnebuffConfigManager();
        this.apiKey = this.configManager.getApiKey() || '';
        this.baseURL = this.configManager.getBaseUrl();
    }
    async chat(messages, model, options) {
        const config = this.configManager.loadConfig();
        const actualModel = model || config.default_model;
        const temperature = options?.temperature || config.temperature;
        const maxTokens = options?.maxTokens || config.max_tokens;
        try {
            const headers = {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            };
            // Add OpenRouter specific headers if using OpenRouter
            if (this.baseURL.includes('openrouter.ai')) {
                headers['HTTP-Referer'] = 'https://github.com/onebuff/onebuff';
                headers['X-Title'] = 'OneBuff CLI';
            }
            const response = await axios.post(`${this.baseURL}/chat/completions`, {
                model: actualModel,
                messages: messages.map(msg => ({
                    role: msg.role,
                    content: msg.content
                })),
                temperature,
                max_tokens: maxTokens,
                stream: false,
            }, { headers });
            return response.data.choices[0].message.content;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.error?.message || error.message;
                throw new Error(`API Error: ${errorMessage}`);
            }
            throw error;
        }
    }
    async getModels() {
        try {
            const headers = {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            };
            const response = await axios.get(`${this.baseURL}/models`, { headers });
            if (this.baseURL.includes('openrouter.ai')) {
                // Add free model information for OpenRouter
                const { FREE_MODELS } = await import('./onebuff-config.js');
                const models = response.data.data?.map((model) => ({
                    ...model,
                    isFree: Object.values(FREE_MODELS).includes(model.id) || model.id.includes(':free')
                }));
                return models || [];
            }
            else {
                // For OpenAI-compatible, just return the models
                return response.data.data || response.data || [];
            }
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`API Error: ${error.response?.data?.error?.message || error.message}`);
            }
            throw error;
        }
    }
    async getAccountInfo() {
        // Only works with OpenRouter
        if (!this.baseURL.includes('openrouter.ai')) {
            return { error: 'Account info only available for OpenRouter', status: 404 };
        }
        try {
            const response = await axios.get('https://openrouter.ai/api/v1/auth/key', {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return {
                endpoint: 'https://openrouter.ai/api/v1/auth/key',
                data: response.data
            };
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                return {
                    error: error.response?.data?.error?.message || error.message,
                    status: error.response?.status
                };
            }
            return { error: String(error) };
        }
    }
}
