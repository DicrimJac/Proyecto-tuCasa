const categoryToField = {
    neighborhood: "neight",
    services: "service_near",
    security: "segurity",
    connectivity: "service_bus",
    neighbors: "neightbors",
    cleanliness: "clean",
    maintenance: "maintenance",
    priceQuality: "quality_price",
    noise: "level_noise",
    internet: "signal",
    lighting: "lighting",
    parking: "parking",
};

const params = new URLSearchParams(window.location.search);
const propertyId = params.get("id") || params.get("id_propi");

const ratings = {};
let reviews = [];

const starGroups = document.querySelectorAll(".star-group");
const submitButton = document.getElementById("submitReview");
const reviewComment = document.getElementById("reviewComment");
const reviewsContainer = document.getElementById("reviewsContainer");
const averageScore = document.getElementById("averageScore");
const averageStars = document.getElementById("averageStars");
const totalReviews = document.getElementById("totalReviews");

starGroups.forEach((group) => {
    const category = group.dataset.category;
    const stars = group.querySelectorAll(".star");
    ratings[category] = 0;

    stars.forEach((star) => {
        star.addEventListener("click", () => {
            const value = Number(star.dataset.value);
            ratings[category] = value;
            updateStars(group, value);
        });

        star.addEventListener("mouseover", () => {
            updateStars(group, Number(star.dataset.value));
        });

        star.addEventListener("mouseleave", () => {
            updateStars(group, ratings[category]);
        });
    });
});

function updateStars(group, value) {
    group.querySelectorAll(".star").forEach((star) => {
        star.classList.toggle("active", Number(star.dataset.value) <= value);
    });
}

function validateRatings() {
    return Object.keys(categoryToField).every((category) => Number(ratings[category]) >= 1);
}

function buildReviewPayload() {
    const payload = {};

    Object.entries(categoryToField).forEach(([category, field]) => {
        payload[field] = ratings[category];
    });

    payload.id_propi = Number(propertyId);
    payload.description = reviewComment.value.trim();
    return payload;
}

async function loadReviews() {
    if (!propertyId) {
        reviewsContainer.innerHTML = "<p>No se encontro la propiedad para cargar resenas.</p>";
        updateSummary();
        return;
    }

    try {
        const response = await fetch(`/api/property-reviews?id_propi=${encodeURIComponent(propertyId)}`, {
            method: "GET",
            credentials: "include",
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result?.message || result?.error || "No se pudieron cargar las resenas");
        }

        reviews = Array.isArray(result.data) ? result.data : [];
        renderReviews();
    } catch (error) {
        console.error("Error cargando evaluaciones de propiedad:", error);
        reviewsContainer.innerHTML = "<p>No se pudieron cargar las resenas.</p>";
        updateSummary();
    }
}

submitButton.addEventListener("click", async () => {
    if (!propertyId) {
        alert("No se encontro la propiedad a evaluar.");
        return;
    }

    if (!validateRatings()) {
        alert("Debes evaluar todas las categorias.");
        return;
    }

    if (!reviewComment.value.trim()) {
        alert("Debes escribir un comentario.");
        return;
    }

    const originalText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="bi bi-hourglass-split"></i> Enviando...';

    try {
        const response = await fetch("/api/property-reviews", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(buildReviewPayload()),
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result?.message || result?.error || "No se pudo enviar la resena");
        }

        resetForm();
        await loadReviews();
        alert("Resena enviada correctamente.");
    } catch (error) {
        console.error("Error enviando evaluacion de propiedad:", error);
        alert(error.message || "No se pudo enviar la resena.");
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
    }
});

function renderReviews() {
    reviewsContainer.innerHTML = "";

    if (reviews.length === 0) {
        reviewsContainer.innerHTML = "<p>No hay resenas todavia.</p>";
        updateSummary();
        return;
    }

    reviews.forEach((review) => {
        const card = document.createElement("div");
        card.classList.add("review-card");
        card.innerHTML = `
            <div class="review-header">
                <div>
                    <div class="review-user">Usuario anonimo</div>
                    <div class="review-date">${formatDate(review.date_register)}</div>
                </div>
                <div class="review-stars">${generateStars(review.total_point)}</div>
            </div>
            <div class="review-comment">${escapeHtml(review.description || "Sin comentario")}</div>
        `;
        reviewsContainer.appendChild(card);
    });

    updateSummary();
}

function updateSummary() {
    totalReviews.textContent = reviews.length;

    if (reviews.length === 0) {
        averageScore.textContent = "0.0";
        averageStars.textContent = "\u2606".repeat(5);
        return;
    }

    const total = reviews.reduce((sum, review) => sum + Number(review.total_point || 0), 0);
    const finalAverage = (total / reviews.length).toFixed(1);
    averageScore.textContent = finalAverage;
    averageStars.textContent = generateStars(finalAverage);
}

function generateStars(score) {
    const rounded = Math.round(Number(score || 0));
    return "\u2605".repeat(rounded) + "\u2606".repeat(Math.max(0, 5 - rounded));
}

function resetForm() {
    reviewComment.value = "";
    Object.keys(ratings).forEach((key) => {
        ratings[key] = 0;
    });
    starGroups.forEach((group) => updateStars(group, 0));
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
