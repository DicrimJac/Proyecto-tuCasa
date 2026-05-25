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

    async getAllProperties() {
        const properties = await this.repository.findAll() || [];
        const addressIds = [...new Set(properties.map((property) => property.id_address).filter(Boolean))];
        const propertyIds = [...new Set(properties.map((property) => property.id_propi).filter(Boolean))];
        const ownerIds = [...new Set(properties
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
            const safeUser = { ...user };
            delete safeUser.pass;
            return [safeUser.id_usuario || safeUser.id || safeUser.id_user || safeUser.user_id, safeUser];
        }));

        return properties.map((property) => ({
            ...property,
            direccion: addressById.get(property.id_address) || null,
            caracteristica: characteristicByPropertyId.get(property.id_propi) || null,
            usuario: userById.get(property.id_usuario || property.id_user || property.user_id || property.owner_id) || null,
        }));
    }

    async getPropertyById(id) {
        const data = await this.repository.findById(id);
        return data;
    }

    async createProperty(propertyData) {
        const data = await this.repository.create(propertyData);
        return data;
    }

    async updateProperty(id, propertyData) {
        const data = await this.repository.update(id, propertyData);
        return data;
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
