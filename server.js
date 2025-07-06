const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const connectDB = require('./src/config/database');
const Script = require('./src/models/Script');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Conectar ao MongoDB
connectDB();

// Middleware para processar JSON
app.use(express.json());

// Servir arquivos estáticos da pasta dist
app.use(express.static(path.join(__dirname, 'dist')));

// Armazenar conexões ativas
const clients = new Set();

// API Routes
app.get('/api/scripts', async (req, res) => {
    try {
        const scripts = await Script.find().sort({ createdAt: -1 });
        res.json(scripts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/scripts', async (req, res) => {
    try {
        const script = new Script(req.body);
        const savedScript = await script.save();
        
        // Notificar todos os clientes sobre o novo script
        const message = JSON.stringify({
            type: 'script_added',
            data: savedScript
        });
        
        clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
        
        res.status(201).json(savedScript);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.put('/api/scripts/:id', async (req, res) => {
    try {
        const script = await Script.findOneAndUpdate(
            { id: req.params.id },
            { ...req.body, updatedAt: new Date() },
            { new: true }
        );
        
        if (!script) {
            return res.status(404).json({ message: 'Script não encontrado' });
        }
        
        // Notificar todos os clientes sobre a atualização
        const message = JSON.stringify({
            type: 'script_edited',
            data: script
        });
        
        clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
        
        res.json(script);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.delete('/api/scripts/:id', async (req, res) => {
    try {
        const script = await Script.findOneAndDelete({ id: req.params.id });
        
        if (!script) {
            return res.status(404).json({ message: 'Script não encontrado' });
        }
        
        // Notificar todos os clientes sobre a exclusão
        const message = JSON.stringify({
            type: 'script_deleted',
            data: req.params.id
        });
        
        clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
        
        res.json({ message: 'Script deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Gerenciar conexões WebSocket
wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('Novo cliente conectado');

    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            
            // Broadcast para todos os clientes exceto o remetente
            clients.forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(data));
                }
            });
        } catch (error) {
            console.error('Erro ao processar mensagem:', error);
        }
    });

    ws.on('close', () => {
        clients.delete(ws);
        console.log('Cliente desconectado');
    });

    // Enviar mensagem inicial
    ws.send(JSON.stringify({ type: 'connection_established' }));
});

// Rota fallback para SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
}); 