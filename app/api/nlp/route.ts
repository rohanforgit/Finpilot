import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const geminiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!geminiKey || geminiKey.trim() === '') {
      // Heuristic fallback for offline/development mode
      const amountMatch = text.match(/(?:₹|Rs\.?|INR)?\s*(\d+(?:\.\d+)?)/i);
      const amount = amountMatch ? parseFloat(amountMatch[1]) : 150;
      
      let merchant = "Quick Expense";
      const cleanText = text.replace(/[^a-zA-Z0-9\s₹]/g, '');
      const words = cleanText.split(/\s+/);
      const indicators = ["at", "for", "on", "to"];
      
      let splitIndex = -1;
      for (const indicator of indicators) {
        const idx = words.map((w: string) => w.toLowerCase()).indexOf(indicator);
        if (idx !== -1) {
          splitIndex = idx;
          break;
        }
      }

      if (splitIndex !== -1 && splitIndex < words.length - 1) {
        merchant = words.slice(splitIndex + 1).join(" ");
        merchant = merchant.replace(/\b\w/g, c => c.toUpperCase());
      } else if (words.length > 0) {
        // Use first two words as description if no indicator is found
        merchant = words.slice(0, 3).join(" ");
      }

      let category = "Miscellaneous";
      const lowerText = text.toLowerCase();
      if (lowerText.includes("chai") || lowerText.includes("coffee") || lowerText.includes("starbucks") || lowerText.includes("dinner") || lowerText.includes("movie") || lowerText.includes("zomato")) {
        category = "Lifestyle";
      } else if (lowerText.includes("rent") || lowerText.includes("electricity") || lowerText.includes("bill") || lowerText.includes("taxi") || lowerText.includes("uber") || lowerText.includes("ola")) {
        category = "Essentials";
      } else if (lowerText.includes("stock") || lowerText.includes("mutual") || lowerText.includes("sip") || lowerText.includes("invest")) {
        category = "Investments";
      }

      await new Promise(resolve => setTimeout(resolve, 800));
      return NextResponse.json({
        merchant,
        amount,
        category,
        date: new Date().toISOString(),
        is_planned: false
      });
    }

    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const prompt = `
      Extract transaction details from this natural language expense note:
      "${text}"

      You must return a JSON object with these exact keys:
      {
        "merchant": "string (Name of the vendor/recipient/description)",
        "amount": number (float, numerical value of transaction),
        "date": "string (ISO date format, default to current time)",
        "category": "string (Must be exactly one of: Essentials, Lifestyle, Investments, Savings, Miscellaneous)",
        "is_planned": boolean (default false)
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    if (!responseText) {
      throw new Error("Empty response from Gemini API");
    }

    const parsedJson = JSON.parse(responseText.trim());
    return NextResponse.json(parsedJson);

  } catch (error: any) {
    console.error("NLP parsing error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
