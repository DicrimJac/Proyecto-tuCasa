import { PropertyRepository } from "../repository/propertyRepository.js";
import { AddressRepository } from "../repository/addressRepository.js";
import { CharacteristicRepository } from "../repository/characteristicRepository.js";
import { UserRepository } from "../repository/userRepository.js";

export class PropertyService {

    constructor() {
        this.repository = new PropertyRepository();
        this.addressRepository = new AddressRepository();
        this.characteristicRepository = new CharacteristicRepository();
        this.userRepository = new UserRepository();
    }

    isPropertyAvailable(property) {
        const stateNumber = property?.state_nbr ?? property?.status_nbr;
        const stateText = String(property?.state_desc || property?.status_desc || property?.estado || property?.status || "")
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .trim()
            .toLowerCase();

        if (Number(stateNumber) === 0) return false;
        return !["no disponible", "inactiva", "inactivo", "inactive", "disabled", "deshabilitada", "deshabilitado", "vendida", "vendido"].includes(stateText);
    }

    async getAllProperties({ publicOnly = false } = {}) {
        const properties = await this.repository.findAll() || [];
        const visibleProperties = publicOnly
            ? properties.filter((property) => this.isPropertyAvailable(property))
            : properties;
        const addressIds = [...new Set(visibleProperties.map((property) => property.id_address).filter(Boolean))];
        const propertyIds = [...new Set(visibleProperties.map((property) => property.id_propi).filter(Boolean))];
        const ownerIds = [...new Set(visibleProperties
            .map((property) => property.id_usuario || property.id_user || property.user_id || property.owner_id)
            .filter(Boolean))];

        const [addresses, characteristics, users] = await Promise.all([
            this.addressRepository.findByIds(addressIds),
            this.characteristicRepository.findByPropertyIds(propertyIds),
            ownerIds.length > 0 ? this.userRepository.findAll() : [],
        ]);

        const addressById = new Map(addresses.map((address) => [address.id_address, address]));
        const characteristicByPropertyId = new Map(
            characteristics.map((characteristic) => [characteristic.id_propi, characteristic]),
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
            return [id, safeUser];
        }));

        return visibleProperties.map((property) => ({
            ...property,
            direccion: addressById.get(property.id_address) || null,
            caracteristica: characteristicByPropertyId.get(property.id_propi) || null,
            usuario: userById.get(property.id_usuario || property.id_user || property.user_id || property.owner_id) || null,
        }));
    }

    async getPropertyById(id, { publicOnly = false } = {}) {
        const property = await this.repository.findById(id);
        if (publicOnly && !this.isPropertyAvailable(property)) {
            return null;
        }

        const [addresses, characteristics] = await Promise.all([
            property?.id_address ? this.addressRepository.findByIds([property.id_address]) : [],
            property?.id_propi ? this.characteristicRepository.findByPropertyIds([property.id_propi]) : [],
        ]);

        return {
            ...property,
            direccion: addresses[0] || null,
            caracteristica: characteristics[0] || null,
        };
    }

    async createProperty(propertyData) {
        const data = await this.repository.create(propertyData);
        return data;
    }

    async updateProperty(id, propertyData) {
        const { direccion, propiedad, caracteristica } = propertyData || {};

        if (!direccion && !propiedad && !caracteristica) {
            const data = await this.repository.update(id, propertyData);
            return data;
        }

        const currentProperty = await this.repository.findById(id);
        const updatedAddress = direccion && currentProperty?.id_address
            ? await this.addressRepository.update(currentProperty.id_address, direccion)
            : null;
        const updatedProperty = propiedad
            ? await this.repository.update(id, propiedad)
            : currentProperty;
        const updatedCharacteristic = caracteristica
            ? await this.characteristicRepository.updateByPropertyId(id, caracteristica)
            : null;

        return {
            direccion: updatedAddress,
            propiedad: updatedProperty,
            caracteristica: updatedCharacteristic,
        };
    }

    async updatePropertyStatus(id, statusData = {}) {
        const rawStatus = statusData.active ?? statusData.enabled ?? statusData.disponible;
        const isActive = typeof rawStatus === "string"
            ? ["true", "1", "disponible", "active", "habilitada", "habilitado"].includes(rawStatus.trim().toLowerCase())
            : Boolean(rawStatus);
        const statePayload = isActive
            ? { state_nbr: 1, state_desc: "Disponible" }
            : { state_nbr: 0, state_desc: "No disponible" };

        return this.repository.update(id, statePayload);
    }

    async deleteProperty(id) {
        const property = await this.repository.findById(id);
        const idAddress = property?.id_address;

        const deletedCharacteristics = await this.characteristicRepository.deleteByPropertyId(id);
        const deletedProperty = await this.repository.delete(id);
        const deletedAddress = idAddress
            ? await this.addressRepository.delete(idAddress)
            : null;

        return {
            propiedad: deletedProperty,
            caracteristicas: deletedCharacteristics,
            direccion: deletedAddress,
        };
    }

    /**
     * Crea una publicación completa: DIRECCION + PROPIEDAD + CARACTERISTICA.
     * Espera un payload con la forma:
     * { direccion: {...}, propiedad: {...}, caracteristica: {...} }
     */
    async createPropertyWithAll({ direccion, propiedad, caracteristica }) {
        // 1) Crear dirección
        const createdAddress = await this.addressRepository.create(direccion);

        // 2) Crear propiedad asociada a la dirección, con estado Disponible por defecto
        const propertyPayload = {
            ...propiedad,
            id_address: createdAddress.id_address,
            state_nbr: propiedad?.state_nbr ?? 1,
            state_desc: propiedad?.state_desc ?? "Disponible",
        };

        const createdProperty = await this.repository.create(propertyPayload);

        // 3) Crear características ligadas a la propiedad
        const characteristicPayload = {
            ...caracteristica,
            id_propi: createdProperty.id_propi,
        };

        const createdChar = await this.characteristicRepository.create(characteristicPayload);

        return {
            direccion: createdAddress,
            propiedad: createdProperty,
            caracteristica: createdChar,
        };
    }
}
