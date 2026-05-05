import { PropertyRepository } from "../repository/propertyRepository.js";

export class PropertyService {
    constructor(){
        this.repository = new PropertyRepository();
    }

    async getAllProperties(){
        const data = await this.repository.findAll();
        return data;
    }

    async getPropertyById(id){
        const data = await this.repository.findById(id);
        return data;
    }

    async createProperty(propertyData){
        const data = await this.repository.create(propertyData);
        return data;
    }

    async updateProperty(id, propertyData){
        const data = await this.repository.update(id, propertyData);
        return data;
    }

    async deleteProperty(id){
        const data = await this.repository.delete(id);
        return data;
    }
}