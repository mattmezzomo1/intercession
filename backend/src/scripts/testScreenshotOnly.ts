import dotenv from 'dotenv';
import { screenshotService } from '../services/screenshotService';
import fs from 'fs';

// Load environment variables
dotenv.config();

async function testScreenshotOnly() {
  console.log('🧪 Testing Screenshot Service Only...\n');

  try {
    // Test screenshot functionality
    console.log('1. Testing screenshot capture...');
    const screenshotPath = await screenshotService.takeScreenshot('https://www.bible.com/pt/verse-of-the-day');
    console.log(`✅ Screenshot captured: ${screenshotPath}`);
    
    // Check if file exists and get size
    if (fs.existsSync(screenshotPath)) {
      const stats = fs.statSync(screenshotPath);
      console.log(`   📏 File size: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log(`   📅 Created: ${stats.birthtime.toLocaleString()}`);
    }
    
    console.log('\n✅ Screenshot test completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Add your OpenAI API key to the .env file');
    console.log('   2. Run: npm run test:word-of-day');
    console.log('   3. Check the screenshot at:', screenshotPath);

  } catch (error) {
    console.error('❌ Test failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('browser')) {
        console.log('\n💡 Browser issues:');
        console.log('   - Make sure you have Chrome/Chromium installed');
        console.log('   - Try: npx puppeteer browsers install chrome');
      }
      
      if (error.message.includes('timeout')) {
        console.log('\n💡 Timeout issues:');
        console.log('   - Check your internet connection');
        console.log('   - The site might be slow to load');
      }
    }
    
    process.exit(1);
  }
}

// Run the test
testScreenshotOnly();
