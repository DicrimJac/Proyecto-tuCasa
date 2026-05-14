// PROPERTY ID
const params = new URLSearchParams(window.location.search);
const propertyId = params.get("id") || "default";
const storageKey = `propertyReviews_${propertyId}`;

// VARIABLES
const ratings = {};
const starGroups = document.querySelectorAll(".star-group");
const submitButton = document.getElementById("submitReview");

// ESTRELLAS POR CATEGORÍA
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
            const value = Number(star.dataset.value);
            updateStars(group, value);
        });

        star.addEventListener("mouseleave", () => {
            updateStars( group, ratings[category]
            );
        });
    });
});
 
// ACTUALIZAR ESTRELLAS
function updateStars(group, value) {
    const stars = group.querySelectorAll(".star");
    stars.forEach((star) => {
        const starValue = Number(star.dataset.value);
        if (starValue <= value) {
            star.classList.add("active");
        } else {
            star.classList.remove("active");
        }
    });
}

// ENVIAR RESEÑA
submitButton.addEventListener("click", () => {
    const comment = document.getElementById("reviewComment").value;
    const hasRating = Object.values(ratings).some(
            value => value > 0
        );
    if (!hasRating) {
        alert("Debes evaluar al menos una categoría");
        return;
    }

    if (comment.trim() === "") {
        alert("Debes escribir un comentario");
        return;
    }

    // CALCULAR PROMEDIO GENERAL
    const values = Object.values(ratings).filter(
            value => value > 0
        );

    const total = values.reduce((acc, value) => acc + value, 0);
    const average = (total / values.length).toFixed(1);

    // OBTENER RESEÑAS
    const reviews = JSON.parse(localStorage.getItem(storageKey)) || [];

    // NUEVA RESEÑA
    const newReview = {
        user: "María González",
        date: new Date().toLocaleDateString("es-CL"),
        ratings: { ...ratings },
        average: average,
        comment: comment
    };

    // GUARDAR
    reviews.push(newReview);
    localStorage.setItem(
        storageKey,
        JSON.stringify(reviews)
    );

    // LIMPIAR FORM
    document.getElementById("reviewComment").value = "";

    Object.keys(ratings).forEach((key) => {
        ratings[key] = 0;
    });

    starGroups.forEach((group) => {
        updateStars(group, 0);
    });

    // RENDER
    renderReviews();
});
 
// RENDER REVIEWS
function renderReviews() {

    const reviews = JSON.parse(localStorage.getItem(storageKey)) || [];
    const reviewsContainer = document.getElementById("reviewsContainer");

    reviewsContainer.innerHTML = "";

    // SIN RESEÑAS
    if (reviews.length === 0) {
        reviewsContainer.innerHTML = `<p>No hay reseñas todavía.</p>`;
        document.getElementById("averageScore").textContent = "0.0";
        document.getElementById("totalReviews").textContent = "0";
        document.getElementById("averageStars").textContent = "☆☆☆☆☆";
        return;
    }

    // PROMEDIO GENERAL
    const totalAverage =
        reviews.reduce((acc, review) => {
            return acc + Number(review.average);

        }, 0);

    const finalAverage =
        (totalAverage / reviews.length).toFixed(1);


    document.getElementById("averageScore").textContent =
        finalAverage;

    document.getElementById("totalReviews").textContent =
        reviews.length;

    document.getElementById("averageStars").textContent =
        "★".repeat(Math.round(finalAverage)) +
        "☆".repeat(5 - Math.round(finalAverage));

    // MOSTRAR RESEÑAS
    reviews
        .slice()
        .reverse()
        .forEach((review) => {
            reviewsContainer.innerHTML += `
                <div class="review-card">
                    <div class="review-header">
                        <div>
                            <div class="review-user">
                                ${review.user}
                            </div>

                            <div class="review-date">
                                ${review.date}
                            </div>
                        </div>
                        <div class="review-stars">
                            ${"★".repeat(Math.round(review.average))}
                        </div>
                    </div>

                    <div class="review-comment">
                        ${review.comment}
                    </div>
                </div>
           `;
        });
}

// INIT
renderReviews();