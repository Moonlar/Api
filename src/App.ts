import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import path from 'path';
import 'dotenv/config';

import Routes from './Routes';

const app = express();

if (process.env.NODE_ENV !== 'test') app.use(morgan('tiny'));
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: process.env.CORS_ORIGIN,
  }),
);
app.use(express.json());
app.use(Routes);
app.use(express.static(path.join(__dirname, '..', 'public')));

export default app;
