"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidateTag } from "next/cache";

const eggLogSchema = z.object({
  cageId: z.string().min(1, "Kandang harus dipilih"),
  date: z.string().min(1, "Tanggal harus diisi"),
  qualityS: z.coerce.number().int().min(0, "Kualitas S tidak boleh negatif"),
  qualityR: z.coerce.number().int().min(0, "Kualitas R tidak boleh negatif"),
  qualityP: z.coerce.number().int().min(0, "Kualitas P tidak boleh negatif"),
});

export type EggLogState = {
  errors?: {
    cageId?: string[];
    date?: string[];
    qualityS?: string[];
    qualityR?: string[];
    qualityP?: string[];
    global?: string[];
  };
  message?: string | null;
  success?: boolean;
};

export async function createEggLog(prevState: EggLogState, formData: FormData): Promise<EggLogState> {
  const session = await getSession();

  if (!session || (session.user as any).role !== "ADMIN") {
    return {
      errors: { global: ["Anda tidak memiliki izin (Admin Only) untuk melakukan aksi ini."] },
      message: "Forbidden",
    };
  }

  const validatedFields = eggLogSchema.safeParse({
    cageId: formData.get("cageId"),
    date: formData.get("date"),
    qualityS: formData.get("qualityS"),
    qualityR: formData.get("qualityR"),
    qualityP: formData.get("qualityP"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors as any,
      message: "Mohon periksa kembali inputan Anda.",
    };
  }

  const { cageId, date, qualityS, qualityR, qualityP } = validatedFields.data;
  const totalGood = qualityS + qualityR;

  try {
    await prisma.eggLog.create({
      data: {
        cageId,
        date: new Date(date),
        qualityS,
        qualityR,
        qualityP,
        totalGood,
      },
    });

    // In Next.js 16, revalidateTag requires 2nd argument. 
    // We use "max" for stale-while-revalidate semantics.
    revalidateTag("egg-logs", "max");
    
    return {
      success: true,
      message: "Data kualitas telur berhasil disimpan.",
    };
  } catch (error) {
    console.error("Database Error:", error);
    return {
      errors: { global: ["Gagal menyimpan ke database."] },
      message: "Terjadi kesalahan sistem.",
    };
  }
}