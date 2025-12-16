declare module 'swagger-jsdoc' {
  interface SwaggerDefinition {
    openapi?: string;
    swagger?: string;
    info?: any;
    servers?: any[];
    components?: any;
    [key: string]: any;
  }

  interface SwaggerOptions {
    definition: SwaggerDefinition;
    apis: string[];
  }

  function swaggerJsdoc(options: SwaggerOptions): any;

  export = swaggerJsdoc;
}
