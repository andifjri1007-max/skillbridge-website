"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Project = {
  id: number;
  owner_id: string;
  title: string;
  category: string;
  description: string;
  budget: number;
  deadline: string;
  status: string;
  created_at: string;
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();

  const projectId = Number(params.id);

  const [project, setProject] = useState<Project | null>(null);
  const [ownerName, setOwnerName] = useState("UMKM");

  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("");

  const [message, setMessage] = useState("");
  const [applied, setApplied] = useState(false);

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile) {
        setRole(profile.role);
      }

      const { data: projectData, error: projectError } =
        await supabase
          .from("projects")
          .select("*")
          .eq("id", projectId)
          .single();

      if (projectError || !projectData) {
        setErrorMessage("Proyek tidak ditemukan.");
        setLoading(false);
        return;
      }

      setProject(projectData);

      const { data: owner } = await supabase
        .from("profiles")
        .select("nama")
        .eq("id", projectData.owner_id)
        .single();

      if (owner?.nama) {
        setOwnerName(owner.nama);
      }

      if (profile?.role === "mahasiswa") {
        const { data: existingApplication } =
          await supabase
            .from("applications")
            .select("id")
            .eq("project_id", projectId)
            .eq("student_id", user.id)
            .maybeSingle();

        if (existingApplication) {
          setApplied(true);
        }
      }

      setLoading(false);
    }

    loadData();
  }, [projectId, router]);

  async function handleApply(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!project || !userId) return;

    setSending(true);
    setErrorMessage("");

    const supabase = createClient();

    const { error } = await supabase
      .from("applications")
      .insert({
        project_id: project.id,
        student_id: userId,
        message: message || null,
      });

    if (error) {
      if (error.code === "23505") {
        setApplied(true);
        setErrorMessage(
          "Kamu sudah melamar proyek ini."
        );
      } else {
        setErrorMessage(
          "Gagal mengirim lamaran: " +
            error.message
        );
      }

      setSending(false);
      return;
    }

    setApplied(true);
    setMessage("");
    setSending(false);
  }

  function formatRupiah(value: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F6F6F4]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-full bg-[#FFD85E]" />

          <p className="font-medium text-[#303030]/70">
            Memuat detail proyek...
          </p>
        </div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F6F6F4] px-6">
        <div className="w-full max-w-md rounded-3xl border border-[#E5E1D5] bg-white p-8 text-center shadow-sm">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FBEDB9] text-2xl">
            !
          </div>

          <h1 className="mt-5 text-2xl font-bold text-[#101C36]">
            Proyek tidak ditemukan
          </h1>

          {errorMessage && (
            <p className="mt-3 text-[#303030]/65">
              {errorMessage}
            </p>
          )}

          <Link
            href="/projects"
            className="mt-6 inline-block rounded-xl bg-[#101C36] px-5 py-3 font-semibold text-white transition hover:bg-[#303030]"
          >
            ← Kembali ke proyek
          </Link>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F6F6F4] text-[#303030]">

      {/* NAVBAR */}
      <nav className="border-b border-[#E5E1D5] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <Link
            href="/"
            className="text-2xl font-bold text-[#101C36]"
          >
            SkillBridge UMKM
          </Link>

          <Link
            href="/dashboard"
            className="rounded-xl border border-[#101C36] px-5 py-2 font-semibold text-[#101C36] transition hover:bg-[#FBEDB9]"
          >
            Dashboard
          </Link>

        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-6 py-12">

        <Link
          href="/projects"
          className="font-semibold text-[#101C36] transition hover:underline"
        >
          ← Kembali ke daftar proyek
        </Link>

        {/* HEADER PROJECT */}
        <div className="mt-6 overflow-hidden rounded-[2rem] border border-[#E5E1D5] bg-white shadow-sm">

          <div className="bg-[#101C36] p-8 text-white md:p-10">

            <span className="inline-block rounded-full bg-[#FFD85E] px-4 py-2 text-sm font-bold text-[#101C36]">
              {project.category}
            </span>

            <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight">
              {project.title}
            </h1>

            <p className="mt-4 text-white/65">
              Diposting oleh{" "}
              <span className="font-semibold text-[#FBEDB9]">
                {ownerName}
              </span>
            </p>

          </div>

          <div className="p-8 md:p-10">

            {/* BUDGET & DEADLINE */}
            <div className="grid gap-4 md:grid-cols-2">

              <div className="rounded-2xl bg-[#FBEDB9] p-5">

                <p className="text-sm font-medium text-[#303030]/55">
                  Budget
                </p>

                <p className="mt-2 text-2xl font-bold text-[#101C36]">
                  {formatRupiah(project.budget)}
                </p>

              </div>

              <div className="rounded-2xl bg-[#F6F6F4] p-5">

                <p className="text-sm font-medium text-[#303030]/55">
                  Deadline
                </p>

                <p className="mt-2 text-xl font-bold text-[#101C36]">
                  {new Date(
                    project.deadline
                  ).toLocaleDateString("id-ID")}
                </p>

              </div>

            </div>

            {/* DESKRIPSI */}
            <div className="mt-8 border-t border-[#E5E1D5] pt-8">

              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#101C36]/60">
                Tentang Proyek
              </p>

              <h2 className="mt-2 text-2xl font-bold text-[#101C36]">
                Deskripsi Proyek
              </h2>

              <p className="mt-4 whitespace-pre-line leading-8 text-[#303030]/70">
                {project.description}
              </p>

            </div>

            {/* FORM LAMARAN MAHASISWA */}
            {role === "mahasiswa" && (
              <div className="mt-10 border-t border-[#E5E1D5] pt-8">

                <div className="mb-5">

                  <p className="font-semibold text-[#101C36]">
                    Tertarik dengan proyek ini?
                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-[#101C36]">
                    Lamar Proyek
                  </h2>

                </div>

                {project.status !== "open" ? (
                  <div className="rounded-2xl border border-[#E5E1D5] bg-[#F6F6F4] p-5 text-[#303030]/65">
                    Proyek ini sudah tidak menerima
                    lamaran baru.
                  </div>
                ) : applied ? (
                  <div className="rounded-2xl border border-green-200 bg-green-50 p-5 text-green-700">
                    <p className="font-bold">
                      ✓ Lamaran sudah dikirim
                    </p>

                    <p className="mt-1 text-sm">
                      UMKM akan meninjau lamaran kamu.
                    </p>
                  </div>
                ) : (
                  <form
                    onSubmit={handleApply}
                    className="rounded-3xl bg-[#F6F6F4] p-6"
                  >

                    <label className="mb-2 block font-semibold text-[#303030]">
                      Pesan untuk UMKM
                    </label>

                    <textarea
                      value={message}
                      onChange={(e) =>
                        setMessage(e.target.value)
                      }
                      rows={5}
                      placeholder="Contoh: Saya tertarik mengerjakan proyek ini dan memiliki pengalaman membuat desain media sosial."
                      className="w-full rounded-xl border border-[#D8D5CB] bg-white px-4 py-3 text-[#303030] outline-none transition placeholder:text-[#303030]/40 focus:border-[#101C36] focus:ring-2 focus:ring-[#101C36]/10"
                    />

                    <p className="mt-2 text-sm text-[#303030]/50">
                      Ceritakan singkat alasan kamu cocok
                      mengerjakan proyek ini.
                    </p>

                    {errorMessage && (
                      <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                        {errorMessage}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={sending}
                      className="mt-5 rounded-xl bg-[#101C36] px-7 py-3 font-semibold text-white transition hover:bg-[#303030] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {sending
                        ? "Mengirim..."
                        : "Lamar Proyek"}
                    </button>

                  </form>
                )}

              </div>
            )}

            {/* JIKA PEMILIK PROYEK */}
            {role === "umkm" &&
              userId === project.owner_id && (
                <div className="mt-10 rounded-2xl border border-[#E6D99D] bg-[#FBEDB9] p-5">

                  <p className="font-bold text-[#101C36]">
                    Proyek milik Anda
                  </p>

                  <p className="mt-1 text-sm text-[#303030]/65">
                    Ini adalah proyek yang Anda posting sebagai UMKM.
                  </p>

                </div>
              )}

          </div>

        </div>

      </div>

    </main>
  );
}