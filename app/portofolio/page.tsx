"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Application = {
  id: number;
  project_id: number;
  student_id: string;
  status: string;
};

type Project = {
  id: number;
  owner_id: string;
  title: string;
  category: string;
  description: string;
  budget: number;
  deadline: string;
  status: string;
};

type PortfolioItem = {
  application: Application;
  project: Project;
  ownerName: string;
};

type Review = {
  project_id: number;
  rating: number;
  comment: string | null;
};

export default function PortfolioPage() {
  const router = useRouter();

  const [reviews, setReviews] =
    useState<Review[]>([]);

  const [nama, setNama] =
    useState("");

  const [portfolio, setPortfolio] =
    useState<PortfolioItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    async function loadPortfolio() {
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
          .select("nama, role")
          .eq("id", user.id)
          .single();

      if (
        !profile ||
        profile.role !== "mahasiswa"
      ) {
        router.push("/dashboard");
        return;
      }

      setNama(
        profile.nama ?? "Mahasiswa"
      );

      const {
        data: applications,
        error: applicationError,
      } = await supabase
        .from("applications")
        .select("*")
        .eq("student_id", user.id)
        .eq("status", "accepted");

      if (applicationError) {
        setErrorMessage(
          applicationError.message
        );
        setLoading(false);
        return;
      }

      const acceptedApplications =
        applications ?? [];

      if (
        acceptedApplications.length === 0
      ) {
        setLoading(false);
        return;
      }

      const projectIds =
        acceptedApplications.map(
          (application) =>
            application.project_id
        );

      const {
        data: projects,
        error: projectError,
      } = await supabase
        .from("projects")
        .select("*")
        .in("id", projectIds)
        .eq("status", "completed");

      if (projectError) {
        setErrorMessage(
          projectError.message
        );
        setLoading(false);
        return;
      }

      const completedProjects =
        projects ?? [];

      if (
        completedProjects.length === 0
      ) {
        setLoading(false);
        return;
      }

      const ownerIds = [
        ...new Set(
          completedProjects.map(
            (project) =>
              project.owner_id
          )
        ),
      ];

      const { data: owners } =
        await supabase
          .from("profiles")
          .select("id,nama")
          .in("id", ownerIds);

      const result: PortfolioItem[] =
        completedProjects.map(
          (project) => {
            const application =
              acceptedApplications.find(
                (item) =>
                  item.project_id ===
                  project.id
              )!;

            const owner =
              owners?.find(
                (item) =>
                  item.id ===
                  project.owner_id
              );

            return {
              application,
              project,
              ownerName:
                owner?.nama ?? "UMKM",
            };
          }
        );

      setPortfolio(result);

      const { data: reviewData } =
        await supabase
          .from("reviews")
          .select(
            "project_id,rating,comment"
          )
          .eq("student_id", user.id);

      setReviews(reviewData ?? []);

      setLoading(false);
    }

    loadPortfolio();
  }, [router]);

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

  function getReview(
    projectId: number
  ) {
    return reviews.find(
      (review) =>
        review.project_id === projectId
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F6F6F4]">

        <div className="text-center">

          <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-full bg-[#FFD85E]" />

          <p className="font-medium text-[#303030]/70">
            Memuat portofolio...
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
        <div className="rounded-[2rem] bg-[#101C36] p-8 text-white md:p-10">

          <div className="inline-flex rounded-full bg-[#FFD85E] px-4 py-2 text-sm font-bold text-[#101C36]">
            Portofolio Terverifikasi
          </div>

          <h1 className="mt-5 text-4xl font-bold">
            Portofolio {nama}
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-white/70">
            Kumpulan proyek SkillBridge yang
            telah kamu kerjakan dan dinyatakan
            selesai oleh UMKM.
          </p>

        </div>

        {/* ERROR */}
        {errorMessage && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            {errorMessage}
          </div>
        )}

        {/* BELUM ADA PORTOFOLIO */}
        {!errorMessage &&
          portfolio.length === 0 && (
            <div className="mt-10 rounded-3xl border border-[#E5E1D5] bg-white p-10 text-center shadow-sm">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FBEDB9] text-2xl">
                🏆
              </div>

              <h2 className="mt-5 text-2xl font-bold text-[#101C36]">
                Belum ada portofolio
              </h2>

              <p className="mx-auto mt-3 max-w-lg leading-7 text-[#303030]/65">
                Portofolio akan muncul setelah
                kamu menyelesaikan proyek yang
                diterima dan disetujui oleh UMKM.
              </p>

              <Link
                href="/projects"
                className="mt-6 inline-block rounded-xl bg-[#101C36] px-6 py-3 font-semibold text-white transition hover:bg-[#303030]"
              >
                Cari Proyek
              </Link>

            </div>
          )}

        {/* DAFTAR PORTOFOLIO */}
        <div className="mt-10 grid gap-6 md:grid-cols-2">

          {portfolio.map(
            ({ project, ownerName }) => {
              const review =
                getReview(project.id);

              return (
                <div
                  key={project.id}
                  className="overflow-hidden rounded-3xl border border-[#E5E1D5] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >

                  <div className="p-7">

                    {/* BADGE */}
                    <div className="flex flex-wrap items-center justify-between gap-3">

                      <span className="rounded-full bg-[#FBEDB9] px-3 py-1 text-sm font-semibold text-[#101C36]">
                        {project.category}
                      </span>

                      <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">
                        ✓ Terverifikasi
                      </span>

                    </div>

                    {/* TITLE */}
                    <h2 className="mt-5 text-2xl font-bold text-[#101C36]">
                      {project.title}
                    </h2>

                    <p className="mt-3 leading-7 text-[#303030]/65">
                      {project.description}
                    </p>

                    {/* CLIENT */}
                    <div className="mt-6 border-t border-[#E5E1D5] pt-5">

                      <p className="text-sm text-[#303030]/50">
                        Klien
                      </p>

                      <p className="mt-1 font-semibold text-[#101C36]">
                        {ownerName}
                      </p>

                    </div>

                    {/* NILAI + STATUS */}
                    <div className="mt-5 grid grid-cols-2 gap-4">

                      <div className="rounded-2xl bg-[#F6F6F4] p-4">

                        <p className="text-sm text-[#303030]/50">
                          Nilai Proyek
                        </p>

                        <p className="mt-1 font-bold text-[#101C36]">
                          {formatRupiah(
                            project.budget
                          )}
                        </p>

                      </div>

                      <div className="rounded-2xl bg-green-50 p-4">

                        <p className="text-sm text-green-700/70">
                          Status
                        </p>

                        <p className="mt-1 font-semibold text-green-700">
                          Selesai
                        </p>

                      </div>

                    </div>

                    {/* REVIEW */}
                    {review && (
                      <div className="mt-6 rounded-2xl border border-[#E6D99D] bg-[#FBEDB9] p-5">

                        <p className="font-bold text-[#101C36]">
                          Penilaian UMKM
                        </p>

                        <div className="mt-3 text-xl text-[#FFD85E]">

                          {"★".repeat(
                            review.rating
                          )}

                          <span className="text-[#D8D3C4]">
                            {"★".repeat(
                              5 -
                                review.rating
                            )}
                          </span>

                        </div>

                        <p className="mt-2 text-sm font-bold text-[#101C36]">
                          {review.rating}/5
                        </p>

                        {review.comment && (
                          <p className="mt-3 leading-7 text-[#303030]/70">
                            “{review.comment}”
                          </p>
                        )}

                      </div>
                    )}

                    {/* DETAIL */}
                    <Link
                      href={`/projects/${project.id}`}
                      className="mt-6 block rounded-xl border border-[#101C36] py-3 text-center font-semibold text-[#101C36] transition hover:bg-[#FBEDB9]"
                    >
                      Lihat Detail Proyek
                    </Link>

                  </div>

                </div>
              );
            }
          )}

        </div>

      </div>

    </main>
  );
}