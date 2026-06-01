"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidateTag } from "next/cache";

const expenseSchema = z.object({
  date: z.string().min(1, "Tanggal harus diisi"),
  category: z.string().min(1, "Kategori harus diisi"),
  amount: z.coerce.number().min(1, "Nominal harus lebih dari 0"),
  description: z.string().optional(),
});

export type ExpenseState = {
  errors?: {
    date?: string[];
    category?: string[];
    amount?: string[];
    global?: string[];
  };
  message?: string | null;
  success?: boolean;
};

export async function createExpense(prevState: ExpenseState, formData: FormData): Promise<ExpenseState> {
  const session = await getSession();

  if (!session || (session.user as any).role !== "ADMIN") {
    return {
      errors: { global: ["Anda tidak memiliki izin (Admin Only) untuk melakukan aksi ini."] },
      message: "Forbidden",
    };
  }

  const validatedFields = expenseSchema.safeParse({
    date: formData.get("date"),
    category: formData.get("category"),
    amount: formData.get("amount"),
    description: formData.get("description"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors as any,
      message: "Mohon periksa kembali inputan Anda.",
    };
  }

  const { date, category, amount, description } = validatedFields.data;

  try {
    await prisma.expense.create({
      data: {
        date: new Date(date),
        category,
        amount,
        description,
      },
    });

    revalidateTag("finance", "max");

    return {
      success: true,
      message: "Data pengeluaran berhasil disimpan.",
    };
  } catch (error) {
    console.error("Database Error:", error);
    return {
      errors: { global: ["Gagal menyimpan ke database."] },
      message: "Terjadi kesalahan sistem.",
    };
  }
}