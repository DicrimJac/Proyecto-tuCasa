import { RequestRepository } from "../repository/requestRepository.js";
import { UserRepository } from "../repository/userRepository.js";

const WORK_SITUATIONS = {
    dependiente: 1,
    independiente: 2,
    estudiante: 3,
    jubilado: 4,
    cesante: 5,
};

export class RequestService {
    constructor() {
        this.repository = new RequestRepository();
        this.userRepository = new UserRepository();
    }

    async resolveUserId(sessionUserId) {
        const rawUserId = String(sessionUserId || "").trim();
        if (!rawUserId) {
            throw new Error("No autorizado");
        }

        try {
            const user = await this.userRepository.findById(rawUserId);
            return user.id_usuario || user.id || rawUserId;
        } catch (error) {
            if (!rawUserId.includes("@")) {
                throw error;
            }

            const user = await this.userRepository.findByEmail(rawUserId);
            return user.id_usuario || user.id || rawUserId;
        }
    }

    normalizePositiveNumber(value, field) {
        const number = Number(value);
        if (!Number.isFinite(number) || number <= 0) {
            throw new Error(`${field} debe ser un numero mayor a 0`);
        }
        return number;
    }

    buildPayload(requestData = {}, userId) {
        const employmentKey = String(requestData.work_situation_key || "").trim().toLowerCase();
        const workSituationNumber = Number(requestData.work_situation_nbr || WORK_SITUATIONS[employmentKey] || 0);
        const workSituationDesc = String(requestData.work_situation_desc || "").trim();

        if (!Number.isFinite(workSituationNumber) || workSituationNumber <= 0) {
            throw new Error("Situacion laboral invalida");
        }

        if (!workSituationDesc) {
            throw new Error("Descripcion de situacion laboral requerida");
        }

        const message = String(requestData.message || "").trim();

        return {
            id_usuario: userId,
            id_propi: this.normalizePositiveNumber(requestData.id_propi, "id_propi"),
            contract_time: this.normalizePositiveNumber(requestData.contract_time, "contract_time"),
            qty_person: this.normalizePositiveNumber(requestData.qty_person, "qty_person"),
            work_situation_nbr: workSituationNumber,
            work_situation_desc: workSituationDesc,
            income: this.normalizePositiveNumber(requestData.income, "income"),
            message: message || null,
        };
    }

    async createRequest(requestData, sessionUserId) {
        const userId = await this.resolveUserId(sessionUserId);
        const payload = this.buildPayload(requestData, userId);
        return this.repository.create(payload);
    }

    async getMyRequests(sessionUserId) {
        const userId = await this.resolveUserId(sessionUserId);
        return this.repository.findByUserId(userId);
    }
}
