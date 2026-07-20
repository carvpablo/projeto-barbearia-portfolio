import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { createError } from '../middleware/error.middleware';

export async function listServices(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    res.json(services);
  } catch (err) {
    next(err);
  }
}

export async function getService(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const service = await prisma.service.findUnique({
      where: { id: req.params.id },
    });
    if (!service) throw createError('Serviço não encontrado.', 404);
    res.json(service);
  } catch (err) {
    next(err);
  }
}

export async function createService(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, description, price, durationMin, imageUrl } = req.body;
    if (!name || price == null || !durationMin) {
      throw createError('Campos obrigatórios: name, price, durationMin.', 400);
    }

    const service = await prisma.service.create({
      data: { name, description, price: Number(price), durationMin: Number(durationMin), imageUrl },
    });
    res.status(201).json(service);
  } catch (err) {
    next(err);
  }
}

export async function updateService(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const service = await prisma.service.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(service);
  } catch (err) {
    next(err);
  }
}

export async function deleteService(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await prisma.service.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
