import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password';

const prisma = new PrismaClient();

async function main() {
  console.log('🙏 Starting prayer requests seeding...');

  // Create a test user first
  const hashedPassword = await hashPassword('123456');
  
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'João Silva',
      password: hashedPassword,
      city: 'São Paulo',
      country: 'Brasil',
      latitude: -23.5505,
      longitude: -46.6333,
      timezone: 'America/Sao_Paulo'
    }
  });

  // Get Portuguese language
  const portugueseLanguage = await prisma.language.findUnique({
    where: { code: 'pt' }
  });

  // Get some categories
  const healthCategory = await prisma.category.findUnique({
    where: { slug: 'saude' }
  });

  const familyCategory = await prisma.category.findUnique({
    where: { slug: 'familia' }
  });

  const workCategory = await prisma.category.findUnique({
    where: { slug: 'trabalho' }
  });

  const gratitudeCategory = await prisma.category.findUnique({
    where: { slug: 'gratidao' }
  });

  if (!portugueseLanguage || !healthCategory || !familyCategory || !workCategory || !gratitudeCategory) {
    console.error('Required data not found. Please run the main seed first.');
    return;
  }

  // Create sample prayer requests
  const prayerRequests = [
    {
      content: 'Peço orações pela recuperação da minha mãe que está internada no hospital. Ela está passando por um momento difícil e precisa de força para se recuperar. Que Deus a abençoe com saúde e paz.',
      urgent: true,
      privacy: 'PUBLIC' as const,
      userId: testUser.id,
      categoryId: healthCategory.id,
      languageId: portugueseLanguage.id,
      city: 'São Paulo',
      country: 'Brasil',
      latitude: -23.5505,
      longitude: -46.6333
    },
    {
      content: 'Agradeço a Deus pelas bênçãos recebidas esta semana. Consegui um novo emprego e estou muito grato por esta oportunidade. Peço orações para que eu possa ser uma luz no meu novo ambiente de trabalho.',
      urgent: false,
      privacy: 'PUBLIC' as const,
      userId: testUser.id,
      categoryId: gratitudeCategory.id,
      languageId: portugueseLanguage.id,
      city: 'São Paulo',
      country: 'Brasil',
      latitude: -23.5505,
      longitude: -46.6333
    },
    {
      content: 'Peço orações pela minha família. Estamos passando por um período de dificuldades financeiras e precisamos de sabedoria para tomar as decisões certas. Que Deus nos guie e nos dê força.',
      urgent: false,
      privacy: 'PUBLIC' as const,
      userId: testUser.id,
      categoryId: familyCategory.id,
      languageId: portugueseLanguage.id,
      city: 'São Paulo',
      country: 'Brasil',
      latitude: -23.5505,
      longitude: -46.6333
    },
    {
      content: 'Preciso de orações para uma entrevista de emprego importante que tenho amanhã. Estou nervoso mas confiante de que Deus tem o melhor plano para minha vida. Peço sabedoria e tranquilidade.',
      urgent: true,
      privacy: 'PUBLIC' as const,
      userId: testUser.id,
      categoryId: workCategory.id,
      languageId: portugueseLanguage.id,
      city: 'São Paulo',
      country: 'Brasil',
      latitude: -23.5505,
      longitude: -46.6333
    },
    {
      content: 'Peço orações pela saúde mental da minha irmã que está passando por depressão. Que Deus a console e lhe dê esperança. Também peço sabedoria para nossa família saber como apoiá-la melhor.',
      urgent: false,
      privacy: 'PUBLIC' as const,
      userId: testUser.id,
      categoryId: healthCategory.id,
      languageId: portugueseLanguage.id,
      city: 'São Paulo',
      country: 'Brasil',
      latitude: -23.5505,
      longitude: -46.6333
    }
  ];

  for (const prayer of prayerRequests) {
    await prisma.prayerRequest.create({
      data: prayer
    });
  }

  console.log(`✅ Created ${prayerRequests.length} sample prayer requests!`);
}

main()
  .catch((e) => {
    console.error('❌ Error during prayer seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
