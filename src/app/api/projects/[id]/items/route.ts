import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: projectId } = params;
    const body = await req.json();
    const {
      name,
      category,
      presetCode,
      width,
      height,
      quantity = 1,
      frameSize = "3_INCH",
      frameThickness = 40,
      color = "SILVER",
      glassCode = "KACA_POLOS_5MM",
      calculationResult,
    } = body;

    if (!name || !presetCode || !width || !height || !calculationResult) {
      return NextResponse.json(
        { success: false, message: "Data item proyek tidak lengkap" },
        { status: 400 }
      );
    }

    const item = await prisma.projectItem.create({
      data: {
        projectId,
        name: name.trim(),
        category: category || "DOOR",
        presetCode,
        width: Number(width),
        height: Number(height),
        quantity: Number(quantity) || 1,
        frameSize,
        frameThickness: Number(frameThickness) || 40,
        color,
        glassCode,
        calculationResult: typeof calculationResult === "string"
          ? calculationResult
          : JSON.stringify(calculationResult),
      },
    });

    return NextResponse.json({
      success: true,
      data: item,
    });
  } catch (error: any) {
    console.error("POST /api/projects/[id]/items error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal menambahkan item ke proyek" },
      { status: 500 }
    );
  }
}
