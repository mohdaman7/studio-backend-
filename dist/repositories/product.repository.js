"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRepository = exports.ProductRepository = void 0;
const base_repository_1 = require("./base.repository");
const Product_model_1 = require("../models/Product.model");
class ProductRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(Product_model_1.Product);
    }
}
exports.ProductRepository = ProductRepository;
exports.productRepository = new ProductRepository();
exports.default = exports.productRepository;
