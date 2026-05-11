// ========== HELP CENTER PAGE ==========
document.addEventListener('DOMContentLoaded', function() {
    // Navegación por categorías
    const helpCards = document.querySelectorAll('.help-card');
    const categories = document.querySelectorAll('.help-category-content');
    
    function showCategory(categoryId) {
        categories.forEach(cat => {
            cat.style.display = 'none';
        });
        
        const targetCategory = document.getElementById(`category-${categoryId}-content`);
        if (targetCategory) {
            targetCategory.style.display = 'block';
        }
        
        helpCards.forEach(card => {
            card.classList.remove('active');
            if (card.getAttribute('data-category') === categoryId) {
                card.classList.add('active');
            }
        });
        
        // Ocultar resultados de búsqueda
        const searchResults = document.getElementById('searchResults');
        if (searchResults) searchResults.style.display = 'none';
    }
    
    helpCards.forEach(card => {
        card.addEventListener('click', () => {
            const category = card.getAttribute('data-category');
            showCategory(category);
            
            // Limpiar búsqueda
            const searchInput = document.getElementById('helpSearch');
            if (searchInput) searchInput.value = '';
        });
    });
    
    // Acordeón de artículos
    const articles = document.querySelectorAll('.help-article');
    
    articles.forEach(article => {
        const title = article.querySelector('.article-title');
        
        title.addEventListener('click', () => {
            // Cerrar otros artículos
            articles.forEach(other => {
                if (other !== article && other.classList.contains('active')) {
                    other.classList.remove('active');
                }
            });
            
            article.classList.toggle('active');
        });
    });
    
    // Búsqueda
    const searchInput = document.getElementById('helpSearch');
    const searchResults = document.getElementById('searchResults');
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            searchResults.style.display = 'none';
            categories.forEach(cat => {
                cat.style.display = 'block';
            });
            helpCards.forEach(card => card.classList.remove('active'));
            return;
        }
        
        const allArticles = document.querySelectorAll('.help-article');
        const results = [];
        
        allArticles.forEach(article => {
            const title = article.getAttribute('data-title') || article.querySelector('.article-title span')?.textContent || '';
            const content = article.querySelector('.article-content')?.textContent || '';
            
            if (title.toLowerCase().includes(searchTerm) || content.toLowerCase().includes(searchTerm)) {
                const categoryContent = article.closest('.help-category-content');
                const categoryId = categoryContent?.id || '';
                const categoryName = categoryContent?.querySelector('h2')?.textContent || '';
                
                results.push({
                    title: title,
                    content: content.substring(0, 150) + '...',
                    categoryId: categoryId,
                    categoryName: categoryName
                });
            }
        });
        
        if (results.length > 0) {
            searchResults.innerHTML = `
                <h3>Resultados de búsqueda (${results.length})</h3>
                ${results.map(result => `
                    <div class="search-result-item" data-category="${result.categoryId}">
                        <strong>${result.title}</strong>
                        <p>${result.content}</p>
                        <small><i class="fas fa-folder"></i> ${result.categoryName}</small>
                    </div>
                `).join('')}
            `;
            searchResults.style.display = 'block';
            
            // Ocultar categorías
            categories.forEach(cat => cat.style.display = 'none');
            helpCards.forEach(card => card.classList.remove('active'));
            
            // Agregar evento a los resultados
            document.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', () => {
                    const categoryId = item.getAttribute('data-category');
                    if (categoryId) {
                        const cleanId = categoryId.replace('-content', '');
                        showCategory(cleanId);
                        searchResults.style.display = 'none';
                        searchInput.value = '';
                    }
                });
            });
        } else {
            searchResults.innerHTML = `
                <h3>Resultados de búsqueda</h3>
                <p>No se encontraron resultados para "${searchTerm}"</p>
            `;
            searchResults.style.display = 'block';
            categories.forEach(cat => cat.style.display = 'none');
        }
    });
    
    // Mostrar categoría inicial
    showCategory('cuenta');
    
    // Función para mostrar toast
    window.showToast = function(message, isError = false) {
        const toast = document.getElementById('notificationToast');
        const toastMessage = document.getElementById('toastMessage');
        const toastHeader = toast.querySelector('.toast-header');
        
        if (toastMessage) toastMessage.textContent = message;
        
        if (isError) {
            toast.style.borderLeftColor = '#dc3545';
            const icon = toastHeader.querySelector('i');
            if (icon) {
                icon.className = 'bi bi-exclamation-triangle-fill';
                icon.style.color = '#dc3545';
            }
            const strong = toastHeader.querySelector('strong');
            if (strong) strong.textContent = 'Error';
        } else {
            toast.style.borderLeftColor = '#2C5A6E';
            const icon = toastHeader.querySelector('i');
            if (icon) {
                icon.className = 'bi bi-check-circle-fill';
                icon.style.color = '#2C5A6E';
            }
            const strong = toastHeader.querySelector('strong');
            if (strong) strong.textContent = 'Información';
        }
        
        toast.style.display = 'block';
        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    };
});