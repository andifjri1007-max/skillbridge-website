"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

export default function MyProjectsPage() {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [reviewedProjectIds, setReviewedProjectIds] =
    useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
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

    // AMBIL PROYEK MILIK UMKM
    const { data: projectData, error } =
      await supabase
        .from("projects")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", {
          ascending: false,
        });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    const myProjects = projectData ?? [];

    setProjects(myProjects);

    // CEK PROYEK YANG SUDAH DIBERI ULASAN
    const projectIds = myProjects.map(
      (project) => project.id
    );

    if (projectIds.length > 0) {
      const { data: reviewData } =
        await supabase
          .from("reviews")
          .select("project_id")
          .eq("reviewer_id", user.id)
          .in("project_id", projectIds);

      setReviewedProjectIds(
        (reviewData ?? []).map(
          (review) => review.project_id
        )
      );
    }

    setLoading(false);
  }

  async function handleDelete(projectId: number) {
    const confirmed = window.confirm(
      "Yakin ingin menghapus proyek ini?"
    );

    if (!confirmed) return;

    const supabase = createClient();

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId);

    if (error) {
      alert(
        "Gagal menghapus proyek: " +
          error.message
      );
      return;
    }

    await loadProjects();
  }

  function formatRupiah(value: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  function statusText(status: string) {
    if (status === "open") {
      return "Mencari Mahasiswa";
    }

    if (status === "in_progress") {
      return "Sedang Dikerjakan";
    }

    if (status === "completed") {
      return "Selesai";
    }

    if (status === "cancelled") {
      return "Dibatalkan";
    }

    return status;
  }

  function statusClass(status: string) {
    if (status === "open") {
      return "bg-[#FBEDB9] text-[#101C36]";
    }

    if (status === "in_progress") {
      return "bg-[#FFD85E] text-[#101C36]";
    }

    if (status === "completed") {
      return "bg-green-100 text-green-700";
    }

    return "bg-[#F6F6F4] text-[#303030]/60";
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

      <div className="mx-auto max-w-6xl px-6 py-12">

        {/* HEADER */}
        <div className="flex flex-col justify-between gap-6 rounded-[2rem] bg-[#101C36] p-8 text-white md:flex-row md:items-center md:p-10">

          <div>

            <div className="inline-flex rounded-full bg-[#FFD85E] px-4 py-2 text-sm font-bold text-[#101C36]">
              UMKM
            </div>

            <h1 className="mt-5 text-4xl font-bold">
              Proyek Saya
            </h1>

            <p className="mt-3 max-w-xl leading-7 text-white/70">
              Kelola proyek, pantau pengerjaan,
              dan review hasil mahasiswa.
            </p>

          </div>

          <Link
            href="/projects/create"
            className="rounded-xl bg-[#FFD85E] px-6 py-3 text-center font-bold text-[#101C36] transition hover:bg-[#FBEDB9]"
          >
            + Buat Proyek
          </Link>

        </div>

        {/* BELUM ADA PROYEK */}
        {projects.length === 0 && (
          <div className="mt-10 rounded-3xl border border-[#E5E1D5] bg-white p-10 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FBEDB9] text-2xl">
              📁
            </div>

            <h2 className="mt-5 text-xl font-bold text-[#101C36]">
              Belum ada proyek
            </h2>

            <p className="mt-2 text-[#303030]/65">
              Buat proyek pertama untuk mulai
              mencari mahasiswa.
            </p>

            <Link
              href="/projects/create"
              className="mt-6 inline-block rounded-xl bg-[#101C36] px-6 py-3 font-semibold text-white transition hover:bg-[#303030]"
            >
              Buat Proyek
            </Link>

          </div>
        )}

        {/* DAFTAR PROYEK */}
        <div className="mt-10 space-y-6">

          {projects.map((project) => {
            const alreadyReviewed =
              reviewedProjectIds.includes(
                project.id
              );

            return (
              <div
                key={project.id}
                className="overflow-hidden rounded-3xl border border-[#E5E1D5] bg-white shadow-sm transition hover:shadow-md"
              >

                {/* ISI PROJECT */}
                <div className="p-7 md:p-8">

                  <div className="flex flex-col justify-between gap-5 md:flex-row">

                    <div className="flex-1">

                      <div className="flex flex-wrap items-center gap-3">

                        {/* CATEGORY */}
                        <span className="rounded-full bg-[#FBEDB9] px-3 py-1 text-sm font-semibold text-[#101C36]">
                          {project.category}
                        </span>

                        {/* STATUS */}
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-semibold ${statusClass(
                            project.status
                          )}`}
                        >
                          {statusText(
                            project.status
                          )}
                        </span>

                      </div>

                      <h2 className="mt-5 text-2xl font-bold text-[#101C36]">
                        {project.title}
                      </h2>

                      <p className="mt-3 max-w-3xl leading-7 text-[#303030]/65">
                        {project.description}
                      </p>

                      {/* BUDGET + DEADLINE */}
                      <div className="mt-6 grid gap-4 sm:grid-cols-2">

                        <div className="rounded-2xl bg-[#F6F6F4] p-4">

                          <p className="text-sm text-[#303030]/50">
                            Budget
                          </p>

                          <p className="mt-1 text-lg font-bold text-[#101C36]">
                            {formatRupiah(
                              project.budget
                            )}
                          </p>

                        </div>

                        <div className="rounded-2xl bg-[#F6F6F4] p-4">

                          <p className="text-sm text-[#303030]/50">
                            Deadline
                          </p>

                          <p className="mt-1 font-semibold text-[#303030]">
                            {new Date(
                              project.deadline +
                                "T00:00:00"
                            ).toLocaleDateString(
                              "id-ID"
                            )}
                          </p>

                        </div>

                      </div>

                    </div>

                  </div>

                </div>

                {/* ===================================
                    PROJECT OPEN
                =================================== */}

                {project.status === "open" && (
                  <div className="border-t border-[#E5E1D5] bg-[#F6F6F4] px-7 py-6 md:px-8">

                    <p className="mb-4 text-sm font-semibold text-[#303030]/55">
                      Proyek masih menerima lamaran mahasiswa.
                    </p>

                    <div className="flex flex-wrap gap-3">

                      <Link
                        href={`/projects/${project.id}`}
                        className="rounded-xl border border-[#101C36] px-5 py-2 font-semibold text-[#101C36] transition hover:bg-[#FBEDB9]"
                      >
                        Lihat Detail
                      </Link>

                      <Link
                        href={`/projects/${project.id}/edit`}
                        className="rounded-xl bg-[#101C36] px-5 py-2 font-semibold text-white transition hover:bg-[#303030]"
                      >
                        Edit
                      </Link>

                      <Link
                        href="/applications/incoming"
                        className="rounded-xl bg-[#FFD85E] px-5 py-2 font-semibold text-[#101C36] transition hover:bg-[#FBEDB9]"
                      >
                        Lihat Lamaran
                      </Link>

                      <button
                        onClick={() =>
                          handleDelete(
                            project.id
                          )
                        }
                        className="rounded-xl border border-red-300 px-5 py-2 font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        Hapus
                      </button>

                    </div>

                  </div>
                )}

                {/* ===================================
                    IN PROGRESS
                =================================== */}

                {project.status ===
                  "in_progress" && (
                  <div className="border-t border-[#E5E1D5] bg-[#FBEDB9] px-7 py-6 md:px-8">

                    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

                      <div>

                        <p className="font-bold text-[#101C36]">
                          Proyek sedang dikerjakan
                        </p>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#303030]/65">
                          Tunggu mahasiswa mengirim
                          hasil pekerjaan. Setelah
                          hasil dikirim, buka menu
                          Review Hasil.
                        </p>

                      </div>

                      <Link
                        href="/submissions"
                        className="shrink-0 rounded-xl bg-[#101C36] px-5 py-3 text-center font-semibold text-white transition hover:bg-[#303030]"
                      >
                        Review Hasil
                      </Link>

                    </div>

                  </div>
                )}

                {/* ===================================
                    COMPLETED
                =================================== */}

                {project.status ===
                  "completed" && (
                  <div className="border-t border-green-200 bg-green-50 px-7 py-6 md:px-8">

                    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

                      <div>

                        <p className="font-bold text-green-800">
                          ✓ Proyek selesai
                        </p>

                        <p className="mt-2 text-sm text-green-700">
                          Hasil pekerjaan telah
                          disetujui dan proyek sudah
                          selesai.
                        </p>

                      </div>

                      <div className="flex flex-wrap gap-3">

                        <Link
                          href={`/projects/${project.id}`}
                          className="rounded-xl border border-[#101C36] px-5 py-2 font-semibold text-[#101C36] transition hover:bg-white"
                        >
                          Lihat Proyek
                        </Link>

                        {!alreadyReviewed ? (
                          <Link
                            href={`/reviews/${project.id}`}
                            className="rounded-xl bg-[#FFD85E] px-5 py-2 font-bold text-[#101C36] transition hover:bg-[#FBEDB9]"
                          >
                            ★ Beri Ulasan
                          </Link>
                        ) : (
                          <span className="rounded-xl bg-white px-5 py-2 font-semibold text-green-700">
                            ✓ Ulasan Sudah Diberikan
                          </span>
                        )}

                      </div>

                    </div>

                  </div>
                )}

              </div>
            );
          })}

        </div>

      </div>

    </main>
  );
}