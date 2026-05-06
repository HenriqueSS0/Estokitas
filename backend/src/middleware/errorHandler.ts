import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  console.error('[Error]', err);

  if (err.code === '23505') {
    res.status(409).json({ error: 'Registro duplicado' });
    return;
  }

  if (err.code === '23503') {
    res.status(400).json({ error: 'Referência inválida' });
    return;
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Erro interno do servidor';
  res.status(status).json({ error: message });
}
