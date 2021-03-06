import { Router } from 'express';

import { AdminAuthController } from './controllers/AdminAuthController';
import { AdminUsersController } from './controllers/AdminUsersController';
import { AppController } from './controllers/AppController';
import { CouponsController } from './controllers/CouponsController';
import { ProductsBenefitsController } from './controllers/ProductBenefitsController';
import { ProductsCommandsController } from './controllers/ProductsCommandsController';
import { ProductsController } from './controllers/ProductsController';
import { ServersController } from './controllers/ServersController';
import { TestsController } from './controllers/TestsController';
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
routes.get('/admin/user/:identifier', AdminUsersController.index);
routes.post('/admin/user', AdminUsersController.create);
routes.patch('/admin/user', AdminUsersController.update);
routes.patch('/admin/user/:identifier', AdminUsersController.update);
routes.delete('/admin/user/:identifier', AdminUsersController.delete);

/* Admin Auth Routes */
routes.get('/admin/auth', AdminAuthController.index);
routes.post('/admin/auth', AdminAuthController.create);
routes.delete('/admin/auth', AdminAuthController.delete);

/* Auth Routes */
routes.get('/auth', UnavailableRoute);
routes.post('/auth', UnavailableRoute);
routes.delete('/auth', UnavailableRoute);

/* Servers Routes */
routes.get('/servers', ServersController.show);
routes.get('/server/:id', ServersController.index);
routes.post('/server', ServersController.create);
routes.patch('/server/:id', ServersController.update);
routes.delete('/server/:id', ServersController.delete);

/* Products Routes */
routes.get('/products', ProductsController.show);
routes.get('/product/:id', ProductsController.index);
routes.post('/product', ProductsController.create);
routes.patch('/product/:id', ProductsController.update);
routes.delete('/product/:id', ProductsController.delete);

/* Product Benefits Routes */
routes.post('/product/:product_id/benefit', ProductsBenefitsController.create);
routes.patch('/product/:product_id/benefit/:benefit_id', ProductsBenefitsController.update);
routes.delete('/product/:product_id/benefit/:benefit_id', ProductsBenefitsController.delete);

/* Product Commands Routes */
routes.post('/product/:product_id/command', ProductsCommandsController.create);
routes.patch('/product/:product_id/command/:command_id', ProductsCommandsController.update);
routes.delete('/product/:product_id/command/:command_id', ProductsCommandsController.delete);

/* Coupons Routes */
routes.get('/coupons', CouponsController.show);
routes.get('/coupon/:code', CouponsController.index);
routes.post('/coupon', CouponsController.create);
routes.patch('/coupon/:id', CouponsController.update);
routes.delete('/coupon/:id', CouponsController.delete);

/* Purchases Routes */
routes.get('/purchases/:nickname', UnavailableRoute);
routes.get('/purchase/:id', UnavailableRoute);
routes.post('/purchase', UnavailableRoute);
routes.patch('/purchase/:id', UnavailableRoute);
routes.delete('/purchase/:id', UnavailableRoute);

/* Test Routes */
routes.get('/test/token/:level', TestsController.create);

export default routes;
