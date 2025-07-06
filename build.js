const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

// Ensure dist directory exists
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
}

// Ensure src/models and src/config directories exist
const modelsDir = path.join(__dirname, 'src', 'models');
const configDir = path.join(__dirname, 'src', 'config');
if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir, { recursive: true });
}
if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
}

// Files to copy and process
const files = {
    'index.html': { src: './', needsObfuscation: false },
    'styles.css': { src: './src/', needsObfuscation: false },
    'script.js': { src: './src/', needsObfuscation: true },
    'admin.js': { src: './src/', needsObfuscation: true },
    'utils.js': { src: './src/', needsObfuscation: true },
    'websocket.js': { src: './src/', needsObfuscation: true },
    'models/Script.js': { src: './src/', needsObfuscation: false },
    'config/database.js': { src: './src/', needsObfuscation: false }
};

// Process each file
for (const [file, config] of Object.entries(files)) {
    const sourcePath = path.join(__dirname, config.src, file);
    const targetPath = path.join(distDir, file);
    
    // Ensure target directory exists
    const targetDir = path.dirname(targetPath);
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }
    
    const content = fs.readFileSync(sourcePath, 'utf8');
    
    if (config.needsObfuscation) {
        // Obfuscate JavaScript files
        const obfuscationResult = JavaScriptObfuscator.obfuscate(content, {
            compact: true,
            controlFlowFlattening: true,
            controlFlowFlatteningThreshold: 0.75,
            numbersToExpressions: true,
            simplify: true,
            stringArrayShuffle: true,
            splitStrings: true,
            stringArrayThreshold: 0.75
        });
        fs.writeFileSync(targetPath, obfuscationResult.getObfuscatedCode());
    } else {
        // Copy non-JavaScript files as is
        fs.writeFileSync(targetPath, content);
    }
}

console.log('Build completed successfully! Files are ready in the dist directory.'); 