const swaggerAutogen = require('swagger-autogen')();

const outputFile = './swagger_output.json';
const endpointsFiles = [
  './src/routes/client/index',
  './src/routes/address/index',
];

swaggerAutogen(outputFile, endpointsFiles).then(() => {
  require('./src/server.ts');
});
