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
        
        // Türkçe karakter encoding sorunlarını düzelt
        text = text
          .replace(/Ã§/g, 'ç')
          .replace(/Ã¼/g, 'ü')
          .replace(/Ã¶/g, 'ö')
          .replace(/ÄŸ/g, 'ğ')
          .replace(/Ä±/g, 'ı')
          .replace(/Åž/g, 'ş');
        
        console.log("PDF METIN UZUNLUGU:", text.length);
        console.log("PDF METIN ORNEGI (ilk 800 karakter):", text.substring(0, 800));
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
    
    const prompt = `HER SATIR BIR ISLEM OLMALI. HICBIR INTRO, ACIKLAMA, BASLIK YOK.

SADECE BU FORMATI KULLAN: TARIH|KATEGORI|MIKTAR|TIP|ACIKLAMA

BANKA METNI:
${text.substring(0, 8000)}

KATEGORI KURALLARI:
migros/market/gida -> Market
zara/koton/giyim -> Alışveriş  
cafe/restaurant/burger -> Yemek
shell/opet/benzin -> Yakıt
taksit/kredi -> Taksit
havale/eft -> Transfer
internet/telefon/elektrik -> Fatura
eczane/saglik -> Sağlık
netflix/spotify -> Eğlence

TARIH FORMAT: YYYY-MM-DD (17/02/2026 -> 2026-02-17, 17.02.2026 -> 2026-02-17)

TIP: harcama/eksi -> expense, gelir/arti -> income

ORNEK (DIREKT ISLEMLE BASLA):
2026-02-17|Market|150.50|expense|Migros
2026-02-18|Yemek|89.90|expense|Burger King`;

    console.log("=== PDF YUKLEMESI BASLADI ===");

    const geminiRes = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 12000,
                topP: 0.95
            }
        })
    });

    const geminiData = await geminiRes.json();
    if (!geminiRes.ok) {
        console.error("GEMINI HATASI:", geminiData);
        return NextResponse.json({ error: "Gemini hatası" }, { status: 502 });
    }

    if (!geminiData.candidates || !geminiData.candidates[0]) {
        console.error("GEMINI CEVABI BOS:", geminiData);
        return NextResponse.json({ error: "AI cevap vermedi" }, { status: 502 });
    }

    const candidate = geminiData.candidates[0];
    console.log("AI FINISH REASON:", candidate.finishReason);
    
    const rawText = candidate.content.parts[0].text;
    console.log("AI CEVABI TAM METIN:", rawText);
    console.log("AI CEVABI UZUNLUK:", rawText.length);
    
    // Metin temizleme: Markdown, başlıklar, açıklamalar
    let cleanedText = rawText
      .replace(/```[a-z]*\n?/g, "")           // Markdown kod bloklarını kaldır
      .replace(/^#+\s+.*/gm, "")              // Başlıkları kaldır
      .replace(/^\*+\s+.*/gm, "")             // Bullet point'leri kaldır
      .replace(/^(aşağıdaki|asagidaki|işlemler|islemler|liste|çıkarılan|cikarilan).*/gmi, "") // Açıklama cümlelerini kaldır
      .trim();
    
    const lines = cleanedText
      .split("\n")
      .map((l: string) => l.trim())
      .filter((l: string) => {
        // Pipe içeren ve en az 4 kısım olan satırlar
        const parts = l.split("|");
        // Ayrıca tarih formatı kontrolü: YYYY-MM-DD veya YYYY- ile başlamalı
        return l.includes("|") && parts.length >= 4 && /^\d{4}/.test(parts[0].trim());
      });

    console.log(`TOPLAM ${lines.length} SATIR BULUNDU`);
    if (lines.length > 0) {
      console.log("ILK 3 SATIR:", lines.slice(0, 3));
    }

    await connectDB();
    let savedCount = 0;
    let skippedCount = 0;
    
    for (const line of lines) {
      try {
        const parts = line.split("|").map((s: string) => s.trim());
        if (parts.length < 4) {
          console.log("ATLANACAK (az parcali):", line);
          skippedCount++;
          continue;
        }
        
        // 4 veya 5 alan olabilir: TARIH|KATEGORI|MIKTAR|TIP veya TARIH|KATEGORI|MIKTAR|TIP|ACIKLAMA
        const dateStr = parts[0];
        const category = parts[1];
        const amountStr = parts[2];
        const typeStr = parts[3];
        const desc = parts.length >= 5 ? parts.slice(4).join(" ") : parts[1]; // Eğer açıklama yoksa kategori adını kullan
        
        // Miktar parsing - hem Türkçe (3.750,00) hem İngilizce (3750.00) formatı destekle
        let cleanAmount = amountStr.replace(/[^0-9.,\-]/g, "");
        let amount: number;
        
        if (cleanAmount.includes(",") && cleanAmount.includes(".")) {
          // 3.750,00 formatı - binlik nokta, ondalık virgül
          amount = parseFloat(cleanAmount.replace(/\./g, "").replace(",", "."));
        } else if (cleanAmount.includes(",")) {
          // 750,00 formatı - ondalık virgül
          amount = parseFloat(cleanAmount.replace(",", "."));
        } else {
          // 750.00 veya 750 formatı
          amount = parseFloat(cleanAmount);
        }
        
        if (isNaN(amount) || amount === 0 || !dateStr) {
          console.log("ATLANACAK (gecersiz miktar/tarih):", line);
          skippedCount++;
          continue;
        }

        // Tarih parsing
        let finalDate = new Date(dateStr);
        if (isNaN(finalDate.getTime())) {
          // DD/MM/YYYY veya DD.MM.YYYY formatı dene
          if (dateStr.includes("/") || dateStr.includes(".")) {
            const separator = dateStr.includes("/") ? "/" : ".";
            const [d, m, y] = dateStr.split(separator);
            finalDate = new Date(`${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`);
          }
        }

        if (isNaN(finalDate.getTime())) {
          console.log("ATLANACAK (gecersiz tarih):", dateStr);
          skippedCount++;
          continue;
        }

        // Akıllı kategori düzeltmesi
        let finalCategory = category || "Diğer";
        const descLower = (desc || "").toLowerCase();
        const categoryLower = (category || "").toLowerCase();
        
        if (descLower.includes("cafe") || descLower.includes("restaurant") || descLower.includes("burger") || descLower.includes("pizza") || descLower.includes("yemek") || categoryLower.includes("restaurant")) {
          finalCategory = "Yemek";
        } else if (descLower.includes("taksit") || descLower.includes("kredi")) {
          finalCategory = "Taksit";
        } else if (descLower.includes("giyim") || descLower.includes("perakende") || descLower.includes("zara") || descLower.includes("waikiki") || descLower.includes("koton") || descLower.includes("defacto")) {
          finalCategory = "Alışveriş";
        } else if (descLower.includes("market") || descLower.includes("migros") || descLower.includes("a101") || descLower.includes("bim") || descLower.includes("carrefour")) {
          finalCategory = "Market";
        } else if (descLower.includes("shell") || descLower.includes("opet") || descLower.includes("petrol") || descLower.includes("benzin")) {
          finalCategory = "Yakıt";
        }

        const transactionData = {
          userId: session.user.id,
          date: finalDate,
          category: finalCategory,
          amount: Math.abs(amount),
          type: (typeStr?.toLowerCase().includes("income") || typeStr?.toLowerCase().includes("gelir")) ? "income" : "expense",
          description: desc || "PDF Aktarımı",
          currency: "TRY"
        };

        await Transaction.create(transactionData);
        console.log("EKLENDI:", transactionData);
        savedCount++;
      } catch (err) {
        console.error("HATALI SATIR:", line, err);
        skippedCount++;
      }
    }

    console.log(`SONUC: ${savedCount} eklendi, ${skippedCount} atlandi`);
    return NextResponse.json({ message: `${savedCount} islem basariyla eklendi.`, count: savedCount, skipped: skippedCount });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Bilinmeyen hata";
    return NextResponse.json({ error: "Sistemsel hata: " + message }, { status: 500 });
  }
}
