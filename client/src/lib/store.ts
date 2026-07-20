import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'CLIENT' | 'BARBER' | 'ADMIN';
  barberProfileId?: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        localStorage.setItem('barberflow_token', token);
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('barberflow_token');
        localStorage.removeItem('barberflow_user');
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'barberflow_auth',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);

// Booking flow store
export interface BookingState {
  selectedServices: Service[];
  selectedBarber: Barber | null;
  selectedSlot: string | null;
  step: number;
  setServices: (services: Service[]) => void;
  setBarber: (barber: Barber | null) => void;
  setSlot: (slot: string | null) => void;
  setStep: (step: number) => void;
  reset: () => void;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  durationMin: number;
  imageUrl?: string;
}

export interface Barber {
  id: string;
  userId: string;
  bio?: string;
  avatarUrl?: string;
  specialty?: string;
  isAvailable: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

const initialBookingState = {
  selectedServices: [] as Service[],
  selectedBarber: null as Barber | null,
  selectedSlot: null as string | null,
  step: 1,
};

export const useBookingStore = create<BookingState>((set) => ({
  ...initialBookingState,
  setServices: (services) => set({ selectedServices: services }),
  setBarber: (barber) => set({ selectedBarber: barber }),
  setSlot: (slot) => set({ selectedSlot: slot }),
  setStep: (step) => set({ step }),
  reset: () => set(initialBookingState),
}));
