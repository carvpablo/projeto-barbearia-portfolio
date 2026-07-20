import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { addDays, setHours, setMinutes } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data
  await prisma.appointmentService.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.barberProfile.deleteMany();
  await prisma.service.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('123456', 10);

  // Create Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@barberflow.com',
      name: 'Admin BarberFlow',
      phone: '(11) 99999-0000',
      passwordHash,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin created:', admin.email);

  // Create Barbers
  const barber1User = await prisma.user.create({
    data: {
      email: 'carlos@barberflow.com',
      name: 'Carlos Mendes',
      phone: '(11) 98888-1111',
      passwordHash,
      role: 'BARBER',
      BarberProfile: {
        create: {
          bio: 'Especialista em cortes classicos e degrade. 10 anos de experiencia.',
          specialty: 'Degrade & Navalhado',
          avatarUrl: 'https://api.dicebear.com/7.x/personas/svg?seed=Carlos',
          isAvailable: true,
        },
      },
    },
    include: { BarberProfile: true },
  });

  const barber2User = await prisma.user.create({
    data: {
      email: 'rafael@barberflow.com',
      name: 'Rafael Silva',
      phone: '(11) 98888-2222',
      passwordHash,
      role: 'BARBER',
      BarberProfile: {
        create: {
          bio: 'Mestre em barba e tratamentos capilares. Certificado internacional.',
          specialty: 'Barba & Tratamentos',
          avatarUrl: 'https://api.dicebear.com/7.x/personas/svg?seed=Rafael',
          isAvailable: true,
        },
      },
    },
    include: { BarberProfile: true },
  });

  const barber3User = await prisma.user.create({
    data: {
      email: 'lucas@barberflow.com',
      name: 'Lucas Ferreira',
      phone: '(11) 98888-3333',
      passwordHash,
      role: 'BARBER',
      BarberProfile: {
        create: {
          bio: 'Especialista em cortes modernos e tendencias internacionais.',
          specialty: 'Cortes Modernos',
          avatarUrl: 'https://api.dicebear.com/7.x/personas/svg?seed=Lucas',
          isAvailable: true,
        },
      },
    },
    include: { BarberProfile: true },
  });

  console.log('✅ Barbers created');

  // Create Client
  const client = await prisma.user.create({
    data: {
      email: 'cliente@barberflow.com',
      name: 'Joao Santos',
      phone: '(11) 97777-4444',
      passwordHash,
      role: 'CLIENT',
    },
  });
  console.log('✅ Client created:', client.email);

  // Create Services
  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: 'Corte Classico',
        description: 'Corte tradicional com tesoura e maquina, finalizado com produtos premium.',
        price: 45.0,
        durationMin: 30,
        imageUrl: 'https://images.unsplash.com/photo-1599011176306-4a96f1516d4d?w=400',
      },
    }),
    prisma.service.create({
      data: {
        name: 'Corte + Barba',
        description: 'Combo completo: corte personalizado e modelagem de barba com navalha.',
        price: 75.0,
        durationMin: 60,
        imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400',
      },
    }),
    prisma.service.create({
      data: {
        name: 'Barba Completa',
        description: 'Modelagem, hidratacao e acabamento perfeito com navalha quente.',
        price: 40.0,
        durationMin: 30,
        imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400',
      },
    }),
    prisma.service.create({
      data: {
        name: 'Degrade Americano',
        description: 'Degrade perfeito nas laterais com finalizacao impecavel.',
        price: 55.0,
        durationMin: 45,
        imageUrl: 'https://images.unsplash.com/photo-1567894340315-735d7c361db0?w=400',
      },
    }),
    prisma.service.create({
      data: {
        name: 'Tratamento Capilar',
        description: 'Hidratacao profunda e tratamento anticaspa com produtos profissionais.',
        price: 60.0,
        durationMin: 45,
        imageUrl: 'https://images.unsplash.com/photo-1571454870646-86bf1e5b25ae?w=774',
      },
    }),
    prisma.service.create({
      data: {
        name: 'Sobrancelha',
        description: 'Design e alinhamento de sobrancelha masculina com cera e tesoura.',
        price: 20.0,
        durationMin: 15,
        imageUrl: 'https://images.unsplash.com/photo-1783013951101-2d9ed3eac234?w=774',
      },
    }),
  ]);

  console.log('✅ Services created:', services.length);

  // Create sample appointments
  const barber1Profile = barber1User.BarberProfile!;
  const barber2Profile = barber2User.BarberProfile!;

  const tomorrow = addDays(new Date(), 1);
  const appt1Start = setMinutes(setHours(tomorrow, 10), 0);
  const appt1End = setMinutes(setHours(tomorrow, 10), 30);

  await prisma.appointment.create({
    data: {
      clientId: client.id,
      barberId: barber1Profile.id,
      startTime: appt1Start,
      endTime: appt1End,
      status: 'CONFIRMED',
      services: {
        create: [{ serviceId: services[0].id }],
      },
    },
  });

  const appt2Start = setMinutes(setHours(tomorrow, 14), 0);
  const appt2End = setMinutes(setHours(tomorrow, 15), 0);

  await prisma.appointment.create({
    data: {
      clientId: client.id,
      barberId: barber2Profile.id,
      startTime: appt2Start,
      endTime: appt2End,
      status: 'CONFIRMED',
      services: {
        create: [{ serviceId: services[1].id }],
      },
    },
  });

  console.log('✅ Sample appointments created');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 Test accounts (password: 123456):');
  console.log('  👑 Admin:   admin@barberflow.com');
  console.log('  ✂️  Barber1: carlos@barberflow.com');
  console.log('  ✂️  Barber2: rafael@barberflow.com');
  console.log('  ✂️  Barber3: lucas@barberflow.com');
  console.log('  👤 Client:  cliente@barberflow.com');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
