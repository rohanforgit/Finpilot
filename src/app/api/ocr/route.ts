import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ai } from "@/lib/ai";

const DEMO_USER_ID = "demo-user-id";

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let base64Image = "";
  let mimeType = "image/jpeg";
  let fileName = `receipt_${Date.now()}.jpg`;

  try {
    const body = await req.json();
    base64Image = body.image || "";
    mimeType = body.mimeType || "image/jpeg";
    fileName = body.fileName || `receipt_${Date.now()}.jpg`;
  } catch (parseErr) {
    // If JSON parsing fails, try Form Data
    try {
      const formData = await req.formData();
      const file = formData.get("file") as File;
      if (file) {
        const buffer = await file.arrayBuffer();
        base64Image = Buffer.from(buffer).toString("base64");
        mimeType = file.type;
        fileName = file.name;
      }
    } catch (formErr) {
      return NextResponse.json({ error: "Failed to read receipt payload." }, { status: 400 });
    }
  }

  if (!base64Image) {
    return NextResponse.json({ error: "Image data is required." }, { status: 400 });
  }

  const mockFilePath = `/uploads/receipts/${DEMO_USER_ID}/${fileName}`;

  try {
    // 1. Run Vision OCR (Gemini or Mock)
    const parsedData = await ai.parseReceiptScreenshot(base64Image, mimeType);
    const elapsedMs = Date.now() - startTime;

    // 2. Log OCR Upload metadata
    const uploadLog = await db.logOcrUpload(
      DEMO_USER_ID,
      mockFilePath,
      "success",
      parsedData,
      elapsedMs
    );

    // 3. Create active records from OCR (supporting multiple transactions)
    const savedExpenses: any[] = [];
    const savedIncomes: any[] = [];

    let transactions: any[] = [];
    const dataObj = parsedData as any;
    if (dataObj) {
      if (Array.isArray(dataObj.transactions)) {
        transactions = dataObj.transactions;
      } else if (dataObj.merchant_name || dataObj.amount) {
        transactions = [dataObj];
      } else if (typeof dataObj === "object") {
        const keys = Object.keys(dataObj);
        for (const k of keys) {
          if (Array.isArray(dataObj[k])) {
            transactions = dataObj[k];
            break;
          }
        }
      }
    }

    for (const tx of transactions) {
      const amountVal = Number(tx.amount || 0);
      if (isNaN(amountVal) || amountVal <= 0) continue;

      if (tx.type === "income" || tx.type === "income_source") {
        // Skip incoming money (credits) as requested by user
        continue;
      } else {
        const expenseItem = await db.saveExpense(DEMO_USER_ID, {
          merchant_name: tx.merchant_name || "Unknown Merchant",
          amount: amountVal,
          date: tx.date || new Date().toISOString().split("T")[0],
          time: tx.time || null,
          category: tx.category || "others",
          ocr_upload_id: uploadLog.id,
          is_manual_corrected: false
        });
        savedExpenses.push(expenseItem);
      }
    }

    const primaryExpense = savedExpenses.length > 0 ? savedExpenses[0] : null;

    return NextResponse.json({
      success: true,
      ocrLogId: uploadLog.id,
      expense: primaryExpense,
      expenses: savedExpenses,
      incomes: savedIncomes,
      processingTimeMs: elapsedMs,
      isMockOCR: ai.isMock
    });

  } catch (err: any) {
    const elapsedMs = Date.now() - startTime;
    console.error("Receipt parsing pipeline crashed:", err);

    const uploadLog = await db.logOcrUpload(
      DEMO_USER_ID,
      mockFilePath,
      "failed",
      null,
      elapsedMs,
      err.message || "Failed during Vision processing"
    );

    return NextResponse.json({
      success: false,
      error: err.message || "Screenshot vision extraction failed",
      ocrLogId: uploadLog.id
    }, { status: 500 });
  }
}
