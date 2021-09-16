import { Request, Response } from 'express';

import { Errors } from './Response';

export const UnavailableRoute = (_req: Request, res: Response) =>
  res.status(400).json({ error: Errors.UNAVAILABLE });
