import { useQuery } from '@tanstack/react-query';
import { format, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Scissors, Calendar, Clock } from 'lucide-react';
import { AppointmentCard } from '../components/AppointmentCard';
import { useAuthStore } from '../lib/store';
import api from '../lib/api';

interface Appointment {
  id: string;
  status: string;
  startTime: string;
  endTime: string;
  notes?: string;
  services: { service: { id: string; name: string; price: number; durationMin: number } }[];
  client?: { id: string; name: string; email: string; phone?: string };
}

export function DashboardBarberPage() {
  const { user } = useAuthStore();

  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ['appointments'],
    queryFn: () => api.get('/appointments').then(r => r.data),
  });

  const today = appointments?.filter(a => {
    return isToday(new Date(a.startTime)) && a.status === 'CONFIRMED';
  }) || [];

  const upcoming = appointments?.filter(a => {
    const d = new Date(a.startTime);
    return !isToday(d) && d > new Date() && a.status === 'CONFIRMED';
  }) || [];

  const past = appointments?.filter(a => {
    return new Date(a.endTime) < new Date() || a.status !== 'CONFIRMED';
  }) || [];

  const totalToday = today.reduce((acc, a) => acc + a.services.reduce((s, as) => s + as.service.price, 0), 0);

  return (
    <div className="min-h-screen py-10">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-display text-3xl font-bold mb-1">
            Sua Agenda, <span className="gold-text">{user?.name.split(' ')[0]}</span>
          </h1>
          <p className="text-muted-foreground">
            {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { icon: Clock, label: 'Hoje', value: today.length.toString(), sub: 'atendimentos' },
            { icon: Calendar, label: 'Próximos', value: upcoming.length.toString(), sub: 'agendamentos' },
            { icon: Scissors, label: 'Faturamento Hoje', value: `R$ ${totalToday.toFixed(0)}`, sub: 'estimado' },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-4 text-center">
              <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold gold-text">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.sub}</p>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-40 skeleton rounded-xl" />)}
          </div>
        ) : (
          <div className="space-y-8">
            {today.length > 0 && (
              <section>
                <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Hoje ({today.length})
                </h2>
                <div className="space-y-4">
                  {today.map(a => <AppointmentCard key={a.id} appointment={a} viewAs="BARBER" />)}
                </div>
              </section>
            )}
            {upcoming.length > 0 && (
              <section>
                <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" /> Próximos
                </h2>
                <div className="space-y-4">
                  {upcoming.map(a => <AppointmentCard key={a.id} appointment={a} viewAs="BARBER" />)}
                </div>
              </section>
            )}
            {today.length === 0 && upcoming.length === 0 && (
              <div className="text-center py-20">
                <Scissors className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="font-display text-2xl font-semibold mb-2">Sem agendamentos</h2>
                <p className="text-muted-foreground">Nenhum atendimento por enquanto.</p>
              </div>
            )}
            {past.length > 0 && (
              <section>
                <h2 className="font-display text-xl font-semibold mb-4 text-muted-foreground">
                  Histórico ({past.length})
                </h2>
                <div className="space-y-4 opacity-70">
                  {past.slice(0, 5).map(a => <AppointmentCard key={a.id} appointment={a} viewAs="BARBER" />)}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
