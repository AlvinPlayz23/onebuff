#!/usr/bin/env node
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { render, Text, Box, useInput, useApp } from 'ink';
import { OnebuffConfigManager } from './onebuff-config.js';
const ProviderWizard = () => {
    const [step, setStep] = React.useState('provider');
    const [provider, setProvider] = React.useState('openrouter');
    const [apiKey, setApiKey] = React.useState('');
    const [baseUrl, setBaseUrl] = React.useState('');
    const [modelId, setModelId] = React.useState('');
    const [inputValue, setInputValue] = React.useState('');
    const [selectedOption, setSelectedOption] = React.useState(1);
    const { exit } = useApp();
    useInput((input, key) => {
        if (key.escape) {
            console.log('\n👋 Setup cancelled');
            exit();
            return;
        }
        switch (step) {
            case 'provider':
                if (input === '1') {
                    setProvider('openrouter');
                    setStep('apikey');
                    setInputValue('');
                }
                else if (input === '2') {
                    setProvider('openai-compatible');
                    setStep('apikey');
                    setInputValue('');
                }
                else if (key.upArrow && selectedOption > 1) {
                    setSelectedOption(selectedOption - 1);
                }
                else if (key.downArrow && selectedOption < 2) {
                    setSelectedOption(selectedOption + 1);
                }
                else if (key.return) {
                    if (selectedOption === 1) {
                        setProvider('openrouter');
                        setStep('apikey');
                    }
                    else {
                        setProvider('openai-compatible');
                        setStep('apikey');
                    }
                    setInputValue('');
                }
                break;
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
    const renderProviderSelection = () => (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "green", bold: true, children: "\uD83D\uDD27 OneBuff Provider Setup" }), _jsx(Text, {}), _jsx(Text, { children: "Choose your AI provider:" }), _jsx(Text, {}), _jsxs(Text, { color: selectedOption === 1 ? "cyan" : "white", children: [selectedOption === 1 ? "❯ " : "  ", "1. OpenRouter ", _jsx(Text, { color: "gray", children: "(150+ models, easy setup)" })] }), _jsxs(Text, { color: selectedOption === 2 ? "cyan" : "white", children: [selectedOption === 2 ? "❯ " : "  ", "2. OpenAI-Compatible ", _jsx(Text, { color: "gray", children: "(Custom endpoint)" })] }), _jsx(Text, {}), _jsx(Text, { color: "yellow", children: "Use arrow keys and Enter to select, or press 1/2, ESC to cancel" })] }));
    const renderApiKeyInput = () => (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "green", bold: true, children: "\uD83D\uDD27 OneBuff Provider Setup" }), _jsx(Text, {}), _jsxs(Text, { children: ["Provider: ", _jsx(Text, { color: "cyan", children: provider === 'openrouter' ? 'OpenRouter' : 'OpenAI-Compatible' })] }), _jsx(Text, {}), _jsx(Text, { children: "Enter your API key:" }), _jsx(Text, { color: "gray", children: provider === 'openrouter'
                    ? 'Get one at: https://openrouter.ai/keys'
                    : 'Your custom API key' }), _jsx(Text, {}), _jsxs(Text, { children: ["API Key: ", _jsx(Text, { color: "cyan", children: inputValue.replace(/./g, '*') }), _jsx(Text, { color: "gray", children: "_" })] }), _jsx(Text, {}), _jsx(Text, { color: "yellow", children: "Type your API key and press Enter" })] }));
    const renderBaseUrlInput = () => (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "green", bold: true, children: "\uD83D\uDD27 OneBuff Provider Setup" }), _jsx(Text, {}), _jsxs(Text, { children: ["Provider: ", _jsx(Text, { color: "cyan", children: "OpenAI-Compatible" })] }), _jsxs(Text, { children: ["API Key: ", _jsx(Text, { color: "green", children: "\u2713 Set" })] }), _jsx(Text, {}), _jsx(Text, { children: "Enter the base URL for your API:" }), _jsx(Text, { color: "gray", children: "Example: https://api.example.com/v1" }), _jsx(Text, {}), _jsxs(Text, { children: ["Base URL: ", _jsx(Text, { color: "cyan", children: inputValue }), _jsx(Text, { color: "gray", children: "_" })] }), _jsx(Text, {}), _jsx(Text, { color: "yellow", children: "Type the base URL and press Enter" })] }));
    const renderModelInput = () => (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "green", bold: true, children: "\uD83D\uDD27 OneBuff Provider Setup" }), _jsx(Text, {}), _jsxs(Text, { children: ["Provider: ", _jsx(Text, { color: "cyan", children: provider === 'openrouter' ? 'OpenRouter' : 'OpenAI-Compatible' })] }), _jsxs(Text, { children: ["API Key: ", _jsx(Text, { color: "green", children: "\u2713 Set" })] }), provider === 'openai-compatible' && _jsxs(Text, { children: ["Base URL: ", _jsx(Text, { color: "green", children: "\u2713 Set" })] }), _jsx(Text, {}), _jsx(Text, { children: "Enter the model ID:" }), _jsx(Text, { color: "gray", children: provider === 'openrouter'
                    ? 'Examples: x-ai/grok-4-turbo:free, anthropic/claude-3.5-haiku'
                    : 'Examples: gpt-4, gpt-3.5-turbo, custom-model-name' }), _jsx(Text, {}), _jsxs(Text, { children: ["Model ID: ", _jsx(Text, { color: "cyan", children: inputValue }), _jsx(Text, { color: "gray", children: "_" })] }), _jsx(Text, {}), _jsx(Text, { color: "yellow", children: "Type the model ID and press Enter" })] }));
    const renderComplete = () => (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "green", bold: true, children: "\uD83C\uDF89 Provider Setup Complete!" }), _jsx(Text, {}), _jsx(Text, { children: "Configuration Summary:" }), _jsxs(Text, { children: ["  Provider: ", _jsx(Text, { color: "cyan", children: provider === 'openrouter' ? 'OpenRouter' : 'OpenAI-Compatible' })] }), _jsxs(Text, { children: ["  Model: ", _jsx(Text, { color: "cyan", children: modelId })] }), provider === 'openai-compatible' && _jsxs(Text, { children: ["  Base URL: ", _jsx(Text, { color: "cyan", children: baseUrl })] }), _jsx(Text, {}), _jsx(Text, { color: "yellow", children: "Configuration saved! You can now use OneBuff with your new provider." }), _jsx(Text, {}), _jsx(Text, { color: "gray", children: "Press any key to exit..." })] }));
    return (_jsxs(Box, { flexDirection: "column", padding: 1, children: [step === 'provider' && renderProviderSelection(), step === 'apikey' && renderApiKeyInput(), step === 'baseurl' && renderBaseUrlInput(), step === 'model' && renderModelInput(), step === 'complete' && renderComplete()] }));
};
// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
    console.log('\n👋 Setup cancelled');
    process.exit(0);
});
render(_jsx(ProviderWizard, {}));
