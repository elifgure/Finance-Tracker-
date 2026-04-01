import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// @ts-expect-error - pdf-parse-fork doesn't have type definitions
import pdf from "pdf-parse-fork";
import Transaction from "@/models/Transaction";
import connectDB from "@/utils/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });  
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    let text = "";
    try {
        const pdfData = await pdf(buffer);
        text = pdfData.text;
    } catch {
        return NextResponse.json({ error: "PDF okunamadi." }, { status: 400 });
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
        return NextResponse.json({ error: "API Key eksik." }, { status: 500 });
    }

    let selectedModel = "gemini-1.5-flash-latest"; 
    try {
        const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`);
        const listData = await listRes.json();
        if (listData.models) {
            const valid = listData.models.find((m: { name: string; supportedGenerationMethods: string[] }) => m.supportedGenerationMethods.includes("generateContent") && !m.name.includes("embedding"));
            if (valid) selectedModel = valid.name.split("/").pop() || selectedModel;
        }
    } catch {}

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${geminiKey}`;
    
    const prompt = `Banka dokumu metni:
${text.substring(0, 4000)}

GOREV: Sadece islemleri listele. HICBIR ACIKLAMA EKLEME.
FORMAT: Her satir: TARIH | KATEGORI | MIKTAR | TIP | ACIKLAMA
ORNEK:
2024-05-20 | Market | 150.50 | expense | Migros
2024-05-21 | Maas | 5000.00 | income | Maas

ONEMLI: 
- Sadece islemleri yaz
- Hicbir baslik veya aciklama ekleme
- JSON kullanma
- Ilk satir direk islemi icermeli`;

    console.log("=== PDF YUKLEMESI BASLADI ===");

    const geminiRes = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 2000
            }
        })
    });

    const geminiData = await geminiRes.json();
    if (!geminiRes.ok) {
        return NextResponse.json({ error: "Gemini hatası" }, { status: 502 });
    }

    const rawText = geminiData.candidates[0].content.parts[0].text;
    console.log("AI CEVABI TAM METIN:", rawText);
    
    const lines = rawText.split("\n").filter((l: string) => l.includes("|") && l.split("|").length >= 3);

    await connectDB();
    let savedCount = 0;
    
    for (const line of lines) {
      try {
const parts = line.split("|").map((s: string) => s.trim());        if (parts.length < 3) continue;
        
        const [dateStr, category, amountStr, typeStr, desc] = parts;
        const amount = parseFloat(amountStr.replace(/[^0-9.,-]/g, "").replace(",", "."));
        
        if (isNaN(amount) || !dateStr) continue;

        let finalDate = new Date(dateStr);
        if (isNaN(finalDate.getTime()) && dateStr.includes(".")) {
            const [d, m, y] = dateStr.split(".");
            finalDate = new Date(`${y}-${m}-${d}`);
        }

        await Transaction.create({
          userId: session.user.id,
          date: isNaN(finalDate.getTime()) ? new Date() : finalDate,
          category: category || "Diger",
          amount: Math.abs(amount),
          type: (typeStr?.toLowerCase().includes("income") || typeStr?.toLowerCase().includes("gelir")) ? "income" : "expense",
          description: desc || "PDF Aktarımı",
          currency: "TRY"
        });
        savedCount++;
      } catch {
        // Skip problematic lines
      }
    }

    return NextResponse.json({ message: `${savedCount} islem basariyla eklendi.`, count: savedCount });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Bilinmeyen hata";
    return NextResponse.json({ error: "Sistemsel hata: " + message }, { status: 500 });
  }
}
