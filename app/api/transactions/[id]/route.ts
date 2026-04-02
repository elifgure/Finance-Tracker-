import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Transaction from "@/models/Transaction";
import connectDB from "@/utils/db";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { id } = params;

    // İşlemi bul ve kullanıcıya ait olduğunu doğrula
    const transaction = await Transaction.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "İşlem bulunamadı veya yetkiniz yok" },
        { status: 404 }
      );
    }

    // İşlemi sil
    await Transaction.deleteOne({ _id: id });

    return NextResponse.json(
      { message: "İşlem başarıyla silindi" },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("DELETE transaction error:", error);
    const message = error instanceof Error ? error.message : "Bilinmeyen hata";
    return NextResponse.json(
      { error: "Silme işlemi başarısız: " + message },
      { status: 500 }
    );
  }
}
