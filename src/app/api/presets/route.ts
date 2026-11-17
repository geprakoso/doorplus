import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const presets = await prisma.productPreset.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    const parsedPresets = presets.map((p) => ({
      ...p,
      config: JSON.parse(p.configJson),
    }));

    return NextResponse.json({
      success: true,
      data: parsedPresets,
    });
  } catch (error: any) {
    console.error("GET /api/presets error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memuat preset" },
      { status: 500 }
    );
  }
}
