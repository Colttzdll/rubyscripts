// Elementos do DOM
const scriptsContainer = document.getElementById('scriptsContainer');
const addScriptBtn = document.getElementById('addScriptBtn');
const scriptModal = document.getElementById('scriptModal');
const saveScriptBtn = document.getElementById('saveScript');
const cancelScriptBtn = document.getElementById('cancelScript');
const closeModalBtn = document.getElementById('closeModal');
const searchInput = document.getElementById('searchInput');
const filterBtns = document.querySelectorAll('.filter-btn');
const loadingScreen = document.getElementById('loadingScreen');
const thumbnailFileInput = document.getElementById('scriptThumbnailFile');
const thumbnailPreview = document.getElementById('thumbnailPreview');

// Variáveis globais
let scripts = [];
let currentThumbnail = '';
let isEditing = false;
let editingScriptId = null;

// Adicionar classe loading ao body
document.body.classList.add('loading');

// Funções de API
async function fetchScripts() {
    try {
        const response = await fetch('/api/scripts');
        if (!response.ok) throw new Error('Erro ao carregar scripts');
        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar scripts:', error);
        showToast('Erro ao carregar scripts', 'error');
        return [];
    }
}

async function createScript(scriptData) {
    try {
        const response = await fetch('/api/scripts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(scriptData)
        });
        if (!response.ok) throw new Error('Erro ao criar script');
        return await response.json();
    } catch (error) {
        console.error('Erro ao criar script:', error);
        showToast('Erro ao criar script', 'error');
        return null;
    }
}

async function updateScript(id, scriptData) {
    try {
        const response = await fetch(`/api/scripts/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(scriptData)
        });
        if (!response.ok) throw new Error('Erro ao atualizar script');
        return await response.json();
    } catch (error) {
        console.error('Erro ao atualizar script:', error);
        showToast('Erro ao atualizar script', 'error');
        return null;
    }
}

async function deleteScriptFromAPI(id) {
    try {
        const response = await fetch(`/api/scripts/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Erro ao deletar script');
        return true;
    } catch (error) {
        console.error('Erro ao deletar script:', error);
        showToast('Erro ao deletar script', 'error');
        return false;
    }
}

// Função para gerar ID único
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Função para adicionar novo script
async function addNewScript() {
    const title = document.getElementById('scriptTitle').value.trim();
    const content = document.getElementById('scriptContent').value.trim();
    const category = document.getElementById('scriptCategory').value;
    const favorite = document.getElementById('scriptFavorite').checked;
    
    if (title && content) {
        const newScript = {
            id: generateUniqueId(),
            title,
            content,
            category,
            favorite,
            thumbnail: currentThumbnail,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        const savedScript = await createScript(newScript);
        if (savedScript) {
            scripts.push(savedScript);
            updateStats();
            renderScripts();
            scriptModal.style.display = 'none';
            showToast('Script adicionado com sucesso!', 'success');
            
            // Limpar formulário
            document.getElementById('scriptTitle').value = '';
            document.getElementById('scriptContent').value = '';
            document.getElementById('scriptCategory').value = 'game';
            document.getElementById('scriptFavorite').checked = false;
            thumbnailFileInput.value = '';
            updateThumbnailPreview('');
        }
    } else {
        showToast('Por favor, preencha todos os campos!', 'error');
    }
}

// Carregar scripts da API
async function loadScripts() {
    scripts = await fetchScripts();
    updateStats();
    renderScripts();
    // Iniciar conexão WebSocket
    if (typeof window.connectWebSocket === 'function') {
        window.connectWebSocket();
    }
}

// Função para atualizar estatísticas
function updateStats() {
    const totalScripts = scripts.length;
    const favoriteScripts = scripts.filter(script => script.favorite).length;
    const recentScripts = scripts.filter(script => {
        const scriptDate = new Date(script.createdAt);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return scriptDate >= sevenDaysAgo;
    }).length;

    // Calcular estatísticas adicionais
    const totalChars = scripts.reduce((sum, script) => sum + script.content.length, 0);
    const avgLines = scripts.length > 0 
        ? Math.round(scripts.reduce((sum, script) => sum + script.content.split('\n').length, 0) / scripts.length)
        : 0;

    // Formatar número grande com pontos
    const formattedTotalChars = totalChars.toLocaleString('pt-BR');

    document.getElementById('totalScripts').textContent = totalScripts;
    document.getElementById('favoriteScripts').textContent = favoriteScripts;
    document.getElementById('recentScripts').textContent = recentScripts;
    document.getElementById('avgScriptLength').textContent = avgLines;
    document.getElementById('totalChars').textContent = formattedTotalChars;
}

// Função para criar um card de script
function createScriptCard(script) {
    const card = document.createElement('div');
    card.className = 'script-card';
    card.setAttribute('data-script-id', script.id);
    
    const formatDate = (dateStr) => {
        if (!dateStr) return 'Data não disponível';
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? 'Data não disponível' : date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formattedCreatedDate = formatDate(script.createdAt);
    const formattedUpdatedDate = formatDate(script.updatedAt);
    const isRecentlyModified = new Date(script.updatedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000);

    card.innerHTML = `
        <div class="script-card-header">
            <div class="script-thumbnail">
                ${script.thumbnail ? 
                    `<img src="${script.thumbnail}" alt="${script.title}" onerror="this.src='https://i.imgur.com/8XcA0zE.png';">` : 
                    '<i class="fas fa-code" style="font-size: 2.5rem; color: var(--accent-color);"></i>'}
            </div>
            <div class="script-info">
                <h3 title="${script.title}">
                    <span class="title-text">${script.title}</span>
                    <span class="icons">
                        ${script.favorite ? '<i class="fas fa-star" style="color: var(--accent-color);"></i>' : ''}
                        <span class="category-badge">${script.category}</span>
                    </span>
                </h3>
            </div>
        </div>
        <pre><code class="language-lua">${script.content}</code></pre>
        <div class="card-buttons">
            <button class="copy-btn" data-script-id="${script.id}">
                <i class="fas fa-copy"></i>
                Copiar
            </button>
            <button onclick="toggleFavorite('${script.id}')" class="favorite-btn">
                <i class="fas fa-star"></i>
                ${script.favorite ? 'Desfavoritar' : 'Favoritar'}
            </button>
            ${window.isAdmin ? `
                <button onclick="editScript('${script.id}')" class="edit-btn">
                    <i class="fas fa-edit"></i>
                    Editar
                </button>
                <button onclick="deleteScript('${script.id}')" class="delete-btn">
                    <i class="fas fa-trash"></i>
                    Excluir
                </button>
            ` : ''}
        </div>
        <div class="script-dates">
            <small>Criado em: ${formattedCreatedDate}</small>
            <small>Última modificação: ${formattedUpdatedDate}</small>
            ${isRecentlyModified ? '<span class="recently-modified">Modificado recentemente</span>' : ''}
        </div>
    `;
    
    return card;
}

// Função para renderizar scripts
function renderScripts(scriptsToRender = scripts) {
    scriptsContainer.innerHTML = '';
    scriptsToRender.forEach(script => {
        scriptsContainer.appendChild(createScriptCard(script));
    });
    Prism.highlightAll();
    setupCopyButtons();
}

// Função para copiar script
function setupCopyButtons() {
    document.querySelectorAll('.copy-btn').forEach(button => {
        button.addEventListener('click', async function() {
            const id = this.dataset.scriptId;
            const script = scripts.find(s => s.id === id);
            
            if (script) {
                try {
                    await navigator.clipboard.writeText(script.content);
                    showToast('Script copiado com sucesso!', 'success');
                    this.innerHTML = '<i class="fas fa-check"></i> Copiado!';
                    const btn = this;
                    setTimeout(() => {
                        btn.innerHTML = '<i class="fas fa-copy"></i> Copiar';
                    }, 2000);
                } catch (err) {
                    console.error('Erro ao copiar:', err);
                    showToast('Erro ao copiar o script', 'error');
                }
            }
        });
    });
}

// Função para alternar favorito
async function toggleFavorite(id) {
    const scriptIndex = scripts.findIndex(s => s.id === id);
    if (scriptIndex !== -1) {
        const updatedScript = {
            ...scripts[scriptIndex],
            favorite: !scripts[scriptIndex].favorite
        };
        
        const savedScript = await updateScript(id, updatedScript);
        if (savedScript) {
            scripts[scriptIndex] = savedScript;
            updateStats();
            renderScripts();
            showToast(
                savedScript.favorite ? 'Script adicionado aos favoritos!' : 'Script removido dos favoritos!',
                'success'
            );
        }
    }
}

// Função para editar script
function editScript(id) {
    if (!window.isAdmin) return;

    const script = scripts.find(s => s.id === id);
    if (!script) return;

    // Configurar modo de edição
    isEditing = true;
    editingScriptId = id;
    
    // Preencher formulário
    document.getElementById('scriptTitle').value = script.title;
    document.getElementById('scriptContent').value = script.content;
    document.getElementById('scriptCategory').value = script.category;
    document.getElementById('scriptFavorite').checked = script.favorite;
    currentThumbnail = script.thumbnail;
    updateThumbnailPreview(script.thumbnail);
    
    // Mostrar modal
    scriptModal.style.display = 'block';
}

// Função para deletar script
async function deleteScript(id) {
    if (!window.isAdmin) return;
    
    if (confirm('Tem certeza que deseja excluir este script?')) {
        const success = await deleteScriptFromAPI(id);
        if (success) {
            scripts = scripts.filter(s => s.id !== id);
            updateStats();
            renderScripts();
            showToast('Script excluído com sucesso!', 'success');
        }
    }
}

// Event Listeners
addScriptBtn.addEventListener('click', () => {
    clearForm();
    scriptModal.style.display = 'block';
});

saveScriptBtn.addEventListener('click', saveScript);

cancelScriptBtn.addEventListener('click', () => {
    clearForm();
    scriptModal.style.display = 'none';
});

closeModalBtn.addEventListener('click', () => {
    clearForm();
    scriptModal.style.display = 'none';
});

// Fechar modal ao clicar fora
window.addEventListener('click', (e) => {
    if (e.target === scriptModal) {
        scriptModal.style.display = 'none';
    }
});

// Pesquisa em tempo real
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredScripts = scripts.filter(script => 
        script.title.toLowerCase().includes(searchTerm) ||
        script.content.toLowerCase().includes(searchTerm)
    );
    renderScripts(filteredScripts);
});

// Filtros
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        let filteredScripts = scripts;
        
        switch (filter) {
            case 'favorite':
                filteredScripts = scripts.filter(script => script.favorite);
                break;
            case 'recent':
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                filteredScripts = scripts.filter(script => new Date(script.createdAt) >= sevenDaysAgo);
                break;
        }
        
        renderScripts(filteredScripts);
    });
});

// Função para obter o IP do usuário e enviar para o Discord
async function notifyDiscord() {
    try {
        // Obter informações do usuário
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        const ip = ipData.ip;

        // Obter informações do navegador
        const userAgent = navigator.userAgent;
        const browser = {
            name: navigator.userAgent.match(/chrome|firefox|safari|opera|edge|ie/i)?.[0] || 'Desconhecido',
            language: navigator.language,
            platform: navigator.platform
        };

        // Data e hora formatadas
        const now = new Date();
        const dateStr = now.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        const timeStr = now.toLocaleTimeString('pt-BR');

        // Criar embed para o Discord
        const webhookBody = {
            username: "Monitor do Site",
            avatar_url: "https://i.imgur.com/8XcA0zE.png",
            embeds: [{
                title: "🌐 Novo Acesso ao Site",
                color: 0x9D4EDD, // Cor roxa
                fields: [
                    {
                        name: "📍 Endereço IP",
                        value: `\`${ip}\``,
                        inline: true
                    },
                    {
                        name: "🌍 Navegador",
                        value: `\`${browser.name}\``,
                        inline: true
                    },
                    {
                        name: "💻 Plataforma",
                        value: `\`${browser.platform}\``,
                        inline: true
                    },
                    {
                        name: "🗣️ Idioma",
                        value: `\`${browser.language}\``,
                        inline: true
                    },
                    {
                        name: "📅 Data",
                        value: `\`${dateStr}\``,
                        inline: true
                    },
                    {
                        name: "⏰ Hora",
                        value: `\`${timeStr}\``,
                        inline: true
                    }
                ],
                footer: {
                    text: "Sistema de Monitoramento",
                    icon_url: "https://i.imgur.com/8XcA0zE.png"
                },
                timestamp: new Date().toISOString()
            }]
        };

        // Enviar para o webhook do Discord
        await fetch('https://discord.com/api/webhooks/1391249898531196948/gV4G5Clw_MURbxo4Cc77V9lD39np7wLcKjk08JgrNhLAzW2zUN34aRVi_SHW4JMvfJuo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(webhookBody)
        });

    } catch (error) {
        console.error('Erro ao enviar notificação:', error);
    }
}

// Função para converter arquivo em Base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Função para atualizar preview da thumbnail
function updateThumbnailPreview(imageUrl) {
    if (imageUrl) {
        thumbnailPreview.innerHTML = `
            <img src="${imageUrl}" alt="Preview">
            <button class="remove-thumbnail" onclick="removeThumbnail()">
                <i class="fas fa-times"></i>
            </button>
        `;
        thumbnailPreview.classList.add('has-image');
        currentThumbnail = imageUrl;
    } else {
        thumbnailPreview.innerHTML = '<i class="fas fa-image"></i>';
        thumbnailPreview.classList.remove('has-image');
        currentThumbnail = '';
    }
}

// Função para remover thumbnail
function removeThumbnail() {
    currentThumbnail = '';
    thumbnailFileInput.value = '';
    updateThumbnailPreview('');
}

// Event listener para arquivo de thumbnail
thumbnailFileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
        try {
            const base64 = await fileToBase64(file);
            updateThumbnailPreview(base64);
        } catch (error) {
            console.error('Erro ao converter imagem:', error);
            showToast('Erro ao carregar imagem', 'error');
        }
    }
});

// Função para limpar o formulário
function clearForm() {
    document.getElementById('scriptTitle').value = '';
    document.getElementById('scriptContent').value = '';
    document.getElementById('scriptCategory').value = 'game';
    document.getElementById('scriptFavorite').checked = false;
    thumbnailFileInput.value = '';
    updateThumbnailPreview('');
    currentThumbnail = '';
    isEditing = false;
    editingScriptId = null;
}

// Função para salvar script (novo ou editado)
async function saveScript() {
    const title = document.getElementById('scriptTitle').value.trim();
    const content = document.getElementById('scriptContent').value.trim();
    const category = document.getElementById('scriptCategory').value;
    const favorite = document.getElementById('scriptFavorite').checked;
    
    if (!title || !content) {
        showToast('Por favor, preencha todos os campos!', 'error');
        return;
    }

    if (isEditing && editingScriptId) {
        // Modo edição
        const scriptIndex = scripts.findIndex(s => s.id === editingScriptId);
        if (scriptIndex !== -1) {
            const updatedScript = {
                ...scripts[scriptIndex],
                title,
                content,
                category,
                favorite,
                thumbnail: currentThumbnail,
                updatedAt: new Date().toISOString()
            };
            
            const savedScript = await updateScript(editingScriptId, updatedScript);
            if (savedScript) {
                scripts[scriptIndex] = savedScript;
                showToast('Script atualizado com sucesso!', 'success');
            }
        }
    } else {
        // Modo adição
        const newScript = {
            id: generateUniqueId(),
            title,
            content,
            category,
            favorite,
            thumbnail: currentThumbnail,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        const savedScript = await createScript(newScript);
        if (savedScript) {
            scripts.push(savedScript);
            showToast('Script adicionado com sucesso!', 'success');
        }
    }

    // Atualizar, limpar e fechar
    updateStats();
    renderScripts();
    scriptModal.style.display = 'none';
    clearForm();
}

// Inicializar aplicação
async function initializeApp() {
    try {
        // Notificar Discord sobre o novo acesso
        await notifyDiscord();
        
        // Carregar scripts da API
        await loadScripts();
        
        // Remover classe loading
        document.body.classList.remove('loading');
        loadingScreen.style.display = 'none';
    } catch (error) {
        console.error('Erro ao inicializar:', error);
        document.body.classList.remove('loading');
        loadingScreen.style.display = 'none';
    }
}

// Inicializar a aplicação
initializeApp();