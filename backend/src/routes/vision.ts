import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Missing GEMINI_API_KEY in environment variables. Please add it to your .env file to enable Visual Search.' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = "Analyze this image and identify the primary product. Return ONLY a concise search query (max 4-5 words) that a user would type into a shopping site to find this exact product. For example: 'Sony WH-1000XM4 Headphones' or 'Nike Air Force 1'. Do not return any other text or explanation, just the search query.";

    // Remove the data URI prefix (e.g. data:image/jpeg;base64,)
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: 'image/jpeg'
        }
      }
    ]);

    const query = result.response.text().trim().replace(/['"]/g, '');
    
    if (!query) {
      throw new Error('Empty response from AI');
    }

    res.json({ query });

  } catch (error: any) {
    console.error('Vision API Error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze image' });
  }
});

export default router;
