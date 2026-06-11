import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    // Parse dates or use defaults (last 30 days)
    const endDate = endDateParam ? new Date(endDateParam) : new Date();
    const startDate = startDateParam
      ? new Date(startDateParam)
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const eggLogs = await prisma.eggLog.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: "desc" },
      include: {
        cage: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(eggLogs);
  } catch (error) {
    console.error("Error fetching egg logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch egg logs" },
      { status: 500 }
    );
  }
}