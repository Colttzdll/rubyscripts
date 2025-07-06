// Inicializar funções utilitárias
(function() {
    // Função para mostrar toast notification
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = document.createElement('i');
        icon.className = type === 'success' ? 'fas fa-check-circle' :
                        type === 'error' ? 'fas fa-times-circle' :
                        'fas fa-exclamation-circle';
        
        toast.appendChild(icon);
        toast.appendChild(document.createTextNode(message));
        
        const toastContainer = document.getElementById('toastContainer');
        if (toastContainer) {
            toastContainer.appendChild(toast);
            
            setTimeout(() => {
                toast.style.animation = 'slideOut 0.3s ease forwards';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }
    }

    // Expor funções globalmente
    window.showToast = showToast;
})(); 