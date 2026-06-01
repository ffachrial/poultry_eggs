"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidateTag } from "next/cache";

const saleSchema = z.object({
  date: z.string().min(1, "Tanggal harus diisi"),
  buyerName: z.string().min(1, "Nama pembeli harus diisi"),
  weightKg: z.coerce.number().min(0.1, "Berat harus lebih dari 0"),
  unitPrice: z.coerce.number().min(1, "Harga per Kg harus diisi"),
  notes: z.string().optional(),
});

export type SaleState = {
  errors?: {
    date?: string[];
    buyerName?: string[];
    weightKg?: string[];
    unitPrice?: string[];
    global?: string[];
  };
  message?: string | null;
  success?: boolean;
};

export async function createSale(prevState: SaleState, formData: FormData): Promise<SaleState> {
  const session = await getSession();

  if (!session || (session.user as any).role !== "ADMIN") {
    return {
      errors: { global: ["Anda tidak memiliki izin (Admin Only) untuk melakukan aksi ini."] },
      message: "Forbidden",
    };
  }

  const validatedFields = saleSchema.safeParse({
    date: formData.get("date"),
    buyerName: formData.get("buyerName"),
    weightKg: formData.get("weightKg"),
    unitPrice: formData.get("unitPrice"),
    notes: formData.get("notes"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors as any,
      message: "Mohon periksa kembali inputan Anda.",
    };
  }

  const { date, buyerName, weightKg, unitPrice, notes } = validatedFields.data;
  const totalAmount = weightKg * unitPrice;

  try {
    await prisma.sale.create({
      data: {
        date: new Date(date),
        buyerName,
        weightKg,
        unitPrice,
        totalAmount,
        notes,
      },
    });

    revalidateTag("sales", "max");
    revalidateTag("finance", "max");

    return {
      success: true,
      message: "Data penjualan berhasil disimpan.",
    };
  } catch (error) {
    console.error("Database Error:", error);
    return {
      errors: { global: ["Gagal menyimpan ke database."] },
      message: "Terjadi kesalahan sistem.",
    };
  }
}