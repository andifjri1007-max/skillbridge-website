"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setErrorMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F6F6F4] px-6 py-12">

      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-[#E5E1D5] bg-white shadow-xl md:grid-cols-2">

        {/* BAGIAN KIRI */}
        <div className="hidden bg-[#101C36] p-10 text-white md:flex md:flex-col md:justify-between">

          <div>
            <Link
              href="/"
              className="text-2xl font-bold text-[#FFD85E]"
            >
              SkillBridge UMKM
            </Link>

            <h2 className="mt-16 text-4xl font-bold leading-tight">
              Hubungkan skill dengan peluang nyata.
            </h2>

            <p className="mt-5 max-w-md leading-7 text-white/70">
              Temukan micro-project, bangun pengalaman, dan kembangkan
              portofolio bersama UMKM.
            </p>
          </div>

          <div className="mt-12 rounded-3xl bg-white/10 p-6">
            <p className="text-sm font-semibold text-[#FFD85E]">
              SkillBridge
            </p>

            <p className="mt-2 text-sm leading-6 text-white/70">
              Satu tempat untuk proyek, lamaran, hasil kerja, review, dan
              portofolio terverifikasi.
            </p>
          </div>

        </div>

        {/* BAGIAN KANAN */}
        <div className="p-8 md:p-10">

          <Link
            href="/"
            className="mb-8 inline-block text-sm font-semibold text-[#101C36] transition hover:underline"
          >
            ← Kembali ke beranda
          </Link>

          <div className="mb-8">

            <div className="mb-4 inline-flex rounded-full bg-[#FBEDB9] px-4 py-2 text-sm font-semibold text-[#101C36]">
              Selamat Datang
            </div>

            <h1 className="text-3xl font-bold text-[#101C36]">
              Masuk ke SkillBridge
            </h1>

            <p className="mt-3 leading-7 text-[#303030]/70">
              Masuk untuk mengakses proyek dan dashboard Anda.
            </p>

          </div>

          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >

            {/* EMAIL */}
            <div>

              <label className="mb-2 block font-semibold text-[#303030]">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
                placeholder="nama@email.com"
                className="w-full rounded-xl border border-[#D8D5CB] bg-[#F6F6F4] px-4 py-3 text-[#303030] outline-none transition placeholder:text-[#303030]/40 focus:border-[#101C36] focus:bg-white focus:ring-2 focus:ring-[#101C36]/10"
              />

            </div>

            {/* PASSWORD */}
            <div>

              <label className="mb-2 block font-semibold text-[#303030]">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
                placeholder="Masukkan password"
                className="w-full rounded-xl border border-[#D8D5CB] bg-[#F6F6F4] px-4 py-3 text-[#303030] outline-none transition placeholder:text-[#303030]/40 focus:border-[#101C36] focus:bg-white focus:ring-2 focus:ring-[#101C36]/10"
              />

            </div>

            {/* ERROR */}
            {errorMessage && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                {errorMessage}
              </div>
            )}

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#101C36] py-3 font-semibold text-white transition hover:bg-[#303030] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Memproses..."
                : "Masuk"}
            </button>

          </form>

          <div className="my-7 flex items-center gap-4">

            <div className="h-px flex-1 bg-[#E4E0D5]" />

            <span className="text-xs font-medium text-[#303030]/50">
              SKILLBRIDGE UMKM
            </span>

            <div className="h-px flex-1 bg-[#E4E0D5]" />

          </div>

          <p className="text-center text-[#303030]/70">
            Belum memiliki akun?{" "}

            <Link
              href="/register"
              className="font-bold text-[#101C36] transition hover:underline"
            >
              Daftar
            </Link>
          </p>

        </div>

      </div>

    </main>
  );
}