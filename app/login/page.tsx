"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Login gagal. Periksa kembali email dan password Anda.");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

   return (
     <div className="flex min-h-full items-center justify-center p-6 sm:p-12">
       <div className="w-full max-w-md space-y-6">
         <div>
           <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-gray-900">
             Masuk ke Sistem Poultry
           </h2>
         </div>
         <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
           <div className="-space-y-px rounded-md shadow-sm">
             <div>
               <input
                 type="email"
                 required
                 className="relative block w-full rounded-t-md border-0 py-3 px-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600"
                 placeholder="Alamat Email"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
               />
             </div>
             <div>
               <input
                 type="password"
                 required
                 className="relative block w-full rounded-b-md border-0 py-3 px-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600"
                 placeholder="Password"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
               />
             </div>
           </div>

           {error && (
             <div className="text-red-500 text-sm text-center font-medium">
               {error}
             </div>
           )}

           <div>
             <button
               type="submit"
               disabled={loading}
               className="w-full justify-center rounded-md bg-blue-600 py-4 px-6 text-base font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
             >
               {loading ? "Memproses..." : "Masuk"}
             </button>
           </div>
         </form>
       </div>
     </div>
   );
}