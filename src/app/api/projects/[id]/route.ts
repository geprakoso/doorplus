import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, message: "Proyek tidak ditemukan" },
        { status: 404 }
      );
    }

    const parsedItems = project.items.map((item) => ({
      ...item,
      calculationResult: JSON.parse(item.calculationResult),
    }));

    return NextResponse.json({
      success: true,
      data: {
        ...project,
        items: parsedItems,
      },
    });
  } catch (error: any) {
    console.error("GET /api/projects/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memuat detail proyek" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { name, clientName, address, notes } = body;

    const updated = await prisma.project.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        clientName: clientName !== undefined ? clientName?.trim() : undefined,
        address: address !== undefined ? address?.trim() : undefined,
        notes: notes !== undefined ? notes?.trim() : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    console.error("PUT /api/projects/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memperbarui proyek" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Proyek berhasil dihapus",
    });
  } catch (error: any) {
    console.error("DELETE /api/projects/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal menghapus proyek" },
      { status: 500 }
    );
  }
}
