import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt gerekli" }, { status: 400 });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: "API anahtarı eksik" }, { status: 500 });
    }

    // Model discovery
    const modelsRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`
    );
    
    if (!modelsRes.ok) {
      throw new Error("Model listesi alınamadı");
    }

    const modelsData = await modelsRes.json();
    const availableModel = modelsData.models?.find((m: { name: string; supportedGenerationMethods?: string[] }) => 
      m.name.includes('gemini') && m.name.includes('flash')
    );

    if (!availableModel) {
      throw new Error("Uygun model bulunamadı");
    }

    const modelName = availableModel.name.replace('models/', '');

    // Gemini API'ye istek gönder
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            topK: 40,
            maxOutputTokens: 500,
          }
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API hatası:", errorData);
      return NextResponse.json({ error: "AI analizi başarısız" }, { status: 500 });
    }

    const data = await response.json();
    const insight = data.candidates?.[0]?.content?.parts?.[0]?.text || "Analiz yapılamadı.";

    return NextResponse.json({ insight });

  } catch (error) {
    console.error("AI analizi hatası:", error);
    return NextResponse.json(
      { error: "Analiz sırasında bir hata oluştu" },
      { status: 500 }
    );
  }
}
