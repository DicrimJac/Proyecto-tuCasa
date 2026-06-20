import { PropertyRepository } from "../repository/propertyRepository.js";
import { AddressRepository } from "../repository/addressRepository.js";
import { CharacteristicRepository } from "../repository/characteristicRepository.js";
import { UserRepository } from "../repository/userRepository.js";
import { PhotoRepository } from "../repository/photoRepository.js";
import { RequestRepository } from "../repository/requestRepository.js";
import { PropertyReviewRepository } from "../repository/propertyReviewRepository.js";

export class PropertyService {
  constructor() {
    this.repository = new PropertyRepository();
    this.addressRepository = new AddressRepository();
    this.characteristicRepository = new CharacteristicRepository();
    this.userRepository = new UserRepository();
    this.photoRepository = new PhotoRepository();
    this.requestRepository = new RequestRepository();
    this.propertyReviewRepository = new PropertyReviewRepository();
  }

  isPropertyAvailable(property) {
    const stateNumber = property?.state_nbr ?? property?.status_nbr;
    const stateText = String(
      property?.state_desc || property?.status_desc || property?.estado ||
        property?.status || "",
    )
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .trim()
      .toLowerCase();

    if (Number(stateNumber) === 0) return false;
    return ![
      "no disponible",
      "inactiva",
      "inactivo",
      "inactive",
      "disabled",
      "deshabilitada",
      "deshabilitado",
      "vendida",
      "vendido",
    ].includes(stateText);
  }

  getPropertyOwnerId(property) {
    return property?.id_usuario || property?.id_user || property?.user_id ||
      property?.owner_id;
  }

  async resolveOwnerId(sessionUserId) {
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

  async isAdminUser(sessionUserId) {
    const rawUserId = String(sessionUserId || "").trim().toLowerCase();
    if (rawUserId === "admin@duoc.cl") return true;

    try {
      const user = rawUserId.includes("@")
        ? await this.userRepository.findByEmail(rawUserId)
        : await this.userRepository.findById(rawUserId);
      const email = String(user?.mail || user?.email || user?.correo || "")
        .trim().toLowerCase();
      return email === "admin@duoc.cl";
    } catch {
      return false;
    }
  }

  assertPropertyOwner(property, ownerId) {
    const propertyOwnerId = this.getPropertyOwnerId(property);
    if (String(propertyOwnerId || "") !== String(ownerId || "")) {
      throw new Error("No tienes permiso para modificar esta propiedad");
    }
  }

  async attachPropertyRelations(properties = []) {
    const addressIds = [
      ...new Set(
        properties.map((property) => property.id_address).filter(Boolean),
      ),
    ];
    const propertyIds = [
      ...new Set(
        properties.map((property) => property.id_propi).filter(Boolean),
      ),
    ];
    const ownerIds = [
      ...new Set(
        properties
          .map((property) => this.getPropertyOwnerId(property))
          .filter(Boolean),
      ),
    ];

    const [addresses, characteristics, photos, users] = await Promise.all([
      this.addressRepository.findByIds(addressIds),
      this.characteristicRepository.findByPropertyIds(propertyIds),
      this.photoRepository.findByPropertyIds(propertyIds),
      ownerIds.length > 0 ? this.userRepository.findAll() : [],
    ]);

    const addressById = new Map(
      addresses.map((address) => [address.id_address, address]),
    );
    const characteristicByPropertyId = new Map(
      characteristics.map((
        characteristic,
      ) => [characteristic.id_propi, characteristic]),
    );
    const userById = new Map(users.map((user) => {
      const id = user.id_usuario || user.id || user.id_user || user.user_id;
      const safeUser = {
        id_usuario: user.id_usuario,
        id,
        first_name: user.first_name,
        second_name: user.second_name,
        first_last_name: user.first_last_name,
        second_last_name: user.second_last_name,
        name: user.name || user.nombre,
      };
      return [String(id), safeUser];
    }));
    const photosByPropertyId = new Map();
    photos.forEach((photo) => {
      const propertyId = String(photo.id_propi);
      const currentPhotos = photosByPropertyId.get(propertyId) || [];
      currentPhotos.push(photo);
      photosByPropertyId.set(propertyId, currentPhotos);
    });

    return properties.map((property) => ({
      ...property,
      direccion: addressById.get(property.id_address) || null,
      caracteristica: characteristicByPropertyId.get(property.id_propi) || null,
      fotos: photosByPropertyId.get(String(property.id_propi)) || [],
      image: photosByPropertyId.get(String(property.id_propi))?.[0]?.url_foto ||
        property.image || property.imagen || null,
      usuario: userById.get(String(this.getPropertyOwnerId(property))) || null,
    }));
  }

  async getAllProperties({ publicOnly = false } = {}) {
    const properties = await this.repository.findAll() || [];
    const visibleProperties = publicOnly
      ? properties.filter((property) => this.isPropertyAvailable(property))
      : properties;
    return this.attachPropertyRelations(visibleProperties);
  }

  async getPropertiesByOwner(ownerId) {
    const resolvedOwnerId = await this.resolveOwnerId(ownerId);
    const properties = await this.repository.findByOwnerId(resolvedOwnerId) ||
      [];
    return this.attachPropertyRelations(properties);
  }

  async getPropertyById(id, { publicOnly = false } = {}) {
    const property = await this.repository.findById(id);
    if (publicOnly && !this.isPropertyAvailable(property)) {
      return null;
    }

    const [addresses, characteristics, photos] = await Promise.all([
      property?.id_address
        ? this.addressRepository.findByIds([property.id_address])
        : [],
      property?.id_propi
        ? this.characteristicRepository.findByPropertyIds([property.id_propi])
        : [],
      property?.id_propi
        ? this.photoRepository.findByPropertyIds([property.id_propi])
        : [],
    ]);

    return {
      ...property,
      direccion: addresses[0] || null,
      caracteristica: characteristics[0] || null,
      fotos: photos,
      image: photos[0]?.url_foto || property.image || property.imagen || null,
    };
  }

  async createProperty(propertyData) {
    const data = await this.repository.create(propertyData);
    return data;
  }

  async updateProperty(id, propertyData, { ownerId } = {}) {
    const resolvedOwnerId = ownerId ? await this.resolveOwnerId(ownerId) : null;
    const { direccion, propiedad, caracteristica } = propertyData || {};

    if (!direccion && !propiedad && !caracteristica) {
      if (resolvedOwnerId) {
        const property = await this.repository.findById(id);
        this.assertPropertyOwner(property, resolvedOwnerId);
        const data = await this.repository.update(id, {
          ...propertyData,
          id_usuario: this.getPropertyOwnerId(property),
        });
        return data;
      }
      const data = await this.repository.update(id, propertyData);
      return data;
    }

    const currentProperty = await this.repository.findById(id);
    if (resolvedOwnerId) {
      this.assertPropertyOwner(currentProperty, resolvedOwnerId);
    }
    const updatedAddress = direccion && currentProperty?.id_address
      ? await this.addressRepository.update(
        currentProperty.id_address,
        direccion,
      )
      : null;
    const propertyPayload = propiedad
      ? { ...propiedad, id_usuario: this.getPropertyOwnerId(currentProperty) }
      : null;
    const updatedProperty = propertyPayload
      ? await this.repository.update(id, propertyPayload)
      : currentProperty;
    const updatedCharacteristic = caracteristica
      ? await this.characteristicRepository.updateByPropertyId(
        id,
        caracteristica,
      )
      : null;

    return {
      direccion: updatedAddress,
      propiedad: updatedProperty,
      caracteristica: updatedCharacteristic,
    };
  }

  async updatePropertyStatus(id, statusData = {}, { ownerId } = {}) {
    const resolvedOwnerId = ownerId ? await this.resolveOwnerId(ownerId) : null;
    if (resolvedOwnerId) {
      const property = await this.repository.findById(id);
      this.assertPropertyOwner(property, resolvedOwnerId);
    }

    const rawStatus = statusData.active ?? statusData.enabled ??
      statusData.disponible;
    const isActive = typeof rawStatus === "string"
      ? ["true", "1", "disponible", "active", "habilitada", "habilitado"]
        .includes(rawStatus.trim().toLowerCase())
      : Boolean(rawStatus);
    const statePayload = isActive
      ? { state_nbr: 1, state_desc: "Disponible" }
      : { state_nbr: 0, state_desc: "No disponible" };

    const updatedProperty = await this.repository.update(id, statePayload);

    // Al volver a publicar una propiedad, el arriendo aprobado anterior termina.
    // Esto mantiene sincronizados la disponibilidad del owner y el estado que ve
    // el arrendatario en su dashboard.
    if (isActive) {
      const finalizedRequests = await this.requestRepository
        .finalizeApprovedByPropertyId(id);
      return { ...updatedProperty, finalizedRequests };
    }

    return updatedProperty;
  }

  async deleteProperty(id, { ownerId } = {}) {
    const isAdmin = ownerId ? await this.isAdminUser(ownerId) : false;
    const resolvedOwnerId = ownerId && !isAdmin
      ? await this.resolveOwnerId(ownerId)
      : null;
    const property = await this.repository.findById(id);
    if (resolvedOwnerId) {
      this.assertPropertyOwner(property, resolvedOwnerId);
    }
    const idAddress = property?.id_address;

    const deletedRequests = await this.requestRepository.deleteByPropertyId(id);
    const deletedPropertyReviews = await this.propertyReviewRepository
      .deleteByPropertyId(id);
    const deletedCharacteristics = await this.characteristicRepository
      .deleteByPropertyId(id);
    const deletedPhotos = await this.photoRepository.deleteByPropertyId(id);
    const deletedProperty = await this.repository.delete(id);
    const deletedAddress = idAddress
      ? await this.addressRepository.delete(idAddress)
      : null;

    return {
      propiedad: deletedProperty,
      solicitudes: deletedRequests,
      evaluaciones: deletedPropertyReviews,
      caracteristicas: deletedCharacteristics,
      fotos: deletedPhotos,
      direccion: deletedAddress,
    };
  }

  async uploadPropertyPhotos(id, files, { ownerId } = {}) {
    const resolvedOwnerId = ownerId ? await this.resolveOwnerId(ownerId) : null;
    const property = await this.repository.findById(id);
    if (resolvedOwnerId) {
      this.assertPropertyOwner(property, resolvedOwnerId);
    }

    return this.photoRepository.uploadPropertyPhotos(id, files);
  }

  async getPropertyPhotos(id) {
    return this.photoRepository.findByPropertyId(id);
  }

  /**
   * Crea una publicación completa: DIRECCION + PROPIEDAD + CARACTERISTICA.
   * Espera un payload con la forma:
   * { direccion: {...}, propiedad: {...}, caracteristica: {...} }
   */
  async createPropertyWithAll(
    { direccion, propiedad, caracteristica, ownerId },
  ) {
    const resolvedOwnerId = await this.resolveOwnerId(ownerId);

    // 1) Crear dirección
    const createdAddress = await this.addressRepository.create(direccion);

    // 2) Crear propiedad asociada a la dirección, con estado Disponible por defecto
    const propertyPayload = {
      ...propiedad,
      id_address: createdAddress.id_address,
      id_usuario: resolvedOwnerId,
      state_nbr: propiedad?.state_nbr ?? 1,
      state_desc: propiedad?.state_desc ?? "Disponible",
    };

    const createdProperty = await this.repository.create(propertyPayload);

    // 3) Crear características ligadas a la propiedad
    const characteristicPayload = {
      ...caracteristica,
      id_propi: createdProperty.id_propi,
    };

    const createdChar = await this.characteristicRepository.create(
      characteristicPayload,
    );

    return {
      direccion: createdAddress,
      propiedad: createdProperty,
      caracteristica: createdChar,
    };
  }
}
