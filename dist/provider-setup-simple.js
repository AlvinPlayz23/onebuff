#!/usr/bin/env node
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
        rl.question(prompt, (answer) => {
            resolve(answer);
        });
    });
};
const clearScreen = () => {
    process.stdout.write('\x1b[2J\x1b[0f');
};
const showHeader = () => {
    console.log(bold(green('🔧 OneBuff Provider Setup Wizard')));
    console.log(dim('='.repeat(50)));
    console.log('');
};
const runProviderSetup = async () => {
    clearScreen();
    showHeader();
    try {
        // Step 1: Choose provider
        console.log(bold('Step 1: Choose your AI provider'));
        console.log('');
        console.log(`${cyan('1.')} OpenRouter ${dim('(150+ models, easy setup)')}`);
        console.log(`${cyan('2.')} OpenAI-Compatible ${dim('(Custom endpoint)')}`);
        console.log('');
        let providerChoice = '';
        while (providerChoice !== '1' && providerChoice !== '2') {
            providerChoice = await question(yellow('Choose provider (1 or 2): '));
            if (providerChoice !== '1' && providerChoice !== '2') {
                console.log(red('❌ Please enter 1 or 2'));
            }
        }
        const provider = providerChoice === '1' ? 'openrouter' : 'openai-compatible';
        const providerName = provider === 'openrouter' ? 'OpenRouter' : 'OpenAI-Compatible';
        clearScreen();
        showHeader();
        console.log(`✅ Provider: ${cyan(providerName)}`);
        console.log('');
        // Step 2: API Key
        console.log(bold('Step 2: Enter API Key'));
        console.log('');
        if (provider === 'openrouter') {
            console.log(dim('Get your API key at: https://openrouter.ai/keys'));
        }
        else {
            console.log(dim('Enter your custom API key'));
        }
        console.log('');
        let apiKey = '';
        while (!apiKey.trim()) {
            apiKey = await question(yellow('API Key: '));
            if (!apiKey.trim()) {
                console.log(red('❌ API key cannot be empty'));
            }
        }
        clearScreen();
        showHeader();
        console.log(`✅ Provider: ${cyan(providerName)}`);
        console.log(`✅ API Key: ${green('*'.repeat(Math.min(apiKey.length, 20)))}`);
        console.log('');
        // Step 3: Base URL (only for OpenAI-compatible)
        let baseUrl = '';
        if (provider === 'openai-compatible') {
            console.log(bold('Step 3: Enter Base URL'));
            console.log('');
            console.log(dim('Example: https://api.example.com/v1'));
            console.log('');
            while (!baseUrl.trim()) {
                baseUrl = await question(yellow('Base URL: '));
                if (!baseUrl.trim()) {
                    console.log(red('❌ Base URL cannot be empty'));
                }
            }
            clearScreen();
            showHeader();
            console.log(`✅ Provider: ${cyan(providerName)}`);
            console.log(`✅ API Key: ${green('*'.repeat(Math.min(apiKey.length, 20)))}`);
            console.log(`✅ Base URL: ${cyan(baseUrl)}`);
            console.log('');
        }
        // Step 4: Model ID
        const stepNumber = provider === 'openrouter' ? '3' : '4';
        console.log(bold(`Step ${stepNumber}: Enter Model ID`));
        console.log('');
        if (provider === 'openrouter') {
            console.log(dim('Examples:'));
            console.log(dim('  • x-ai/grok-4-turbo:free   (Free Grok 4 Turbo)'));
            console.log(dim('  • anthropic/claude-3.5-haiku   (Claude 3.5 Haiku)'));
            console.log(dim('  • openai/gpt-4o-mini   (GPT-4o Mini)'));
        }
        else {
            console.log(dim('Examples: gpt-4, gpt-3.5-turbo, your-custom-model'));
        }
        console.log('');
        let modelId = '';
        while (!modelId.trim()) {
            modelId = await question(yellow('Model ID: '));
            if (!modelId.trim()) {
                console.log(red('❌ Model ID cannot be empty'));
            }
        }
        // Step 5: Confirmation and Save
        clearScreen();
        showHeader();
        console.log(bold(green('🎉 Setup Complete!')));
        console.log('');
        console.log(bold('Configuration Summary:'));
        console.log(`  Provider: ${cyan(providerName)}`);
        console.log(`  API Key: ${green('*'.repeat(Math.min(apiKey.length, 20)))}`);
        if (baseUrl) {
            console.log(`  Base URL: ${cyan(baseUrl)}`);
        }
        console.log(`  Model: ${cyan(modelId)}`);
        console.log('');
        const confirmation = await question(yellow('Save this configuration? (y/N): '));
        if (confirmation.toLowerCase() === 'y' || confirmation.toLowerCase() === 'yes') {
            // Save configuration
            const config = {
                provider,
                apiKey: apiKey.trim(),
                baseUrl: provider === 'openai-compatible' ? baseUrl.trim() : undefined,
                modelId: modelId.trim()
            };
            await saveConfiguration(config);
            clearScreen();
            showHeader();
            console.log(bold(green('✅ Configuration saved successfully!')));
            console.log('');
            console.log(yellow('You can now use OneBuff with your new provider.'));
            console.log('');
            console.log(dim('Run: node dist/index.js --help'));
            console.log(dim('Or:  node dist/index.js -i'));
        }
        else {
            console.log('');
            console.log(yellow('👋 Configuration cancelled'));
        }
    }
    catch (error) {
        console.log('');
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
        // Clear any existing custom provider settings
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
        // Clear any existing OpenRouter key when switching providers
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
// Handle errors gracefully
process.on('uncaughtException', (error) => {
    console.log('');
    console.log(red('❌ An error occurred:'), error.message);
    process.exit(1);
});
runProviderSetup();
