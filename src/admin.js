// Elementos do DOM para autenticação
const adminLoginBtn = document.getElementById('adminLoginBtn');
const loginModal = document.getElementById('loginModal');
const loginBtn = document.getElementById('loginBtn');
const cancelLoginBtn = document.getElementById('cancelLoginBtn');
const closeLoginModal = document.getElementById('closeLoginModal');
const adminPassword = document.getElementById('adminPassword');
const adminControls = document.getElementById('adminControls');
const logoutBtn = document.getElementById('logoutBtn');

// Função para mostrar mensagens
function showMessage(message, type) {
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
    } else {
        console.log(message);
    }
}

// Senha de admin (você deve alterar isso para uma senha segura)
const ADMIN_PASSWORD = 'RubyScripts2024!';
const ADMIN_PASSWORD_HASH = btoa(ADMIN_PASSWORD); // Codificação básica para não deixar a senha exposta

// Verificar se já está logado
let isAdmin = localStorage.getItem('isAdmin') === 'true';
window.isAdmin = isAdmin; // Definir window.isAdmin imediatamente

// Função para mostrar/esconder elementos baseado no status de admin
function updateAdminUI() {
    window.isAdmin = isAdmin; // Atualizar window.isAdmin sempre que mudar
    if (isAdmin) {
        adminLoginBtn.style.display = 'none';
        adminControls.style.display = 'block';
        // Habilitar edição nos cards de script
        document.querySelectorAll('.script-card').forEach(card => {
            card.classList.add('admin-mode');
        });
    } else {
        adminLoginBtn.style.display = 'block';
        adminControls.style.display = 'none';
        // Desabilitar edição nos cards de script
        document.querySelectorAll('.script-card').forEach(card => {
            card.classList.remove('admin-mode');
        });
    }
}

// Função para fazer login
function login() {
    const password = adminPassword.value;
    if (btoa(password) === ADMIN_PASSWORD_HASH) {
        isAdmin = true;
        window.isAdmin = true;
        localStorage.setItem('isAdmin', 'true');
        updateAdminUI();
        loginModal.style.display = 'none';
        showMessage('Login realizado com sucesso!', 'success');
        adminPassword.value = ''; // Limpar senha
        if (typeof window.renderScripts === 'function') {
            window.renderScripts(); // Recarregar os cards com os botões de admin
        }
    } else {
        showMessage('Senha incorreta!', 'error');
    }
}

// Função para fazer logout
function logout() {
    isAdmin = false;
    window.isAdmin = false;
    localStorage.removeItem('isAdmin');
    updateAdminUI();
    showMessage('Logout realizado com sucesso!', 'success');
    if (typeof window.renderScripts === 'function') {
        window.renderScripts(); // Recarregar os cards sem os botões de admin
    }
}

// Event Listeners
adminLoginBtn.addEventListener('click', () => {
    loginModal.style.display = 'block';
});

[cancelLoginBtn, closeLoginModal].forEach(btn => {
    btn.addEventListener('click', () => {
        loginModal.style.display = 'none';
        adminPassword.value = ''; // Limpar senha
    });
});

loginBtn.addEventListener('click', login);

logoutBtn.addEventListener('click', logout);

// Fechar modal ao clicar fora
window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        loginModal.style.display = 'none';
        adminPassword.value = ''; // Limpar senha
    }
});

// Permitir login com Enter
adminPassword.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        login();
    }
});

// Inicializar UI
updateAdminUI();

// Exportar funções e variáveis necessárias
window.isAdmin = isAdmin;
window.updateAdminUI = updateAdminUI;

// Se não for administrador, oculta os botões de admin
if (!window.isAdmin) {
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
}