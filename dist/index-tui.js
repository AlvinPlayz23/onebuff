#!/usr/bin/env node
import { Command } from 'commander';
import { ConfigManager } from './config.js';
import { InteractiveCLI } from './cli.js';
import pc from 'picocolors';
const { green, yellow, cyan, red, bold } = pc;
const program = new Command();
const configManager = new ConfigManager();
program
    .name('onebuff')
    .description('OneBuff - Local AI Coding Assistant with Beautiful UI')
    .version('1.0.0');
program
    .option('-i, --interactive', 'Start interactive mode (default)')
    .option('--classic', 'Use classic terminal interface')
    .option('--model <model>', 'Specify AI model to use')
    .option('--config', 'Show current configuration')
    .option('--trace', 'Enable debug tracing')
    .argument('[message]', 'Message to send to AI (non-interactive)');
program.action(async (message, options) => {
    try {
        // Show beautiful startup banner
        console.clear();
        console.log(bold(cyan('╔══════════════════════════════════════════════════════════════╗')));
        console.log(bold(cyan('║') + '                         ' + green('OneBuff') + '                        ' + cyan('║')));
        console.log(bold(cyan('║') + '              ' + yellow('🚀 Local AI Coding Assistant') + '             ' + cyan('║')));
        console.log(bold(cyan('╚══════════════════════════════════════════════════════════════╝')));
        console.log('');
        // Handle configuration commands
        if (options.config) {
            const config = configManager.loadConfig();
            console.log(cyan('📋 Current OneBuff Configuration:'));
            console.log('');
            console.log('  OpenRouter API Key:', config.openrouterApiKey ? green('✓ Set') : red('✗ Not set'));
            console.log('  Default Model:', config.defaultModel || 'Not set');
            console.log('  Working Directory:', config.workingDirectory || 'Current directory');
            console.log('');
            return;
        }
        // Set model if specified
        if (options.model) {
            const config = configManager.loadConfig();
            config.defaultModel = options.model;
            configManager.saveConfig(config);
            console.log(green(`✓ Model set to: ${options.model}`));
            console.log('');
        }
        // Enable tracing if requested
        if (options.trace) {
            process.env.ONEBUFF_DEBUG = 'true';
        }
        // Handle direct message (simple mode)
        if (message) {
            console.log(yellow('🤖 Processing your message...'));
            // For direct messages, start CLI in simple mode
            const cli = new InteractiveCLI();
            // Send the message directly and exit after response
            // This would need to be implemented in the CLI class
            console.log(red('Direct message mode not yet implemented. Use interactive mode instead.'));
            return;
        }
        // Start the beautiful interactive CLI
        console.log(green('🎯 Starting OneBuff Interactive Mode...'));
        console.log('');
        const cli = new InteractiveCLI();
        cli.start();
    }
    catch (error) {
        console.error(red('❌ Error:'), error);
        process.exit(1);
    }
});
program.parse();
