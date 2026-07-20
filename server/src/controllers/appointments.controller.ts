import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { addMinutes, parseISO } from 'date-fns';
import { prisma } from '../lib/prisma';
import { createError } from '../middleware/error.middleware';

const createAppointmentSchema = z.object({
  barberId: z.string().uuid('ID de barbeiro inválido'),
  serviceIds: z.array(z.string().uuid()).min(1, 'Selecione ao menos um serviço'),
  startTime: z.string().datetime('Data/hora inválida'),
  notes: z.string().optional(),
});

export async function createAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createAppointmentSchema.parse(req.body);
    const clientId = req.user!.userId;

    // Get all services to calculate total duration
    const services = await prisma.service.findMany({
      where: { id: { in: data.serviceIds }, isActive: true },
    });

    if (services.length !== data.serviceIds.length) {
      throw createError('Um ou mais serviços não encontrados.', 404);
    }

    const totalDuration = services.reduce((acc, s) => acc + s.durationMin, 0);
    const startTime = parseISO(data.startTime);
    const endTime = addMinutes(startTime, totalDuration);

    // Verify barber exists
    const barber = await prisma.barberProfile.findUnique({
      where: { id: data.barberId, isAvailable: true },
    });
    if (!barber) throw createError('Barbeiro não encontrado ou indisponível.', 404);

    // Check for conflicts
    const conflict = await prisma.appointment.findFirst({
      where: {
        barberId: data.barberId,
        NOT: { status: 'CANCELED' },
        AND: [
          { startTime: { lt: endTime } },
          { endTime: { gt: startTime } },
        ],
      },
    });

    if (conflict) {
      throw createError('Horário já está ocupado. Escolha outro horário.', 409);
    }

    const appointment = await prisma.appointment.create({
      data: {
        clientId,
        barberId: data.barberId,
        startTime,
        endTime,
        notes: data.notes,
        services: {
          create: data.serviceIds.map((serviceId) => ({ serviceId })),
        },
      },
      include: {
        barber: { include: { user: { select: { name: true } } } },
        client: { select: { id: true, name: true, email: true } },
        services: { include: { service: true } },
      },
    });

    res.status(201).json(appointment);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    next(err);
  }
}

export async function listMyAppointments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role;

    let appointments;

    if (role === 'CLIENT') {
      appointments = await prisma.appointment.findMany({
        where: { clientId: userId },
        include: {
          barber: { include: { user: { select: { name: true } } } },
          services: { include: { service: true } },
        },
        orderBy: { startTime: 'desc' },
      });
    } else if (role === 'BARBER') {
      const profile = await prisma.barberProfile.findUnique({ where: { userId } });
      if (!profile) throw createError('Perfil de barbeiro não encontrado.', 404);

      appointments = await prisma.appointment.findMany({
        where: { barberId: profile.id },
        include: {
          client: { select: { id: true, name: true, email: true, phone: true } },
          services: { include: { service: true } },
        },
        orderBy: { startTime: 'asc' },
      });
    } else {
      // ADMIN sees all
      appointments = await prisma.appointment.findMany({
        include: {
          client: { select: { id: true, name: true, email: true } },
          barber: { include: { user: { select: { name: true } } } },
          services: { include: { service: true } },
        },
        orderBy: { startTime: 'desc' },
      });
    }

    res.json(appointments);
  } catch (err) {
    next(err);
  }
}

export async function cancelAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role;
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment) throw createError('Agendamento não encontrado.', 404);

    // Only client owner, the barber, or admin can cancel
    const isOwner = appointment.clientId === userId;
    const isAdmin = role === 'ADMIN';

    let isBarberOwner = false;
    if (role === 'BARBER') {
      const profile = await prisma.barberProfile.findUnique({ where: { userId } });
      isBarberOwner = profile?.id === appointment.barberId;
    }

    if (!isOwner && !isAdmin && !isBarberOwner) {
      throw createError('Sem permissão para cancelar este agendamento.', 403);
    }

    if (appointment.status === 'CANCELED') {
      throw createError('Agendamento já está cancelado.', 400);
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: 'CANCELED' },
      include: {
        services: { include: { service: true } },
      },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function completeAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role;
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment) throw createError('Agendamento não encontrado.', 404);

    let isBarberOwner = false;
    if (role === 'BARBER') {
      const profile = await prisma.barberProfile.findUnique({ where: { userId } });
      isBarberOwner = profile?.id === appointment.barberId;
    }

    if (!isBarberOwner && role !== 'ADMIN') {
      throw createError('Apenas o barbeiro pode marcar como concluído.', 403);
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: 'COMPLETED' },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function getAdminStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [totalAppointments, totalClients, totalBarbers, completedAppointments] = await Promise.all([
      prisma.appointment.count({ where: { NOT: { status: 'CANCELED' } } }),
      prisma.user.count({ where: { role: 'CLIENT' } }),
      prisma.barberProfile.count({ where: { isAvailable: true } }),
      prisma.appointment.findMany({
        where: { status: 'COMPLETED' },
        include: { services: { include: { service: true } } },
      }),
    ]);

    const totalRevenue = completedAppointments.reduce((acc, appt) => {
      return acc + appt.services.reduce((s, as) => s + as.service.price, 0);
    }, 0);

    res.json({
      totalAppointments,
      totalClients,
      totalBarbers,
      totalRevenue,
    });
  } catch (err) {
    next(err);
  }
}
