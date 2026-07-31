import { Application } from 'express';
import authRouter from './auth.routes';
import userRouter from './user.routes';
import productRouter from './product.routes';
import transactionRouter from './transaction.routes';

export const registerRoutes = (app: Application, prefix: string): void => {
  app.use(`${prefix}/auth`, authRouter);
  app.use(prefix, userRouter);
  app.use(prefix, productRouter);
  app.use(prefix, transactionRouter);
};
