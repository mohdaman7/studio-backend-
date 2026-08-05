"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = exports.UserRepository = void 0;
const base_repository_1 = require("./base.repository");
const User_model_1 = require("../models/User.model");
class UserRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(User_model_1.User);
    }
    async findByEmail(email) {
        return User_model_1.User.findOne({ email }).select('+password').exec();
    }
}
exports.UserRepository = UserRepository;
exports.userRepository = new UserRepository();
exports.default = exports.userRepository;
