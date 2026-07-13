import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString('base64');

    // 1. Fallback to mock data if Gemini API key is missing
    const geminiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!geminiKey || geminiKey.trim() === '') {
      console.warn("GOOGLE_GEMINI_API_KEY is not configured. Falling back to simulated OCR extraction.");
      
      const filename = file.name.toLowerCase();
      let mockResult = {
        merchant: "Starbucks Cafe",
        amount: 350,
        date: new Date().toISOString(),
        category: "Lifestyle",
        is_planned: false
      };

      if (filename.includes("rent")) {
        mockResult = {
          merchant: "Ganesh Rentals (Rent)",
          amount: 25000,
          date: new Date().toISOString(),
          category: "Essentials",
          is_planned: true
        };
      } else if (filename.includes("electricity") || filename.includes("power") || filename.includes("bill")) {
        mockResult = {
          merchant: "Tata Power",
          amount: 4200,
          date: new Date().toISOString(),
          category: "Essentials",
          is_planned: true
        };
      } else if (filename.includes("sip") || filename.includes("groww") || filename.includes("invest")) {
        mockResult = {
          merchant: "HDFC Top 100 Index Fund SIP",
          amount: 5000,
          date: new Date().toISOString(),
          category: "Investments",
          is_planned: true
        };
      } else if (filename.includes("uber") || filename.includes("cab") || filename.includes("ola")) {
        mockResult = {
          merchant: "Uber India",
          amount: 680,
          date: new Date().toISOString(),
          category: "Essentials",
          is_planned: false
        };
      }

      // Simulate a small delay for premium UX loader
      await new Promise(resolve => setTimeout(resolve, 1500));
      return NextResponse.json(mockResult);
    }

    // 2. Call Google Gemini 1.5 Flash Vision API
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const prompt = `
      Extract transaction details from this payment screenshot/receipt (Paytm, PhonePe, Google Pay, UPI, or similar).
      You must return a JSON object with these exact keys:
      {
        "merchant": "string (Name of the merchant/recipient)",
        "amount": number (float, numerical value of transaction),
        "date": "string (ISO date format e.g. 2026-07-13T12:00:00.000Z)",
        "category": "string (Must be exactly one of: Essentials, Lifestyle, Investments, Savings, Miscellaneous)",
        "is_planned": boolean (true if it looks like a planned/fixed recurring item like Rent, EMI, SIP, Insurance; false if casual spending)
      }

      Classification Guideline for Category:
      - Essentials: Rent, utilities, insurance, bills, groceries, transport.
      - Lifestyle: Dining out, cafes, shopping, movies, entertainment, travel.
      - Investments: SIP, mutual funds, stocks, gold, PPF.
      - Savings: Savings buckets, general deposits.
      - Miscellaneous: Anything else or casual transfers.
    `;

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: file.type
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();

    if (!responseText) {
      throw new Error("Empty response from Gemini API");
    }

    const parsedJson = JSON.parse(responseText.trim());
    return NextResponse.json(parsedJson);

  } catch (error: any) {
    console.error("OCR Extraction Error:", error);
    return NextResponse.json(
      { error: "Failed to parse receipt screenshot: " + error.message },
      { status: 500 }
    );
  }
}
