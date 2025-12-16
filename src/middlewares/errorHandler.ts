import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public field?: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  console.error('Error:', err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      field: err.field,
      statusCode: err.statusCode,
    });
    return;
  }

  // Prisma unique constraint error
  if (err.message.includes('Unique constraint failed')) {
    res.status(400).json({
      error: 'Este registro já existe',
      statusCode: 400,
    });
    return;
  }

  // Prisma foreign key error
  if (err.message.includes('Foreign key constraint failed')) {
    res.status(400).json({
      error: 'Registro relacionado não encontrado',
      statusCode: 400,
    });
    return;
  }

  // Generic error
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    statusCode: 500,
  });
};

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
