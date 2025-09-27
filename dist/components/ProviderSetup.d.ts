import React from 'react';
interface ProviderConfig {
    provider: 'openrouter' | 'openai-compatible';
    apiKey: string;
    baseUrl?: string;
    modelId: string;
}
interface ProviderSetupProps {
    onComplete: (config?: ProviderConfig) => void;
}
declare const ProviderSetup: React.FC<ProviderSetupProps>;
export default ProviderSetup;
