import { Application } from 'express';
import authRouter from './auth.routes';
import userRouter from './user.routes';
import productRouter from './product.routes';
import transactionRouter from './transaction.routes';
import settingsRouter from './settings.routes';
import notificationRouter from './notification.routes';
import auditLogRouter from './auditLog.routes';

export const registerRoutes = (app: Application, prefix: string): void => {
  // Auth (no prefix duplication — auth router internally maps /login, /register etc.)
  app.use(`${prefix}/auth`, authRouter);

  // User & Roles
  app.use(prefix, userRouter);

  // Products, Categories, Brands, Suppliers, Customers, Inventory
  app.use(prefix, productRouter);

  // Sales, Purchases, Credit Sales, Expenses, Dashboard, Reports
  app.use(prefix, transactionRouter);

  // Settings & Company Profile
  app.use(prefix, settingsRouter);

  // Notifications
  app.use(prefix, notificationRouter);

  // Audit Logs
  app.use(prefix, auditLogRouter);
};
