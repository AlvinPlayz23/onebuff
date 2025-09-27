#!/usr/bin/env node
// Simple CLI-based provider setup (no JSX)
import * as readline from 'readline';
import pc from 'picocolors';
import { OnebuffConfigManager } from './onebuff-config.js';
const { bold, green, cyan, yellow, red, dim } = pc;
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const question = (prompt) => {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
};
const runProviderSetup = async () => {
    console.clear();
    console.log(bold(green('🔧 OneBuff Provider Setup')));
    console.log('');
    try {
        // Step 1: Choose provider
        console.log('Choose your AI provider:');
        console.log('');
        console.log(cyan('1. OpenRouter') + dim(' (150+ models, easy setup)'));
        console.log(cyan('2. OpenAI-Compatible') + dim(' (Custom endpoint)'));
        console.log('');
        const providerChoice = await question(yellow('Enter your choice (1 or 2): '));
        if (providerChoice !== '1' && providerChoice !== '2') {
            console.log(red('❌ Invalid choice. Exiting.'));
            process.exit(1);
        }
        const provider = providerChoice === '1' ? 'openrouter' : 'openai-compatible';
        const providerName = provider === 'openrouter' ? 'OpenRouter' : 'OpenAI-Compatible';
        console.log('');
        console.log(`Selected provider: ${cyan(providerName)}`);
        console.log('');
        // Step 2: API Key
        const apiKeyPrompt = provider === 'openrouter'
            ? 'Enter your OpenRouter API key (get one at https://openrouter.ai/keys): '
            : 'Enter your API key: ';
        const apiKey = await question(yellow(apiKeyPrompt));
        if (!apiKey.trim()) {
            console.log(red('❌ API key is required. Exiting.'));
            process.exit(1);
        }
        console.log(green('✓ API key set'));
        console.log('');
        // Step 3: Base URL (only for OpenAI-compatible)
        let baseUrl = '';
        if (provider === 'openai-compatible') {
            baseUrl = await question(yellow('Enter the base URL (e.g., https://api.example.com/v1): '));
            if (!baseUrl.trim()) {
                console.log(red('❌ Base URL is required for OpenAI-compatible providers. Exiting.'));
                process.exit(1);
            }
            console.log(green('✓ Base URL set'));
            console.log('');
        }
        // Step 4: Model ID
        const modelPrompt = provider === 'openrouter'
            ? 'Enter model ID (e.g., x-ai/grok-4-fast:free, anthropic/claude-3.5-haiku): '
            : 'Enter model ID (e.g., gpt-4, gpt-3.5-turbo): ';
        const modelId = await question(yellow(modelPrompt));
        if (!modelId.trim()) {
            console.log(red('❌ Model ID is required. Exiting.'));
            process.exit(1);
        }
        console.log(green('✓ Model ID set'));
        console.log('');
        // Save configuration
        const config = {
            provider,
            apiKey: apiKey.trim(),
            baseUrl: provider === 'openai-compatible' ? baseUrl.trim() : undefined,
            modelId: modelId.trim()
        };
        await saveConfiguration(config);
        console.log(bold(green('🎉 Provider configuration completed successfully!')));
        console.log('');
        console.log('Configuration summary:');
        console.log(`  Provider: ${cyan(providerName)}`);
        console.log(`  Model: ${cyan(config.modelId)}`);
        if (config.baseUrl) {
            console.log(`  Base URL: ${cyan(config.baseUrl)}`);
        }
        console.log('');
        console.log(yellow('You can now use OneBuff with your new provider!'));
        console.log('');
    }
    catch (error) {
        console.log(red('❌ Setup failed:'), error);
        process.exit(1);
    }
    finally {
        rl.close();
    }
};
const saveConfiguration = async (config) => {
    const configManager = new OnebuffConfigManager();
    // Update the configuration based on provider
    const newConfig = {
        default_model: config.modelId
    };
    if (config.provider === 'openrouter') {
        newConfig.openrouter_api_key = config.apiKey;
        // Remove any custom provider settings
        newConfig.custom_provider = undefined;
    }
    else {
        // OpenAI-compatible provider
        newConfig.custom_provider = {
            type: 'openai-compatible',
            api_key: config.apiKey,
            base_url: config.baseUrl,
            model: config.modelId
        };
        // Remove OpenRouter key if switching providers
        newConfig.openrouter_api_key = undefined;
    }
    configManager.saveConfig(newConfig);
};
// Handle Ctrl+C
process.on('SIGINT', () => {
    console.log('');
    console.log(yellow('👋 Provider setup cancelled'));
    process.exit(0);
});
runProviderSetup();
