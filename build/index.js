"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.AWSServices = void 0;
var aws_1 = require("./aws-services/aws");
Object.defineProperty(exports, "AWSServices", { enumerable: true, get: function () { return __importDefault(aws_1).default; } });
var logger_1 = require("./logger/logger");
Object.defineProperty(exports, "logger", { enumerable: true, get: function () { return __importDefault(logger_1).default; } });
