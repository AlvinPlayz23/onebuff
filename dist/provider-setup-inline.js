import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { render, Text, Box, useInput, useApp } from 'ink';
import SelectInput from 'ink-select-input';
// @ts-ignore
import InkBox from 'ink-box';
// @ts-ignore  
import Divider from 'ink-divider';
import { OnebuffConfigManager } from './onebuff-config.js';
const ProviderSetup = ({ onComplete }) => {
    const [step, setStep] = useState('provider');
    const [provider, setProvider] = useState('openrouter');
    const [apiKey, setApiKey] = useState('');
    const [baseUrl, setBaseUrl] = useState('');
    const [modelId, setModelId] = useState('');
    const [inputValue, setInputValue] = useState('');
    const { exit } = useApp();
    useInput((input, key) => {
        if (key.escape) {
            console.log('\n👋 Setup cancelled');
            exit();
            return;
        }
        switch (step) {
            case 'apikey':
                if (key.return && inputValue.trim()) {
                    setApiKey(inputValue.trim());
                    if (provider === 'openrouter') {
                        setStep('model');
                    }
                    else {
                        setStep('baseurl');
                    }
                    setInputValue('');
                }
                else if (key.backspace) {
                    setInputValue(prev => prev.slice(0, -1));
                }
                else if (input && !key.ctrl && !key.meta && !key.return) {
                    setInputValue(prev => prev + input);
                }
                break;
            case 'baseurl':
                if (key.return && inputValue.trim()) {
                    setBaseUrl(inputValue.trim());
                    setStep('model');
                    setInputValue('');
                }
                else if (key.backspace) {
                    setInputValue(prev => prev.slice(0, -1));
                }
                else if (input && !key.ctrl && !key.meta && !key.return) {
                    setInputValue(prev => prev + input);
                }
                break;
            case 'model':
                if (key.return && inputValue.trim()) {
                    setModelId(inputValue.trim());
                    saveConfiguration();
                    setStep('complete');
                }
                else if (key.backspace) {
                    setInputValue(prev => prev.slice(0, -1));
                }
                else if (input && !key.ctrl && !key.meta && !key.return) {
                    setInputValue(prev => prev + input);
                }
                break;
            case 'complete':
                exit();
                break;
        }
    });
    const handleProviderSelect = (item) => {
        setProvider(item.value);
        setStep('apikey');
    };
    const saveConfiguration = async () => {
        const configManager = new OnebuffConfigManager();
        const newConfig = {
            default_model: modelId
        };
        if (provider === 'openrouter') {
            newConfig.openrouter_api_key = apiKey;
            newConfig.custom_provider = undefined;
        }
        else {
            newConfig.custom_provider = {
                type: 'openai-compatible',
                api_key: apiKey,
                base_url: baseUrl,
                model: modelId
            };
            newConfig.openrouter_api_key = undefined;
        }
        configManager.saveConfig(newConfig);
    };
    const providerItems = [
        {
            label: 'OpenRouter (150+ models, easy setup)',
            value: 'openrouter'
        },
        {
            label: 'OpenAI-Compatible (Custom endpoint)',
            value: 'openai-compatible'
        }
    ];
    const renderProviderSelection = () => (_jsxs(Box, { flexDirection: "column", children: [_jsx(InkBox, { borderStyle: "round", borderColor: "cyan", padding: 1, children: _jsx(Text, { color: "cyan", bold: true, children: "\uD83D\uDD27 OneBuff Provider Setup" }) }), _jsx(Divider, { title: "Choose Provider" }), _jsx(Box, { marginY: 1, children: _jsx(SelectInput, { items: providerItems, onSelect: handleProviderSelect }) }), _jsx(Text, { color: "gray", dimColor: true, children: "Use arrow keys to navigate, Enter to select, ESC to cancel" })] }));
    const renderApiKeyInput = () => (_jsxs(Box, { flexDirection: "column", children: [_jsx(InkBox, { borderStyle: "round", borderColor: "cyan", padding: 1, children: _jsx(Text, { color: "cyan", bold: true, children: "\uD83D\uDD27 OneBuff Provider Setup" }) }), _jsx(Divider, { title: "API Key" }), _jsxs(Box, { flexDirection: "column", marginY: 1, children: [_jsxs(Text, { children: ["Provider: ", _jsx(Text, { color: "cyan", children: provider === 'openrouter' ? 'OpenRouter' : 'OpenAI-Compatible' })] }), _jsx(Text, {}), _jsx(Text, { color: "yellow", children: provider === 'openrouter'
                            ? '🔗 Get your API key at: https://openrouter.ai/keys'
                            : '🔑 Enter your custom API key' }), _jsx(Text, {}), _jsxs(Text, { children: ["API Key: ", _jsx(Text, { color: "green", children: inputValue.replace(/./g, '*') }), _jsx(Text, { color: "gray", children: "_" })] })] }), _jsx(Text, { color: "gray", dimColor: true, children: "Type your API key and press Enter" })] }));
    const renderBaseUrlInput = () => (_jsxs(Box, { flexDirection: "column", children: [_jsx(InkBox, { borderStyle: "round", borderColor: "cyan", padding: 1, children: _jsx(Text, { color: "cyan", bold: true, children: "\uD83D\uDD27 OneBuff Provider Setup" }) }), _jsx(Divider, { title: "Base URL" }), _jsxs(Box, { flexDirection: "column", marginY: 1, children: [_jsxs(Text, { children: ["Provider: ", _jsx(Text, { color: "cyan", children: "OpenAI-Compatible" })] }), _jsxs(Text, { children: ["API Key: ", _jsx(Text, { color: "green", children: "\u2705 Set" })] }), _jsx(Text, {}), _jsx(Text, { color: "yellow", children: "\uD83C\uDF10 Example: https://api.example.com/v1" }), _jsx(Text, {}), _jsxs(Text, { children: ["Base URL: ", _jsx(Text, { color: "cyan", children: inputValue }), _jsx(Text, { color: "gray", children: "_" })] })] }), _jsx(Text, { color: "gray", dimColor: true, children: "Type the base URL and press Enter" })] }));
    const renderModelInput = () => (_jsxs(Box, { flexDirection: "column", children: [_jsx(InkBox, { borderStyle: "round", borderColor: "cyan", padding: 1, children: _jsx(Text, { color: "cyan", bold: true, children: "\uD83D\uDD27 OneBuff Provider Setup" }) }), _jsx(Divider, { title: "Model Selection" }), _jsxs(Box, { flexDirection: "column", marginY: 1, children: [_jsxs(Text, { children: ["Provider: ", _jsx(Text, { color: "cyan", children: provider === 'openrouter' ? 'OpenRouter' : 'OpenAI-Compatible' })] }), _jsxs(Text, { children: ["API Key: ", _jsx(Text, { color: "green", children: "\u2705 Set" })] }), provider === 'openai-compatible' && _jsxs(Text, { children: ["Base URL: ", _jsx(Text, { color: "green", children: "\u2705 Set" })] }), _jsx(Text, {}), _jsx(Text, { color: "yellow", children: provider === 'openrouter'
                            ? '🤖 Examples: x-ai/grok-4-turbo:free, anthropic/claude-3.5-haiku'
                            : '🤖 Examples: gpt-4, gpt-3.5-turbo, custom-model-name' }), _jsx(Text, {}), _jsxs(Text, { children: ["Model ID: ", _jsx(Text, { color: "cyan", children: inputValue }), _jsx(Text, { color: "gray", children: "_" })] })] }), _jsx(Text, { color: "gray", dimColor: true, children: "Type the model ID and press Enter" })] }));
    const renderComplete = () => (_jsxs(Box, { flexDirection: "column", children: [_jsx(InkBox, { borderStyle: "round", borderColor: "green", padding: 1, children: _jsx(Text, { color: "green", bold: true, children: "\uD83C\uDF89 Setup Complete!" }) }), _jsx(Divider, { title: "Configuration Summary" }), _jsxs(Box, { flexDirection: "column", marginY: 1, children: [_jsxs(Text, { children: ["\u2705 Provider: ", _jsx(Text, { color: "cyan", children: provider === 'openrouter' ? 'OpenRouter' : 'OpenAI-Compatible' })] }), _jsxs(Text, { children: ["\u2705 Model: ", _jsx(Text, { color: "cyan", children: modelId })] }), provider === 'openai-compatible' && _jsxs(Text, { children: ["\u2705 Base URL: ", _jsx(Text, { color: "cyan", children: baseUrl })] }), _jsx(Text, {}), _jsx(Text, { color: "yellow", children: "\uD83D\uDE80 Configuration saved! You can now use OneBuff with your new provider." })] }), _jsx(Text, { color: "gray", dimColor: true, children: "Press any key to return to OneBuff..." })] }));
    return (_jsxs(Box, { flexDirection: "column", padding: 1, children: [step === 'provider' && renderProviderSelection(), step === 'apikey' && renderApiKeyInput(), step === 'baseurl' && renderBaseUrlInput(), step === 'model' && renderModelInput(), step === 'complete' && renderComplete()] }));
};
export const runInlineProviderSetup = async () => {
    return new Promise((resolve) => {
        render(_jsx(ProviderSetup, { onComplete: resolve }));
    });
};
