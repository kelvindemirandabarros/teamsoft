import { Router } from 'express';
import Client from './client';

const router = Router();

router.use(Client);

export default router;
