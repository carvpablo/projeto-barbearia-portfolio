import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Scissors, Mail, Lock, Eye, EyeOff, User, Phone } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import api from '../lib/api';
import { useAuthStore } from '../lib/store';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
});

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

interface AuthPageProps {
  mode?: 'login' | 'register';
}

export function AuthPage({ mode = 'login' }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const loginForm = useForm<LoginData>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterData>({ resolver: zodResolver(registerSchema) });

  const handleLogin = async (data: LoginData) => {
    setServerError('');
    try {
      const res = await api.post('/auth/login', data);
      setAuth(res.data.user, res.data.token);
      const role = res.data.user.role;
      if (role === 'ADMIN') navigate('/admin');
      else if (role === 'BARBER') navigate('/barber');
      else navigate('/dashboard');
    } catch (err: any) {
      setServerError(err.response?.data?.error || 'Erro ao fazer login. Tente novamente.');
    }
  };

  const handleRegister = async (data: RegisterData) => {
    setServerError('');
    try {
      const res = await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
      });
      setAuth(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      setServerError(err.response?.data?.error || 'Erro ao cadastrar. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 hero-pattern opacity-30" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 rounded-2xl gold-gradient flex items-center justify-center shadow-xl shadow-yellow-500/20 group-hover:scale-105 transition-transform">
              <Scissors className="w-6 h-6 text-black" />
            </div>
            <span className="font-display text-2xl font-bold gold-text">BarberFlow</span>
          </Link>
        </div>

        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-display">
              {isLogin ? 'Bem-vindo de volta' : 'Criar conta'}
            </CardTitle>
            <CardDescription>
              {isLogin
                ? 'Entre com sua conta para agendar'
                : 'Junte-se ao BarberFlow e agende agora'}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            {/* Toggle */}
            <div className="flex p-1 rounded-xl bg-muted mb-6">
              <button
                id="login-tab"
                type="button"
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${isLogin ? 'bg-card shadow-md text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => { setIsLogin(true); setServerError(''); }}
              >
                Entrar
              </button>
              <button
                id="register-tab"
                type="button"
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${!isLogin ? 'bg-card shadow-md text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => { setIsLogin(false); setServerError(''); }}
              >
                Cadastrar
              </button>
            </div>

            {serverError && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                {serverError}
              </div>
            )}

            {isLogin ? (
              <form id="login-form" onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                <Input
                  id="login-email"
                  label="Email"
                  type="email"
                  placeholder="seu@email.com"
                  icon={<Mail className="w-4 h-4" />}
                  error={loginForm.formState.errors.email?.message}
                  {...loginForm.register('email')}
                />
                <div className="relative">
                  <Input
                    id="login-password"
                    label="Senha"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    icon={<Lock className="w-4 h-4" />}
                    error={loginForm.formState.errors.password?.message}
                    {...loginForm.register('password')}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="p-3 rounded-lg bg-muted/50 border border-border text-xs text-muted-foreground">
                  <p className="font-medium text-foreground/70 mb-1">Contas de teste (senha: 123456):</p>
                  <p>👤 cliente@barberflow.com</p>
                  <p>✂️ carlos@barberflow.com</p>
                  <p>👑 admin@barberflow.com</p>
                </div>

                <Button id="login-submit-btn" type="submit" variant="gold" size="lg" className="w-full"
                  loading={loginForm.formState.isSubmitting}>
                  Entrar
                </Button>
              </form>
            ) : (
              <form id="register-form" onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                <Input
                  id="register-name"
                  label="Nome completo"
                  placeholder="João Silva"
                  icon={<User className="w-4 h-4" />}
                  error={registerForm.formState.errors.name?.message}
                  {...registerForm.register('name')}
                />
                <Input
                  id="register-email"
                  label="Email"
                  type="email"
                  placeholder="seu@email.com"
                  icon={<Mail className="w-4 h-4" />}
                  error={registerForm.formState.errors.email?.message}
                  {...registerForm.register('email')}
                />
                <Input
                  id="register-phone"
                  label="Telefone (opcional)"
                  type="tel"
                  placeholder="(11) 99999-0000"
                  icon={<Phone className="w-4 h-4" />}
                  {...registerForm.register('phone')}
                />
                <div className="relative">
                  <Input
                    id="register-password"
                    label="Senha"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mín. 6 caracteres"
                    icon={<Lock className="w-4 h-4" />}
                    error={registerForm.formState.errors.password?.message}
                    {...registerForm.register('password')}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <Input
                  id="register-confirm-password"
                  label="Confirmar senha"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  icon={<Lock className="w-4 h-4" />}
                  error={registerForm.formState.errors.confirmPassword?.message}
                  {...registerForm.register('confirmPassword')}
                />
                <Button id="register-submit-btn" type="submit" variant="gold" size="lg" className="w-full"
                  loading={registerForm.formState.isSubmitting}>
                  Criar Conta
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
