"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Application = {
  id: number;
  project_id: number;
  message: string | null;
  status: string;
  created_at: string;
};

type Project = {
  id: number;
  title: string;
  category: string;
  budget: number;
  deadline: string;
};

export default function MyApplicationsPage() {
  const router = useRouter();

  const [applications, setApplications] =
    useState<Application[]>([]);

  const [projects, setProjects] =
    useState<Project[]>([]);

  const [loading, setLoading] =
    useState(true);

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

      const { data: profile } =
        await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

      if (
        !profile ||
        profile.role !== "mahasiswa"
      ) {
        router.push("/dashboard");
        return;
      }

      const { data: applicationData } =
        await supabase
          .from("applications")
          .select("*")
          .eq("student_id", user.id)
          .order("created_at", {
            ascending: false,
          });

      const list =
        applicationData ?? [];

      setApplications(list);

      const projectIds = list.map(
        (item) => item.project_id
      );

      if (projectIds.length > 0) {
        const { data: projectData } =
          await supabase
            .from("projects")
            .select(
              "id,title,category,budget,deadline"
            )
            .in("id", projectIds);

        setProjects(projectData ?? []);
      }

      setLoading(false);
    }

    loadData();
  }, [router]);

  function getProject(
    projectId: number
  ) {
    return projects.find(
      (project) =>
        project.id === projectId
    );
  }

  function formatRupiah(
    value: number
  ) {
    return new Intl.NumberFormat(
      "id-ID",
      {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }
    ).format(value);
  }

  function statusLabel(
    status: string
  ) {
    if (status === "accepted") {
      return "Diterima";
    }

    if (status === "rejected") {
      return "Ditolak";
    }

    return "Menunggu";
  }

  function statusClass(
    status: string
  ) {
    if (status === "accepted") {
      return "bg-green-100 text-green-700";
    }

    if (status === "rejected") {
      return "bg-red-50 text-red-700";
    }

    return "bg-[#FFD85E] text-[#101C36]";
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F6F6F4]">
        <div className="text-center">

          <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-full bg-[#FFD85E]" />

          <p className="font-medium text-[#303030]/70">
            Memuat lamaran...
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

      <div className="mx-auto max-w-5xl px-6 py-12">

        {/* HEADER */}
        <div className="rounded-[2rem] bg-[#101C36] p-8 text-white md:p-10">

          <div className="inline-flex rounded-full bg-[#FFD85E] px-4 py-2 text-sm font-bold text-[#101C36]">
            Mahasiswa
          </div>

          <h1 className="mt-5 text-4xl font-bold">
            Lamaran Saya
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-white/70">
            Pantau status proyek yang sudah
            kamu lamar dan lanjutkan
            pengerjaan jika lamaran diterima.
          </p>

        </div>

        {/* BELUM ADA LAMARAN */}
        {applications.length === 0 && (
          <div className="mt-10 rounded-3xl border border-[#E5E1D5] bg-white p-10 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FBEDB9] text-2xl">
              📄
            </div>

            <h2 className="mt-5 text-xl font-bold text-[#101C36]">
              Belum ada lamaran
            </h2>

            <p className="mt-2 text-[#303030]/65">
              Cari proyek dan kirim
              lamaran pertamamu.
            </p>

            <Link
              href="/projects"
              className="mt-6 inline-block rounded-xl bg-[#101C36] px-6 py-3 font-semibold text-white transition hover:bg-[#303030]"
            >
              Cari Proyek
            </Link>

          </div>
        )}

        {/* DAFTAR LAMARAN */}
        <div className="mt-10 space-y-6">

          {applications.map(
            (application) => {
              const project =
                getProject(
                  application.project_id
                );

              if (!project) return null;

              return (
                <div
                  key={application.id}
                  className="overflow-hidden rounded-3xl border border-[#E5E1D5] bg-white shadow-sm transition hover:shadow-md"
                >

                  <div className="p-7 md:p-8">

                    <div className="flex flex-col justify-between gap-6 md:flex-row">

                      {/* INFORMASI PROYEK */}
                      <div className="flex-1">

                        <span className="inline-block rounded-full bg-[#FBEDB9] px-3 py-1 text-sm font-semibold text-[#101C36]">
                          {project.category}
                        </span>

                        <h2 className="mt-4 text-2xl font-bold text-[#101C36]">
                          {project.title}
                        </h2>

                        {/* BUDGET & DEADLINE */}
                        <div className="mt-5 grid gap-4 sm:grid-cols-2">

                          <div className="rounded-2xl bg-[#F6F6F4] p-4">

                            <p className="text-sm text-[#303030]/50">
                              Budget
                            </p>

                            <p className="mt-1 font-bold text-[#101C36]">
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
                                project.deadline
                              ).toLocaleDateString(
                                "id-ID"
                              )}
                            </p>

                          </div>

                        </div>

                        {/* PESAN */}
                        {application.message && (
                          <div className="mt-5 rounded-2xl border border-[#E6D99D] bg-[#FBEDB9] p-5">

                            <p className="text-sm font-semibold text-[#101C36]">
                              Pesan Lamaran
                            </p>

                            <p className="mt-2 leading-6 text-[#303030]/70">
                              {
                                application.message
                              }
                            </p>

                          </div>
                        )}

                      </div>

                      {/* STATUS */}
                      <div className="md:text-right">

                        <span
                          className={`inline-block rounded-full px-4 py-2 text-sm font-semibold ${statusClass(
                            application.status
                          )}`}
                        >
                          {statusLabel(
                            application.status
                          )}
                        </span>

                        {/* TOMBOL KERJAKAN */}
                        {application.status ===
                          "accepted" && (
                          <Link
                            href={`/work/${application.project_id}`}
                            className="mt-5 block rounded-xl bg-[#101C36] px-5 py-3 text-center font-semibold text-white transition hover:bg-[#303030]"
                          >
                            Kerjakan Proyek
                          </Link>
                        )}

                      </div>

                    </div>

                  </div>

                  {/* STATUS BAWAH */}
                  {application.status ===
                    "pending" && (
                    <div className="border-t border-[#E5E1D5] bg-[#F6F6F4] px-7 py-5 md:px-8">

                      <p className="text-sm text-[#303030]/65">
                        Lamaran sedang menunggu
                        keputusan UMKM.
                      </p>

                    </div>
                  )}

                  {application.status ===
                    "accepted" && (
                    <div className="border-t border-green-200 bg-green-50 px-7 py-5 md:px-8">

                      <p className="font-semibold text-green-700">
                        ✓ Lamaran diterima
                      </p>

                      <p className="mt-1 text-sm text-green-700/80">
                        Kamu sudah dapat mulai
                        mengerjakan proyek ini.
                      </p>

                    </div>
                  )}

                  {application.status ===
                    "rejected" && (
                    <div className="border-t border-red-100 bg-red-50 px-7 py-5 md:px-8">

                      <p className="font-semibold text-red-700">
                        Lamaran belum berhasil
                      </p>

                      <p className="mt-1 text-sm text-red-700/75">
                        Kamu tetap bisa mencari
                        dan melamar proyek lain.
                      </p>

                    </div>
                  )}

                </div>
              );
            }
          )}

        </div>

      </div>

    </main>
  );
}