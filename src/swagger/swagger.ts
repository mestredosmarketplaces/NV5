import express from 'express';
import swaggerJSDoc  from 'swagger-jsdoc';
import { SwaggerOptions } from 'swagger-ui-express';
import { SwaggerDefinition } from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

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
    }
  },
  servers: [  
    {url: string;}
  ]

}

export default class SetupSwagger {
  
  private swaggerDefinition: SwaggerDefinition;
  private options: SwaggerOptions;
  private swaggerSpec: any;

  constructor(swaggerDefitionObj: SetSwaggerDoc) {

    console.log(swaggerDefitionObj);

    this.swaggerDefinition = {
      openapi: '3.0.0',
      explorer: true,
      ...swaggerDefitionObj
    };

    console.log('Esse é o swagger Definition', this.swaggerDefinition);

    this.options = {
      swaggerDefinition: this.swaggerDefinition,
      apis: ['./src/routes/components-openapi/*.ts', 
      './src/routes/components-openapi/schemas/*.ts', 
      './src/routes/*.ts'
    ], // Atualize o caminho correto para os seus arquivos de rotas e arquivos JSON do Swagger
    };

    console.log('Esse é o options', this.options);
    this.swaggerSpec = swaggerJSDoc(this.options);

    console.log('Esse é o swagger Spec', this.swaggerSpec);
  };

  setupSwagger(app: express.Application, route: string) {
    console.log(app);
    console.log(route);
    console.log(this.swaggerSpec);
    app.use(route, swaggerUi.serve, swaggerUi.setup(this.swaggerSpec));
  }


};
