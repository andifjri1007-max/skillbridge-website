"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import {
  useParams,
  useRouter,
} from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();

  const projectId = Number(params.id);

  const [title, setTitle] = useState("");
  const [category, setCategory] =
    useState("Desain Grafis");
  const [description, setDescription] =
    useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] =
    useState("");

  const [loading, setLoading] =
    useState(true);
  const [saving, setSaving] =
    useState(false);
  const [message, setMessage] =
    useState("");

  useEffect(() => {
    async function loadProject() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: project, error } =
        await supabase
          .from("projects")
          .select("*")
          .eq("id", projectId)
          .eq("owner_id", user.id)
          .single();

      if (error || !project) {
        router.push("/projects/mine");
        return;
      }

      if (project.status !== "open") {
        router.push("/projects/mine");
        return;
      }

      setTitle(project.title);
      setCategory(project.category);
      setDescription(project.description);
      setBudget(String(project.budget));
      setDeadline(project.deadline);

      setLoading(false);
    }

    loadProject();
  }, [projectId, router]);

  async function handleUpdate(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setSaving(true);
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase
      .from("projects")
      .update({
        title,
        category,
        description,
        budget: Number(budget),
        deadline,
      })
      .eq("id", projectId);

    if (error) {
      setMessage(
        "Gagal memperbarui proyek: " +
          error.message
      );

      setSaving(false);
      return;
    }

    setMessage("Proyek berhasil diperbarui.");

    setTimeout(() => {
      router.push("/projects/mine");
    }, 800);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F6F6F4]">
        <div className="text-center">

          <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-full bg-[#FFD85E]" />

          <p className="font-medium text-[#303030]/70">
            Memuat proyek...
          </p>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F6F6F4] px-6 py-12 text-[#303030]">

      <div className="mx-auto max-w-3xl">

        <Link
          href="/projects/mine"
          className="font-semibold text-[#101C36] transition hover:underline"
        >
          ← Kembali ke Proyek Saya
        </Link>

        <div className="mt-6 overflow-hidden rounded-[2rem] border border-[#E5E1D5] bg-white shadow-sm">

          {/* HEADER */}
          <div className="bg-[#101C36] p-8 text-white md:p-10">

            <div className="inline-flex rounded-full bg-[#FFD85E] px-4 py-2 text-sm font-bold text-[#101C36]">
              Kelola Proyek
            </div>

            <h1 className="mt-5 text-3xl font-bold">
              Edit Proyek
            </h1>

            <p className="mt-3 max-w-xl leading-7 text-white/70">
              Perbarui informasi proyek Anda sebelum
              mahasiswa mulai mengerjakannya.
            </p>

          </div>

          {/* FORM */}
          <div className="p-8 md:p-10">

            <form
              onSubmit={handleUpdate}
              className="space-y-6"
            >

              {/* JUDUL */}
              <div>

                <label className="mb-2 block font-semibold text-[#303030]">
                  Judul Proyek
                </label>

                <input
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  required
                  className="w-full rounded-xl border border-[#D8D5CB] bg-[#F6F6F4] px-4 py-3 text-[#303030] outline-none transition focus:border-[#101C36] focus:bg-white focus:ring-2 focus:ring-[#101C36]/10"
                />

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
                  rows={6}
                  required
                  className="w-full rounded-xl border border-[#D8D5CB] bg-[#F6F6F4] px-4 py-3 text-[#303030] outline-none transition focus:border-[#101C36] focus:bg-white focus:ring-2 focus:ring-[#101C36]/10"
                />

              </div>

              {/* BUDGET + DEADLINE */}
              <div className="grid gap-5 md:grid-cols-2">

                <div>

                  <label className="mb-2 block font-semibold text-[#303030]">
                    Budget
                  </label>

                  <input
                    type="number"
                    value={budget}
                    onChange={(e) =>
                      setBudget(e.target.value)
                    }
                    required
                    min="1"
                    className="w-full rounded-xl border border-[#D8D5CB] bg-[#F6F6F4] px-4 py-3 text-[#303030] outline-none transition focus:border-[#101C36] focus:bg-white focus:ring-2 focus:ring-[#101C36]/10"
                  />

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

              {/* MESSAGE */}
              {message && (
                <div className="rounded-xl border border-[#E6D99D] bg-[#FBEDB9] p-4 font-medium text-[#101C36]">
                  {message}
                </div>
              )}

              {/* BUTTON */}
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-[#101C36] py-3 font-semibold text-white transition hover:bg-[#303030] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Menyimpan..."
                  : "Simpan Perubahan"}
              </button>

            </form>

          </div>

        </div>

      </div>

    </main>
  );
}