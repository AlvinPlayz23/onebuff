import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname, resolve } from 'path';
export class ProjectContextDetector {
    static detectProjectRoot(startPath = process.cwd()) {
        let currentPath = resolve(startPath);
        // Look for common project markers going up the directory tree
        const projectMarkers = [
            'package.json',
            'pyproject.toml',
            'requirements.txt',
            'Cargo.toml',
            'go.mod',
            'pom.xml',
            'CMakeLists.txt',
            '.git'
        ];
        while (currentPath !== dirname(currentPath)) {
            for (const marker of projectMarkers) {
                if (existsSync(join(currentPath, marker))) {
                    return currentPath;
                }
            }
            currentPath = dirname(currentPath);
        }
        // If no project root found, return the starting path
        return startPath;
    }
    static analyzeProject(rootPath) {
        const projectType = this.detectProjectType(rootPath);
        const name = this.detectProjectName(rootPath, projectType);
        const languages = this.detectLanguages(rootPath);
        const frameworks = this.detectFrameworks(rootPath);
        const packageManager = this.detectPackageManager(rootPath);
        const gitRepository = existsSync(join(rootPath, '.git'));
        const structure = this.analyzeStructure(rootPath);
        return {
            root: rootPath,
            type: projectType,
            name,
            language: languages,
            frameworks,
            packageManager,
            gitRepository,
            structure
        };
    }
    static detectProjectType(rootPath) {
        const files = this.getDirectoryContents(rootPath);
        // Next.js (check before React)
        if (files.includes('next.config.js') || files.includes('next.config.ts')) {
            return 'nextjs';
        }
        // React
        if (this.hasReactDependencies(rootPath) || files.includes('create-react-app')) {
            return 'react';
        }
        // Vue
        if (files.includes('vue.config.js') || this.hasVueDependencies(rootPath)) {
            return 'vue';
        }
        // Angular
        if (files.includes('angular.json')) {
            return 'angular';
        }
        // Node.js
        if (files.includes('package.json')) {
            return 'nodejs';
        }
        // Python
        if (files.includes('pyproject.toml') || files.includes('requirements.txt') || files.includes('setup.py')) {
            return 'python';
        }
        // Rust
        if (files.includes('Cargo.toml')) {
            return 'rust';
        }
        // Go
        if (files.includes('go.mod') || files.includes('go.sum')) {
            return 'go';
        }
        // Java
        if (files.includes('pom.xml') || files.includes('build.gradle')) {
            return 'java';
        }
        // C++
        if (files.includes('CMakeLists.txt') || files.includes('Makefile')) {
            return 'cpp';
        }
        return 'unknown';
    }
    static detectProjectName(rootPath, type) {
        if (type === 'nodejs' || type === 'react' || type === 'nextjs' || type === 'vue' || type === 'angular') {
            try {
                const packageJson = JSON.parse(readFileSync(join(rootPath, 'package.json'), 'utf8'));
                return packageJson.name || dirname(rootPath).split('/').pop() || 'unknown';
            }
            catch (error) {
                // Fall through to default
            }
        }
        if (type === 'python') {
            try {
                const pyproject = readFileSync(join(rootPath, 'pyproject.toml'), 'utf8');
                const nameMatch = pyproject.match(/name\s*=\s*"([^"]+)"/);
                if (nameMatch)
                    return nameMatch[1];
            }
            catch (error) {
                // Try setup.py
                try {
                    const setupPy = readFileSync(join(rootPath, 'setup.py'), 'utf8');
                    const nameMatch = setupPy.match(/name\s*=\s*['"']([^'"]+)['"']/);
                    if (nameMatch)
                        return nameMatch[1];
                }
                catch (error) {
                    // Fall through to default
                }
            }
        }
        if (type === 'rust') {
            try {
                const cargoToml = readFileSync(join(rootPath, 'Cargo.toml'), 'utf8');
                const nameMatch = cargoToml.match(/name\s*=\s*"([^"]+)"/);
                if (nameMatch)
                    return nameMatch[1];
            }
            catch (error) {
                // Fall through to default
            }
        }
        // Default to directory name
        return rootPath.split(/[/\\]/).pop() || 'unknown';
    }
    static detectLanguages(rootPath) {
        const languages = new Set();
        this.walkDirectory(rootPath, (filePath) => {
            const ext = filePath.split('.').pop()?.toLowerCase();
            switch (ext) {
                case 'js':
                case 'jsx':
                case 'mjs':
                case 'cjs':
                    languages.add('javascript');
                    break;
                case 'ts':
                case 'tsx':
                    languages.add('typescript');
                    break;
                case 'py':
                case 'pyx':
                case 'pyi':
                    languages.add('python');
                    break;
                case 'rs':
                    languages.add('rust');
                    break;
                case 'go':
                    languages.add('go');
                    break;
                case 'java':
                case 'kt':
                case 'scala':
                    languages.add('java');
                    break;
                case 'cpp':
                case 'cc':
                case 'cxx':
                case 'c':
                case 'h':
                case 'hpp':
                    languages.add('cpp');
                    break;
                case 'rb':
                    languages.add('ruby');
                    break;
                case 'php':
                    languages.add('php');
                    break;
                case 'cs':
                    languages.add('csharp');
                    break;
            }
        }, 2); // Only walk 2 levels deep for performance
        return Array.from(languages);
    }
    static detectFrameworks(rootPath) {
        const frameworks = [];
        try {
            const packageJsonPath = join(rootPath, 'package.json');
            if (existsSync(packageJsonPath)) {
                const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
                const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
                if (deps.react)
                    frameworks.push('react');
                if (deps.next)
                    frameworks.push('nextjs');
                if (deps.vue)
                    frameworks.push('vue');
                if (deps['@angular/core'])
                    frameworks.push('angular');
                if (deps.express)
                    frameworks.push('express');
                if (deps.fastify)
                    frameworks.push('fastify');
                if (deps.nest)
                    frameworks.push('nestjs');
                if (deps.svelte)
                    frameworks.push('svelte');
            }
        }
        catch (error) {
            // Ignore package.json parsing errors
        }
        return frameworks;
    }
    static detectPackageManager(rootPath) {
        const files = this.getDirectoryContents(rootPath);
        if (files.includes('bun.lockb'))
            return 'bun';
        if (files.includes('pnpm-lock.yaml'))
            return 'pnpm';
        if (files.includes('yarn.lock'))
            return 'yarn';
        if (files.includes('package-lock.json'))
            return 'npm';
        if (files.includes('requirements.txt'))
            return 'pip';
        if (files.includes('poetry.lock'))
            return 'poetry';
        if (files.includes('Cargo.lock'))
            return 'cargo';
        if (files.includes('go.sum'))
            return 'go';
        return null;
    }
    static analyzeStructure(rootPath) {
        const structure = {
            directories: [],
            importantFiles: [],
            configFiles: [],
            sourceDirectories: [],
            testDirectories: []
        };
        try {
            const entries = readdirSync(rootPath);
            for (const entry of entries) {
                const fullPath = join(rootPath, entry);
                const stat = statSync(fullPath);
                if (stat.isDirectory()) {
                    structure.directories.push(entry);
                    // Categorize directories
                    if (this.isSourceDirectory(entry)) {
                        structure.sourceDirectories.push(entry);
                    }
                    if (this.isTestDirectory(entry)) {
                        structure.testDirectories.push(entry);
                    }
                }
                else {
                    // Categorize files
                    if (this.isImportantFile(entry)) {
                        structure.importantFiles.push(entry);
                    }
                    if (this.isConfigFile(entry)) {
                        structure.configFiles.push(entry);
                    }
                }
            }
        }
        catch (error) {
            // Ignore directory reading errors
        }
        return structure;
    }
    static isSourceDirectory(name) {
        const sourceDirs = ['src', 'lib', 'app', 'source', 'components', 'pages', 'routes', 'api'];
        return sourceDirs.includes(name.toLowerCase());
    }
    static isTestDirectory(name) {
        const testDirs = ['test', 'tests', '__tests__', 'spec', 'specs', 'e2e', 'integration'];
        return testDirs.includes(name.toLowerCase());
    }
    static isImportantFile(name) {
        const important = [
            'README.md', 'README.txt', 'LICENSE', 'CHANGELOG.md',
            'package.json', 'tsconfig.json', 'webpack.config.js',
            'index.js', 'index.ts', 'main.js', 'main.ts', 'app.js', 'app.ts'
        ];
        return important.includes(name);
    }
    static isConfigFile(name) {
        const configs = [
            'package.json', 'tsconfig.json', '.eslintrc.js', '.prettierrc',
            'webpack.config.js', 'vite.config.js', 'next.config.js',
            'pyproject.toml', 'requirements.txt', 'Cargo.toml', 'go.mod'
        ];
        return configs.includes(name) || name.startsWith('.env');
    }
    static hasReactDependencies(rootPath) {
        try {
            const packageJson = JSON.parse(readFileSync(join(rootPath, 'package.json'), 'utf8'));
            const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
            return !!(deps.react || deps['@types/react']);
        }
        catch (error) {
            return false;
        }
    }
    static hasVueDependencies(rootPath) {
        try {
            const packageJson = JSON.parse(readFileSync(join(rootPath, 'package.json'), 'utf8'));
            const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
            return !!(deps.vue || deps['@vue/cli']);
        }
        catch (error) {
            return false;
        }
    }
    static getDirectoryContents(path) {
        try {
            return readdirSync(path);
        }
        catch (error) {
            return [];
        }
    }
    static walkDirectory(dir, callback, maxDepth = 3, currentDepth = 0) {
        if (currentDepth >= maxDepth)
            return;
        try {
            const entries = readdirSync(dir);
            for (const entry of entries) {
                // Skip hidden files and common ignore patterns
                if (entry.startsWith('.') || entry === 'node_modules' || entry === '__pycache__') {
                    continue;
                }
                const fullPath = join(dir, entry);
                const stat = statSync(fullPath);
                if (stat.isFile()) {
                    callback(fullPath);
                }
                else if (stat.isDirectory()) {
                    this.walkDirectory(fullPath, callback, maxDepth, currentDepth + 1);
                }
            }
        }
        catch (error) {
            // Ignore directory access errors
        }
    }
    static generateProjectSummary(context) {
        let summary = `Project: ${context.name}\n`;
        summary += `Type: ${context.type}\n`;
        summary += `Languages: ${context.language.join(', ')}\n`;
        if (context.frameworks.length > 0) {
            summary += `Frameworks: ${context.frameworks.join(', ')}\n`;
        }
        if (context.packageManager) {
            summary += `Package Manager: ${context.packageManager}\n`;
        }
        if (context.gitRepository) {
            summary += `Git Repository: Yes\n`;
        }
        summary += `\nProject Structure:\n`;
        summary += `- Source directories: ${context.structure.sourceDirectories.join(', ') || 'None detected'}\n`;
        summary += `- Test directories: ${context.structure.testDirectories.join(', ') || 'None detected'}\n`;
        summary += `- Config files: ${context.structure.configFiles.slice(0, 5).join(', ')}${context.structure.configFiles.length > 5 ? '...' : ''}\n`;
        summary += `- Important files: ${context.structure.importantFiles.slice(0, 5).join(', ')}${context.structure.importantFiles.length > 5 ? '...' : ''}\n`;
        return summary;
    }
}
