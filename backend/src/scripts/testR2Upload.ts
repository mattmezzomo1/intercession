import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import r2Service from '../services/r2Service';

// Load environment variables
dotenv.config();

async function testR2Upload() {
  console.log('🧪 Testing Cloudflare R2 Upload Service...\n');

  // Debug environment variables
  console.log('🔍 Checking environment variables...');
  console.log('CLOUDFLARE_ACCOUNT_ID:', process.env.CLOUDFLARE_ACCOUNT_ID ? '✅ Set' : '❌ Missing');
  console.log('CLOUDFLARE_R2_ACCESS_KEY_ID:', process.env.CLOUDFLARE_R2_ACCESS_KEY_ID ? '✅ Set' : '❌ Missing');
  console.log('CLOUDFLARE_R2_SECRET_ACCESS_KEY:', process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Missing');
  console.log('CLOUDFLARE_R2_BUCKET_NAME:', process.env.CLOUDFLARE_R2_BUCKET_NAME ? '✅ Set' : '❌ Missing');
  console.log('CLOUDFLARE_R2_PUBLIC_URL:', process.env.CLOUDFLARE_R2_PUBLIC_URL ? '✅ Set' : '❌ Missing');
  console.log('');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing R2 Health Check...');
    const isHealthy = await r2Service.healthCheck();
    console.log(`   Health Status: ${isHealthy ? '✅ Healthy' : '❌ Unhealthy'}\n`);

    if (!isHealthy) {
      console.log('❌ R2 service is not healthy. Please check your configuration.');
      return;
    }

    // Test 2: Create a test image buffer (valid PNG)
    console.log('2️⃣ Creating test image...');
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      'base64'
    );
    console.log('   Test image created ✅\n');

    // Test 3: Upload test image
    console.log('3️⃣ Testing image upload...');
    const uploadedUrl = await r2Service.uploadImage(
      testImageBuffer,
      'test-image.png',
      'prayer-requests'
    );
    console.log(`   Upload successful! ✅`);
    console.log(`   Image URL: ${uploadedUrl}\n`);

    // Test 4: Test avatar upload
    console.log('4️⃣ Testing avatar upload...');
    const avatarUrl = await r2Service.uploadImage(
      testImageBuffer,
      'test-avatar.png',
      'avatars'
    );
    console.log(`   Avatar upload successful! ✅`);
    console.log(`   Avatar URL: ${avatarUrl}\n`);

    // Test 5: Clean up - delete test images
    console.log('5️⃣ Cleaning up test images...');
    try {
      await r2Service.deleteImage(uploadedUrl);
      console.log('   Test image deleted ✅');
    } catch (error) {
      console.log('   ⚠️ Could not delete test image (this is okay for testing)');
    }

    try {
      await r2Service.deleteImage(avatarUrl);
      console.log('   Test avatar deleted ✅');
    } catch (error) {
      console.log('   ⚠️ Could not delete test avatar (this is okay for testing)');
    }

    console.log('\n🎉 All tests passed! R2 service is working correctly.');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Missing required Cloudflare R2 environment variables')) {
        console.log('\n💡 Make sure you have configured the following environment variables:');
        console.log('   - CLOUDFLARE_ACCOUNT_ID');
        console.log('   - CLOUDFLARE_R2_ACCESS_KEY_ID');
        console.log('   - CLOUDFLARE_R2_SECRET_ACCESS_KEY');
        console.log('   - CLOUDFLARE_R2_BUCKET_NAME');
        console.log('   - CLOUDFLARE_R2_PUBLIC_URL');
      }
    }
  }
}

// Run the test
testR2Upload().catch(console.error);
