"use client";

import { useActionState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { createDailyLog, DailyLogState } from "@/app/daily-logs/actions";
import { Cage } from "@prisma/client";

const initialState: DailyLogState = {
  message: null,
  errors: {},
};

export default function DailyLogForm({ cages }: { cages: Cage[] }) {
  const [state, formAction, isPending] = useActionState(createDailyLog, initialState);
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  useEffect(() => {
    if (state.success) {
      const form = document.getElementById("daily-log-form") as HTMLFormElement;
      if (form) form.reset();
    }
  }, [state]);

  if (!isAdmin) {
    return (
      <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-blue-800 mb-8">
        <p className="font-medium text-center">Anda dalam mode View-Only. Hanya Admin yang dapat menambah data.</p>
      </div>
    );
  }

  return (
    <form id="daily-log-form" action={formAction} className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4">Input Log Harian</h2>
        
        {state.message && (
          <div className={`p-4 rounded-lg mb-6 ${state.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {state.message}
          </div>
        )}

        {state.errors?.global && (
          <div className="p-4 rounded-lg mb-6 bg-red-50 text-red-700">
            {state.errors.global.map(err => <p key={err}>{err}</p>)}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label htmlFor="cageId" className="block text-sm font-medium text-gray-700">Kandang</label>
            <select
              id="cageId"
              name="cageId"
              required
              className="w-full rounded-lg border-gray-300 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Pilih Kandang</option>
              {cages.map((cage) => (
                <option key={cage.id} value={cage.id}>{cage.name}</option>
              ))}
            </select>
            {state.errors?.cageId && (
              <p className="text-sm text-red-600">{state.errors.cageId[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">Tanggal</label>
            <input
              type="date"
              id="date"
              name="date"
              defaultValue={new Date().toISOString().split('T')[0]}
              required
              className="w-full rounded-lg border-gray-300 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {state.errors?.date && (
              <p className="text-sm text-red-600">{state.errors.date[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="timeSlot" className="block text-sm font-medium text-gray-700">Waktu</label>
            <select
              id="timeSlot"
              name="timeSlot"
              required
              className="w-full rounded-lg border-gray-300 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Pilih Waktu</option>
              <option value="PAGI">PAGI</option>
              <option value="SIANG">SIANG</option>
              <option value="SORE">SORE</option>
              <option value="MALAM">MALAM</option>
            </select>
            {state.errors?.timeSlot && (
              <p className="text-sm text-red-600">{state.errors.timeSlot[0]}</p>
            )}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="mortality" className="block text-sm font-medium text-gray-700">Mortalitas (Ayam Mati)</label>
            <div className="relative">
              <input
                type="number"
                id="mortality"
                name="mortality"
                min="0"
                required
                className="w-full rounded-lg border-gray-300 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="0"
              />
              <span className="absolute right-3 top-2 text-gray-400 text-sm">Ekor</span>
            </div>
            {state.errors?.mortality && (
              <p className="text-sm text-red-600">{state.errors.mortality[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="feedQuantity" className="block text-sm font-medium text-gray-700">Pemberian Pakan</label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                id="feedQuantity"
                name="feedQuantity"
                min="0"
                required
                className="w-full rounded-lg border-gray-300 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="0"
              />
              <span className="absolute right-3 top-2 text-gray-400 text-sm">Kg</span>
            </div>
            {state.errors?.feedQuantity && (
              <p className="text-sm text-red-600">{state.errors.feedQuantity[0]}</p>
            )}
          </div>
        </div>

        <div className="mt-8">
          <button
            type="submit"
            disabled={isPending}
            className={`w-full md:w-auto md:px-6 py-3 md:py-2 rounded-lg font-medium text-white transition-colors ${
              isPending ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isPending ? 'Menyimpan...' : 'Simpan Log'}
          </button>
        </div>
      </div>
    </form>
  );
}