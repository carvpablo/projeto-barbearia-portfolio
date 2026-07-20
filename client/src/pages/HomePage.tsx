import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Scissors, Star, Clock, Shield, ChevronRight, MapPin, Phone, AtSign, Award } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import api from '../lib/api';
import { formatCurrency, cn } from '../lib/utils';

interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  durationMin: number;
  imageUrl?: string;
}

interface Barber {
  id: string;
  bio?: string;
  specialty?: string;
  avatarUrl?: string;
  user: { name: string };
}

export function HomePage() {
  const navigate = useNavigate();

  const { data: services } = useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: () => api.get('/services').then((r) => r.data),
  });

  const { data: barbers } = useQuery<Barber[]>({
    queryKey: ['barbers'],
    queryFn: () => api.get('/barbers').then((r) => r.data),
  });

  const features = [
    { icon: Clock, title: 'Agendamento Rápido', desc: 'Marque em menos de 2 minutos, 24 horas por dia.' },
    { icon: Shield, title: 'Garantia de Horário', desc: 'Confirmação imediata, sem surpresas.' },
    { icon: Star, title: 'Barbeiros Premium', desc: 'Profissionais certificados e altamente avaliados.' },
    { icon: Award, title: 'Experiência Única', desc: 'Ambiente sofisticado para o homem moderno.' },
  ];

  return (
    <main>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden hero-pattern">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-in">
              <Scissors className="w-4 h-4" />
              Premium Barbershop Experience
            </div>

            {/* Title */}
            <h1 className="font-display text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.1] mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              A Arte do{' '}
              <span className="gold-text">Corte</span>{' '}
              Perfeito
            </h1>

            <p className="text-xl text-muted-foreground max-w-xl leading-relaxed mb-10 animate-fade-in mx-auto" style={{ animationDelay: '0.2s' }}>
              Agende com os melhores barbeiros da cidade. Cortes, barba e tratamentos premium. 
              <span className="text-foreground"> Sua melhor versão começa aqui.</span>
            </p>

            <div className="flex flex-wrap gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Button id="hero-booking-btn" variant="gold" size="lg" onClick={() => navigate('/booking')} className="group">
                Agendar Agora
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button id="hero-services-btn" variant="outline" size="lg" onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}>
                Ver Serviços
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 mt-14 justify-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
              {[
                { value: '500+', label: 'Clientes satisfeitos' },
                { value: '3', label: 'Barbeiros expert' },
                { value: '6', label: 'Serviços premium' },
                { value: '5★', label: 'Avaliação média' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-3xl font-bold gold-text">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative scissors */}
        <div className="hidden lg:block absolute right-10 top-1/2 -translate-y-1/2 opacity-5">
          <Scissors className="w-96 h-96 text-primary rotate-45" />
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="flex flex-col items-start gap-3 p-6 rounded-xl hover:bg-muted/30 transition-colors">
                <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center shadow-lg shadow-yellow-500/20">
                  <f.icon className="w-6 h-6 text-black" />
                </div>
                <h3 className="font-semibold text-lg">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-primary text-sm font-medium uppercase tracking-widest mb-3">Nossos Serviços</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              O que oferecemos
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Cada serviço é executado com precisão e dedicação, usando os melhores produtos do mercado.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(services || Array(6).fill(null)).map((service, i) => (
              <Card key={service?.id || i} className="group overflow-hidden hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 cursor-pointer"
                onClick={() => navigate('/booking')}>
                {service ? (
                  <>
                    {service.imageUrl && (
                      <div className="h-64 overflow-hidden">
                        <img
                          src={service.imageUrl}
                          alt={service.name}
                          className={cn(
                            'w-full h-full object-cover group-hover:scale-105 transition-transform duration-500',
                            {
                              'object-top': service.name === 'Corte Classico',
                              'object-bottom': service.name === 'Degrade Americano',
                            }
                          )}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{service.name}</h3>
                        <span className="text-xl font-bold gold-text shrink-0">{formatCurrency(service.price)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{service.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        {service.durationMin} minutos
                      </div>
                    </CardContent>
                  </>
                ) : (
                  <div className="h-52 skeleton" />
                )}
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button id="book-services-btn" variant="gold" size="lg" onClick={() => navigate('/booking')}>
              Agendar um Serviço <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Barbers */}
      <section id="barbers" className="py-24 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-primary text-sm font-medium uppercase tracking-widest mb-3">Nossa Equipe</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Conheça os Artistas
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Profissionais apaixonados pelo que fazem, prontos para transformar seu visual.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {(barbers || Array(3).fill(null)).map((barber, i) => (
              <div key={barber?.id || i} className="text-center group">
                {barber ? (
                  <>
                    <div className="relative inline-block mb-5">
                      <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-primary/20 group-hover:border-primary/50 transition-all duration-300 shadow-xl shadow-black/30">
                        {barber.avatarUrl ? (
                          <img src={barber.avatarUrl} alt={barber.user.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full gold-gradient flex items-center justify-center text-4xl font-bold text-black">
                            {barber.user.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full gold-gradient flex items-center justify-center shadow-lg">
                        <Scissors className="w-4 h-4 text-black" />
                      </div>
                    </div>
                    <h3 className="font-display text-xl font-semibold mb-1">{barber.user.name}</h3>
                    {barber.specialty && (
                      <p className="text-primary text-sm font-medium mb-3">{barber.specialty}</p>
                    )}
                    <p className="text-sm text-muted-foreground mb-5 max-w-xs mx-auto leading-relaxed">{barber.bio}</p>
                    <Button id={`book-barber-${barber.id}`} variant="outline" size="sm" onClick={() => navigate('/booking')}>
                      Agendar com este barbeiro
                    </Button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="w-32 h-32 mx-auto rounded-full skeleton" />
                    <div className="h-5 w-32 mx-auto skeleton rounded" />
                    <div className="h-3 w-48 mx-auto skeleton rounded" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 gold-gradient opacity-5" />
        <div className="absolute inset-0 hero-pattern opacity-30" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Pronto para uma{' '}
            <span className="gold-text">Transformação?</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10">
            Agende agora e experimente o melhor da barbearia premium. Seu novo visual está a um clique de distância.
          </p>
          <Button id="cta-booking-btn" variant="gold" size="lg" onClick={() => navigate('/booking')} className="text-lg px-10">
            Agendar Agora
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl gold-gradient flex items-center justify-center">
                  <Scissors className="w-5 h-5 text-black" />
                </div>
                <span className="font-display text-xl font-bold gold-text">BarberFlow</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A experiência de barbearia premium que você merece. Tradição e modernidade em cada corte.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Horário de Funcionamento</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Segunda a Sexta: 8h — 19h</p>
                <p>Sábado: 8h — 17h</p>
                <p>Domingo: Fechado</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" /> (11) 99999-0000
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Rua dos Barbeiros, 123
                </div>
                <div className="flex items-center gap-2">
                  <AtSign className="w-4 h-4" /> @barberflow
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2026 BarberFlow. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </main>
  );
}
