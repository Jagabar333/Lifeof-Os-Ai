import { NextRequest, NextResponse } from "next/server";
import { getAuthStatus } from "@/lib/api/with-auth";

export async function POST(req: NextRequest) {
  try {
    // ── Step 1: Check authentication with specific error messages ──
    const auth = await getAuthStatus();

    if (!auth.authenticated) {
      const message =
        auth.reason === "NO_TOKEN"
          ? "Authentication required. Please log in."
          : "Your session has expired. Please log in again.";
      return NextResponse.json(
        { success: false, message },
        { status: 401 },
      );
    }

    // ── Step 2: Read the user message ──
    const body = await req.json();
    if (!body.message || typeof body.message !== "string" || !body.message.trim()) {
      return NextResponse.json(
        { success: false, message: "Message is required." },
        { status: 400 },
      );
    }

    // ── Step 3: Proxy to NestJS backend ──
    const backendUrl = process.env["BACKEND_API_URL"] || "http://localhost:4001";
    const res = await fetch(`${backendUrl}/api/v1/ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      // NestJS HttpExceptionFilter formats errors as { error: { message } }
      // Standard NestJS errors use { message }
      const errorMessage = data.error?.message || data.message || "AI Coach failed to respond.";
      return NextResponse.json(
        { success: false, message: errorMessage },
        { status: res.status },
      );
    }

    // ── Step 4: Return the AI response in the requested format ──
    // NestJS TransformInterceptor wraps response in { data: ... }
    const aiResponse = data.data || data;
    return NextResponse.json({
      success: true,
      message: aiResponse.message || aiResponse.text || "No response from AI.",
      intent: aiResponse.intent,
    });
  } catch (error: any) {
    console.error("[AI Chat Route Error]", error);

    // Handle network errors to the backend
    if (error?.cause?.code === "ECONNREFUSED" || error?.message?.includes("fetch failed")) {
      return NextResponse.json(
        { success: false, message: "LifeOS AI backend is unavailable. Please make sure the API server is running." },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { success: false, message: "An unexpected error occurred." },
      { status: 500 },
    );
  }
}

