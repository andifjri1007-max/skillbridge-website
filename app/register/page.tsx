"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const supabase = createClient();

  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("mahasiswa");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleRegister(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const { data, error } =
      await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nama,
            role,
          },
        },
      });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      setMessage(
        "Pendaftaran berhasil. Akun sudah aktif."
      );
    } else {
      setMessage(
        "Pendaftaran berhasil. Silakan cek email untuk konfirmasi akun."
      );
    }

    setLoading(false);
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
              Mulai dari satu proyek,
              bangun pengalaman yang nyata.
            </h2>

            <p className="mt-5 max-w-md leading-7 text-white/70">
              Daftar sebagai mahasiswa untuk
              menemukan peluang proyek atau sebagai
              UMKM untuk mendapatkan bantuan
              digital dari mahasiswa.
            </p>

          </div>

          <div className="mt-12 space-y-4">

            <div className="rounded-2xl bg-white/10 p-5">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFD85E] font-bold text-[#101C36]">
                  M
                </div>

                <div>
                  <p className="font-semibold">
                    Mahasiswa
                  </p>

                  <p className="text-sm text-white/60">
                    Proyek, pengalaman, portofolio.
                  </p>
                </div>

              </div>

            </div>

            <div className="rounded-2xl bg-white/10 p-5">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FBEDB9] font-bold text-[#101C36]">
                  U
                </div>

                <div>
                  <p className="font-semibold">
                    UMKM
                  </p>

                  <p className="text-sm text-white/60">
                    Posting proyek dan temukan talent.
                  </p>
                </div>

              </div>

            </div>

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
              Buat Akun Baru
            </div>

            <h1 className="text-3xl font-bold text-[#101C36]">
              Daftar SkillBridge
            </h1>

            <p className="mt-3 leading-7 text-[#303030]/70">
              Buat akun sebagai mahasiswa atau UMKM
              dan mulai menggunakan SkillBridge.
            </p>

          </div>

          <form
            onSubmit={handleRegister}
            className="space-y-5"
          >

            {/* NAMA */}
            <div>

              <label className="mb-2 block font-semibold text-[#303030]">
                Nama
              </label>

              <input
                type="text"
                value={nama}
                onChange={(e) =>
                  setNama(e.target.value)
                }
                required
                placeholder="Masukkan nama"
                className="w-full rounded-xl border border-[#D8D5CB] bg-[#F6F6F4] px-4 py-3 text-[#303030] outline-none transition placeholder:text-[#303030]/40 focus:border-[#101C36] focus:bg-white focus:ring-2 focus:ring-[#101C36]/10"
              />

            </div>

            {/* ROLE */}
            <div>

              <label className="mb-2 block font-semibold text-[#303030]">
                Daftar sebagai
              </label>

              <select
                value={role}
                onChange={(e) =>
                  setRole(e.target.value)
                }
                className="w-full rounded-xl border border-[#D8D5CB] bg-[#F6F6F4] px-4 py-3 text-[#303030] outline-none transition focus:border-[#101C36] focus:bg-white focus:ring-2 focus:ring-[#101C36]/10"
              >
                <option value="mahasiswa">
                  Mahasiswa
                </option>

                <option value="umkm">
                  UMKM
                </option>
              </select>

            </div>

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
                minLength={6}
                placeholder="Minimal 6 karakter"
                className="w-full rounded-xl border border-[#D8D5CB] bg-[#F6F6F4] px-4 py-3 text-[#303030] outline-none transition placeholder:text-[#303030]/40 focus:border-[#101C36] focus:bg-white focus:ring-2 focus:ring-[#101C36]/10"
              />

              <p className="mt-2 text-sm text-[#303030]/50">
                Gunakan minimal 6 karakter.
              </p>

            </div>

            {/* MESSAGE */}
            {message && (
              <div className="rounded-xl border border-[#E4D69C] bg-[#FBEDB9] p-4 text-sm font-medium text-[#101C36]">
                {message}
              </div>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#101C36] py-3 font-semibold text-white transition hover:bg-[#303030] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Mendaftar..."
                : "Daftar"}
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
            Sudah memiliki akun?{" "}

            <Link
              href="/login"
              className="font-bold text-[#101C36] transition hover:underline"
            >
              Masuk
            </Link>
          </p>

        </div>

      </div>

    </main>
  );
}