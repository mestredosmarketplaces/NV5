"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util = __importStar(require("util"));
const winston_1 = __importDefault(require("winston"));
const logs_schema_1 = require("./schemas/logs-schema");
const logger = winston_1.default.createLogger({
    transports: [
        new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.printf(({ level, message, [Symbol.for('message')]: splat }) => {
                const logMessage = `${level}: ${message}`;
                const meta = splat ? util.inspect(splat, { compact: false }) : '';
                // Armazena as informações em uma variável separada
                const logDetail = {
                    level,
                    message,
                    meta: splat || {}
                };
                // Save the log asynchronously
                const metaJson = JSON.parse(logDetail.meta);
                const date = new Date();
                date.setHours(date.getHours() - 3 + date.getTimezoneOffset() / 60);
                const cleanedDescription = JSON.stringify(logDetail)
                    .replace(/\\\\/g, '') // Remove as barras invertidas extras
                    .replace(/\\([^"])/g, '$1') // Remove as barras invertidas antes de qualquer caractere, exceto aspas
                    .replace(/\\\"/g, '"') // Remove as barras invertidas antes das aspas
                    .replace(/\\:/g, ': ') // Adiciona um espaço após os dois pontos
                    .replace(/^\{"/, '') // Remove o { inicial
                    .replace(/"}$/, '') // Remove o } final
                    .split("/").join("");
                logs_schema_1.Logger.build({
                    level,
                    message,
                    meta: {
                        ip_address: metaJson.ipAddress,
                        status_code: metaJson.statusCode,
                        route: metaJson.route,
                        method: metaJson.method,
                        browser_name: metaJson.browserName,
                        browser_version: metaJson.browserVersion,
                        os_name: metaJson.osName,
                        os_version: metaJson.osVersion,
                        device_name: metaJson.deviceName,
                        device_type: metaJson.deviceType,
                        resolution: metaJson.resolution,
                        user_agent_source: JSON.stringify(metaJson.userAgentSource),
                        request_body: JSON.stringify(metaJson.requestBody),
                        request_response: JSON.stringify(metaJson.requestResponse),
                        request_params: metaJson.requestParams,
                        application_name: process.env.SERVICE_NAME || undefined,
                    },
                    description: cleanedDescription
                })
                    .then((logsaved) => { })
                    .catch((error) => {
                    console.error('Failed to save log:', error);
                });
                return `${logMessage} ${meta}`;
            }))
        })
    ]
});
exports.default = logger;
