const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Servir arquivos estáticos da pasta dist
app.use(express.static(path.join(__dirname, 'dist')));

// Armazenar conexões ativas
const clients = new Set();

// Gerenciar conexões WebSocket
wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('Novo cliente conectado');

    ws.on('message', (message) => {
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