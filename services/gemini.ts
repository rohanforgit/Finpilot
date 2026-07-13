import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

/**
 * Placeholder function for AI integration
 * @param prompt the text prompt to send
 */
export async function generateFinancialInsight(prompt: string) {
  if (!process.env.GOOGLE_GEMINI_API_KEY) {
    console.warn("Gemini API key is missing. Returning mock data.");
    return "Mock AI Insight based on financial data.";
  }
  
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}
