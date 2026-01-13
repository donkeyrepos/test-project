const express = require('express');
const router = express.Router();
const axios = require('axios');
const https = require('https');
const { protect } = require('../middleware/auth');

// Create HTTPS agent that handles SSL issues (common in corporate networks)
const httpsAgent = new https.Agent({
  rejectUnauthorized: process.env.NODE_ENV === 'production' // Only verify SSL in production
});

// System prompt for cooking assistant
const COOKING_ASSISTANT_PROMPT = `You are COOKit AI Assistant, a friendly and knowledgeable cooking expert. Your role is to help users with:

1. Recipe suggestions and recommendations
2. Cooking techniques and tips
3. Ingredient substitutions
4. Meal planning and nutrition advice
5. Kitchen equipment guidance
6. Food safety and storage tips
7. Cooking time and temperature guidance
8. Dietary restrictions and allergies

Guidelines:
- Be friendly, encouraging, and enthusiastic about cooking
- Provide clear, step-by-step instructions when needed
- Consider food safety in all recommendations
- Ask clarifying questions if the user's request is unclear
- Use emojis occasionally to make responses more engaging
- Keep responses concise but informative
- If asked about non-cooking topics, politely redirect to cooking-related questions

Always prioritize user safety and provide accurate cooking information.`;

// @route   POST /api/ai-assistant/chat
// @desc    Chat with AI cooking assistant
// @access  Private
router.post('/chat', protect, async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        message: 'AI Assistant is not configured. Please add GEMINI_API_KEY to environment variables.',
        error: 'API_KEY_MISSING'
      });
    }

    console.log('🤖 AI Chat Request - User:', req.user.username);
    console.log('📝 Message:', message);

    // Build conversation context
    let prompt = COOKING_ASSISTANT_PROMPT + '\n\n';

    // Add conversation history if provided
    if (conversationHistory && Array.isArray(conversationHistory)) {
      conversationHistory.forEach(msg => {
        prompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
      });
    }

    // Add current message
    prompt += `User: ${message}\nAssistant:`;

    // Generate response using axios (works better with SSL issues)
    console.log('🔄 Sending request to Gemini API...');

    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const data = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    };

    const apiResponse = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json'
      },
      httpsAgent: httpsAgent
    });

    const aiMessage = apiResponse.data.candidates[0].content.parts[0].text;

    console.log('✅ AI Response received');

    res.json({
      message: aiMessage,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ AI Assistant Error:', error);

    // Handle specific error cases
    if (error.response) {
      console.error('API Response Error:', error.response.status, error.response.data);

      if (error.response.status === 400) {
        return res.status(400).json({
          message: 'Invalid request to AI service.',
          error: 'BAD_REQUEST'
        });
      }

      if (error.response.status === 403 || error.response.status === 401) {
        return res.status(503).json({
          message: 'Invalid API key. Please check your GEMINI_API_KEY in the .env file.',
          error: 'API_KEY_ERROR'
        });
      }
    }

    if (error.message && error.message.includes('fetch failed')) {
      return res.status(503).json({
        message: 'Unable to connect to Google AI services. Please check your internet connection or try again later.',
        error: 'NETWORK_ERROR',
        details: 'This could be due to firewall, proxy, or network connectivity issues.'
      });
    }

    res.status(500).json({
      message: 'Error communicating with AI assistant. Please try again.',
      error: error.message
    });
  }
});

// @route   POST /api/ai-assistant/recipe-suggestion
// @desc    Get recipe suggestions based on ingredients
// @access  Private
router.post('/recipe-suggestion', protect, async (req, res) => {
  try {
    const { ingredients, dietary, cuisine } = req.body;

    if (!ingredients || ingredients.length === 0) {
      return res.status(400).json({ message: 'At least one ingredient is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        message: 'AI Assistant is not configured.',
        error: 'API_KEY_MISSING'
      });
    }

    let prompt = `As a professional chef, suggest 3 delicious recipes using these ingredients: ${ingredients.join(', ')}.`;

    if (dietary) {
      prompt += ` The recipes should be ${dietary}.`;
    }

    if (cuisine) {
      prompt += ` Focus on ${cuisine} cuisine.`;
    }

    prompt += `\n\nFor each recipe, provide:
1. Recipe name
2. Brief description
3. Difficulty level (Easy/Medium/Hard)
4. Estimated cooking time
5. Key ingredients needed
6. Brief cooking steps

Format the response in a clear, structured way.`;

    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const data = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    };

    const apiResponse = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json'
      },
      httpsAgent: httpsAgent
    });

    const suggestions = apiResponse.data.candidates[0].content.parts[0].text;

    res.json({
      suggestions,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Recipe Suggestion Error:', error);
    res.status(500).json({ 
      message: 'Error generating recipe suggestions.',
      error: error.message 
    });
  }
});

// @route   GET /api/ai-assistant/status
// @desc    Check AI assistant status
// @access  Private
router.get('/status', protect, async (req, res) => {
  try {
    const isConfigured = !!process.env.GEMINI_API_KEY;
    
    res.json({
      available: isConfigured,
      message: isConfigured 
        ? 'AI Assistant is ready to help!' 
        : 'AI Assistant requires configuration. Please add GEMINI_API_KEY to environment variables.'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error checking AI status', error: error.message });
  }
});

module.exports = router;

