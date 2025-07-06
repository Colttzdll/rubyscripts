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
    'index.html': false, // false means no obfuscation
    'styles.css': false,
    'script.js': true,  // true means needs obfuscation
    'admin.js': true
};

// Process each file
for (const [file, needsObfuscation] of Object.entries(files)) {
    const content = fs.readFileSync(path.join(__dirname, file), 'utf8');
    
    if (needsObfuscation) {
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