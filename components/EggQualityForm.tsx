"use client";

import { useActionState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { createEggLog, EggLogState } from "@/app/egg-quality/actions";
import { Cage } from "@prisma/client";

const initialState: EggLogState = {
  message: null,
  errors: {},
};

export default function EggQualityForm({ cages }: { cages: Cage[] }) {
  const [state, formAction, isPending] = useActionState(createEggLog, initialState);
  const { data: session } = useSession();
  const isAdmin = session?.user && (session.user as { role?: string }).role === "ADMIN";

  useEffect(() => {
    if (state.success) {
      // Clear form or show notification if needed
      const form = document.getElementById("egg-quality-form") as HTMLFormElement;
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
    <form id="egg-quality-form" action={formAction} className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4">Input Kualitas Telur</h2>
        
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

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="cageId" className="block text-sm font-medium text-gray-700">Kandang</label>
              <select
                id="cageId"
                name="cageId"
                required
                className="block w-full rounded-md border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
              required
              defaultValue={new Date().toISOString().split("T")[0]}
              className="block w-full rounded-md border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {state.errors?.date && (
              <p className="text-sm text-red-600">{state.errors.date[0]}</p>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="qualityS" className="block text-sm font-medium text-gray-700">Grade S (Kualitas Bagus)</label>
            <div className="relative">
              <input
                type="number"
                id="qualityS"
                name="qualityS"
                min="0"
                required
                placeholder="0"
                className="block w-full rounded-md border-gray-300 bg-gray-50 pl-4 pr-12 py-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="absolute right-3 top-2 text-gray-400 text-sm">Butir</span>
            </div>
            {state.errors?.qualityS && (
              <p className="text-sm text-red-600">{state.errors.qualityS[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="qualityR" className="block text-sm font-medium text-gray-700">Grade R (Retak/Kotor)</label>
            <div className="relative">
              <input
                type="number"
                id="qualityR"
                name="qualityR"
                min="0"
                required
                placeholder="0"
                className="block w-full rounded-md border-gray-300 bg-gray-50 pl-4 pr-12 py-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="absolute right-3 top-2 text-gray-400 text-sm">Butir</span>
            </div>
            {state.errors?.qualityR && (
              <p className="text-sm text-red-600">{state.errors.qualityR[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="qualityP" className="block text-sm font-medium text-gray-700">Grade P (Pecah)</label>
            <div className="relative">
              <input
                type="number"
                id="qualityP"
                name="qualityP"
                min="0"
                required
                placeholder="0"
                className="block w-full rounded-md border-gray-300 bg-gray-50 pl-4 pr-12 py-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="absolute right-3 top-2 text-gray-400 text-sm">Butir</span>
            </div>
            {state.errors?.qualityP && (
              <p className="text-sm text-red-600">{state.errors.qualityP[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Keterangan (Opsional)</label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="Detail pengambilan telur"
              className="block w-full rounded-lg border-gray-300 bg-gray-50 px-4 py-3 text-base text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-8">
          <button
            type="submit"
            disabled={isPending}
            className={`w-full rounded-lg px-6 py-3 text-sm font-medium text-white transition-colors ${
              isPending ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isPending ? 'Menyimpan...' : 'Simpan Kualitas'}
          </button>
        </div>
      </div>
    </form>
  );
}
