import useragent from "useragent";
import { Request, Response, NextFunction } from "express";
import iso6391 from 'iso-639-1';

interface DeviceInfo {
  browserName: string;
  browserVersion: string;
  osName: string;
  osVersion: string;
  deviceName: string;
  deviceType: string;
  resolution: string;
  userAgentSource: string;
}

declare global {
  namespace Express {
    interface Request {
      requestHandledHeader?: {};
    }
  }
}

const extractResolutionFromUserAgent = (userAgentHeader: string): string => {
  const regex = /(\d+)x(\d+)/;
  const match = userAgentHeader.match(regex);

  if (match && match.length >= 3) {
    const width = match[1];
    const height = match[2];
    return `${width}x${height}`;
  }

  return "Unknown";
};

const getRequestDeviceInfo = (userAgentHeader: string): DeviceInfo => {
  const agent = useragent.parse(userAgentHeader);

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

const getPreferredLanguage = (acceptLanguageHeader: string): {} => {
  let preferredLanguage = acceptLanguageHeader.split(',')[0].trim() || '';
  let languageName = iso6391.getName(preferredLanguage.split('-')[0]) || '';

  return {
    preferredLanguage, languageName
  };
};

const getIpAddress = (req: Request) : string => {
  const forwardedIpsStr = req.headers['x-forwarded-for'] as string
  const ips = forwardedIpsStr ? forwardedIpsStr.split(',') : [];
  return ips.length > 0 ? ips[0].trim() : req.ip;
};

export const handleRequestHeaders: (
  req: Request,
  res: Response,
  next: NextFunction
) => void = (req, res, next) => {
  const userAgentHeader = req.headers["user-agent"] || "";
  const acceptLanguageHeader = req.headers["accept-language"] || "";

  req.requestHandledHeader = {
    ipAddress: getIpAddress(req), ...getRequestDeviceInfo(userAgentHeader), ... getPreferredLanguage(acceptLanguageHeader), 
  }

  next();
};