import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config();

async function testWordOfDayAPI() {
  console.log('🧪 Testing Word of Day API...\n');

  try {
    // Test the API endpoint
    console.log('1. Testing /api/word-of-day/today endpoint...');
    const response = await axios.get('http://localhost:3001/api/word-of-day/today');
    
    console.log('✅ API Response Status:', response.status);
    console.log('✅ API Response Success:', response.data.success);
    
    const wordData = response.data.data;
    
    if (!wordData) {
      console.error('❌ No word data returned');
      return;
    }
    
    console.log('\n📊 Word of Day Data:');
    console.log('   📅 Date:', wordData.date);
    console.log('   📝 Word:', wordData.word);
    console.log('   📖 Verse:', wordData.verse.substring(0, 100) + '...');
    console.log('   📍 Reference:', wordData.reference);
    console.log('   📚 Devotional Title:', wordData.devotionalTitle);
    console.log('   📚 Devotional Content:', wordData.devotionalContent ? 'Present' : 'Missing');
    console.log('   💭 Devotional Reflection:', wordData.devotionalReflection ? 'Present' : 'Missing');
    console.log('   🙏 Prayer Title:', wordData.prayerTitle);
    console.log('   🙏 Prayer Content:', wordData.prayerContent ? 'Present' : 'Missing');
    console.log('   ⏱️ Prayer Duration:', wordData.prayerDuration);
    console.log('   🌍 Language:', wordData.language?.name);
    
    // Check for missing fields
    const requiredFields = [
      'id', 'date', 'word', 'verse', 'reference', 
      'devotionalTitle', 'devotionalContent', 'devotionalReflection',
      'prayerTitle', 'prayerContent', 'prayerDuration'
    ];
    
    const missingFields = requiredFields.filter(field => !wordData[field]);
    
    if (missingFields.length > 0) {
      console.log('\n❌ Missing fields:', missingFields.join(', '));
    } else {
      console.log('\n✅ All required fields are present!');
    }
    
    // Show full content lengths
    console.log('\n📏 Content Lengths:');
    console.log('   Devotional Content:', wordData.devotionalContent?.length || 0, 'characters');
    console.log('   Devotional Reflection:', wordData.devotionalReflection?.length || 0, 'characters');
    console.log('   Prayer Content:', wordData.prayerContent?.length || 0, 'characters');
    
    console.log('\n🎉 Word of Day API test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        console.log('\n💡 Make sure the backend server is running on port 3001');
        console.log('   Run: npm run dev');
      }
    }
    
    process.exit(1);
  }
}

// Run the test
testWordOfDayAPI();
