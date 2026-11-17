import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [profiles, glasses, accessories] = await Promise.all([
      prisma.profile.findMany({
        orderBy: [{ category: "asc" }, { size: "asc" }, { name: "asc" }],
      }),
      prisma.glass.findMany({
        orderBy: [{ thicknessMm: "asc" }, { name: "asc" }],
      }),
      prisma.accessory.findMany({
        orderBy: [{ category: "asc" }, { name: "asc" }],
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: { profiles, glasses, accessories },
    });
  } catch (error: any) {
    console.error("GET /api/materials error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memuat material" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, id, data } = body;

    if (!type || !id || !data) {
      return NextResponse.json(
        { success: false, message: "Parameter tidak lengkap (type, id, data)" },
        { status: 400 }
      );
    }

    if (type === "profile") {
      const updated = await prisma.profile.update({
        where: { id },
        data: {
          priceSilver: data.priceSilver !== undefined ? Number(data.priceSilver) : undefined,
          priceBrown: data.priceBrown !== undefined ? Number(data.priceBrown) : undefined,
          priceBlack: data.priceBlack !== undefined ? Number(data.priceBlack) : undefined,
          priceWhite: data.priceWhite !== undefined ? Number(data.priceWhite) : undefined,
        },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    if (type === "glass") {
      const updated = await prisma.glass.update({
        where: { id },
        data: {
          pricePerM2: Number(data.pricePerM2),
        },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    if (type === "accessory") {
      const updated = await prisma.accessory.update({
        where: { id },
        data: {
          pricePerUnit: Number(data.pricePerUnit),
        },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    return NextResponse.json(
      { success: false, message: `Tipe material '${type}' tidak valid` },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("PUT /api/materials error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memperbarui harga" },
      { status: 500 }
    );
  }
}
