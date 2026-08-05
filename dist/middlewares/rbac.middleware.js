"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const auth_middleware_1 = require("./auth.middleware");
const authorize = (permission) => {
    return (0, auth_middleware_1.authorizePermission)(permission);
};
exports.authorize = authorize;
