import { ChatMessage } from './types.js';
export declare class OpenRouterClient {
    private apiKey;
    private baseURL;
    constructor(apiKey: string, baseURL?: string);
    chat(messages: ChatMessage[], model?: string, options?: {
        temperature?: number;
        maxTokens?: number;
    }): Promise<any>;
    getModels(): Promise<any>;
    getAccountInfo(): Promise<{
        endpoint: string;
        data: any;
        error?: undefined;
        status?: undefined;
    } | {
        error: string;
        status: number | undefined;
        endpoint?: undefined;
        data?: undefined;
    } | {
        error: string;
        endpoint?: undefined;
        data?: undefined;
        status?: undefined;
    }>;
}
