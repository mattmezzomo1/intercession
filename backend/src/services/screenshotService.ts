import puppeteer from 'puppeteer';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

// Initialize OpenAI
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

interface ExtractedVerse {
  verse: string;
  reference: string;
}

export class ScreenshotService {
  private screenshotsDir: string;

  constructor() {
    this.screenshotsDir = path.join(__dirname, '../../screenshots');
    // Create screenshots directory if it doesn't exist
    if (!fs.existsSync(this.screenshotsDir)) {
      fs.mkdirSync(this.screenshotsDir, { recursive: true });
    }
  }

  /**
   * Take a screenshot of the Bible.com verse of the day page
   */
  async takeScreenshot(url: string): Promise<string> {
    let browser;
    
    try {
      console.log('🚀 Launching browser...');
      
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });

      const page = await browser.newPage();
      
      // Set viewport and user agent
      await page.setViewport({ width: 1200, height: 800 });
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

      console.log(`📸 Navigating to ${url}...`);
      
      // Navigate to the page
      await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Wait a bit more for dynamic content to load
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Try to accept cookies if there's a cookie banner
      try {
        await page.click('button[data-testid="accept-cookies"], .cookie-accept, [aria-label*="Accept"], [aria-label*="Aceitar"]');
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.log('No cookie banner found or already accepted');
      }

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `bible-verse-${timestamp}.png`;
      const filepath = path.join(this.screenshotsDir, filename);

      console.log('📷 Taking screenshot...');
      
      // Take screenshot
      await page.screenshot({
        path: filepath as `${string}.png`,
        fullPage: false, // Just the viewport
        type: 'png'
      });

      console.log(`✅ Screenshot saved: ${filepath}`);
      
      return filepath;

    } catch (error) {
      console.error('❌ Error taking screenshot:', error);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Use OpenAI Vision to extract verse from screenshot
   */
  async extractVerseFromImage(imagePath: string): Promise<ExtractedVerse> {
    if (!openai) {
      throw new Error('OpenAI API key is required but not configured. Please set OPENAI_API_KEY environment variable.');
    }

    try {
      console.log('🤖 Analyzing image with OpenAI Vision...');

      // Read the image file and convert to base64
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analise esta imagem da página "Versículo do Dia" do site Bible.com em português. 

Extraia:
1. O texto completo do versículo bíblico
2. A referência bíblica (livro, capítulo e versículo)

Responda APENAS com um JSON válido:
{
  "verse": "texto completo do versículo em português",
  "reference": "referência bíblica completa (ex: João 3:16)"
}

Se não conseguir identificar claramente o versículo, responda com null nos campos.`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/png;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.1
      });

      const responseText = response.choices[0]?.message?.content;
      if (!responseText) {
        throw new Error('No response from OpenAI Vision');
      }

      console.log('📝 OpenAI Vision response:', responseText);

      // Clean and parse JSON response (remove markdown formatting if present)
      let cleanedResponse = responseText.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const extractedData = JSON.parse(cleanedResponse);

      if (!extractedData.verse || !extractedData.reference) {
        throw new Error('Could not extract verse and reference from image');
      }

      console.log('✅ Successfully extracted verse from image:', {
        verse: extractedData.verse.substring(0, 50) + '...',
        reference: extractedData.reference
      });

      return {
        verse: extractedData.verse.trim(),
        reference: extractedData.reference.trim()
      };

    } catch (error) {
      console.error('❌ Error extracting verse from image:', error);
      throw error;
    }
  }

  /**
   * Clean up old screenshots (keep only last 10)
   */
  async cleanupOldScreenshots(): Promise<void> {
    try {
      const files = fs.readdirSync(this.screenshotsDir)
        .filter(file => file.startsWith('bible-verse-') && file.endsWith('.png'))
        .map(file => ({
          name: file,
          path: path.join(this.screenshotsDir, file),
          stats: fs.statSync(path.join(this.screenshotsDir, file))
        }))
        .sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime());

      // Keep only the 10 most recent files
      const filesToDelete = files.slice(10);
      
      for (const file of filesToDelete) {
        fs.unlinkSync(file.path);
        console.log(`🗑️ Deleted old screenshot: ${file.name}`);
      }

    } catch (error) {
      console.error('❌ Error cleaning up screenshots:', error);
    }
  }
}

export const screenshotService = new ScreenshotService();
