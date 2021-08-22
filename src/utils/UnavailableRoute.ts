import { Request, Response } from 'express';

export const UnavailableRoute = (_req: Request, res: Response) => {
  return res.status(400).json({ error: 'Route unavailable' });
};
