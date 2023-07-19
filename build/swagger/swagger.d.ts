import express from 'express';
interface SetSwaggerDoc {
    info: {
        title: string;
        version: string;
        description: string;
        summary: string;
        contact: {
            name: string;
            url: string;
            email: string;
        };
    };
    servers: {
        url: string;
    };
}
export default class SetupSwagger {
    private swaggerDefitionObj;
    private swaggerDefinition;
    private options;
    private swaggerSpec;
    constructor(swaggerDefitionObj: SetSwaggerDoc);
    setupSwagger(app: express.Application, route: string): void;
}
export {};
