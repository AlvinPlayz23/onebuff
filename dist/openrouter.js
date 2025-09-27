import axios from 'axios';
export class OpenRouterClient {
    apiKey;
    baseURL;
    constructor(apiKey, baseURL) {
        this.apiKey = apiKey;
        this.baseURL = baseURL || 'https://openrouter.ai/api/v1';
    }
    async chat(messages, model, options) {
        // Load configuration for defaults
        const { OnebuffConfigManager } = await import('./onebuff-config.js');
        const configManager = new OnebuffConfigManager();
        const config = configManager.loadConfig();
        const actualModel = model || config.default_model;
        const temperature = options?.temperature || config.temperature;
        // Use max tokens from config - no optimization
        let maxTokens = options?.maxTokens || config.max_tokens;
        try {
            const response = await axios.post(`${this.baseURL}/chat/completions`, {
                model: actualModel,
                messages: messages.map(msg => ({
                    role: msg.role,
                    content: msg.content
                })),
                temperature,
                max_tokens: maxTokens,
                stream: false,
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://github.com/onebuff/onebuff',
                    'X-Title': 'OneBuff CLI'
                }
            });
            return response.data.choices[0].message.content;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.error?.message || error.message;
                if (errorMessage.includes('requires more credits') || errorMessage.includes('max_tokens')) {
                    throw new Error(`OpenRouter API Error: ${errorMessage}\n\nTip: Try reducing max_tokens in onebuff-config.json or use a different free model.`);
                }
                throw new Error(`OpenRouter API Error: ${errorMessage}`);
            }
            throw error;
        }
    }
    async getModels() {
        try {
            const response = await axios.get(`${this.baseURL}/models`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });
            // Add free model information
            const { FREE_MODELS } = await import('./onebuff-config.js');
            const models = response.data.data.map((model) => ({
                ...model,
                isFree: Object.values(FREE_MODELS).includes(model.id) || model.id.includes(':free')
            }));
            return models;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`OpenRouter API Error: ${error.response?.data?.error?.message || error.message}`);
            }
            throw error;
        }
    }
    async getAccountInfo() {
        try {
            // Try different possible endpoints for account information
            const endpoints = [
                '/auth/key', // Check key validity and get user info
                '/account', // Account endpoint
                '/user', // User endpoint
                '/credits', // Credits endpoint
                '/me' // Common 'me' endpoint
            ];
            for (const endpoint of endpoints) {
                try {
                    const response = await axios.get(`${this.baseURL}${endpoint}`, {
                        headers: {
                            'Authorization': `Bearer ${this.apiKey}`
                        }
                    });
                    return {
                        endpoint: endpoint,
                        data: response.data
                    };
                }
                catch (error) {
                    // If it's a 404, try next endpoint
                    if (error.response?.status === 404) {
                        continue;
                    }
                    // If it's another error, we found an endpoint but got an error
                    throw error;
                }
            }
            throw new Error('No valid account endpoint found');
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                return {
                    error: `OpenRouter API Error: ${error.response?.data?.error?.message || error.message}`,
                    status: error.response?.status
                };
            }
            return { error: error.message };
        }
    }
}
