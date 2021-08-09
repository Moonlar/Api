import { Controller } from '../typings';

export const AppController = {
  async index(_, res) {
    const appData = {
      environment: process.env.NODE_ENV,
    };

    return res.json(appData);
  },
} as Controller;
