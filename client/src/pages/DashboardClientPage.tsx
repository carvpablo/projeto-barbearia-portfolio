import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, Scissors } from 'lucide-react';
import { Button } from '../components/ui/Button';
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
  barber?: { user: { name: string }; specialty?: string; avatarUrl?: string };
}

export function DashboardClientPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ['appointments'],
    queryFn: () => api.get('/appointments').then(r => r.data),
  });

  const upcoming = appointments?.filter(a => a.status === 'CONFIRMED' && new Date(a.startTime) >= new Date()) || [];
  const past = appointments?.filter(a => a.status !== 'CONFIRMED' || new Date(a.startTime) < new Date()) || [];

  return (
    <div className="min-h-screen py-10">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-display text-3xl font-bold mb-1">
              Olá, <span className="gold-text">{user?.name.split(' ')[0]}</span>! 👋
            </h1>
            <p className="text-muted-foreground">Gerencie seus agendamentos</p>
          </div>
          <Button id="new-booking-btn" variant="gold" size="md" onClick={() => navigate('/booking')}>
            <Plus className="w-4 h-4" /> Novo Agendamento
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-40 skeleton rounded-xl" />)}
          </div>
        ) : appointments?.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-5">
              <Scissors className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="font-display text-2xl font-semibold mb-2">Nenhum agendamento</h2>
            <p className="text-muted-foreground mb-6">Que tal marcar um horário com nossos barbeiros?</p>
            <Button id="first-booking-btn" variant="gold" onClick={() => navigate('/booking')}>
              Agendar Agora
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {upcoming.length > 0 && (
              <section>
                <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" /> Próximos ({upcoming.length})
                </h2>
                <div className="space-y-4">
                  {upcoming.map(a => <AppointmentCard key={a.id} appointment={a} viewAs="CLIENT" />)}
                </div>
              </section>
            )}
            {past.length > 0 && (
              <section>
                <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2 text-muted-foreground">
                  Histórico ({past.length})
                </h2>
                <div className="space-y-4 opacity-75">
                  {past.map(a => <AppointmentCard key={a.id} appointment={a} viewAs="CLIENT" />)}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
