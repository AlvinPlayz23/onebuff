import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { render, Text, Box, useInput, useApp, Static } from 'ink';
// @ts-ignore
import InkBox from 'ink-box';
// @ts-ignore
import BigText from 'ink-big-text';
// @ts-ignore
import Spinner from 'ink-spinner';
// @ts-ignore
import Divider from 'ink-divider';
import { UniversalClient } from './universal-client.js';
import { AgentSystem } from './agents.js';
import ProviderSetup from './components/ProviderSetup.js';
const OnebuffTUI = ({ configManager }) => {
    const [state, setState] = useState('welcome');
    const [client, setClient] = useState(null);
    const [agentSystem, setAgentSystem] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [currentModel, setCurrentModel] = useState('');
    const [projectInfo, setProjectInfo] = useState(null);
    const { exit } = useApp();
    useEffect(() => {
        initializeClient();
        detectProject();
    }, []);
    const initializeClient = async () => {
        try {
            setState('loading');
            const universalClient = new UniversalClient(configManager);
            const connected = await universalClient.testConnection();
            if (connected) {
                setClient(universalClient);
                setAgentSystem(new AgentSystem(universalClient, configManager));
                setIsConnected(true);
                setCurrentModel(configManager.getSelectedModel());
            }
            setState('main');
        }
        catch (error) {
            addSystemMessage(`Failed to initialize: ${error}`);
            setState('main');
        }
    };
    const detectProject = async () => {
        try {
            const { ProjectAnalyzer } = await import('./project-detector.js');
            const analyzer = new ProjectAnalyzer(process.cwd());
            const info = analyzer.getProjectInfo();
            setProjectInfo(info);
        }
        catch (error) {
            // Project detection is optional
        }
    };
    const addSystemMessage = (content) => {
        setMessages(prev => [...prev, {
                id: Date.now().toString(),
                content,
                role: 'system',
                timestamp: new Date()
            }]);
    };
    const addUserMessage = (content) => {
        setMessages(prev => [...prev, {
                id: Date.now().toString(),
                content,
                role: 'user',
                timestamp: new Date()
            }]);
    };
    const addAssistantMessage = (content, isStreaming = false) => {
        setMessages(prev => [...prev, {
                id: Date.now().toString(),
                content,
                role: 'assistant',
                timestamp: new Date(),
                isStreaming
            }]);
    };
    const handleSendMessage = async () => {
        if (!inputValue.trim() || !client)
            return;
        const userMessage = inputValue.trim();
        setInputValue('');
        addUserMessage(userMessage);
        try {
            setState('loading');
            if (agentSystem) {
                const response = await agentSystem.handleChat(userMessage);
                addAssistantMessage(response);
            }
            else {
                const response = await client.generateText(userMessage, { maxTokens: 2048 });
                addAssistantMessage(response);
            }
            setState('chat');
        }
        catch (error) {
            addSystemMessage(`Error: ${error}`);
            setState('chat');
        }
    };
    useInput((input, key) => {
        if (key.ctrl && input.toLowerCase() === 'c') {
            exit();
            return;
        }
        switch (state) {
            case 'welcome':
                if (key.return) {
                    setState('main');
                }
                break;
            case 'main':
                if (input === '1') {
                    setState('chat');
                }
                else if (input === '2') {
                    setState('provider-setup');
                }
                else if (input === '3') {
                    setState('help');
                }
                else if (input === '4') {
                    exit();
                }
                break;
            case 'chat':
                if (key.escape) {
                    setState('main');
                }
                else if (key.return) {
                    handleSendMessage();
                }
                else if (key.backspace) {
                    setInputValue(prev => prev.slice(0, -1));
                }
                else if (input && !key.ctrl && !key.meta) {
                    setInputValue(prev => prev + input);
                }
                break;
            case 'help':
                if (key.return || key.escape) {
                    setState('main');
                }
                break;
        }
    });
    const renderWelcome = () => (_jsxs(Box, { flexDirection: "column", alignItems: "center", justifyContent: "center", children: [_jsx(BigText, { text: "OneBuff", colors: ['cyan', 'magenta'] }), _jsx(Box, { marginY: 1, children: _jsx(Text, { color: "yellow", bold: true, children: "\uD83D\uDE80 Local AI Coding Assistant" }) }), _jsx(InkBox, { borderStyle: "double", borderColor: "cyan", padding: 1, children: _jsxs(Box, { flexDirection: "column", alignItems: "center", children: [_jsx(Text, { color: "green", children: "Welcome to OneBuff!" }), _jsx(Text, { color: "gray", children: "Your local-first AI coding companion" })] }) }), _jsx(Box, { marginTop: 2, children: _jsx(Text, { color: "gray", dimColor: true, children: "Press Enter to continue..." }) })] }));
    const renderMain = () => (_jsxs(Box, { flexDirection: "column", children: [_jsx(InkBox, { borderStyle: "round", borderColor: "cyan", padding: 1, children: _jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "cyan", bold: true, children: "\uD83D\uDE80 OneBuff - Local AI Coding Assistant" }), _jsxs(Box, { flexDirection: "row", gap: 2, children: [_jsxs(Text, { children: ["\uD83D\uDCC1 Project: ", _jsx(Text, { color: "cyan", children: projectInfo?.name || 'Unknown' })] }), _jsxs(Text, { children: ["\uD83E\uDD16 Model: ", _jsx(Text, { color: isConnected ? 'green' : 'red', children: currentModel })] })] })] }) }), _jsx(Divider, { title: "Main Menu" }), _jsxs(Box, { flexDirection: "column", marginY: 1, gap: 1, children: [_jsx(Text, { color: "cyan", children: "1. \uD83D\uDCAC Start Chat Session" }), _jsx(Text, { color: "cyan", children: "2. \uD83D\uDD27 Provider Setup" }), _jsx(Text, { color: "cyan", children: "3. \u2753 Help & Commands" }), _jsx(Text, { color: "cyan", children: "4. \uD83D\uDEAA Exit" })] }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: "gray", dimColor: true, children: "Press 1-4 to select an option" }) }), !isConnected && (_jsx(Box, { marginTop: 1, children: _jsx(InkBox, { borderStyle: "round", borderColor: "red", padding: 1, children: _jsx(Text, { color: "red", children: "\u26A0\uFE0F Not connected to AI provider. Use option 2 to setup." }) }) }))] }));
    const renderChat = () => (_jsxs(Box, { flexDirection: "column", height: "100%", children: [_jsx(InkBox, { borderStyle: "round", borderColor: "green", padding: 1, children: _jsxs(Text, { color: "green", bold: true, children: ["\uD83D\uDCAC OneBuff Chat - ", currentModel] }) }), _jsx(Box, { flexDirection: "column", flexGrow: 1, marginY: 1, children: _jsx(Static, { items: messages, children: message => (_jsxs(Box, { flexDirection: "row", marginBottom: 1, children: [_jsx(Box, { minWidth: 12, children: _jsx(Text, { color: message.role === 'user' ? 'cyan' : message.role === 'assistant' ? 'green' : 'yellow', children: message.role === 'user' ? '👤 You:' : message.role === 'assistant' ? '🤖 AI:' : '💻 System:' }) }), _jsxs(Box, { flexDirection: "column", flexGrow: 1, children: [_jsxs(Text, { children: [message.content, message.isStreaming && _jsx(Spinner, { type: "dots" })] }), _jsx(Text, { color: "gray", dimColor: true, children: message.timestamp.toLocaleTimeString() })] })] }, message.id)) }) }), _jsx(Divider, {}), _jsxs(Box, { flexDirection: "row", alignItems: "center", children: [_jsx(Text, { color: "cyan", children: "Message: " }), _jsx(Text, { children: inputValue }), _jsx(Text, { color: "gray", children: "_" })] }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: "gray", dimColor: true, children: "Type your message and press Enter to send \u2022 ESC to return to main menu" }) })] }));
    const renderLoading = () => (_jsxs(Box, { flexDirection: "column", alignItems: "center", justifyContent: "center", children: [_jsxs(Box, { marginBottom: 1, children: [_jsx(Spinner, { type: "dots" }), _jsx(Text, { color: "yellow", children: " Processing..." })] }), _jsx(Text, { color: "gray", dimColor: true, children: "Please wait..." })] }));
    const renderHelp = () => (_jsxs(Box, { flexDirection: "column", children: [_jsx(InkBox, { borderStyle: "round", borderColor: "yellow", padding: 1, children: _jsx(Text, { color: "yellow", bold: true, children: "\u2753 OneBuff Help & Commands" }) }), _jsx(Divider, { title: "Available Features" }), _jsxs(Box, { flexDirection: "column", marginY: 1, gap: 1, children: [_jsx(Text, { color: "green", bold: true, children: "\uD83D\uDCAC Chat Features:" }), _jsx(Text, { children: "  \u2022 Natural language conversations with AI" }), _jsx(Text, { children: "  \u2022 Code analysis and suggestions" }), _jsx(Text, { children: "  \u2022 Multi-agent coordination" }), _jsx(Text, { children: "  \u2022 Project-aware responses" }), _jsx(Text, { color: "cyan", bold: true, children: "\uD83D\uDD27 Configuration:" }), _jsx(Text, { children: "  \u2022 Multiple AI provider support" }), _jsx(Text, { children: "  \u2022 OpenRouter integration (150+ models)" }), _jsx(Text, { children: "  \u2022 Custom OpenAI-compatible endpoints" }), _jsx(Text, { children: "  \u2022 Easy model switching" }), _jsx(Text, { color: "magenta", bold: true, children: "\uD83D\uDE80 Advanced Features:" }), _jsx(Text, { children: "  \u2022 Project detection and analysis" }), _jsx(Text, { children: "  \u2022 Tool calling capabilities" }), _jsx(Text, { children: "  \u2022 File operations and terminal commands" }), _jsx(Text, { children: "  \u2022 Multi-step workflows" })] }), _jsx(Box, { marginTop: 2, children: _jsx(Text, { color: "gray", dimColor: true, children: "Press Enter or ESC to return to main menu" }) })] }));
    const renderProviderSetup = () => (_jsx(ProviderSetup, { onComplete: (config) => {
            if (config) {
                // Configuration will be saved by the component
                initializeClient();
            }
            setState('main');
        } }));
    return (_jsxs(Box, { flexDirection: "column", padding: 1, children: [state === 'welcome' && renderWelcome(), state === 'main' && renderMain(), state === 'chat' && renderChat(), state === 'loading' && renderLoading(), state === 'help' && renderHelp(), state === 'provider-setup' && renderProviderSetup()] }));
};
export const startOnebuffTUI = (configManager) => {
    render(_jsx(OnebuffTUI, { configManager: configManager }));
};
