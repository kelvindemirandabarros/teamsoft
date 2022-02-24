import { Router } from 'express';

import Client from './client';
import Address from './address';

const router = Router();

router.use(Client);
router.use(Address);

export default router;
