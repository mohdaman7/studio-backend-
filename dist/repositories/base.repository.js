"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
class BaseRepository {
    model;
    constructor(model) {
        this.model = model;
    }
    async findById(id) {
        return this.model.findById(id).exec();
    }
    async findOne(filter) {
        return this.model.findOne(filter).exec();
    }
    async findAll(filter = {}) {
        return this.model.find(filter).exec();
    }
    async create(data) {
        const doc = new this.model(data);
        return doc.save();
    }
    async updateById(id, update) {
        return this.model.findByIdAndUpdate(id, update, { new: true, runValidators: true }).exec();
    }
    async deleteById(id) {
        return this.model.findByIdAndDelete(id).exec();
    }
    async count(filter = {}) {
        return this.model.countDocuments(filter).exec();
    }
}
exports.BaseRepository = BaseRepository;
