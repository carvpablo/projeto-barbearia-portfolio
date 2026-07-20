import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Scissors, ChevronRight, ChevronLeft, CheckCircle, Clock, User, Calendar, Check } from 'lucide-react';
import { format, addDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import api from '../lib/api';
import { useBookingStore, useAuthStore, type Barber } from '../lib/store';
import { formatCurrency, formatTime, cn } from '../lib/utils';

interface Service { id: string; name: string; description?: string; price: number; durationMin: number; imageUrl?: string; }
// Barber type is imported from store to keep a single source of truth
interface TimeSlot { time: string; available: boolean; }

const STEPS = [
  { id: 1, label: 'Serviços', icon: Scissors },
  { id: 2, label: 'Barbeiro', icon: User },
  { id: 3, label: 'Horário', icon: Calendar },
  { id: 4, label: 'Confirmação', icon: CheckCircle },
];

export function BookingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const {
    step, setStep,
    selectedServices, setServices,
    selectedBarber, setBarber,
    selectedSlot, setSlot,
    reset,
  } = useBookingStore();

  const queryClient = useQueryClient();

  const [selectedDate, setSelectedDate] = useState<Date>(addDays(new Date(), 1));
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');

  const { data: services } = useQuery<Service[]>({ queryKey: ['services'], queryFn: () => api.get('/services').then(r => r.data) });
  const { data: barbers } = useQuery<Barber[]>({ queryKey: ['barbers'], queryFn: () => api.get('/barbers').then(r => r.data) });

  const totalDuration = useMemo(() => selectedServices.reduce((acc, s) => acc + s.durationMin, 0), [selectedServices]);
  const totalPrice = useMemo(() => selectedServices.reduce((acc, s) => acc + s.price, 0), [selectedServices]);

  const { data: slots, isLoading: slotsLoading } = useQuery<TimeSlot[]>({
    queryKey: ['slots', selectedBarber?.id, format(selectedDate, 'yyyy-MM-dd'), totalDuration],
    queryFn: () => api.get(`/barbers/${selectedBarber!.id}/slots`, {
      params: { date: format(selectedDate, 'yyyy-MM-dd'), duration: totalDuration }
    }).then(r => r.data),
    enabled: !!selectedBarber && totalDuration > 0 && step === 3,
  });

  const bookMutation = useMutation({
    mutationFn: () => api.post('/appointments', {
      barberId: selectedBarber!.id,
      serviceIds: selectedServices.map(s => s.id),
      startTime: selectedSlot,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setBookingSuccess(true);
      reset();
    },
    onError: (err: any) => {
      setBookingError(err.response?.data?.error || 'Erro ao confirmar agendamento.');
    },
  });

  const toggleService = (service: Service) => {
    const exists = selectedServices.find(s => s.id === service.id);
    if (exists) {
      setServices(selectedServices.filter(s => s.id !== service.id));
    } else {
      setServices([...selectedServices, service]);
    }
  };

  const canNext = () => {
    if (step === 1) return selectedServices.length > 0;
    if (step === 2) return selectedBarber !== null;
    if (step === 3) return selectedSlot !== null;
    return true;
  };

  // Generate next 14 days
  const availableDates = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => addDays(new Date(), i + 1));
  }, []);

  if (bookingSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md animate-fade-in">
          <div className="w-20 h-20 mx-auto rounded-full gold-gradient flex items-center justify-center shadow-2xl shadow-yellow-500/30 mb-6">
            <CheckCircle className="w-10 h-10 text-black" />
          </div>
          <h1 className="font-display text-3xl font-bold mb-3">Agendamento Confirmado!</h1>
          <p className="text-muted-foreground mb-8">Seu horário foi reservado com sucesso. Até lá!</p>
          <div className="flex gap-3 justify-center">
            <Button id="view-appointments-btn" variant="gold" onClick={() => navigate('/dashboard')}>
              Ver meus agendamentos
            </Button>
            <Button id="book-another-btn" variant="outline" onClick={() => { setBookingSuccess(false); }}>
              Agendar outro
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold mb-2">Agendar Serviço</h1>
          <p className="text-muted-foreground">Siga os passos abaixo para confirmar seu horário</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-10">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className={cn(
                'flex flex-col items-center gap-1.5',
              )}>
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                  step > s.id ? 'bg-primary border-primary text-primary-foreground' :
                  step === s.id ? 'border-primary text-primary bg-primary/10' :
                  'border-border text-muted-foreground'
                )}>
                  {step > s.id ? <Check className="w-5 h-5" /> : <s.icon className="w-4 h-4" />}
                </div>
                <span className={cn(
                  'text-xs font-medium hidden sm:block',
                  step === s.id ? 'text-primary' : 'text-muted-foreground'
                )}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn(
                  'h-0.5 w-12 sm:w-20 mx-2 transition-all duration-300',
                  step > s.id ? 'bg-primary' : 'bg-border'
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card className="mb-6">
          <CardContent className="p-6">

            {/* Step 1: Services */}
            {step === 1 && (
              <div className="animate-fade-in">
                <h2 className="font-display text-2xl font-semibold mb-1">Escolha os serviços</h2>
                <p className="text-muted-foreground text-sm mb-6">Selecione um ou mais serviços</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {services?.map((service) => {
                    const isSelected = selectedServices.some(s => s.id === service.id);
                    return (
                      <button
                        key={service.id}
                        id={`service-${service.id}`}
                        onClick={() => toggleService(service)}
                        className={cn(
                          'text-left p-4 rounded-xl border-2 transition-all duration-200 hover:border-primary/50',
                          isSelected ? 'border-primary bg-primary/10' : 'border-border bg-muted/20 hover:bg-muted/40'
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className={cn('font-semibold', isSelected && 'text-primary')}>{service.name}</p>
                            {service.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{service.description}</p>}
                            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" /> {service.durationMin}min
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-bold gold-text">{formatCurrency(service.price)}</p>
                            {isSelected && <div className="mt-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center ml-auto"><Check className="w-3 h-3 text-black" /></div>}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {selectedServices.length > 0 && (
                  <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{selectedServices.length} serviço(s) • {totalDuration}min</span>
                      <span className="font-bold gold-text">{formatCurrency(totalPrice)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Barber */}
            {step === 2 && (
              <div className="animate-fade-in">
                <h2 className="font-display text-2xl font-semibold mb-1">Escolha o barbeiro</h2>
                <p className="text-muted-foreground text-sm mb-6">Selecione com quem deseja ser atendido</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {barbers?.map((barber) => {
                    const isSelected = selectedBarber?.id === barber.id;
                    return (
                      <button
                        key={barber.id}
                        id={`barber-${barber.id}`}
                        onClick={() => setBarber(isSelected ? null : barber)}
                        className={cn(
                          'flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 text-center',
                          isSelected ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50 hover:bg-muted/30'
                        )}
                      >
                        <div className={cn(
                          'w-16 h-16 rounded-full mb-3 border-2 overflow-hidden transition-all',
                          isSelected ? 'border-primary shadow-lg shadow-primary/20' : 'border-border'
                        )}>
                          {barber.avatarUrl ? (
                            <img src={barber.avatarUrl} alt={barber.user.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full gold-gradient flex items-center justify-center text-xl font-bold text-black">
                              {barber.user.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <p className={cn('font-semibold', isSelected && 'text-primary')}>{barber.user.name}</p>
                        {barber.specialty && <p className="text-xs text-muted-foreground mt-0.5">{barber.specialty}</p>}
                        {isSelected && <div className="mt-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"><Check className="w-3 h-3 text-black" /></div>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Date & Time */}
            {step === 3 && (
              <div className="animate-fade-in">
                <h2 className="font-display text-2xl font-semibold mb-1">Escolha data e horário</h2>
                <p className="text-muted-foreground text-sm mb-6">Selecione quando deseja ser atendido</p>

                {/* Date picker */}
                <div className="mb-6">
                  <p className="text-sm font-medium mb-3">Data</p>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {availableDates.map((date) => {
                      const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                      const dayName = format(date, 'EEE', { locale: ptBR });
                      const dayNum = format(date, 'd');
                      return (
                        <button
                          key={date.toISOString()}
                          id={`date-${format(date, 'yyyy-MM-dd')}`}
                          onClick={() => { setSelectedDate(date); setSlot(null); }}
                          className={cn(
                            'flex flex-col items-center p-3 rounded-xl border-2 min-w-[60px] transition-all',
                            isSelected ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/40'
                          )}
                        >
                          <span className="text-xs font-medium capitalize">{dayName}</span>
                          <span className="text-xl font-bold">{dayNum}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time slots */}
                <div>
                  <p className="text-sm font-medium mb-3">Horário disponível</p>
                  {slotsLoading ? (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {Array(12).fill(null).map((_, i) => <div key={i} className="h-10 skeleton rounded-lg" />)}
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {slots?.map((slot) => {
                        const isSelected = selectedSlot === slot.time;
                        return (
                          <button
                            key={slot.time}
                            id={`slot-${slot.time}`}
                            disabled={!slot.available}
                            onClick={() => setSlot(slot.time)}
                            className={cn(
                              'py-2 px-1 rounded-lg text-sm font-medium border transition-all',
                              isSelected ? 'border-primary bg-primary/20 text-primary' :
                              slot.available ? 'border-border hover:border-primary/50 hover:bg-muted' :
                              'border-border/30 text-muted-foreground/30 cursor-not-allowed line-through'
                            )}
                          >
                            {formatTime(slot.time)}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {slots?.every(s => !s.available) && !slotsLoading && (
                    <p className="text-center text-muted-foreground py-6">Sem horários disponíveis nesta data. Escolha outro dia.</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Confirm */}
            {step === 4 && (
              <div className="animate-fade-in">
                <h2 className="font-display text-2xl font-semibold mb-1">Confirmar agendamento</h2>
                <p className="text-muted-foreground text-sm mb-6">Revise os detalhes antes de confirmar</p>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-muted/30 border border-border">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Serviços</p>
                    {selectedServices.map(s => (
                      <div key={s.id} className="flex justify-between text-sm py-1">
                        <span className="flex items-center gap-2"><Scissors className="w-3.5 h-3.5 text-primary" />{s.name}</span>
                        <span>{formatCurrency(s.price)}</span>
                      </div>
                    ))}
                    <div className="border-t border-border mt-2 pt-2 flex justify-between font-semibold">
                      <span>Total ({totalDuration}min)</span>
                      <span className="gold-text">{formatCurrency(totalPrice)}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/30 border border-border">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Barbeiro</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center text-sm font-bold text-black">
                        {selectedBarber?.user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{selectedBarber?.user.name}</p>
                        {selectedBarber?.specialty && <p className="text-xs text-muted-foreground">{selectedBarber.specialty}</p>}
                      </div>
                    </div>
                  </div>

                  {selectedSlot && (
                    <div className="p-4 rounded-xl bg-muted/30 border border-border">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Data e Horário</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <p className="font-medium">
                          {format(parseISO(selectedSlot), "EEEE, d 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {bookingError && (
                  <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                    {bookingError}
                  </div>
                )}

                {!isAuthenticated && (
                  <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20 text-sm text-primary">
                    Você precisa estar logado para confirmar o agendamento.{' '}
                    <button onClick={() => navigate('/login')} className="underline font-medium">Entrar agora</button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex gap-3">
          {step > 1 && (
            <Button id="prev-step-btn" variant="outline" size="lg" onClick={() => setStep(step - 1)} className="flex-1">
              <ChevronLeft className="w-5 h-5" /> Anterior
            </Button>
          )}
          {step < 4 ? (
            <Button
              id="next-step-btn"
              variant="gold"
              size="lg"
              className="flex-1"
              disabled={!canNext()}
              onClick={() => setStep(step + 1)}
            >
              Próximo <ChevronRight className="w-5 h-5" />
            </Button>
          ) : (
            <Button
              id="confirm-booking-btn"
              variant="gold"
              size="lg"
              className="flex-1"
              disabled={!isAuthenticated}
              loading={bookMutation.isPending}
              onClick={() => bookMutation.mutate()}
            >
              <CheckCircle className="w-5 h-5" /> Confirmar Agendamento
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
