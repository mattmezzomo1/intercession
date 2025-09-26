import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Seed Languages
  console.log('📝 Seeding languages...');
  const languages = [
    { code: 'pt', name: 'Português', nativeName: 'Português' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'es', name: 'Español', nativeName: 'Español' },
    { code: 'fr', name: 'Français', nativeName: 'Français' },
    { code: 'de', name: 'Deutsch', nativeName: 'Deutsch' },
    { code: 'it', name: 'Italiano', nativeName: 'Italiano' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' }
  ];

  for (const language of languages) {
    await prisma.language.upsert({
      where: { code: language.code },
      update: {},
      create: language
    });
  }

  // Seed Categories
  console.log('📝 Seeding categories...');
  const categories = [
    { name: 'Saúde', slug: 'saude' },
    { name: 'Família', slug: 'familia' },
    { name: 'Trabalho', slug: 'trabalho' },
    { name: 'Relacionamentos', slug: 'relacionamentos' },
    { name: 'Estudos', slug: 'estudos' },
    { name: 'Finanças', slug: 'financas' },
    { name: 'Viagem', slug: 'viagem' },
    { name: 'Ministério', slug: 'ministerio' },
    { name: 'Comunidade', slug: 'comunidade' },
    { name: 'Gratidão', slug: 'gratidao' },
    { name: 'Perdão', slug: 'perdao' },
    { name: 'Sabedoria', slug: 'sabedoria' },
    { name: 'Proteção', slug: 'protecao' },
    { name: 'Cura', slug: 'cura' },
    { name: 'Paz', slug: 'paz' },
    { name: 'Conversão', slug: 'conversao' }
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category
    });
  }

  // Get Portuguese language ID for Word of Day seeding
  const portugueseLanguage = await prisma.language.findUnique({
    where: { code: 'pt' }
  });

  if (portugueseLanguage) {
    console.log('📝 Seeding Word of Day (Portuguese)...');
    
    const wordsOfDay = [
      {
        date: new Date('2025-01-01'),
        word: 'ESPERANÇA',
        verse: 'Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor; pensamentos de paz e não de mal, para vos dar o fim que esperais.',
        reference: 'Jeremias 29:11',
        devotionalTitle: 'A Esperança que Não Falha',
        devotionalContent: 'Em meio às incertezas da vida, a esperança cristã se destaca como uma âncora para a alma. Não é uma esperança vaga ou baseada em circunstâncias, mas uma esperança fundamentada nas promessas imutáveis de Deus. Quando Jeremias escreveu estas palavras ao povo de Israel no exílio, eles estavam passando por um dos períodos mais difíceis de sua história. Longe de casa, em terra estranha, poderia parecer que Deus os havia abandonado.',
        devotionalReflection: 'Hoje, reflita sobre as áreas de sua vida onde você precisa renovar sua esperança. Lembre-se de que os planos de Deus para você são de bem e não de mal. Mesmo quando não conseguimos ver o caminho à frente, podemos confiar que Ele está trabalhando todas as coisas para o nosso bem.',
        prayerTitle: 'Oração pela Esperança Renovada',
        prayerContent: 'Senhor, obrigado por Teus planos perfeitos para minha vida. Quando as circunstâncias parecem difíceis e o futuro incerto, ajuda-me a lembrar que Tu tens pensamentos de paz para comigo. Renova minha esperança hoje e ajuda-me a confiar em Tua bondade e fidelidade. Em nome de Jesus, amém.',
        prayerDuration: '2 minutos',
        languageId: portugueseLanguage.id
      },
      {
        date: new Date('2025-01-02'),
        word: 'GRATIDÃO',
        verse: 'Em tudo dai graças, porque esta é a vontade de Deus em Cristo Jesus para convosco.',
        reference: '1 Tessalonicenses 5:18',
        devotionalTitle: 'O Poder Transformador da Gratidão',
        devotionalContent: 'A gratidão não é apenas uma emoção passageira, mas uma escolha deliberada que transforma nossa perspectiva. Paulo nos ensina que devemos dar graças "em tudo", não apenas pelas coisas boas. Isso não significa que devemos ser gratos pelo mal ou pelo sofrimento, mas que podemos encontrar razões para gratidão mesmo nas circunstâncias mais desafiadoras.',
        devotionalReflection: 'A gratidão muda nosso foco do que nos falta para o que temos. Ela nos conecta com a bondade de Deus e nos lembra de Sua fidelidade constante. Quando cultivamos um coração grato, descobrimos que nossa alegria não depende das circunstâncias externas.',
        prayerTitle: 'Oração de Gratidão',
        prayerContent: 'Pai celestial, obrigado por todas as bênçãos em minha vida. Ajuda-me a ter olhos para ver Tua bondade mesmo nos momentos difíceis. Que meu coração seja sempre grato e que eu possa expressar essa gratidão não apenas em palavras, mas em ações. Obrigado por Teu amor incondicional. Amém.',
        prayerDuration: '2 minutos',
        languageId: portugueseLanguage.id
      },
      {
        date: new Date('2025-01-03'),
        word: 'PAZ',
        verse: 'Deixo-vos a paz, a minha paz vos dou; não vo-la dou como o mundo a dá. Não se turbe o vosso coração, nem se atemorize.',
        reference: 'João 14:27',
        devotionalTitle: 'A Paz que Excede Todo Entendimento',
        devotionalContent: 'A paz que Jesus oferece é diferente de qualquer paz que o mundo pode dar. Não é a ausência de problemas ou conflitos, mas a presença de Deus em meio às tempestades da vida. É uma paz que permanece mesmo quando as circunstâncias são turbulentas, porque está fundamentada não no que acontece ao nosso redor, mas em quem Deus é.',
        devotionalReflection: 'Esta paz divina não depende de nossa capacidade de controlar as situações, mas de nossa confiança em Deus. Ela vem quando entregamos nossos medos, ansiedades e preocupações aos cuidados do Pai celestial. É uma paz que guarda nossos corações e mentes em Cristo Jesus.',
        prayerTitle: 'Oração pela Paz Interior',
        prayerContent: 'Senhor Jesus, obrigado por Tua paz que excede todo entendimento. Em meio às preocupações e ansiedades deste dia, eu escolho receber Tua paz. Acalma meu coração e minha mente. Ajuda-me a confiar em Ti e a descansar em Tua soberania. Que Tua paz reine em meu coração hoje. Amém.',
        prayerDuration: '2 minutos',
        languageId: portugueseLanguage.id
      }
    ];

    for (const wordOfDay of wordsOfDay) {
      await prisma.wordOfDay.upsert({
        where: { 
          date_languageId: { 
            date: wordOfDay.date, 
            languageId: wordOfDay.languageId 
          } 
        },
        update: {},
        create: wordOfDay
      });
    }
  }

  // Get English language ID for English Word of Day
  const englishLanguage = await prisma.language.findUnique({
    where: { code: 'en' }
  });

  if (englishLanguage) {
    console.log('📝 Seeding Word of Day (English)...');
    
    const englishWordsOfDay = [
      {
        date: new Date('2025-01-01'),
        word: 'HOPE',
        verse: 'For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope.',
        reference: 'Jeremiah 29:11',
        devotionalTitle: 'The Hope That Never Fails',
        devotionalContent: 'In the midst of life\'s uncertainties, Christian hope stands out as an anchor for the soul. It\'s not a vague hope or one based on circumstances, but a hope grounded in God\'s unchanging promises. When Jeremiah wrote these words to the people of Israel in exile, they were going through one of the most difficult periods in their history.',
        devotionalReflection: 'Today, reflect on the areas of your life where you need to renew your hope. Remember that God\'s plans for you are good and not evil. Even when we can\'t see the path ahead, we can trust that He is working all things for our good.',
        prayerTitle: 'Prayer for Renewed Hope',
        prayerContent: 'Lord, thank You for Your perfect plans for my life. When circumstances seem difficult and the future uncertain, help me remember that You have thoughts of peace toward me. Renew my hope today and help me trust in Your goodness and faithfulness. In Jesus\' name, amen.',
        prayerDuration: '2 minutes',
        languageId: englishLanguage.id
      }
    ];

    for (const wordOfDay of englishWordsOfDay) {
      await prisma.wordOfDay.upsert({
        where: { 
          date_languageId: { 
            date: wordOfDay.date, 
            languageId: wordOfDay.languageId 
          } 
        },
        update: {},
        create: wordOfDay
      });
    }
  }

  console.log('✅ Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
