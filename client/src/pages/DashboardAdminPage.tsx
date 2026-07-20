import { useQuery } from '@tanstack/react-query';
import { Users, Scissors, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { AppointmentCard } from '../components/AppointmentCard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useAuthStore } from '../lib/store';
import api from '../lib/api';
import { formatCurrency } from '../lib/utils';

interface Stats { totalAppointments: number; totalClients: number; totalBarbers: number; totalRevenue: number; }
interface Appointment {
  id: string; status: string; startTime: string; endTime: string; notes?: string;
  services: { service: { id: string; name: string; price: number; durationMin: number } }[];
  client?: { id: string; name: string; email: string };
  barber?: { user: { name: string } };
}

export function DashboardAdminPage() {
  const { user } = useAuthStore();

  const { data: stats } = useQuery<Stats>({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/appointments/admin/stats').then(r => r.data),
  });

  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ['appointments'],
    queryFn: () => api.get('/appointments').then(r => r.data),
  });

  const statCards = [
    { icon: Calendar, label: 'Total de Agendamentos', value: stats?.totalAppointments ?? '—', color: 'text-blue-400' },
    { icon: Users, label: 'Clientes Cadastrados', value: stats?.totalClients ?? '—', color: 'text-purple-400' },
    { icon: Scissors, label: 'Barbeiros Ativos', value: stats?.totalBarbers ?? '—', color: 'text-yellow-400' },
    { icon: DollarSign, label: 'Faturamento Total', value: stats ? formatCurrency(stats.totalRevenue) : '—', color: 'text-emerald-400' },
  ];

  return (
    <div className="min-h-screen py-10">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center text-black font-bold">
              A
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold">
                Painel <span className="gold-text">Admin</span>
              </h1>
              <p className="text-muted-foreground text-sm">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {statCards.map((stat) => (
            <Card key={stat.label} className="hover:border-primary/30 transition-all">
              <CardContent className="p-5">
                <stat.icon className={`w-6 h-6 mb-3 ${stat.color}`} />
                <p className="text-2xl font-bold mb-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* All appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Todos os Agendamentos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-36 skeleton rounded-xl" />)}
              </div>
            ) : appointments?.length === 0 ? (
              <p className="text-center text-muted-foreground py-10">Nenhum agendamento encontrado.</p>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto scrollbar-hide">
                {appointments?.map(a => <AppointmentCard key={a.id} appointment={a} viewAs="ADMIN" />)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
