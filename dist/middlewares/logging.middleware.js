"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const morgan_1 = __importDefault(require("morgan"));
const logger_1 = __importDefault(require("../utils/logger"));
exports.requestLogger = (0, morgan_1.default)('dev', {
    stream: {
        write: (message) => logger_1.default.http ? logger_1.default.http(message.trim()) : logger_1.default.info(message.trim()),
    },
});
