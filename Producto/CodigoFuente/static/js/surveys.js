// ========== ENCUESTAS DE SATISFACCIÓN ==========

// Inicializar estrellas
function initStars() {
    const starGroups = document.querySelectorAll('.rating-stars');

    starGroups.forEach(group => {
        const stars = group.querySelectorAll('i');
        const questionId = group.getAttribute('data-question');
        const hiddenInput = document.getElementById(`rating${questionId}`);

        // Establecer valor inicial
        if (hiddenInput && hiddenInput.value === '0') {
            hiddenInput.value = '0';
        }

        stars.forEach((star) => {
            // Click - seleccionar estrella
            star.addEventListener('click', function () {
                const value = parseInt(this.getAttribute('data-value'));
                hiddenInput.value = value;

                // Marcar estrellas
                stars.forEach((s, i) => {
                    if (i < value) {
                        s.className = 'fas fa-star selected';
                    } else {
                        s.className = 'far fa-star';
                    }
                });
            });

            // Hover
            star.addEventListener('mouseenter', function () {
                const value = parseInt(this.getAttribute('data-value'));
                stars.forEach((s, i) => {
                    if (i < value) {
                        s.className = 'fas fa-star';
                    } else {
                        s.className = 'far fa-star';
                    }
                });
            });

            // Restaurar selección
            star.addEventListener('mouseleave', function () {
                const currentValue = parseInt(hiddenInput.value);
                stars.forEach((s, i) => {
                    if (i < currentValue) {
                        s.className = 'fas fa-star selected';
                    } else {
                        s.className = 'far fa-star';
                    }
                });
            });
        });
    });
}

// Guardar encuesta
function saveSurvey(surveyData) {
    const surveys = JSON.parse(localStorage.getItem('userSurveys')) || [];
    const newSurvey = {
        id: Date.now(),
        date: new Date().toISOString(),
        ...surveyData
    };

    surveys.unshift(newSurvey);
    localStorage.setItem('userSurveys', JSON.stringify(surveys));
    return newSurvey;
}

// Cargar historial
function loadHistory() {
    const surveys = JSON.parse(localStorage.getItem('userSurveys')) || [];
    const historyContainer = document.getElementById('surveysHistory');

    if (surveys.length === 0) {
        historyContainer.innerHTML = `
            <div class="history-empty">
                <i class="fas fa-chart-simple"></i>
                <p>Aún no has realizado ninguna encuesta</p>
            </div>
        `;
        return;
    }

    historyContainer.innerHTML = surveys.map(survey => `
        <div class="history-item" onclick="viewSurveyDetail(${survey.id})">
            <span class="history-date">${formatDate(survey.date)}</span>
            <div class="history-rating">
                ${generateRatingStars(survey.averageRating)}
            </div>
            ${survey.comments ? `
                <div class="history-comment">
                    ${survey.comments.substring(0, 60)}
                    ${survey.comments.length > 60 ? '...' : ''}
                </div>
            ` : ''}
        </div>
    `).join('');
}

// Generar estrellas historial
function generateRatingStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

// Ver detalle encuesta
function viewSurveyDetail(surveyId) {
    const surveys = JSON.parse(localStorage.getItem('userSurveys')) || [];
    const survey = surveys.find(s => s.id === surveyId);
    if (!survey) return;
    let modal = document.getElementById('surveyModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'surveyModal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-container">
                <div class="modal-header">
                    <h3>Detalles de la encuesta</h3>
                    <button class="modal-close" onclick="closeSurveyModal()">
                        &times;
                    </button>
                </div>
                <div class="modal-body" id="surveyModalBody"></div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    const modalBody = document.getElementById('surveyModalBody');
    modalBody.innerHTML = `
        <p><strong>Fecha:</strong> ${formatDate(survey.date)}</p>
        <p><strong>Calificación general:</strong></p>
        <div style="margin-bottom: 1rem;">
            ${generateRatingStars(survey.averageRating)}
        </div>
        <p><strong>Facilidad de búsqueda:</strong> ${survey.rating1}/5</p>
        <p><strong>Atención recibida:</strong> ${survey.rating2}/5</p>
        <p><strong>Recomendación:</strong> ${survey.rating3}/5</p>
        <p><strong>Calidad de información:</strong> ${survey.rating4}/5</p>
        <p><strong>Uso nuevamente:</strong> ${survey.rating5}/5</p>
        ${survey.comments ? `
            <p>
                <strong>Comentarios:</strong>
                ${survey.comments}
            </p>
        ` : ''}
    `;
    modal.classList.add('active');
}

// Cerrar modal
function closeSurveyModal() {
    const modal = document.getElementById('surveyModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Formatear fecha
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Toast
function showToast(message, isError = false) {
    const toast = document.getElementById('notificationToast');
    const toastMessage = document.getElementById('toastMessage');
    const toastHeader = toast?.querySelector('.toast-header');

    if (toastMessage) {
        toastMessage.textContent = message;
    }

    if (isError) {
        toast.style.borderLeftColor = '#dc3545';
        const icon = toastHeader?.querySelector('i');
        if (icon) {
            icon.className = 'bi bi-exclamation-triangle-fill';
            icon.style.color = '#dc3545';
        }

        const strong = toastHeader?.querySelector('strong');
        if (strong) {
            strong.textContent = 'Error';
        }

    } else {
        toast.style.borderLeftColor = '#2C5A6E';
        const icon = toastHeader?.querySelector('i');
        if (icon) {
            icon.className = 'bi bi-check-circle-fill';
            icon.style.color = '#2C5A6E';
        }

        const strong = toastHeader?.querySelector('strong');
        if (strong) {
            strong.textContent = 'Éxito';
        }
    }

    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// Reset estrellas
function resetStars() {
    document.querySelectorAll('.rating-stars').forEach(group => {
        const stars = group.querySelectorAll('i');
        stars.forEach(star => {
            star.className = 'far fa-star';
        });
    });

    document.querySelectorAll('input[id^="rating"]').forEach(input => {
        input.value = '0';
    });
}

// Formulario
const surveyForm = document.getElementById('surveyForm');

if (surveyForm) {
    surveyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const rating1 = parseInt(document.getElementById('rating1').value);
        const rating2 = parseInt(document.getElementById('rating2').value);
        const rating3 = parseInt(document.getElementById('rating3').value);
        const rating4 = parseInt(document.getElementById('rating4').value);
        const rating5 = parseInt(document.getElementById('rating5').value);
        const comments = document.getElementById('comments').value;

        // Validar
        if (!rating1 || !rating2 || !rating3 || !rating4 || !rating5) {
            showToast('Por favor, responde todas las preguntas', true);
            return;
        }

        const averageRating = Math.round(
            (rating1 + rating2 + rating3 + rating4 + rating5) / 5
        );

        const surveyData = {
            rating1,
            rating2,
            rating3,
            rating4,
            rating5,
            averageRating,
            comments
        };

        const submitBtn = surveyForm.querySelector('.btn-submit');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            Enviando...
        `;

        submitBtn.disabled = true;
        setTimeout(() => {
            saveSurvey(surveyData);
            surveyForm.reset();
            resetStars();
            showToast('¡Gracias por tu opinión! Tu encuesta ha sido enviada.');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 1500);
    });
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    initStars();
});
