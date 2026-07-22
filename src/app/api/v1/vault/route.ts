import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    
    let whereClause: any = {};
    if (user) {
      whereClause.userId = user.id;
    }

    const documents = await prisma.fileMetadata.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: documents,
      count: documents.length,
    });
  } catch (error: any) {
    console.error("[Vault GET API Error]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
