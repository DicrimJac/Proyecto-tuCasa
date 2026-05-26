import { TenantReviewRepository } from "../repository/tenantReviewRepository.js";

const RANK_FIELDS = [
    "pay_rank",
    "clean_rank",
    "respect_rank",
    "comunic_rank",
    "noise_rank",
    "respons_rank",
    "exp_rank",
];

export class TenantReviewService {
    constructor() {
        this.repository = new TenantReviewRepository();
    }

    async getAllReviews() {
        return this.repository.findAll();
    }

    normalizeRank(value, field) {
        const rank = Number(value);

        if (!Number.isFinite(rank) || rank < 1 || rank > 5) {
            throw new Error(`${field} debe ser un numero entre 1 y 5`);
        }

        return rank;
    }

    buildPayload(reviewData = {}) {
        const payload = {};

        RANK_FIELDS.forEach((field) => {
            payload[field] = this.normalizeRank(reviewData[field], field);
        });

        payload.comment = String(reviewData.comment || "").trim() || null;
        payload.total_rank = Number((
            RANK_FIELDS.reduce((sum, field) => sum + payload[field], 0) / RANK_FIELDS.length
        ).toFixed(1));

        return payload;
    }

    async createReview(reviewData) {
        const payload = this.buildPayload(reviewData);
        return this.repository.create(payload);
    }

    async deleteReview(id) {
        const reviewId = Number(id);

        if (!Number.isInteger(reviewId) || reviewId <= 0) {
            throw new Error("ID de evaluacion invalido");
        }

        return this.repository.delete(reviewId);
    }
}
