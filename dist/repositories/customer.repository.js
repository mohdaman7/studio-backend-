"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerRepository = exports.CustomerRepository = void 0;
const base_repository_1 = require("./base.repository");
const Customer_model_1 = require("../models/Customer.model");
class CustomerRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(Customer_model_1.Customer);
    }
}
exports.CustomerRepository = CustomerRepository;
exports.customerRepository = new CustomerRepository();
exports.default = exports.customerRepository;
