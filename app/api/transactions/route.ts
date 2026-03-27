import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/utils/db";
import Transaction from "@/models/Transaction";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Yetkisiz erişim." }, { status: 401 });
    }

    await connectToDatabase();
    const transactions = await Transaction.find({ userId: session.user.id }).sort({ date: -1 });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("İşlemler getirme hatası:", error);
    return NextResponse.json({ message: "Bir hata oluştu." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Yetkisiz erişim." }, { status: 401 });
    }

    const { type, amount, category, date, currency } = await req.json();

    if (!type || !amount || !category || !date) {
      return NextResponse.json({ message: "Eksik alanlar var." }, { status: 400 });
    }

    await connectToDatabase();
    const newTransaction = await Transaction.create({
      userId: session.user.id,
      type,
      amount,
      category,
      date,
      currency: currency || "TRY",
    });

    return NextResponse.json(newTransaction, { status: 201 });
  } catch (error) {
    console.error("İşlem kaydetme hatası:", error);
    return NextResponse.json({ message: "Bir hata oluştu." }, { status: 500 });
  }
}
