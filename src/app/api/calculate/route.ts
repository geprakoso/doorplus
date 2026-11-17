import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateAluminiumItem } from "@/lib/calculator/engine";
import { CalculationInput } from "@/lib/calculator/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      presetCode,
      widthMm,
      heightMm,
      quantity = 1,
      frameSize = "3_INCH",
      frameThicknessMm,
      color = "SILVER",
      glassCode = "KACA_POLOS_5MM",
      customParams = {},
    } = body;

    if (!presetCode || !widthMm || !heightMm) {
      return NextResponse.json(
        { success: false, message: "Parameter wajib: presetCode, widthMm, heightMm" },
        { status: 400 }
      );
    }

    if (widthMm < 200 || widthMm > 10000 || heightMm < 200 || heightMm > 10000) {
      return NextResponse.json(
        { success: false, message: "Dimensi lebar dan tinggi harus antara 200mm dan 10000mm" },
        { status: 400 }
      );
    }

    // Fetch pricing from database
    const [profiles, glasses, accessories] = await Promise.all([
      prisma.profile.findMany(),
      prisma.glass.findMany(),
      prisma.accessory.findMany(),
    ]);

    const input: CalculationInput = {
      presetCode,
      widthMm: Number(widthMm),
      heightMm: Number(heightMm),
      quantity: Number(quantity) || 1,
      frameSize,
      frameThicknessMm: frameThicknessMm ? Number(frameThicknessMm) : undefined,
      color,
      glassCode,
      customParams,
    };

    const result = calculateAluminiumItem(input, {
      profiles,
      glasses,
      accessories,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("POST /api/calculate error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal melakukan kalkulasi" },
      { status: 500 }
    );
  }
}
