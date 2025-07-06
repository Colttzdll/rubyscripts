// Conexão WebSocket
let ws;

// Função para conectar ao WebSocket
function connectWebSocket() {
    // Quando hospedar, troque esta URL pelo seu domínio
    // Exemplo: wss://seusite.com/ws
    ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
        console.log('Conectado ao servidor WebSocket');
    };

    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        
        switch (message.type) {
            case 'script_added':
                scripts.push(message.data);
                updateStats();
                renderScripts();
                showToast('Novo script adicionado!', 'success');
                break;
                
            case 'script_edited':
                const editIndex = scripts.findIndex(s => s.id === message.data.id);
                if (editIndex !== -1) {
                    scripts[editIndex] = message.data;
                    updateStats();
                    renderScripts();
                    showToast('Um script foi atualizado!', 'info');
                }
                break;
                
            case 'script_deleted':
                const deleteIndex = scripts.findIndex(s => s.id === message.data);
                if (deleteIndex !== -1) {
                    scripts.splice(deleteIndex, 1);
                    updateStats();
                    renderScripts();
                    showToast('Um script foi removido!', 'warning');
                }
                break;
                
            case 'full_update':
                scripts = message.data;
                updateStats();
                renderScripts();
                break;
        }
    };

    ws.onclose = () => {
        console.log('Desconectado do servidor WebSocket');
        // Tentar reconectar após 5 segundos
        setTimeout(connectWebSocket, 5000);
    };

    ws.onerror = (error) => {
        console.error('Erro WebSocket:', error);
    };
}

// Função para enviar atualizações para outros usuários
function broadcastUpdate(action, data) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: action,
            data: data
        }));
    }
} 