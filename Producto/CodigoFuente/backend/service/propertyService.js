import { PropertyRepository } from "../repository/propertyRepository.js";
import { AddressRepository } from "../repository/addressRepository.js";
import { CharacteristicRepository } from "../repository/characteristicRepository.js";

export class PropertyService {

    constructor() {
        this.repository = new PropertyRepository();
        this.addressRepository = new AddressRepository();
        this.characteristicRepository = new CharacteristicRepository();
    }

    async getAllProperties() {
        const data = await this.repository.findAll();
        return data;
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
        const data = await this.repository.delete(id);
        return data;
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