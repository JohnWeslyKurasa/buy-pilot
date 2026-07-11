import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: Request) {
  try {
    const { imageBase64 } = await request.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY in environment variables. Please add it to your .env file to enable Visual Search." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = "Analyze this image and identify the primary product. Return ONLY a concise search query (max 4-5 words) that a user would type into a shopping site to find this exact product. For example: 'Sony WH-1000XM4 Headphones' or 'Nike Air Force 1'. Do not return any other text or explanation, just the search query.";

    // Remove the data URI prefix (e.g. data:image/jpeg;base64,)
    const base64Data = imageBase64.replace(/^data:image\\/\\w+;base64,/, "");

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg"
        }
      }
    ]);

    const query = result.response.text().trim().replace(/['"]/g, '');
    
    if (!query) {
      throw new Error("Empty response from AI");
    }

    return NextResponse.json({ query });

  } catch (error: any) {
    console.error("Vision API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to analyze image" }, { status: 500 });
  }
}
