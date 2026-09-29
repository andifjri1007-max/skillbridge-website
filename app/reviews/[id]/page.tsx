"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Project = {
  id: number;
  title: string;
  owner_id: string;
  status: string;
};

type Student = {
  id: string;
  nama: string;
};

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();

  const projectId = Number(params.id);

  const [project, setProject] = useState<Project | null>(null);
  const [student, setStudent] = useState<Student | null>(null);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

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

      const { data: projectData } = await supabase
        .from("projects")
        .select("id,title,owner_id,status")
        .eq("id", projectId)
        .eq("owner_id", user.id)
        .single();

      if (
        !projectData ||
        projectData.status !== "completed"
      ) {
        router.push("/projects/mine");
        return;
      }

      setProject(projectData);

      const { data: application } = await supabase
        .from("applications")
        .select("student_id")
        .eq("project_id", projectId)
        .eq("status", "accepted")
        .single();

      if (!application) {
        router.push("/projects/mine");
        return;
      }

      const { data: studentData } = await supabase
        .from("profiles")
        .select("id,nama")
        .eq("id", application.student_id)
        .single();

      if (studentData) {
        setStudent(studentData);
      }

      const { data: existingReview } = await supabase
        .from("reviews")
        .select("id")
        .eq("project_id", projectId)
        .maybeSingle();

      if (existingReview) {
        setMessage(
          "Ulasan untuk proyek ini sudah pernah diberikan."
        );
      }

      setLoading(false);
    }

    loadData();
  }, [projectId, router]);

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!project || !student) return;

    setSaving(true);
    setMessage("");

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { error } = await supabase
      .from("reviews")
      .insert({
        project_id: project.id,
        reviewer_id: user.id,
        student_id: student.id,
        rating,
        comment,
      });

    if (error) {
      if (error.code === "23505") {
        setMessage(
          "Ulasan untuk proyek ini sudah pernah diberikan."
        );
      } else {
        setMessage(
          "Gagal menyimpan ulasan: " + error.message
        );
      }

      setSaving(false);
      return;
    }

    setMessage(
      "Rating dan ulasan berhasil disimpan."
    );

    setTimeout(() => {
      router.push("/projects/mine");
    }, 1000);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F6F6F4]">
        <div className="text-center">

          <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-full bg-[#FFD85E]" />

          <p className="font-medium text-[#303030]/70">
            Memuat data...
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
              Penilaian Proyek
            </div>

            <h1 className="mt-5 text-3xl font-bold">
              Beri Rating Mahasiswa
            </h1>

            <p className="mt-3 max-w-xl leading-7 text-white/70">
              Berikan penilaian berdasarkan hasil
              pekerjaan dan pengalaman Anda
              bekerja sama dengan mahasiswa.
            </p>

          </div>

          {/* INFO PROJECT */}
          <div className="border-b border-[#E5E1D5] bg-[#FBEDB9] p-7 md:p-8">

            <div className="grid gap-4 md:grid-cols-2">

              <div>

                <p className="text-sm font-medium text-[#303030]/55">
                  Proyek
                </p>

                <p className="mt-1 font-bold text-[#101C36]">
                  {project?.title}
                </p>

              </div>

              <div>

                <p className="text-sm font-medium text-[#303030]/55">
                  Mahasiswa
                </p>

                <p className="mt-1 font-bold text-[#101C36]">
                  {student?.nama ?? "Mahasiswa"}
                </p>

              </div>

            </div>

          </div>

          {/* FORM */}
          <div className="p-7 md:p-8">

            <form
              onSubmit={handleSubmit}
              className="space-y-7"
            >

              {/* RATING */}
              <div>

                <label className="mb-3 block font-semibold text-[#303030]">
                  Rating
                </label>

                <div className="rounded-2xl bg-[#F6F6F4] p-5">

                  <div className="flex flex-wrap gap-2">

                    {[1, 2, 3, 4, 5].map(
                      (value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() =>
                            setRating(value)
                          }
                          className={`text-4xl transition hover:scale-110 ${
                            value <= rating
                              ? "text-[#FFD85E]"
                              : "text-[#D8D5CB]"
                          }`}
                          aria-label={`${value} bintang`}
                        >
                          ★
                        </button>
                      )
                    )}

                  </div>

                  <p className="mt-3 text-sm font-semibold text-[#101C36]">
                    {rating} dari 5 bintang
                  </p>

                </div>

              </div>

              {/* ULASAN */}
              <div>

                <label className="mb-2 block font-semibold text-[#303030]">
                  Ulasan
                </label>

                <textarea
                  value={comment}
                  onChange={(e) =>
                    setComment(e.target.value)
                  }
                  rows={5}
                  placeholder="Contoh: Pengerjaan tepat waktu, komunikasi baik, dan hasil sesuai brief."
                  className="w-full rounded-xl border border-[#D8D5CB] bg-[#F6F6F4] px-4 py-3 text-[#303030] outline-none transition placeholder:text-[#303030]/40 focus:border-[#101C36] focus:bg-white focus:ring-2 focus:ring-[#101C36]/10"
                />

                <p className="mt-2 text-sm text-[#303030]/50">
                  Ceritakan pengalaman Anda bekerja
                  sama dengan mahasiswa pada proyek ini.
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
                disabled={saving}
                className="w-full rounded-xl bg-[#101C36] py-3 font-semibold text-white transition hover:bg-[#303030] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Menyimpan..."
                  : "Simpan Rating & Ulasan"}
              </button>

            </form>

          </div>

        </div>

      </div>

    </main>
  );
}