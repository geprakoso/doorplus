import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const { itemId } = params;
    await prisma.projectItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({
      success: true,
      message: "Item proyek berhasil dihapus",
    });
  } catch (error: any) {
    console.error("DELETE /api/projects/[id]/items/[itemId] error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal menghapus item" },
      { status: 500 }
    );
  }
}
