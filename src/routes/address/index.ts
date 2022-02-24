import { Router } from 'express';

import AddressController from '../../Controllers/Address';

const addressRoutes = Router();

addressRoutes.post('/addresses', AddressController.create);

addressRoutes.get('/addresses', AddressController.read);

addressRoutes.get('/addresses/:id', AddressController.readOne);

addressRoutes.put('/addresses/:id', AddressController.update);

addressRoutes.delete('/addresses/:id', AddressController.delete);

export default addressRoutes;
