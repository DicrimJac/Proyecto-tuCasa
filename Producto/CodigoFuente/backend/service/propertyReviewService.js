import { PropertyReviewRepository } from "../repository/propertyReviewRepository.js";

const RANK_FIELDS = [
    "neight",
    "service_near",
    "segurity",
    "service_bus",
    "neightbors",
    "clean",
    "maintenance",
    "quality_price",
    "level_noise",
    "signal",
    "lighting",
    "parking",
];

export class PropertyReviewService {
    constructor() {
        this.repository = new PropertyReviewRepository();
    }

    async getAllReviews({ propertyId } = {}) {
        return this.repository.findAll({ propertyId });
    }

    normalizeRank(value, field) {
        const rank = Number(value);
        if (!Number.isFinite(rank) || rank < 1 || rank > 5) {
            throw new Error(`${field} debe ser un numero entre 1 y 5`);
        }
        return rank;
    }

    normalizePropertyId(value) {
        const propertyId = Number(value);
        if (!Number.isInteger(propertyId) || propertyId <= 0) {
            throw new Error("id_propi invalido");
        }
        return propertyId;
    }

    buildPayload(reviewData = {}) {
        const payload = {};

        RANK_FIELDS.forEach((field) => {
            payload[field] = this.normalizeRank(reviewData[field], field);
        });

        payload.description = String(reviewData.description || reviewData.comment || "").trim() || null;
        payload.id_propi = this.normalizePropertyId(reviewData.id_propi);
        payload.total_point = Number((
            RANK_FIELDS.reduce((sum, field) => sum + payload[field], 0) / RANK_FIELDS.length
        ).toFixed(1));

        return payload;
    }

    async createReview(reviewData) {
        return this.repository.create(this.buildPayload(reviewData));
    }

    async deleteReview(id) {
        const reviewId = Number(id);
        if (!Number.isInteger(reviewId) || reviewId <= 0) {
            throw new Error("ID de evaluacion invalido");
        }
        return this.repository.delete(reviewId);
    }
}
