import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt } = body;

    console.log("🔵 [API] AI Generate endpoint called");
    console.log("📝 [API] Prompt received:", prompt.substring(0, 100) + "...");

    if (!prompt || !prompt.trim()) {
      console.log("❌ [API] Empty prompt");
      return NextResponse.json(
        { message: "Prompt is required" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      console.log("❌ [API] GEMINI_API_KEY not configured");
      return NextResponse.json(
        { message: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }
    
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    // Create a detailed prompt that instructs Gemini to return structured code
    const systemPrompt = `You are an expert React developer. Generate clean, well-structured React code based on user requests.

IMPORTANT: You MUST respond with ONLY valid JSON in this exact format:
{
  "files": {
    "/src/App.js": "React component code here",
    "/src/components/ComponentName.jsx": "Additional component code here"
    "/src/index.css": "Global CSS styles here"
  }
}

Rules:
1. Always return multiple files if needed (App.js + any helper components)
2. Use .js file extension (not .jsx)
3. Use JSX syntax inside the .js files
4. Include proper imports (React, useState, etc.)
5. Make code production-ready
6. Never include markdown formatting or code blocks
7. Only return raw JSON`;

    const fullPrompt = `${systemPrompt}\n\nUser Request: ${prompt}`;

    console.log("🤖 [API] Calling Gemini API with model: gemini-2.5-flash");
    const result = await model.generateContent(fullPrompt);
    const responseText = result.response.text();

    console.log(
      "✅ [API] Gemini response received, length:",
      responseText.length
    );
    console.log(
      "📄 [API] Response preview:",
      responseText.substring(0, 200) + "..."
    );

    // Parse the JSON response
    let parsedResponse;
    try {
      // Extract JSON if it's wrapped in markdown code blocks
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        parsedResponse = JSON.parse(responseText);
      }
      console.log("✅ [API] JSON parsed successfully");
    } catch (parseError) {
      console.error("❌ [API] Failed to parse Gemini response:", responseText);
      return NextResponse.json(
        {
          message: "Failed to parse AI response",
          raw: responseText,
        },
        { status: 500 }
      );
    }

    // Validate response structure
    if (!parsedResponse.files || typeof parsedResponse.files !== "object") {
      console.log("❌ [API] Invalid response structure:", parsedResponse);
      return NextResponse.json(
        {
          message: "Invalid response format from AI",
          received: parsedResponse,
        },
        { status: 500 }
      );
    }

    console.log(
      "✅ [API] Response valid, files count:",
      Object.keys(parsedResponse.files).length
    );
    console.log("📦 [API] Files:", Object.keys(parsedResponse.files));
    return NextResponse.json(parsedResponse);
  } catch (error) {
    console.error("❌ [API] Error in AI generate endpoint:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    console.error("❌ [API] Error message:", errorMessage);

    return NextResponse.json(
      {
        message: "Error generating code",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
