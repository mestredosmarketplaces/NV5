"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
class SetupSwagger {
    constructor(swaggerDefitionObj) {
        const swaggerObj = Object.assign({ openapi: '3.0.0', explorer: true }, swaggerDefitionObj);
        this.swaggerDefinition = swaggerObj;
        this.options = Object.assign(Object.assign({}, this.swaggerDefinition), { apis: ['./src/routes/components-openapi/*.ts',
                './src/routes/components-openapi/schemas/*.ts',
                './src/routes/*.ts'
            ] });
        this.swaggerSpec = (0, swagger_jsdoc_1.default)(this.options);
    }
    ;
    setupSwagger(app, route) {
        app.use(route, swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(this.swaggerSpec));
    }
}
exports.default = SetupSwagger;
;
