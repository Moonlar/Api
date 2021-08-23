import jwt from 'jsonwebtoken';

import { TokenData } from '../typings';

export function GenerateToken(expiresIn: number, data: TokenData): string {
  if (!process.env.SECRET) throw new Error("Secret can't be undefined");

  return jwt.sign(data, process.env.SECRET, { expiresIn });
}
