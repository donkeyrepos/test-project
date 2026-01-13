// Test script to verify Gemini API connection
require('dotenv').config();
const axios = require('axios');
const https = require('https');

async function testGeminiAPI() {
  console.log('🔍 Testing Gemini API Connection...\n');

  // Check if API key exists
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found in .env file');
    process.exit(1);
  }

  console.log('✅ API Key found:', process.env.GEMINI_API_KEY.substring(0, 10) + '...');

  try {
    console.log('\n🔄 Listing available models...');
    console.log('⚠️  Disabling SSL verification for testing (not recommended for production)');

    // Create an HTTPS agent that ignores SSL errors
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false
    });

    // First, list available models
    const listUrl = `https://generativelanguage.googleapis.com/v1/models?key=${process.env.GEMINI_API_KEY}`;
    const listResponse = await axios.get(listUrl, { httpsAgent });

    console.log('\n📋 Available models:');
    listResponse.data.models.forEach(model => {
      if (model.name.includes('gemini')) {
        console.log(`  - ${model.name} (${model.displayName})`);
      }
    });

    // Try with the first available gemini model
    const availableModel = listResponse.data.models.find(m =>
      m.name.includes('gemini') && m.supportedGenerationMethods?.includes('generateContent')
    );

    if (!availableModel) {
      throw new Error('No suitable Gemini model found');
    }

    console.log(`\n✅ Using model: ${availableModel.name}`);

    const url = `https://generativelanguage.googleapis.com/v1/${availableModel.name}:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const data = {
      contents: [{
        parts: [{
          text: "Say 'Hello! I'm working!' in one sentence."
        }]
      }]
    };

    console.log('📤 Sending test request...');

    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json'
      },
      httpsAgent: httpsAgent
    });

    const text = response.data.candidates[0].content.parts[0].text;

    console.log('\n✅ SUCCESS! API is working!');
    console.log('📥 Response:', text);
    console.log('\n🎉 Gemini API is properly configured and working!');
    console.log('\n💡 Now testing with @google/generative-ai SDK...\n');

    // Now test with the SDK
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const result = await model.generateContent("Say hello!");
    const sdkText = result.response.text();

    console.log('✅ SDK also working!');
    console.log('📥 SDK Response:', sdkText);

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);

    if (error.response) {
      console.error('\nAPI Response Error:');
      console.error('- Status:', error.response.status);
      console.error('- Data:', JSON.stringify(error.response.data, null, 2));
    }

    console.error('\nError Details:');
    console.error('- Name:', error.name);
    console.error('- Message:', error.message);

    if (error.cause) {
      console.error('- Cause:', error.cause);
    }

    if (error.message.includes('fetch failed') || error.code === 'ECONNREFUSED') {
      console.error('\n💡 Troubleshooting:');
      console.error('1. Check your internet connection');
      console.error('2. Check if a firewall is blocking the request');
      console.error('3. Check if you need to configure a proxy');
      console.error('4. Verify the API key is correct at: https://aistudio.google.com/app/apikey');
    }

    if (error.response?.status === 400) {
      console.error('\n💡 The API key appears to be invalid or the request format is wrong.');
      console.error('Get a new key at: https://aistudio.google.com/app/apikey');
    }

    process.exit(1);
  }
}

testGeminiAPI();

