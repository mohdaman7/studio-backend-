import mongoose, { Model, Document, UpdateQuery } from 'mongoose';

export class BaseRepository<T extends Document> {
  public readonly model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  async findOne(filter: Record<string, any>): Promise<T | null> {
    return this.model.findOne(filter).exec();
  }

  async findAll(filter: Record<string, any> = {}): Promise<T[]> {
    return this.model.find(filter).exec();
  }

  async create(data: Partial<T>): Promise<T> {
    const doc = new this.model(data);
    return doc.save();
  }

  async updateById(id: string, update: UpdateQuery<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, update, { new: true, runValidators: true }).exec();
  }

  async deleteById(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id).exec();
  }

  async count(filter: Record<string, any> = {}): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }
}
