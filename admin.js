// Elementos do DOM
const adminLoginBtn = document.getElementById('adminLoginBtn');
const footerAdminLoginBtn = document.getElementById('footerAdminLoginBtn');
const loginModal = document.getElementById('loginModal');
const scriptModal = document.getElementById('scriptModal');
const adminPassword = document.getElementById('admin-password');
const loginBtn = document.getElementById('loginBtn');
const cancelLoginBtn = document.getElementById('cancelLoginBtn');
const closeLoginModal = document.getElementById('closeLoginModal');
const adminControls = document.getElementById('adminControls');
const addScriptBtn = document.getElementById('addScriptBtn');
const logoutBtn = document.getElementById('logoutBtn');
const closeModal = document.getElementById('closeModal');
const scriptTitle = document.getElementById('script-title');
const scriptCategory = document.getElementById('script-category');
const scriptContent = document.getElementById('script-content');
const scriptFavorite = document.getElementById('script-favorite');
const scriptThumbnail = document.getElementById('script-thumbnail');
const saveScript = document.getElementById('saveScript');
const cancelScript = document.getElementById('cancelScript');

// Funções de Admin
function showLoginModal() {
    loginModal.style.display = 'flex';
    adminPassword.focus();
}

function hideLoginModal() {
    loginModal.style.display = 'none';
    adminPassword.value = '';
}

function showScriptModal() {
    scriptModal.style.display = 'flex';
    scriptTitle.focus();
}

function hideScriptModal() {
    scriptModal.style.display = 'none';
    resetScriptForm();
}

function resetScriptForm() {
    scriptTitle.value = '';
    scriptCategory.value = 'game';
    scriptContent.value = '';
    scriptFavorite.checked = false;
    editingScriptId = null;
}

// Event Listeners
adminLoginBtn.addEventListener('click', showLoginModal);
footerAdminLoginBtn.addEventListener('click', showLoginModal);
loginBtn.addEventListener('click', login);
cancelLoginBtn.addEventListener('click', hideLoginModal);
closeLoginModal.addEventListener('click', hideLoginModal);
logoutBtn.addEventListener('click', logout);
addScriptBtn.addEventListener('click', showScriptModal);
closeModal.addEventListener('click', hideScriptModal);
cancelScript.addEventListener('click', hideScriptModal);
saveScript.addEventListener('click', saveScriptToDatabase); 