import { formatCurrency, formatDateTime, formatTime } from '../lib/utils';
import { Calendar, Clock, Scissors, User, X, CheckCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useState } from 'react';

interface AppointmentService {
  service: {
    id: string;
    name: string;
    price: number;
    durationMin: number;
  };
}

interface Appointment {
  id: string;
  status: string;
  startTime: string;
  endTime: string;
  notes?: string;
  services: AppointmentService[];
  client?: { id: string; name: string; email: string; phone?: string };
  barber?: {
    user: { name: string };
    specialty?: string;
    avatarUrl?: string;
  };
}

interface AppointmentCardProps {
  appointment: Appointment;
  viewAs?: 'CLIENT' | 'BARBER' | 'ADMIN';
}

export function AppointmentCard({ appointment, viewAs = 'CLIENT' }: AppointmentCardProps) {
  const queryClient = useQueryClient();
  const [showConfirm, setShowConfirm] = useState(false);

  const totalPrice = appointment.services.reduce((acc, as) => acc + as.service.price, 0);
  const totalDuration = appointment.services.reduce((acc, as) => acc + as.service.durationMin, 0);

  const cancelMutation = useMutation({
    mutationFn: () => api.patch(`/appointments/${appointment.id}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setShowConfirm(false);
    },
  });

  const completeMutation = useMutation({
    mutationFn: () => api.patch(`/appointments/${appointment.id}/complete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  const isPast = new Date(appointment.endTime) < new Date();
  const canCancel = appointment.status === 'CONFIRMED' && !isPast;
  const canComplete = (viewAs === 'BARBER' || viewAs === 'ADMIN') && appointment.status === 'CONFIRMED';

  return (
    <div className="glass-card p-5 hover:border-primary/30 transition-all duration-300 animate-fade-in">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge variant="status" status={appointment.status} />
            {isPast && appointment.status === 'CONFIRMED' && (
              <span className="text-xs text-muted-foreground">(passado)</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
            <Calendar className="w-4 h-4 shrink-0 text-primary" />
            <span>{formatDateTime(appointment.startTime)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <Clock className="w-4 h-4 shrink-0 text-primary/70" />
            <span>{formatTime(appointment.startTime)} — {formatTime(appointment.endTime)} ({totalDuration}min)</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xl font-bold gold-text">{formatCurrency(totalPrice)}</p>
        </div>
      </div>

      {/* Services */}
      <div className="flex flex-wrap gap-2 mb-4">
        {appointment.services.map((as) => (
          <span key={as.service.id} className="flex items-center gap-1.5 text-xs bg-muted px-2.5 py-1 rounded-full text-foreground/80">
            <Scissors className="w-3 h-3 text-primary" />
            {as.service.name}
          </span>
        ))}
      </div>

      {/* Barber / Client info */}
      {viewAs === 'CLIENT' && appointment.barber && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground border-t border-border pt-3 mt-3">
          <div className="w-7 h-7 rounded-full gold-gradient flex items-center justify-center text-xs font-bold text-black shrink-0">
            {appointment.barber.user.name.charAt(0)}
          </div>
          <div>
            <p className="text-foreground font-medium text-sm">{appointment.barber.user.name}</p>
            {appointment.barber.specialty && <p className="text-xs text-muted-foreground">{appointment.barber.specialty}</p>}
          </div>
        </div>
      )}
      {(viewAs === 'BARBER' || viewAs === 'ADMIN') && appointment.client && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground border-t border-border pt-3 mt-3">
          <User className="w-4 h-4 shrink-0" />
          <div>
            <p className="text-foreground font-medium text-sm">{appointment.client.name}</p>
            {appointment.client.phone && <p className="text-xs">{appointment.client.phone}</p>}
          </div>
        </div>
      )}

      {/* Actions */}
      {(canCancel || canComplete) && (
        <div className="flex gap-2 mt-4 pt-3 border-t border-border">
          {canComplete && (
            <Button
              id={`complete-btn-${appointment.id}`}
              variant="outline"
              size="sm"
              className="flex-1 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
              loading={completeMutation.isPending}
              onClick={() => completeMutation.mutate()}
            >
              <CheckCircle className="w-4 h-4" /> Concluir
            </Button>
          )}
          {canCancel && !showConfirm && (
            <Button
              id={`cancel-btn-${appointment.id}`}
              variant="outline"
              size="sm"
              className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={() => setShowConfirm(true)}
            >
              <X className="w-4 h-4" /> Cancelar
            </Button>
          )}
          {showConfirm && (
            <div className="flex-1 flex gap-2">
              <Button
                id={`confirm-cancel-btn-${appointment.id}`}
                variant="destructive"
                size="sm"
                className="flex-1"
                loading={cancelMutation.isPending}
                onClick={() => cancelMutation.mutate()}
              >
                Confirmar cancelamento
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowConfirm(false)}>
                Não
              </Button>
            </div>
          )}
        </div>
      )}

      {cancelMutation.isError && (
        <p className="text-xs text-destructive mt-2">Erro ao cancelar. Tente novamente.</p>
      )}
    </div>
  );
}
