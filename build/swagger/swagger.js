"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
class SetupSwagger {
    constructor(swaggerDefitionObj) {
        console.log(swaggerDefitionObj);
        this.swaggerDefinition = Object.assign({ openapi: '3.0.0', explorer: true }, swaggerDefitionObj);
        console.log('Esse é o swagger Definition', this.swaggerDefinition);
        this.options = {
            swaggerDefinition: this.swaggerDefinition,
            apis: ['./src/routes/components-openapi/*.ts',
                './src/routes/components-openapi/schemas/*.ts',
                './src/routes/*.ts'
            ], // Atualize o caminho correto para os seus arquivos de rotas e arquivos JSON do Swagger
        };
        console.log('Esse é o options', this.options);
        this.swaggerSpec = (0, swagger_jsdoc_1.default)(this.options);
        console.log('Esse é o swagger Spec', this.swaggerSpec);
    }
    ;
    setupSwagger(app, route) {
        console.log(app);
        console.log(route);
        console.log(this.swaggerSpec);
        app.use(route, swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(this.swaggerSpec));
    }
}
exports.default = SetupSwagger;
;
