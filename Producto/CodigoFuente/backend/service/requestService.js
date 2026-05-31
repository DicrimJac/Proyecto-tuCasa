import { RequestRepository } from "../repository/requestRepository.js";
import { UserRepository } from "../repository/userRepository.js";
import { PropertyService } from "./propertyService.js";

const WORK_SITUATIONS = {
    dependiente: 1,
    independiente: 2,
    estudiante: 3,
    jubilado: 4,
    cesante: 5,
};

const REQUEST_STATUSES = {
    pendiente: { status_nbr: 1, status_desc: "Pendiente" },
    aprobada: { status_nbr: 2, status_desc: "Aprobada" },
    rechazada: { status_nbr: 3, status_desc: "Rechazada" },
    finalizada: { status_nbr: 4, status_desc: "Finalizada" },
};

export class RequestService {
    constructor() {
        this.repository = new RequestRepository();
        this.userRepository = new UserRepository();
        this.propertyService = new PropertyService();
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
            status_nbr: REQUEST_STATUSES.pendiente.status_nbr,
            status_desc: REQUEST_STATUSES.pendiente.status_desc,
        };
    }

    async createRequest(requestData, sessionUserId) {
        const userId = await this.resolveUserId(sessionUserId);
        const payload = this.buildPayload(requestData, userId);
        return this.repository.create(payload);
    }

    async getMyRequests(sessionUserId) {
        const userId = await this.resolveUserId(sessionUserId);
        const requests = await this.repository.findByUserId(userId);
        return this.attachProperties(requests);
    }

    async getReceivedRequests(sessionUserId) {
        const ownerId = await this.resolveUserId(sessionUserId);
        const properties = await this.propertyService.getPropertiesByOwner(ownerId);
        const propertyIds = properties
            .map((property) => property.id_propi || property.id)
            .filter(Boolean);
        const requests = await this.repository.findByPropertyIds(propertyIds);
        const propertyById = new Map(properties.map((property) => [String(property.id_propi || property.id), property]));
        const users = await this.userRepository.findAll();
        const userById = new Map(users.map((user) => [String(user.id_usuario || user.id), user]));

        return requests.map((request) => ({
            ...request,
            propiedad: propertyById.get(String(request.id_propi)) || null,
            usuario: userById.get(String(request.id_usuario)) || null,
        }));
    }

    normalizeRequestStatus(status) {
        const normalizedStatus = String(status || "")
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .trim()
            .toLowerCase();
        const aliases = {
            pending: "pendiente",
            approved: "aprobada",
            rejected: "rechazada",
            completed: "finalizada",
        };
        const key = aliases[normalizedStatus] || normalizedStatus;
        const statusData = REQUEST_STATUSES[key];

        if (!statusData) {
            throw new Error("Estado de solicitud invalido");
        }

        return statusData;
    }

    async updateRequestStatus(id, statusData = {}, sessionUserId) {
        const ownerId = await this.resolveUserId(sessionUserId);
        const statusPayload = this.normalizeRequestStatus(statusData.status || statusData.status_desc);
        const properties = await this.propertyService.getPropertiesByOwner(ownerId);
        const propertyIds = new Set(properties.map((property) => String(property.id_propi || property.id)));
        const requests = await this.repository.findByPropertyIds([...propertyIds]);
        const request = requests.find((item) => String(item.id_request) === String(id));

        if (!request) {
            throw new Error("No tienes permiso para actualizar esta solicitud");
        }

        const updatedRequest = await this.repository.updateStatus(id, statusPayload);
        return {
            ...updatedRequest,
            propiedad: properties.find((property) => String(property.id_propi || property.id) === String(updatedRequest.id_propi)) || null,
        };
    }

    async attachProperties(requests = []) {
        return Promise.all(requests.map(async (request) => {
            try {
                const property = request.id_propi
                    ? await this.propertyService.getPropertyById(request.id_propi)
                    : null;
                return { ...request, propiedad: property };
            } catch (error) {
                console.error(`Error adjuntando propiedad ${request.id_propi}:`, error);
                return { ...request, propiedad: null };
            }
        }));
    }
}
