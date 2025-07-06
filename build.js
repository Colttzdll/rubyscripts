const fs = require('fs');
const JavaScriptObfuscator = require('javascript-obfuscator');
const path = require('path');

// Configurações de ofuscação
const obfuscationOptions = {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.8,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.5,
    debugProtection: true,
    debugProtectionInterval: 4000,
    disableConsoleOutput: true,
    identifierNamesGenerator: 'hexadecimal',
    log: false,
    numbersToExpressions: true,
    renameGlobals: true,
    rotateStringArray: true,
    selfDefending: true,
    shuffleStringArray: true,
    splitStrings: true,
    splitStringsChunkLength: 5,
    stringArray: true,
    stringArrayEncoding: ['rc4'],
    stringArrayThreshold: 0.8,
    transformObjectKeys: true,
    unicodeEscapeSequence: false
};

// Lista de arquivos para ofuscar
const filesToObfuscate = [
    'script.js',
    'admin.js'
];

// Criar pasta dist se não existir
if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
}

// Copiar arquivos HTML e CSS
fs.copyFileSync('index.html', 'dist/index.html');
fs.copyFileSync('styles.css', 'dist/styles.css');

// Ofuscar cada arquivo JavaScript
filesToObfuscate.forEach(file => {
    const code = fs.readFileSync(file, 'utf8');
    const obfuscationResult = JavaScriptObfuscator.obfuscate(code, obfuscationOptions);
    fs.writeFileSync(`dist/${file}`, obfuscationResult.getObfuscatedCode());
    console.log(`✅ Arquivo ${file} ofuscado com sucesso!`);
});

// Atualizar os caminhos no HTML
let htmlContent = fs.readFileSync('dist/index.html', 'utf8');
htmlContent = htmlContent.replace(/src="(.*?)\.js"/g, 'src="$1.js"');
fs.writeFileSync('dist/index.html', htmlContent);

console.log('\n🔒 Build completo! Os arquivos ofuscados estão na pasta dist/'); 