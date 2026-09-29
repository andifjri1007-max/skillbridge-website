"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type StudentProfile = {
  id: string;
  nama: string;
  role: string;
  bio: string | null;
  skills: string | null;
  institution: string | null;
};

type Review = {
  rating: number;
  comment: string | null;
};

type Project = {
  id: number;
  title: string;
  category: string;
  description: string;
  budget: number;
  status: string;
};

export default function StudentPublicProfilePage() {
  const params = useParams();
  const router = useRouter();

  const studentId = String(params.id);

  const [student, setStudent] =
    useState<StudentProfile | null>(null);

  const [reviews, setReviews] =
    useState<Review[]>([]);

  const [projects, setProjects] =
    useState<Project[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

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

      const { data: profile } = await supabase
        .from("profiles")
        .select(
          "id,nama,role,bio,skills,institution"
        )
        .eq("id", studentId)
        .single();

      if (
        !profile ||
        profile.role !== "mahasiswa"
      ) {
        setErrorMessage(
          "Profil mahasiswa tidak ditemukan."
        );
        setLoading(false);
        return;
      }

      setStudent(profile);

      const { data: reviewData } =
        await supabase
          .from("reviews")
          .select("rating,comment")
          .eq("student_id", studentId);

      setReviews(reviewData ?? []);

      const { data: applications } =
        await supabase
          .from("applications")
          .select("project_id")
          .eq("student_id", studentId)
          .eq("status", "accepted");

      const projectIds =
        applications?.map(
          (item) => item.project_id
        ) ?? [];

      if (projectIds.length > 0) {
        const { data: projectData } =
          await supabase
            .from("projects")
            .select(
              "id,title,category,description,budget,status"
            )
            .in("id", projectIds)
            .eq("status", "completed");

        setProjects(projectData ?? []);
      }

      setLoading(false);
    }

    loadData();
  }, [studentId, router]);

  function formatRupiah(value: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  const averageRating =
    reviews.length > 0
      ? reviews.reduce(
          (total, review) =>
            total + review.rating,
          0
        ) / reviews.length
      : 0;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F6F6F4]">
        <div className="text-center">

          <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-full bg-[#FFD85E]" />

          <p className="font-medium text-[#303030]/70">
            Memuat profil mahasiswa...
          </p>

        </div>
      </main>
    );
  }

  if (!student) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F6F6F4] px-6">

        <div className="w-full max-w-md rounded-3xl border border-[#E5E1D5] bg-white p-8 text-center shadow-sm">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FBEDB9] text-2xl font-bold text-[#101C36]">
            !
          </div>

          <h1 className="mt-5 text-2xl font-bold text-[#101C36]">
            Profil tidak ditemukan
          </h1>

          <p className="mt-3 text-[#303030]/65">
            {errorMessage}
          </p>

          <Link
            href="/dashboard"
            className="mt-6 inline-block rounded-xl bg-[#101C36] px-6 py-3 font-semibold text-white transition hover:bg-[#303030]"
          >
            ← Kembali
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
          href="/applications/incoming"
          className="font-semibold text-[#101C36] transition hover:underline"
        >
          ← Kembali ke Lamaran Masuk
        </Link>

        {/* PROFIL UTAMA */}
        <div className="mt-6 overflow-hidden rounded-[2rem] border border-[#E5E1D5] bg-white shadow-sm">

          {/* HEADER */}
          <div className="bg-[#101C36] p-8 text-white md:p-10">

            <div className="inline-flex rounded-full bg-[#FFD85E] px-4 py-2 text-sm font-bold text-[#101C36]">
              Profil Mahasiswa
            </div>

            <h1 className="mt-5 text-4xl font-bold">
              {student.nama}
            </h1>

            {student.institution && (
              <p className="mt-3 text-white/70">
                {student.institution}
              </p>
            )}

          </div>

          <div className="p-8 md:p-10">

            {/* STATISTIK */}
            <div className="grid gap-4 sm:grid-cols-2">

              {/* RATING */}
              <div className="rounded-2xl bg-[#FBEDB9] p-5">

                <p className="text-sm font-medium text-[#303030]/55">
                  Rating
                </p>

                {reviews.length > 0 ? (
                  <>
                    <div className="mt-2 flex items-center gap-2">

                      <span className="text-2xl text-[#FFD85E]">
                        ★
                      </span>

                      <span className="text-2xl font-bold text-[#101C36]">
                        {averageRating.toFixed(1)}
                      </span>

                    </div>

                    <p className="mt-1 text-sm text-[#303030]/55">
                      {reviews.length} ulasan
                    </p>
                  </>
                ) : (
                  <p className="mt-2 font-semibold text-[#101C36]">
                    Belum ada rating
                  </p>
                )}

              </div>

              {/* PROYEK */}
              <div className="rounded-2xl bg-[#F6F6F4] p-5">

                <p className="text-sm font-medium text-[#303030]/55">
                  Proyek selesai
                </p>

                <p className="mt-2 text-2xl font-bold text-[#101C36]">
                  {projects.length}
                </p>

                <p className="mt-1 text-sm text-[#303030]/55">
                  Portofolio terverifikasi
                </p>

              </div>

            </div>

            {/* BIO */}
            {student.bio && (
              <div className="mt-8 border-t border-[#E5E1D5] pt-8">

                <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#101C36]/55">
                  Tentang
                </p>

                <h2 className="mt-2 text-2xl font-bold text-[#101C36]">
                  Tentang Mahasiswa
                </h2>

                <p className="mt-4 whitespace-pre-line leading-8 text-[#303030]/70">
                  {student.bio}
                </p>

              </div>
            )}

            {/* SKILL */}
            {student.skills && (
              <div className="mt-8 border-t border-[#E5E1D5] pt-8">

                <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#101C36]/55">
                  Kemampuan
                </p>

                <h2 className="mt-2 text-2xl font-bold text-[#101C36]">
                  Skill
                </h2>

                <div className="mt-4 flex flex-wrap gap-2">

                  {student.skills
                    .split(",")
                    .map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-[#FBEDB9] px-4 py-2 text-sm font-semibold text-[#101C36]"
                      >
                        {skill.trim()}
                      </span>
                    ))}

                </div>

              </div>
            )}

          </div>

        </div>

        {/* PORTOFOLIO */}
        <section className="mt-12">

          <div>

            <p className="font-semibold text-[#101C36]">
              Pengalaman Proyek
            </p>

            <h2 className="mt-1 text-3xl font-bold text-[#101C36]">
              Portofolio Terverifikasi
            </h2>

            <p className="mt-2 text-[#303030]/60">
              Proyek yang telah diselesaikan melalui SkillBridge.
            </p>

          </div>

          {projects.length === 0 && (
            <div className="mt-6 rounded-3xl border border-[#E5E1D5] bg-white p-8 text-center shadow-sm">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FBEDB9] text-2xl">
                🏆
              </div>

              <h3 className="mt-4 font-bold text-[#101C36]">
                Belum ada proyek selesai
              </h3>

              <p className="mt-2 text-[#303030]/60">
                Mahasiswa ini belum memiliki proyek
                terverifikasi.
              </p>

            </div>
          )}

          <div className="mt-6 grid gap-6 md:grid-cols-2">

            {projects.map((project) => (
              <div
                key={project.id}
                className="overflow-hidden rounded-3xl border border-[#E5E1D5] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >

                <div className="p-6">

                  <div className="flex flex-wrap items-center justify-between gap-3">

                    <span className="rounded-full bg-[#FBEDB9] px-3 py-1 text-sm font-semibold text-[#101C36]">
                      {project.category}
                    </span>

                    <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">
                      ✓ Terverifikasi
                    </span>

                  </div>

                  <h3 className="mt-5 text-xl font-bold text-[#101C36]">
                    {project.title}
                  </h3>

                  <p className="mt-3 leading-7 text-[#303030]/65">
                    {project.description}
                  </p>

                  <div className="mt-6 border-t border-[#E5E1D5] pt-5">

                    <p className="text-sm text-[#303030]/50">
                      Nilai Proyek
                    </p>

                    <p className="mt-1 text-lg font-bold text-[#101C36]">
                      {formatRupiah(
                        project.budget
                      )}
                    </p>

                  </div>

                </div>

              </div>
            ))}

          </div>

        </section>

        {/* ULASAN */}
        {reviews.length > 0 && (
          <section className="mt-12">

            <div>

              <p className="font-semibold text-[#101C36]">
                Feedback
              </p>

              <h2 className="mt-1 text-3xl font-bold text-[#101C36]">
                Ulasan UMKM
              </h2>

              <p className="mt-2 text-[#303030]/60">
                Penilaian dari UMKM setelah proyek selesai.
              </p>

            </div>

            <div className="mt-6 space-y-4">

              {reviews.map(
                (review, index) => (
                  <div
                    key={index}
                    className="rounded-3xl border border-[#E5E1D5] bg-white p-6 shadow-sm"
                  >

                    <div className="text-xl text-[#FFD85E]">

                      {"★".repeat(
                        review.rating
                      )}

                      <span className="text-[#E3E0D6]">
                        {"★".repeat(
                          5 - review.rating
                        )}
                      </span>

                    </div>

                    {review.comment && (
                      <p className="mt-4 leading-7 text-[#303030]/70">
                        “{review.comment}”
                      </p>
                    )}

                  </div>
                )
              )}

            </div>

          </section>
        )}

      </div>

    </main>
  );
}