import axios from 'axios';
import * as cheerio from 'cheerio';
import OpenAI from 'openai';
import prisma from '../utils/database';
import { screenshotService } from './screenshotService';

// Initialize OpenAI (will be null if no API key is provided)
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

interface ScrapedVerse {
  verse: string;
  reference: string;
}

interface GeneratedContent {
  devotionalTitle: string;
  devotionalContent: string;
  devotionalReflection: string;
  prayerTitle: string;
  prayerContent: string;
  prayerDuration: string;
}

export class WordOfDayService {
  /**
   * Get verse of the day from Bible.com using screenshot + OpenAI Vision
   */
  async scrapeVerseOfTheDay(): Promise<ScrapedVerse> {
    try {
      console.log('🔍 Getting verse of the day from Bible.com using screenshot...');

      // First, try traditional scraping as a quick attempt
      try {
        const traditionalResult = await this.tryTraditionalScraping();
        if (traditionalResult) {
          return traditionalResult;
        }
      } catch (e) {
        console.log('Traditional scraping failed, proceeding with screenshot method...');
      }

      // Use screenshot + OpenAI Vision method
      const url = 'https://www.bible.com/pt/verse-of-the-day';

      // Take screenshot
      const screenshotPath = await screenshotService.takeScreenshot(url);

      // Extract verse using OpenAI Vision
      const extractedVerse = await screenshotService.extractVerseFromImage(screenshotPath);

      // Clean up old screenshots
      await screenshotService.cleanupOldScreenshots();

      console.log('✅ Successfully extracted verse using screenshot + OpenAI Vision:', {
        verse: extractedVerse.verse.substring(0, 50) + '...',
        reference: extractedVerse.reference
      });

      return extractedVerse;

    } catch (error) {
      console.error('❌ Error getting verse of the day:', error);
      // Try alternative approach before giving up
      return await this.getVerseFromAlternativeSource();
    }
  }

  /**
   * Try traditional scraping first (faster if it works)
   */
  private async tryTraditionalScraping(): Promise<ScrapedVerse | null> {
    try {
      const response = await axios.get('https://www.bible.com/pt/verse-of-the-day', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout: 5000
      });

      const $ = cheerio.load(response.data);

      // Look for JSON data in script tags
      let foundData: { verse: string; reference: string } | null = null;
      $('script').each((i, elem): boolean | void => {
        const scriptContent = $(elem).html();
        if (scriptContent && scriptContent.includes('__NEXT_DATA__')) {
          try {
            const jsonMatch = scriptContent.match(/__NEXT_DATA__\s*=\s*({.*?});?\s*$/);
            if (jsonMatch) {
              const data = JSON.parse(jsonMatch[1]);
              if (data.props?.pageProps?.votd) {
                const verseData = data.props.pageProps.votd;
                if (verseData.content && verseData.reference) {
                  const verse = verseData.content.replace(/"/g, '').trim();
                  const reference = verseData.reference.human || verseData.reference;

                  console.log('✅ Traditional scraping successful');
                  foundData = { verse, reference };
                  return false; // Break out of each loop
                }
              }
            }
          } catch (e) {
            // Continue to next script tag
          }
        }
        return undefined;
      });

      return foundData;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get verse from alternative sources when main scraping fails
   */
  private async getVerseFromAlternativeSource(): Promise<ScrapedVerse> {
    try {
      // Try YouVersion API or other Bible APIs
      console.log('🔍 Trying alternative Bible sources...');

      // For now, we'll use a more robust approach with multiple Bible sites
      const alternativeSources = [
        'https://www.bibliaonline.com.br/acf',
        'https://www.bibliaon.com/',
        'https://www.bible.com/pt'
      ];

      for (const source of alternativeSources) {
        try {
          console.log(`🔍 Trying source: ${source}`);
          // This is a placeholder - in a real implementation, you'd have specific scraping logic for each source
          // For now, we'll generate a verse using OpenAI based on today's date
          break;
        } catch (sourceError) {
          console.log(`❌ Failed to get verse from ${source}:`, sourceError);
          continue;
        }
      }

      // If all sources fail, use OpenAI to generate a verse selection based on today
      return await this.generateVerseSelection();

    } catch (error) {
      console.error('❌ All alternative sources failed:', error);
      throw new Error('Unable to retrieve verse of the day from any source. Please check your internet connection and try again.');
    }
  }

  /**
   * Use OpenAI to select an appropriate verse for today
   */
  private async generateVerseSelection(): Promise<ScrapedVerse> {
    if (!openai) {
      throw new Error('OpenAI API key is required but not configured. Please set OPENAI_API_KEY environment variable.');
    }

    try {
      console.log('🤖 Using OpenAI to select today\'s verse...');

      const today = new Date();
      const dayOfWeek = today.toLocaleDateString('pt-BR', { weekday: 'long' });
      const dateString = today.toLocaleDateString('pt-BR');

      const prompt = `
Hoje é ${dayOfWeek}, ${dateString}.

Selecione um versículo bíblico apropriado para hoje, considerando:
- O dia da semana e contexto atual
- Mensagem de esperança, fé ou encorajamento
- Relevância para a vida cristã cotidiana

Responda APENAS com um JSON válido:
{
  "verse": "texto completo do versículo em português",
  "reference": "referência bíblica (ex: João 3:16)"
}

Use versículos conhecidos e impactantes da Bíblia.
`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Você é um pastor experiente que conhece profundamente a Bíblia. Selecione versículos apropriados e inspiradores para cada dia."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.8,
        response_format: { type: "json_object" }
      });

      const responseText = completion.choices[0]?.message?.content;
      if (!responseText) {
        throw new Error('No response from OpenAI for verse selection');
      }

      // Clean and parse JSON response (remove markdown formatting if present)
      let cleanedResponse = responseText.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const verseData = JSON.parse(cleanedResponse);

      if (!verseData.verse || !verseData.reference) {
        throw new Error('Invalid verse data from OpenAI');
      }

      console.log('✅ Successfully generated verse selection with OpenAI:', {
        verse: verseData.verse.substring(0, 50) + '...',
        reference: verseData.reference
      });

      return {
        verse: verseData.verse,
        reference: verseData.reference
      };

    } catch (error) {
      console.error('❌ Error generating verse selection with OpenAI:', error);
      throw new Error('Failed to generate verse selection. Please try again later.');
    }
  }

  /**
   * Generate devotional and prayer content using OpenAI
   */
  async generateContent(verse: string, reference: string): Promise<GeneratedContent> {
    if (!openai) {
      throw new Error('OpenAI API key is required but not configured. Please set OPENAI_API_KEY environment variable.');
    }

    console.log('🤖 Generating content with OpenAI...');

    const prompt = `
Baseado no versículo bíblico "${verse}" (${reference}), crie um conteúdo devocional completo em português brasileiro:

1. **Título da Devocional** (máximo 60 caracteres): Um título cativante e inspirador
2. **Conteúdo Devocional** (250-350 palavras):
   - Explique o contexto bíblico do versículo
   - Aplique a mensagem à vida cotidiana moderna
   - Use linguagem acessível e inspiradora
   - Inclua exemplos práticos ou ilustrações
3. **Reflexão Devocional** (120-180 palavras):
   - Perguntas para meditação pessoal
   - Desafios práticos para aplicação
   - Convite à reflexão profunda
4. **Título da Oração** (máximo 50 caracteres): Um título que capture o tema da oração
5. **Oração** (180-250 palavras):
   - Oração pessoal e íntima baseada no versículo
   - Inclua gratidão, pedidos e entrega
   - Use linguagem reverente mas acessível
6. **Duração da Oração**: Tempo estimado em minutos (formato: "X minutos")

IMPORTANTE: Responda APENAS com um JSON válido usando estas chaves exatas:
{
  "devotionalTitle": "...",
  "devotionalContent": "...",
  "devotionalReflection": "...",
  "prayerTitle": "...",
  "prayerContent": "...",
  "prayerDuration": "..."
}

Use linguagem cristã evangélica, inspiradora e adequada para todos os públicos cristãos.
`;

    // Try multiple times with different strategies if needed
    let lastError: Error | null = null;
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 OpenAI attempt ${attempt}/${maxRetries}...`);

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "Você é um pastor evangélico experiente e escritor de devocionais cristãos no Brasil. Crie conteúdo inspirador, biblicamente fundamentado e prático para a vida diária dos cristãos brasileiros. Sempre responda em português brasileiro com linguagem clara e acessível."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7,
          response_format: { type: "json_object" }
        });

        const responseText = completion.choices[0]?.message?.content;
        if (!responseText) {
          throw new Error('No response from OpenAI');
        }

        // Clean and parse JSON response (remove markdown formatting if present)
        let cleanedResponse = responseText.trim();
        if (cleanedResponse.startsWith('```json')) {
          cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanedResponse.startsWith('```')) {
          cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        // Try to parse JSON response
        const content = JSON.parse(cleanedResponse);

        // Validate required fields
        const requiredFields = ['devotionalTitle', 'devotionalContent', 'devotionalReflection', 'prayerTitle', 'prayerContent', 'prayerDuration'];
        for (const field of requiredFields) {
          if (!content[field]) {
            throw new Error(`Missing field: ${field}`);
          }
        }

        console.log('✅ Successfully generated content with OpenAI');
        return content;

      } catch (error) {
        lastError = error as Error;
        console.error(`❌ OpenAI attempt ${attempt} failed:`, error);

        if (attempt < maxRetries) {
          // Wait before retrying (exponential backoff)
          const waitTime = Math.pow(2, attempt) * 1000;
          console.log(`⏳ Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    // If all attempts failed, throw the last error
    throw new Error(`Failed to generate content after ${maxRetries} attempts. Last error: ${lastError?.message}`);
  }



  /**
   * Create or update today's word of the day
   */
  async createTodayWordOfDay(): Promise<void> {
    try {
      console.log('📅 Creating today\'s word of the day...');
      
      // Get today's date
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get Portuguese language
      const language = await prisma.language.findUnique({
        where: { code: 'pt' }
      });

      if (!language) {
        throw new Error('Portuguese language not found in database');
      }

      // Check if today's word already exists
      const existingWord = await prisma.wordOfDay.findUnique({
        where: {
          date_languageId: {
            date: today,
            languageId: language.id
          }
        }
      });

      if (existingWord) {
        console.log('🔄 Today\'s word of the day already exists, updating...');

        // Get verse and generate new content
        const { verse, reference } = await this.scrapeVerseOfTheDay();
        const content = await this.generateContent(verse, reference);

        // Update existing word
        await prisma.wordOfDay.update({
          where: { id: existingWord.id },
          data: {
            word: reference,
            verse,
            reference,
            devotionalTitle: content.devotionalTitle,
            devotionalContent: content.devotionalContent,
            devotionalReflection: content.devotionalReflection,
            prayerTitle: content.prayerTitle,
            prayerContent: content.prayerContent,
            prayerDuration: content.prayerDuration,
          }
        });

        console.log('✅ Successfully updated today\'s word of the day');
        return;
      }

      // Scrape verse of the day
      const { verse, reference } = await this.scrapeVerseOfTheDay();

      // Generate content
      const content = await this.generateContent(verse, reference);

      // Create word of the day
      await prisma.wordOfDay.create({
        data: {
          date: today,
          word: reference, // Using reference as the "word"
          verse,
          reference,
          devotionalTitle: content.devotionalTitle,
          devotionalContent: content.devotionalContent,
          devotionalReflection: content.devotionalReflection,
          prayerTitle: content.prayerTitle,
          prayerContent: content.prayerContent,
          prayerDuration: content.prayerDuration,
          languageId: language.id
        }
      });

      console.log('✅ Successfully created today\'s word of the day');

    } catch (error) {
      console.error('❌ Error creating today\'s word of the day:', error);
      throw error;
    }
  }
}

export const wordOfDayService = new WordOfDayService();
