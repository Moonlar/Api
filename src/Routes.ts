import { Router } from 'express';
import { AdminUsersController } from './controllers/AdminUsersController';

import { AppController } from './controllers/AppController';
import { Auth } from './middlewares/Auth';
import { UnavailableRoute } from './utils/UnavailableRoute';

const routes = Router();

/* Middlewares */
routes.use(Auth);

/* App Routes */
routes.get('/', AppController.index);

/* Admin Users Routes */
routes.get('/admin/users', AdminUsersController.show);
routes.get('/admin/user', AdminUsersController.index);
routes.get('/admin/user/:nickname', AdminUsersController.index);
routes.post('/admin/user', AdminUsersController.create);
routes.patch('/admin/user', UnavailableRoute);
routes.patch('/admin/user/:id', UnavailableRoute);
routes.delete('/admin/user/:id', UnavailableRoute);

/* Admin Auth Routes */
routes.get('/admin/auth', UnavailableRoute);
routes.post('/admin/auth', UnavailableRoute);
routes.delete('/admin/auth', UnavailableRoute);

/* Auth Routes */
routes.get('/auth', UnavailableRoute);
routes.post('/auth', UnavailableRoute);
routes.delete('/auth', UnavailableRoute);

/* Products Routes */
routes.get('/products', UnavailableRoute);
routes.get('/product/:id', UnavailableRoute);
routes.post('/product', UnavailableRoute);
routes.patch('/product/:id', UnavailableRoute);
routes.delete('/product/:id', UnavailableRoute);

/* Coupons Routes */
routes.get('/coupons', UnavailableRoute);
routes.get('/coupon/:code', UnavailableRoute);
routes.post('/coupon', UnavailableRoute);
routes.patch('/coupon/:id', UnavailableRoute);
routes.delete('/coupon/:id', UnavailableRoute);

/* Purchases Routes */
routes.get('/purchases/:nickname', UnavailableRoute);
routes.get('/purchase/:id', UnavailableRoute);
routes.post('/purchase', UnavailableRoute);
routes.patch('/purchase/:id', UnavailableRoute);
routes.delete('/purchase/:id', UnavailableRoute);

/* Test Routes */
routes.get('/token/:permission', UnavailableRoute);

export default routes;
