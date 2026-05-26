const categoryToField = {
    payments: "pay_rank",
    cleanliness: "clean_rank",
    respect: "respect_rank",
    communication: "comunic_rank",
    noise: "noise_rank",
    responsibility: "respons_rank",
    overallExperience: "exp_rank",
};

const ratings = {};
let reviews = [];

const averageScore = document.getElementById("averageScore");
const averageStars = document.getElementById("averageStars");
const totalReviews = document.getElementById("totalReviews");
const reviewComment = document.getElementById("reviewComment");
const submitReview = document.getElementById("submitReview");
const reviewsContainer = document.getElementById("reviewsContainer");

document.querySelectorAll(".star-group").forEach(group => {
    const category = group.dataset.category;
    const stars = group.querySelectorAll(".star");

    stars.forEach(star => {
        star.addEventListener("click", () => {
            const value = Number(star.dataset.value);
            ratings[category] = value;

            stars.forEach(item => {
                item.classList.toggle("active", Number(item.dataset.value) <= value);
            });
        });
    });
});

async function loadReviews() {
    try {
        const response = await fetch("/api/tenant-reviews", {
            method: "GET",
            credentials: "same-origin",
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result?.message || result?.error || "No se pudieron cargar las resenas");
        }

        reviews = Array.isArray(result.data) ? result.data : [];
        renderReviews();
    } catch (error) {
        console.error("Error cargando evaluaciones:", error);
        reviewsContainer.innerHTML = `
            <div class="review-card">
                <p class="review-comment">No se pudieron cargar las resenas.</p>
            </div>
        `;
        updateSummary();
    }
}

function buildReviewPayload() {
    const payload = {};

    Object.entries(categoryToField).forEach(([category, field]) => {
        payload[field] = ratings[category];
    });

    payload.comment = reviewComment.value.trim();
    return payload;
}

function validateRatings() {
    return Object.keys(categoryToField).every(category => Number(ratings[category]) >= 1);
}

submitReview.addEventListener("click", async () => {
    if (!validateRatings()) {
        alert("Debes calificar todas las categorias.");
        return;
    }

    const originalText = submitReview.innerHTML;
    submitReview.disabled = true;
    submitReview.innerHTML = '<i class="bi bi-hourglass-split"></i> Enviando...';

    try {
        const response = await fetch("/api/tenant-reviews", {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(buildReviewPayload()),
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result?.message || result?.error || "No se pudo enviar la resena");
        }

        resetForm();
        await loadReviews();
    } catch (error) {
        console.error("Error enviando evaluacion:", error);
        alert(error.message || "No se pudo enviar la resena.");
    } finally {
        submitReview.disabled = false;
        submitReview.innerHTML = originalText;
    }
});

function renderReviews() {
    reviewsContainer.innerHTML = "";

    if (reviews.length === 0) {
        reviewsContainer.innerHTML = `
            <div class="review-card">
                <p class="review-comment">Aun no existen resenas para este arrendatario.</p>
            </div>
        `;
        updateSummary();
        return;
    }

    reviews.forEach(review => {
        const reviewCard = document.createElement("div");
        reviewCard.classList.add("review-card");
        reviewCard.innerHTML = `
            <div class="review-header">
                <div class="review-user">Usuario anonimo</div>
                <div class="review-date">${formatDate(review.date_review)}</div>
            </div>
            <div class="review-stars">${generateStars(review.total_rank)}</div>
            <p class="review-comment">${escapeHtml(review.comment || "Sin comentario")}</p>
        `;
        reviewsContainer.appendChild(reviewCard);
    });

    updateSummary();
}

function updateSummary() {
    totalReviews.textContent = reviews.length;

    if (reviews.length === 0) {
        averageScore.textContent = "0.0";
        averageStars.textContent = "☆☆☆☆☆";
        return;
    }

    const total = reviews.reduce((sum, review) => sum + Number(review.total_rank || 0), 0);
    const finalAverage = (total / reviews.length).toFixed(1);
    averageScore.textContent = finalAverage;
    averageStars.innerHTML = generateStars(finalAverage);
}

function generateStars(score) {
    const rounded = Math.round(Number(score || 0));
    let stars = "";

    for (let i = 1; i <= 5; i++) {
        stars += i <= rounded ? "★" : "☆";
    }

    return stars;
}

function resetForm() {
    Object.keys(ratings).forEach(key => {
        delete ratings[key];
    });

    document.querySelectorAll(".star").forEach(star => {
        star.classList.remove("active");
    });

    reviewComment.value = "";
}

function formatDate(value) {
    if (!value) return "Sin fecha";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Sin fecha";
    return date.toLocaleDateString("es-CL");
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

loadReviews();
