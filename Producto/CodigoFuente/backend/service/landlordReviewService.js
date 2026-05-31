import { LandlordReviewRepository } from "../repository/landlordReviewRepository.js";

const RANK_FIELDS = [
    "comunicacion_rank",
    "respect_rank",
    "mainte_rank",
    "timeless_rank",
    "trasparency_rank",
    "availability_rank",
    "trust_rank",
    "general_exp_rank",
];

export class LandlordReviewService {
    constructor() {
        this.repository = new LandlordReviewRepository();
    }

    async getAllReviews({ userId } = {}) {
        return this.repository.findAll({ userId });
    }

    normalizeRank(value, field) {
        const rank = Number(value);
        if (!Number.isFinite(rank) || rank < 1 || rank > 5) {
            throw new Error(`${field} debe ser un numero entre 1 y 5`);
        }
        return rank;
    }

    normalizeOptionalUserId(value) {
        if (value === undefined || value === null || String(value).trim() === "") return null;
        const userId = Number(value);
        if (!Number.isInteger(userId) || userId <= 0) {
            throw new Error("id_usuario invalido");
        }
        return userId;
    }

    buildPayload(reviewData = {}) {
        const payload = {};

        RANK_FIELDS.forEach((field) => {
            payload[field] = this.normalizeRank(reviewData[field], field);
        });

        payload.descr = String(reviewData.descr || reviewData.comment || "").trim() || null;
        payload.id_usuario = this.normalizeOptionalUserId(reviewData.id_usuario);
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
