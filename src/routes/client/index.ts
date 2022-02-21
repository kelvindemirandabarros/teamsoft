import { Router } from 'express';
import ClientController from '../../Controllers/Client';

const clientRoutes = Router();

clientRoutes.post('/clients', ClientController.create);

clientRoutes.get('/clients', ClientController.read);

clientRoutes.get('/clients/:id', ClientController.readOne);

clientRoutes.put('/clients/:id', ClientController.update);

clientRoutes.delete('/clients/:id', ClientController.delete);

export default clientRoutes;
