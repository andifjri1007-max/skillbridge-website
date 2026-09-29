"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CreateProjectPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Desain Grafis");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");

  const [userId, setUserId] = useState("");
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function checkUser() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!profile || profile.role !== "umkm") {
        router.push("/dashboard");
        return;
      }

      setUserId(user.id);
      setChecking(false);
    }

    checkUser();
  }, [router]);

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase
      .from("projects")
      .insert({
        owner_id: userId,
        title,
        category,
        description,
        budget: Number(budget),
        deadline,
      });

    if (error) {
      setMessage(
        "Gagal membuat proyek: " +
          error.message
      );

      setLoading(false);
      return;
    }

    setMessage(
      "Proyek berhasil dipublikasikan."
    );

    setTitle("");
    setDescription("");
    setBudget("");
    setDeadline("");

    setLoading(false);

    setTimeout(() => {
      router.push("/projects");
    }, 1000);
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F6F6F4]">
        <div className="text-center">

          <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-full bg-[#FFD85E]" />

          <p className="font-medium text-[#303030]/70">
            Memeriksa akun...
          </p>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F6F6F4] px-6 py-12 text-[#303030]">

      <div className="mx-auto max-w-3xl">

        <Link
          href="/dashboard"
          className="font-semibold text-[#101C36] transition hover:underline"
        >
          ← Kembali ke dashboard
        </Link>

        <div className="mt-6 overflow-hidden rounded-[2rem] border border-[#E5E1D5] bg-white shadow-sm">

          {/* HEADER */}
          <div className="bg-[#101C36] p-8 text-white md:p-10">

            <div className="inline-flex rounded-full bg-[#FFD85E] px-4 py-2 text-sm font-bold text-[#101C36]">
              Micro-Project UMKM
            </div>

            <h1 className="mt-5 text-3xl font-bold">
              Posting Proyek
            </h1>

            <p className="mt-3 max-w-xl leading-7 text-white/70">
              Jelaskan kebutuhan digital UMKM Anda
              dengan ruang lingkup, budget, dan
              deadline yang jelas.
            </p>

          </div>

          {/* FORM */}
          <div className="p-8 md:p-10">

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >

              {/* JUDUL */}
              <div>

                <label className="mb-2 block font-semibold text-[#303030]">
                  Judul Proyek
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  required
                  placeholder="Contoh: 5 Desain Feed Instagram"
                  className="w-full rounded-xl border border-[#D8D5CB] bg-[#F6F6F4] px-4 py-3 text-[#303030] outline-none transition placeholder:text-[#303030]/40 focus:border-[#101C36] focus:bg-white focus:ring-2 focus:ring-[#101C36]/10"
                />

                <p className="mt-2 text-sm text-[#303030]/50">
                  Gunakan judul yang singkat dan
                  menjelaskan hasil yang dibutuhkan.
                </p>

              </div>

              {/* KATEGORI */}
              <div>

                <label className="mb-2 block font-semibold text-[#303030]">
                  Kategori
                </label>

                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value)
                  }
                  className="w-full rounded-xl border border-[#D8D5CB] bg-[#F6F6F4] px-4 py-3 text-[#303030] outline-none transition focus:border-[#101C36] focus:bg-white focus:ring-2 focus:ring-[#101C36]/10"
                >
                  <option>Desain Grafis</option>
                  <option>Video</option>
                  <option>Social Media</option>
                  <option>Data Entry</option>
                  <option>Website</option>
                </select>

              </div>

              {/* DESKRIPSI */}
              <div>

                <label className="mb-2 block font-semibold text-[#303030]">
                  Deskripsi
                </label>

                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  required
                  rows={6}
                  placeholder="Jelaskan pekerjaan yang dibutuhkan, hasil akhir yang diharapkan, dan informasi penting lainnya..."
                  className="w-full rounded-xl border border-[#D8D5CB] bg-[#F6F6F4] px-4 py-3 text-[#303030] outline-none transition placeholder:text-[#303030]/40 focus:border-[#101C36] focus:bg-white focus:ring-2 focus:ring-[#101C36]/10"
                />

              </div>

              {/* BUDGET & DEADLINE */}
              <div className="grid gap-5 md:grid-cols-2">

                <div>

                  <label className="mb-2 block font-semibold text-[#303030]">
                    Budget
                  </label>

                  <div className="relative">

                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-[#101C36]">
                      Rp
                    </span>

                    <input
                      type="number"
                      value={budget}
                      onChange={(e) =>
                        setBudget(e.target.value)
                      }
                      required
                      min="1"
                      placeholder="150000"
                      className="w-full rounded-xl border border-[#D8D5CB] bg-[#F6F6F4] py-3 pl-12 pr-4 text-[#303030] outline-none transition placeholder:text-[#303030]/40 focus:border-[#101C36] focus:bg-white focus:ring-2 focus:ring-[#101C36]/10"
                    />

                  </div>

                </div>

                <div>

                  <label className="mb-2 block font-semibold text-[#303030]">
                    Deadline
                  </label>

                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) =>
                      setDeadline(e.target.value)
                    }
                    required
                    className="w-full rounded-xl border border-[#D8D5CB] bg-[#F6F6F4] px-4 py-3 text-[#303030] outline-none transition focus:border-[#101C36] focus:bg-white focus:ring-2 focus:ring-[#101C36]/10"
                  />

                </div>

              </div>

              {/* INFO */}
              <div className="rounded-2xl bg-[#FBEDB9] p-5">

                <p className="font-bold text-[#101C36]">
                  Sebelum dipublikasikan
                </p>

                <p className="mt-2 text-sm leading-6 text-[#303030]/65">
                  Pastikan deskripsi, budget, dan
                  deadline sudah jelas agar mahasiswa
                  dapat memahami proyek sebelum
                  mengirim lamaran.
                </p>

              </div>

              {/* MESSAGE */}
              {message && (
                <div className="rounded-xl border border-[#E6D99D] bg-[#FBEDB9] p-4 text-sm font-medium text-[#101C36]">
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
                  ? "Memposting..."
                  : "Posting Proyek"}
              </button>

            </form>

          </div>

        </div>

      </div>

    </main>
  );
}