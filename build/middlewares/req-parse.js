"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRequestHeaders = void 0;
const useragent_1 = __importDefault(require("useragent"));
const iso_639_1_1 = __importDefault(require("iso-639-1"));
const extractResolutionFromUserAgent = (userAgentHeader) => {
    const regex = /(\d+)x(\d+)/;
    const match = userAgentHeader.match(regex);
    if (match && match.length >= 3) {
        const width = match[1];
        const height = match[2];
        return `${width}x${height}`;
    }
    return "Unknown";
};
const getRequestDeviceInfo = (userAgentHeader) => {
    const agent = useragent_1.default.parse(userAgentHeader);
    return {
        browserName: agent.family,
        browserVersion: `${agent.major}.${agent.minor}.${agent.patch}`,
        osName: agent.os.family,
        osVersion: `${agent.os.major}.${agent.os.minor}.${agent.os.patch}`,
        deviceName: agent.device.family,
        deviceType: agent.device.family === "iPhone" ? "Mobile" : "Desktop",
        resolution: extractResolutionFromUserAgent(userAgentHeader),
        userAgentSource: agent.source,
    };
};
const getPreferredLanguage = (acceptLanguageHeader) => {
    let preferredLanguage = acceptLanguageHeader.split(',')[0].trim() || '';
    let languageName = iso_639_1_1.default.getName(preferredLanguage.split('-')[0]) || '';
    return {
        preferredLanguage, languageName
    };
};
const getIpAddress = (req) => {
    const forwardedIpsStr = req.headers['x-forwarded-for'];
    const ips = forwardedIpsStr ? forwardedIpsStr.split(',') : [];
    return ips.length > 0 ? ips[0].trim() : req.ip;
};
const handleRequestHeaders = (req, res, next) => {
    const userAgentHeader = req.headers["user-agent"] || "";
    const acceptLanguageHeader = req.headers["accept-language"] || "";
    req.requestHandledHeader = Object.assign(Object.assign({ ipAddress: getIpAddress(req) }, getRequestDeviceInfo(userAgentHeader)), getPreferredLanguage(acceptLanguageHeader));
    next();
};
exports.handleRequestHeaders = handleRequestHeaders;
