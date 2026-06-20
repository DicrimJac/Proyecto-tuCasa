import { RequestRepository } from "../repository/requestRepository.js";
import { UserRepository } from "../repository/userRepository.js";
import { PropertyService } from "./propertyService.js";
import { EmailService } from "./emailService.js";
import { TenantReviewRepository } from "../repository/tenantReviewRepository.js";

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
    this.emailService = new EmailService();
    this.tenantReviewRepository = new TenantReviewRepository();
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
    const employmentKey = String(requestData.work_situation_key || "").trim()
      .toLowerCase();
    const workSituationNumber = Number(
      requestData.work_situation_nbr || WORK_SITUATIONS[employmentKey] || 0,
    );
    const workSituationDesc = String(requestData.work_situation_desc || "")
      .trim();

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
      contract_time: this.normalizePositiveNumber(
        requestData.contract_time,
        "contract_time",
      ),
      qty_person: this.normalizePositiveNumber(
        requestData.qty_person,
        "qty_person",
      ),
      work_situation_nbr: workSituationNumber,
      work_situation_desc: workSituationDesc,
      income: this.normalizePositiveNumber(requestData.income, "income"),
      message: message || null,
      status_nbr: REQUEST_STATUSES.pendiente.status_nbr,
      status_desc: REQUEST_STATUSES.pendiente.status_desc,
    };
  }

  async createRequest(requestData, sessionUserId, { baseUrl } = {}) {
    const userId = await this.resolveUserId(sessionUserId);
    const payload = this.buildPayload(requestData, userId);
    const createdRequest = await this.repository.create(payload);
    let notificationEmailDelivery = { success: false, skipped: true };

    try {
      const [applicant, property, reviews] = await Promise.all([
        this.userRepository.findById(userId),
        this.propertyService.getPropertyById(createdRequest.id_propi),
        this.tenantReviewRepository.findAll({ userId }),
      ]);
      const ownerId = this.propertyService.getPropertyOwnerId(property);
      const owner = await this.userRepository.findById(ownerId);

      notificationEmailDelivery = await this.emailService
        .sendRentalRequestNotification({
          to: this.getUserEmail(owner),
          ownerName: this.getUserFullName(owner),
          applicant: this.buildApplicantContact(applicant, createdRequest),
          property,
          reviews,
          request: createdRequest,
          propertyUrl: baseUrl
            ? this.buildReviewUrl(baseUrl, "/detail.html", {
              id: createdRequest.id_propi,
            })
            : "",
          baseUrl,
        });
    } catch (error) {
      console.error(
        `No se pudo notificar la solicitud ${createdRequest.id_request}:`,
        error,
      );
      notificationEmailDelivery = { success: false, error: error.message };
    }

    return { ...createdRequest, notificationEmailDelivery };
  }

  async getMyRequests(sessionUserId) {
    const userId = await this.resolveUserId(sessionUserId);
    const requests = await this.repository.findByUserId(userId);
    return this.attachProperties(requests);
  }

  async getReceivedRequests(sessionUserId) {
    const ownerId = await this.resolveUserId(sessionUserId);
    const requestsById = new Map();
    const propertyById = new Map();

    try {
      const directRequests = await this.repository.findReceivedByOwnerId(
        ownerId,
      );
      directRequests.forEach((request) => {
        requestsById.set(String(request.id_request), request);
        if (request.propiedad) {
          propertyById.set(String(request.id_propi), request.propiedad);
        }
      });
    } catch (error) {
      console.error(
        "Error cargando solicitudes recibidas con join directo:",
        error,
      );
    }

    const properties = await this.propertyService.getPropertiesByOwner(ownerId);
    const propertyIds = properties
      .map((property) => property.id_propi || property.id)
      .filter(Boolean);
    properties.forEach((property) => {
      propertyById.set(String(property.id_propi || property.id), property);
    });

    const requests = await this.repository.findByPropertyIds(propertyIds);
    requests.forEach((request) => {
      requestsById.set(String(request.id_request), request);
    });

    const allRequests = await this.repository.findAll();
    await Promise.all(allRequests.map(async (request) => {
      if (!request.id_propi || requestsById.has(String(request.id_request))) {
        return;
      }

      try {
        const property = propertyById.get(String(request.id_propi)) ||
          await this.propertyService.getPropertyById(request.id_propi);
        const propertyOwnerId = this.propertyService.getPropertyOwnerId(
          property,
        );

        if (String(propertyOwnerId || "") === String(ownerId || "")) {
          requestsById.set(String(request.id_request), request);
          propertyById.set(String(request.id_propi), property);
        }
      } catch (error) {
        console.error(
          `Error validando solicitud ${request.id_request} para propiedad ${request.id_propi}:`,
          error,
        );
      }
    }));

    const users = await this.userRepository.findAll();
    const userById = new Map(
      users.map((user) => [String(user.id_usuario || user.id), user]),
    );

    return [...requestsById.values()].map((request) => ({
      ...request,
      propiedad: propertyById.get(String(request.id_propi)) || null,
      usuario: request.usuario || userById.get(String(request.id_usuario)) ||
        null,
    })).sort((a, b) => {
      const dateDiff = new Date(b.date || 0) - new Date(a.date || 0);
      return dateDiff || Number(b.id_request || 0) - Number(a.id_request || 0);
    });
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

  getUserEmail(user = {}) {
    return String(user.mail || user.email || user.correo || "").trim()
      .toLowerCase();
  }

  getUserFullName(user = {}) {
    return [
      user.first_name,
      user.second_name,
      user.first_last_name,
      user.second_last_name,
    ].filter(Boolean).join(" ").trim() ||
      String(user.fullName || user.name || user.nombre || "").trim();
  }

  getMessageValue(message, label) {
    const line = String(message || "").split(/\r?\n/).find((item) =>
      item.toLowerCase().startsWith(`${String(label).toLowerCase()}:`)
    );
    return line ? line.slice(line.indexOf(":") + 1).trim() : "";
  }

  buildApplicantContact(user = {}, request = {}) {
    return {
      name: this.getMessageValue(request.message, "Nombre") ||
        this.getUserFullName(user) || "Solicitante",
      email: this.getMessageValue(request.message, "Correo") ||
        this.getUserEmail(user),
      phone: this.getMessageValue(request.message, "Telefono") || user.fono ||
        user.phone || user.telefono || "No informado",
    };
  }

  getRequestEmail(request = {}) {
    return String(this.getMessageValue(request.message, "Correo") || "").trim()
      .toLowerCase();
  }

  buildReviewUrl(baseUrl, pathname, params = {}) {
    const url = new URL(pathname, baseUrl);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim()) {
        url.searchParams.set(key, String(value));
      }
    });
    return url.toString();
  }

  async updateRequestStatus(
    id,
    statusData = {},
    sessionUserId,
    { baseUrl } = {},
  ) {
    const ownerId = await this.resolveUserId(sessionUserId);
    const statusPayload = this.normalizeRequestStatus(
      statusData.status || statusData.status_desc,
    );
    const properties = await this.propertyService.getPropertiesByOwner(ownerId);
    const propertyIds = new Set(
      properties.map((property) => String(property.id_propi || property.id)),
    );
    const requests = await this.repository.findByPropertyIds([...propertyIds]);
    const request = requests.find((item) =>
      String(item.id_request) === String(id)
    );

    if (!request) {
      throw new Error("No tienes permiso para actualizar esta solicitud");
    }

    const updatedRequest = await this.repository.updateStatus(
      id,
      statusPayload,
    );
    let property =
      properties.find((item) =>
        String(item.id_propi || item.id) === String(updatedRequest.id_propi)
      ) || null;

    if (statusPayload.status_desc === "Finalizada" && property) {
      property = await this.propertyService.updatePropertyStatus(
        updatedRequest.id_propi,
        { active: true },
        { ownerId },
      );
    }

    let reviewEmailDelivery = [];

    if (statusPayload.status_desc === "Aprobada" && baseUrl) {
      try {
        const ownerUser = await this.userRepository.findById(ownerId);
        let tenantUser = {};
        try {
          tenantUser = await this.userRepository.findById(
            updatedRequest.id_usuario,
          );
        } catch (error) {
          console.error(
            `No se pudo resolver usuario arrendatario ${updatedRequest.id_usuario}:`,
            error,
          );
        }

        const ownerEmail = this.getUserEmail(ownerUser);
        const tenantEmail = this.getUserEmail(tenantUser) ||
          this.getRequestEmail(updatedRequest);

        reviewEmailDelivery = await this.emailService
          .sendRentalApprovedReviewLinks({
            ownerEmail,
            tenantEmail,
            tenantReviewUrl: this.buildReviewUrl(
              baseUrl,
              "/tenantReview.html",
              {
                id_usuario: updatedRequest.id_usuario,
                id_request: updatedRequest.id_request,
              },
            ),
            landlordReviewUrl: this.buildReviewUrl(
              baseUrl,
              "/landlordReview.html",
              {
                id_usuario: ownerId,
                id_request: updatedRequest.id_request,
              },
            ),
          });
      } catch (error) {
        console.error("No se pudieron enviar los correos de resena:", error);
        reviewEmailDelivery = [{ success: false, error: error.message }];
      }
    }

    return {
      ...updatedRequest,
      propiedad: property,
      reviewEmailDelivery,
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
