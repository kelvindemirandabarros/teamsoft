const productionEnv = process.env.NODE_ENV === 'production';
require('dotenv').config({ path: productionEnv ? '.env' : '.env.test' });

import express from 'express';
import cors from 'cors';

import routes from './routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(routes);

export default app;
