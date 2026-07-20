import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Scissors, Calendar, LogOut, Menu, X, User, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../lib/store';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return '/dashboard';
    if (user.role === 'ADMIN') return '/admin';
    if (user.role === 'BARBER') return '/barber';
    return '/dashboard';
  };

  const navLinks = [
    { href: '/', label: 'Início' },
    { href: '/booking', label: 'Agendar' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl gold-gradient flex items-center justify-center shadow-lg shadow-yellow-500/20 group-hover:scale-105 transition-transform">
            <Scissors className="w-5 h-5 text-black" />
          </div>
          <span className="font-display text-xl font-bold gold-text">BarberFlow</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                'text-sm font-medium transition-colors duration-200',
                location.pathname === link.href
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth Area */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                id="user-menu-btn"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center text-black font-bold text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium max-w-[120px] truncate">{user.name}</span>
                <ChevronDown className={cn('w-4 h-4 text-muted-foreground transition-transform', userMenuOpen && 'rotate-180')} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 glass-card border border-border py-1 shadow-xl animate-fade-in">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-xs text-muted-foreground">Conectado como</p>
                    <p className="text-sm font-semibold truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                      {user.role === 'CLIENT' ? 'Cliente' : user.role === 'BARBER' ? 'Barbeiro' : 'Admin'}
                    </span>
                  </div>
                  <Link
                    to={getDashboardLink()}
                    id="dashboard-link"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    Meu Painel
                  </Link>
                  <button
                    id="logout-btn"
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                Entrar
              </Button>
              <Button variant="gold" size="sm" onClick={() => navigate('/register')}>
                Cadastrar
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          id="mobile-menu-btn"
          className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl px-4 py-4 space-y-3 animate-fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-border flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Link to={getDashboardLink()} onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <User className="w-4 h-4" /> Meu Painel
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-destructive" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" /> Sair
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" className="w-full" onClick={() => { navigate('/login'); setMobileOpen(false); }}>
                  Entrar
                </Button>
                <Button variant="gold" size="sm" className="w-full" onClick={() => { navigate('/register'); setMobileOpen(false); }}>
                  Cadastrar
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
