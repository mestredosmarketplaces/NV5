import * as util from 'util';
import winston from 'winston';
import { Logger } from "./schemas/logs-schema";

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.printf(({ level, message, [Symbol.for('message')]: splat }) => {
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
            .split("/").join("")

          Logger.build({
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
            .then((logsaved) => {})
            .catch((error) => {
              console.error('Failed to save log:', error);
            });

          return `${logMessage} ${meta}`;
        })
      )
    })
  ]
});

export default logger;
