"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidateTag } from "next/cache";

const timeSlotValues = ["PAGI", "SIANG", "SORE", "MALAM"] as const;

const dailyLogSchema = z.object({
  cageId: z.string().min(1, "Kandang harus dipilih"),
  date: z.string().min(1, "Tanggal harus diisi"),
  timeSlot: z.enum(timeSlotValues, { message: "Waktu harus dipilih" }),
  mortality: z.coerce.number().int().min(0, "Mortalitas tidak boleh negatif"),
  feedQuantity: z.coerce.number().min(0, "Pakan tidak boleh negatif"),
});

export type DailyLogState = {
  errors?: {
    cageId?: string[];
    date?: string[];
    timeSlot?: string[];
    mortality?: string[];
    feedQuantity?: string[];
    global?: string[];
  };
  message?: string | null;
  success?: boolean;
};

export async function createDailyLog(prevState: DailyLogState, formData: FormData): Promise<DailyLogState> {
  const session = await getSession();

  if (!session || (session.user as any).role !== "ADMIN") {
    return {
      errors: { global: ["Anda tidak memiliki izin (Admin Only) untuk melakukan aksi ini."] },
      message: "Forbidden",
    };
  }

  const validatedFields = dailyLogSchema.safeParse({
    cageId: formData.get("cageId"),
    date: formData.get("date"),
    timeSlot: formData.get("timeSlot"),
    mortality: formData.get("mortality"),
    feedQuantity: formData.get("feedQuantity"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors as Record<string, string[]>,
      message: "Mohon periksa kembali inputan Anda.",
    };
  }

  const { cageId, date, timeSlot, mortality, feedQuantity } = validatedFields.data;

  try {
    await prisma.dailyLog.create({
      data: {
        cageId,
        date: new Date(date),
        timeSlot,
        mortality,
        feedQuantity,
      },
    });

    revalidateTag("daily-logs", "max");

    return {
      success: true,
      message: "Data log harian berhasil disimpan.",
    };
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && (error as Record<string, unknown>).code === "P2002") {
      return {
        errors: { global: ["Data untuk kandang, tanggal, dan waktu ini sudah ada. Gunakan tab Edit jika ingin mengubah."] },
        message: "Duplikasi data.",
      };
    }
    console.error("Database Error:", error);
    return {
      errors: { global: ["Gagal menyimpan ke database."] },
      message: "Terjadi kesalahan sistem.",
    };
  }
}