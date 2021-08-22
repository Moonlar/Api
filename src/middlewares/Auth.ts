import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { TokenData } from '../typings';

export const Auth = async (req: Request, res: Response, next: NextFunction) => {
  async function authError() {
    return res
      .status(401)
      .json({ error: 'You need to be authenticated to access this feature' });
  }

  async function validateToken(token: string) {
    if (!process.env.SECRET) throw new Error("Secret can't be undefined");

    const verifyPromise = new Promise<TokenData>((resolve, reject) => {
      jwt.verify(token, process.env.SECRET!, (err, decoded) => {
        if (err) reject(err);
        resolve(decoded as TokenData);
      });
    });

    return verifyPromise;
  }

  res.authError = authError;
  req.isAuth = false;

  const { token } = req.cookies as { token?: string };

  if (token) {
    try {
      const result = await validateToken(token);

      req.isAuth = true;
      req.user = result;
    } catch (err) {
      switch (err.message) {
        case 'jwt expired' || 'jwt not active':
          res.status(401).json({ error: 'Session expired' });
          break;

        case 'jwt malformed':
          res.status(401).json({ error: 'Invalid session token' });
          break;

        default:
          res.status(500).json({ error: 'Internal Server Error' });
          break;
      }
    }
  }

  next();
};
