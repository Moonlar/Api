import { Request, Response } from 'express';

interface Controller {
  /**
   * Retornar dados específicos
   */
  index: (req: Request, res: Response) => Promise<any>;
  /**
   * Retornar lista de dados
   */
  show: (req: Request, res: Response) => Promise<any>;
  /**
   * Criar dados
   */
  create: (req: Request, res: Response) => Promise<any>;
  /**
   * Atualizar dados
   */
  update: (req: Request, res: Response) => Promise<any>;
  /**
   * Deletar dados
   */
  delete: (req: Request, res: Response) => Promise<any>;
}
