// CALIFICACIONES
const ratings = {};

// ELEMENTOS
const averageScore = document.getElementById("averageScore");
const averageStars = document.getElementById("averageStars");
const totalReviews = document.getElementById("totalReviews");
const reviewComment = document.getElementById("reviewComment");
const submitReview = document.getElementById("submitReview");
const reviewsContainer = document.getElementById("reviewsContainer");

// STORAGE
let reviews = JSON.parse(localStorage.getItem("tenantReviews")) || [];

// ========== STARS ==========
document.querySelectorAll(".star-group").forEach(group => {

    const category = group.dataset.category;
    const stars = group.querySelectorAll(".star");

    stars.forEach(star => {
        star.addEventListener("click", () => {
            const value = Number(star.dataset.value);

            ratings[category] = value;
            stars.forEach(s => {
                const currentValue = Number(s.dataset.value);

                if (currentValue <= value) {
                    s.classList.add("active");
                } else {
                    s.classList.remove("active");
                }
            });
        });
    });
});

// ========== ENVIAR RESEÑA ==========
submitReview.addEventListener("click", () => {
    const categories = document.querySelectorAll(".star-group");

    // VALIDAR ESTRELLAS
    for (const category of categories) {
        const categoryName = category.dataset.category;
        if (!ratings[categoryName]) {
            alert("Debes calificar todas las categorías.");
            return;
        }
    }

    // VALIDAR COMENTARIO
    const comment = reviewComment.value.trim();
    if (comment.length < 10) {
        alert("Escribe un comentario un poco más largo.");
        return;
    }

    // PROMEDIO
    const values = Object.values(ratings);
    const average = values.reduce((acc, value) => acc + value, 0) / values.length;

    // NUEVA REVIEW
    const newReview = {
        id: Date.now(),
        user: "Usuario anónimo",
        date: new Date().toLocaleDateString("es-CL"),
        average: average.toFixed(1),
        comment,
        ratings

    };

    // GUARDAR
    reviews.unshift(newReview);

    localStorage.setItem(
        "tenantReviews",
        JSON.stringify(reviews)
    );

    // LIMPIAR
    resetForm();

    // RENDER
    renderReviews();

    // ALERT
    alert("Reseña enviada correctamente.");
});

// ========== RENDER REVIEWS ==========
function renderReviews() {
    reviewsContainer.innerHTML = "";

    if (reviews.length === 0) {
        reviewsContainer.innerHTML = `
            <div class="review-card">
                <p class="review-comment">
                    Aún no existen reseñas para este arrendatario.
                </p>
            </div>
        `;
        updateSummary();
        return;
    }

    reviews.forEach(review => {
        const stars = generateStars(review.average);
        const reviewCard = document.createElement("div");

        reviewCard.classList.add("review-card");
        reviewCard.innerHTML = `
            <div class="review-header">
                <div class="review-user">
                    ${review.user}
                </div>
                <div class="review-date">
                    ${review.date}
                </div>
            </div>
            <div class="review-stars">
                ${stars}
            </div>
            <p class="review-comment">
                ${review.comment}
            </p>
        `;
        reviewsContainer.appendChild(reviewCard);
    });
    updateSummary();
}

// ========== RESUMEN ==========
function updateSummary() {
    totalReviews.textContent = reviews.length;

    if (reviews.length === 0) {
        averageScore.textContent = "0.0";
        averageStars.textContent = "☆☆☆☆☆";
        return;
    }

    const averages = reviews.map(review => Number(review.average));
    const total = averages.reduce((acc, value) => acc + value, 0);
    const finalAverage = (total / averages.length).toFixed(1);
    averageScore.textContent = finalAverage;
    averageStars.innerHTML = generateStars(finalAverage);

}

// ========== GENERAR ESTRELLAS ==========
function generateStars(score) {
    const rounded = Math.round(score);
    let stars = "";

    for (let i = 1; i <= 5; i++) {
        if (i <= rounded) {
            stars += "★";
        } else {
            stars += "☆";
        }
    }
    return stars;
}

// ========== RESET ==========
function resetForm() {

    // LIMPIAR RATINGS
    Object.keys(ratings).forEach(key => {
        delete ratings[key];
    });

    // LIMPIAR ESTRELLAS
    document.querySelectorAll(".star").forEach(star => {
        star.classList.remove("active");
    });

    // LIMPIAR TEXTO
    reviewComment.value = "";
}

// ========== INIT ==========
renderReviews();