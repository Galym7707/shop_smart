const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testGemini() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = 'Suggest 5 grocery items for making borscht.';
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log('Gemini Response:', text);
  } catch (error) {
    console.error('Gemini Test Error:', error);
  }
}

testGemini();