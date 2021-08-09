import { Router } from 'express';

import { AppController } from './controllers/AppController';

const routes = Router();

/* App Routes */
routes.get('/', AppController.index);

export default routes;
