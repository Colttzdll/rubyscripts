const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

// Ensure dist directory exists
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
}

// Files to copy and process
const files = {
    'index.html': { src: './', needsObfuscation: false },
    'styles.css': { src: './src/', needsObfuscation: false },
    'script.js': { src: './src/', needsObfuscation: true },
    'admin.js': { src: './src/', needsObfuscation: true },
    'utils.js': { src: './src/', needsObfuscation: true },
    'websocket.js': { src: './src/', needsObfuscation: true }
};

// Process each file
for (const [file, config] of Object.entries(files)) {
    const sourcePath = path.join(__dirname, config.src, file);
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
        fs.writeFileSync(path.join(distDir, file), obfuscationResult.getObfuscatedCode());
    } else {
        // Copy non-JavaScript files as is
        fs.writeFileSync(path.join(distDir, file), content);
    }
}

console.log('Build completed successfully! Files are ready in the dist directory.'); 