"use server";

import { db } from "@/lib/db";

// Fetch telemetry data for the administrator dashboard
export async function getAdminTelemetry() {
  const stats = await db.getAdminStats();
  const ocrLogs = await db.getOcrLogs();
  const aiReports = await db.getAllAiReports();
  const feedback = await db.getAllFeedback();

  // Construct error logs for dashboard monitoring
  const errorLogs = ocrLogs
    .filter(o => o.status === "failed")
    .map(o => ({
      id: o.id,
      timestamp: o.created_at,
      type: "OCR Error",
      message: o.error_message || "Unknown vision processing error"
    }))
    .concat(
      feedback
        .filter(f => f.comments && f.comments.toLowerCase().includes("error"))
        .map(f => ({
          id: f.id,
          timestamp: f.created_at,
          type: "User Reported Bug",
          message: f.comments || ""
        }))
    );

  return {
    stats,
    ocrLogs: ocrLogs.slice(0, 20), // Top 20 recent
    aiReports: aiReports.slice(0, 20),
    feedback: feedback.slice(0, 20),
    errorLogs: errorLogs.slice(0, 15)
  };
}
