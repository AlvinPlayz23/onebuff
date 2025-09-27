import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Text, Box, useInput, useApp } from 'ink';
import SelectInput from 'ink-select-input';
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
            onComplete();
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
                    const config = {
                        provider,
                        apiKey,
                        baseUrl: provider === 'openai-compatible' ? baseUrl : undefined,
                        modelId: inputValue.trim()
                    };
                    setStep('complete');
                    setTimeout(() => {
                        onComplete(config);
                        exit();
                    }, 2000);
                }
                else if (key.backspace) {
                    setInputValue(prev => prev.slice(0, -1));
                }
                else if (input && !key.ctrl && !key.meta && !key.return) {
                    setInputValue(prev => prev + input);
                }
                break;
            case 'complete':
                onComplete();
                exit();
                break;
        }
    });
    const handleProviderSelect = (item) => {
        setProvider(item.value);
        setStep('apikey');
    };
    const providerItems = [
        {
            label: '🌟 OpenRouter (150+ models, easy setup)',
            value: 'openrouter'
        },
        {
            label: '🔧 OpenAI-Compatible (Custom endpoint)',
            value: 'openai-compatible'
        }
    ];
    const renderProviderSelection = () => (_jsxs(Box, { flexDirection: "column", padding: 1, children: [_jsx(Box, { borderStyle: "round", borderColor: "cyan", padding: 1, children: _jsx(Text, { color: "cyan", bold: true, children: "\uD83D\uDD27 OneBuff Provider Setup" }) }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: "yellow", bold: true, children: "Choose your AI provider:" }) }), _jsx(Box, { marginY: 1, children: _jsx(SelectInput, { items: providerItems, onSelect: handleProviderSelect }) }), _jsx(Text, { color: "gray", dimColor: true, children: "\u2191\u2193 Navigate \u2022 Enter to select \u2022 ESC to cancel" })] }));
    const renderApiKeyInput = () => (_jsxs(Box, { flexDirection: "column", padding: 1, children: [_jsx(Box, { borderStyle: "round", borderColor: "cyan", padding: 1, children: _jsx(Text, { color: "cyan", bold: true, children: "\uD83D\uDD27 OneBuff Provider Setup" }) }), _jsxs(Box, { flexDirection: "column", marginY: 1, children: [_jsxs(Text, { children: ["\u2705 Provider: ", _jsx(Text, { color: "cyan", children: provider === 'openrouter' ? 'OpenRouter' : 'OpenAI-Compatible' })] }), _jsx(Text, {}), _jsx(Text, { color: "yellow", bold: true, children: "Enter your API key:" }), _jsx(Text, { color: "gray", children: provider === 'openrouter'
                            ? '🔗 Get one at: https://openrouter.ai/keys'
                            : '🔑 Enter your custom API key' }), _jsx(Text, {}), _jsxs(Text, { children: ["API Key: ", _jsx(Text, { color: "green", children: inputValue.replace(/./g, '•') }), _jsx(Text, { color: "gray", dimColor: true, children: "_" })] })] }), _jsx(Text, { color: "gray", dimColor: true, children: "Type your API key and press Enter \u2022 ESC to cancel" })] }));
    const renderBaseUrlInput = () => (_jsxs(Box, { flexDirection: "column", padding: 1, children: [_jsx(Box, { borderStyle: "round", borderColor: "cyan", padding: 1, children: _jsx(Text, { color: "cyan", bold: true, children: "\uD83D\uDD27 OneBuff Provider Setup" }) }), _jsxs(Box, { flexDirection: "column", marginY: 1, children: [_jsxs(Text, { children: ["\u2705 Provider: ", _jsx(Text, { color: "cyan", children: "OpenAI-Compatible" })] }), _jsxs(Text, { children: ["\u2705 API Key: ", _jsx(Text, { color: "green", children: "Set" })] }), _jsx(Text, {}), _jsx(Text, { color: "yellow", bold: true, children: "Enter the base URL for your API:" }), _jsx(Text, { color: "gray", children: "\uD83C\uDF10 Example: https://api.example.com/v1" }), _jsx(Text, {}), _jsxs(Text, { children: ["Base URL: ", _jsx(Text, { color: "cyan", children: inputValue }), _jsx(Text, { color: "gray", dimColor: true, children: "_" })] })] }), _jsx(Text, { color: "gray", dimColor: true, children: "Type the base URL and press Enter \u2022 ESC to cancel" })] }));
    const renderModelInput = () => (_jsxs(Box, { flexDirection: "column", padding: 1, children: [_jsx(Box, { borderStyle: "round", borderColor: "cyan", padding: 1, children: _jsx(Text, { color: "cyan", bold: true, children: "\uD83D\uDD27 OneBuff Provider Setup" }) }), _jsxs(Box, { flexDirection: "column", marginY: 1, children: [_jsxs(Text, { children: ["\u2705 Provider: ", _jsx(Text, { color: "cyan", children: provider === 'openrouter' ? 'OpenRouter' : 'OpenAI-Compatible' })] }), _jsxs(Text, { children: ["\u2705 API Key: ", _jsx(Text, { color: "green", children: "Set" })] }), provider === 'openai-compatible' && _jsxs(Text, { children: ["\u2705 Base URL: ", _jsx(Text, { color: "green", children: "Set" })] }), _jsx(Text, {}), _jsx(Text, { color: "yellow", bold: true, children: "Enter the model ID:" }), _jsx(Text, { color: "gray", children: provider === 'openrouter'
                            ? '🤖 Examples: x-ai/grok-4-turbo:free, anthropic/claude-3.5-haiku, openai/gpt-4o-mini'
                            : '🤖 Examples: gpt-4, gpt-3.5-turbo, custom-model-name' }), _jsx(Text, {}), _jsxs(Text, { children: ["Model ID: ", _jsx(Text, { color: "cyan", children: inputValue }), _jsx(Text, { color: "gray", dimColor: true, children: "_" })] })] }), _jsx(Text, { color: "gray", dimColor: true, children: "Type the model ID and press Enter \u2022 ESC to cancel" })] }));
    const renderComplete = () => (_jsxs(Box, { flexDirection: "column", padding: 1, children: [_jsx(Box, { borderStyle: "round", borderColor: "green", padding: 1, children: _jsx(Text, { color: "green", bold: true, children: "\uD83C\uDF89 Setup Complete!" }) }), _jsxs(Box, { flexDirection: "column", marginY: 1, children: [_jsx(Text, { color: "yellow", bold: true, children: "Configuration Summary:" }), _jsxs(Text, { children: ["\u2705 Provider: ", _jsx(Text, { color: "cyan", children: provider === 'openrouter' ? 'OpenRouter' : 'OpenAI-Compatible' })] }), _jsxs(Text, { children: ["\u2705 Model: ", _jsx(Text, { color: "cyan", children: modelId })] }), provider === 'openai-compatible' && _jsxs(Text, { children: ["\u2705 Base URL: ", _jsx(Text, { color: "cyan", children: baseUrl })] }), _jsx(Text, {}), _jsx(Text, { color: "green", children: "\uD83D\uDE80 Configuration will be saved automatically!" })] }), _jsx(Text, { color: "gray", dimColor: true, children: "Returning to OneBuff in 2 seconds..." })] }));
    return (_jsxs(Box, { flexDirection: "column", children: [step === 'provider' && renderProviderSelection(), step === 'apikey' && renderApiKeyInput(), step === 'baseurl' && renderBaseUrlInput(), step === 'model' && renderModelInput(), step === 'complete' && renderComplete()] }));
};
export default ProviderSetup;
