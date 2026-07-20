import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { createError } from '../middleware/error.middleware';
import { startOfDay, endOfDay, addMinutes, isWithinInterval, parseISO } from 'date-fns';

export async function listBarbers(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const barbers = await prisma.barberProfile.findMany({
      where: { isAvailable: true },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
      orderBy: { user: { name: 'asc' } },
    });
    res.json(barbers);
  } catch (err) {
    next(err);
  }
}

export async function getBarber(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const barber = await prisma.barberProfile.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });
    if (!barber) throw createError('Barbeiro não encontrado.', 404);
    res.json(barber);
  } catch (err) {
    next(err);
  }
}

// Returns available time slots for a barber on a given date
export async function getAvailableSlots(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { date, duration } = req.query;

    if (!date) throw createError('Data é obrigatória.', 400);
    if (!duration) throw createError('Duração é obrigatória.', 400);

    const targetDate = parseISO(date as string);
    const durationMin = Number(duration);

    // Working hours: 08:00 to 19:00
    const workStart = 8 * 60; // minutes from midnight
    const workEnd = 19 * 60;
    const slotInterval = 30; // generate slots every 30 min

    // Get existing appointments for that day
    const dayStart = startOfDay(targetDate);
    const dayEnd = endOfDay(targetDate);

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        barberId: id,
        status: { not: 'CANCELED' },
        startTime: { gte: dayStart, lte: dayEnd },
      },
    });

    // Generate all possible slots
    const slots: { time: string; available: boolean }[] = [];

    for (let minuteOffset = workStart; minuteOffset + durationMin <= workEnd; minuteOffset += slotInterval) {
      const slotStart = new Date(dayStart);
      slotStart.setHours(0, minuteOffset, 0, 0);
      const slotEnd = addMinutes(slotStart, durationMin);

      // Check if this slot conflicts with existing appointments
      const hasConflict = existingAppointments.some((appt) => {
        return (
          slotStart < appt.endTime && slotEnd > appt.startTime
        );
      });

      // Don't show past slots
      const isPast = slotStart < new Date();

      slots.push({
        time: slotStart.toISOString(),
        available: !hasConflict && !isPast,
      });
    }

    res.json(slots);
  } catch (err) {
    next(err);
  }
}
