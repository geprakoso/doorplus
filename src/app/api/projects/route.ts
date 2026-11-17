import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: projects,
    });
  } catch (error: any) {
    console.error("GET /api/projects error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memuat proyek" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, clientName, address, notes } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { success: false, message: "Nama proyek wajib diisi" },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        clientName: clientName?.trim() || null,
        address: address?.trim() || null,
        notes: notes?.trim() || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: project,
    });
  } catch (error: any) {
    console.error("POST /api/projects error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal membuat proyek" },
      { status: 500 }
    );
  }
}
