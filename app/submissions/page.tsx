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
  status: string;
};

type Student = {
  id: string;
  nama: string;
};

type Submission = {
  id: number;
  project_id: number;
  student_id: string;
  submission_url: string;
  note: string | null;
  revision_note: string | null;
  status: "submitted" | "revision" | "approved";
  created_at: string;
  updated_at: string | null;
};

export default function SubmissionsPage() {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [submissions, setSubmissions] =
    useState<Submission[]>([]);

  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] =
    useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    // CEK ROLE
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
    const {
      data: projectData,
      error: projectError,
    } = await supabase
      .from("projects")
      .select(
        "id,owner_id,title,category,status"
      )
      .eq("owner_id", user.id)
      .order("id", {
        ascending: false,
      });

    if (projectError) {
      console.error(projectError);
      setLoading(false);
      return;
    }

    const myProjects = projectData ?? [];

    setProjects(myProjects);

    const projectIds = myProjects.map(
      (project) => project.id
    );

    if (projectIds.length === 0) {
      setSubmissions([]);
      setLoading(false);
      return;
    }

    // AMBIL SUBMISSION UNTUK PROYEK UMKM
    const {
      data: submissionData,
      error: submissionError,
    } = await supabase
      .from("submissions")
      .select("*")
      .in("project_id", projectIds)
      .order("updated_at", {
        ascending: false,
      });

    if (submissionError) {
      console.error(submissionError);
      setLoading(false);
      return;
    }

    const submissionList =
      submissionData ?? [];

    setSubmissions(submissionList);

    // AMBIL DATA MAHASISWA
    const studentIds = [
      ...new Set(
        submissionList.map(
          (submission) =>
            submission.student_id
        )
      ),
    ];

    if (studentIds.length > 0) {
      const { data: studentData } =
        await supabase
          .from("profiles")
          .select("id,nama")
          .in("id", studentIds);

      setStudents(studentData ?? []);
    } else {
      setStudents([]);
    }

    setLoading(false);
  }

  function getProject(
    projectId: number
  ) {
    return projects.find(
      (project) =>
        project.id === projectId
    );
  }

  function getStudent(
    studentId: string
  ) {
    return students.find(
      (student) =>
        student.id === studentId
    );
  }

  function statusText(
    status: Submission["status"]
  ) {
    if (status === "submitted") {
      return "Menunggu Review";
    }

    if (status === "revision") {
      return "Perlu Revisi";
    }

    if (status === "approved") {
      return "Disetujui";
    }

    return status;
  }

  function statusClass(
    status: Submission["status"]
  ) {
    if (status === "submitted") {
      return "bg-[#FBEDB9] text-[#101C36]";
    }

    if (status === "revision") {
      return "bg-[#FFD85E] text-[#101C36]";
    }

    if (status === "approved") {
      return "bg-green-100 text-green-700";
    }

    return "bg-[#F6F6F4] text-[#303030]";
  }

  async function handleRevision(
    submission: Submission
  ) {
    const revisionNote = window.prompt(
      "Tuliskan revisi yang harus dilakukan mahasiswa:"
    );

    if (revisionNote === null) {
      return;
    }

    if (!revisionNote.trim()) {
      alert(
        "Catatan revisi tidak boleh kosong."
      );
      return;
    }

    setProcessingId(submission.id);

    const supabase = createClient();

    const { error } = await supabase
      .from("submissions")
      .update({
        status: "revision",
        revision_note:
          revisionNote.trim(),
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", submission.id);

    if (error) {
      alert(
        "Gagal meminta revisi: " +
          error.message
      );

      setProcessingId(null);
      return;
    }

    alert(
      "Permintaan revisi berhasil dikirim."
    );

    await loadData();

    setProcessingId(null);
  }

  async function handleApprove(
    submission: Submission
  ) {
    const project = getProject(
      submission.project_id
    );

    if (!project) return;

    const confirmed = window.confirm(
      `Setujui hasil pekerjaan untuk proyek "${project.title}"?`
    );

    if (!confirmed) {
      return;
    }

    setProcessingId(submission.id);

    const supabase = createClient();

    // 1. SETUJUI SUBMISSION
    const { error: submissionError } =
      await supabase
        .from("submissions")
        .update({
          status: "approved",
          revision_note: null,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", submission.id);

    if (submissionError) {
      alert(
        "Gagal menyetujui hasil: " +
          submissionError.message
      );

      setProcessingId(null);
      return;
    }

    // 2. UBAH PROYEK MENJADI COMPLETED
    const { error: projectError } =
      await supabase
        .from("projects")
        .update({
          status: "completed",
        })
        .eq(
          "id",
          submission.project_id
        );

    if (projectError) {
      alert(
        "Hasil berhasil disetujui, tetapi status proyek gagal diperbarui: " +
          projectError.message
      );

      setProcessingId(null);
      return;
    }

    alert(
      "Hasil pekerjaan berhasil disetujui. Proyek sekarang selesai."
    );

    await loadData();

    setProcessingId(null);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F6F6F4]">
        <div className="text-center">

          <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-full bg-[#FFD85E]" />

          <p className="font-medium text-[#303030]/70">
            Memuat hasil pekerjaan...
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
            UMKM
          </div>

          <h1 className="mt-5 text-4xl font-bold">
            Review Hasil
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-white/70">
            Periksa hasil pekerjaan mahasiswa,
            minta revisi jika diperlukan, atau
            setujui hasil untuk menyelesaikan proyek.
          </p>

        </div>

        {/* BELUM ADA SUBMISSION */}
        {submissions.length === 0 && (
          <div className="mt-10 rounded-3xl border border-[#E5E1D5] bg-white p-10 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FBEDB9] text-2xl">
              ✅
            </div>

            <h2 className="mt-5 text-xl font-bold text-[#101C36]">
              Belum ada hasil pekerjaan
            </h2>

            <p className="mt-2 text-[#303030]/65">
              Hasil pekerjaan mahasiswa akan
              muncul di halaman ini setelah
              dikirim.
            </p>

            <Link
              href="/projects/mine"
              className="mt-6 inline-block rounded-xl border border-[#101C36] px-6 py-3 font-semibold text-[#101C36] transition hover:bg-[#FBEDB9]"
            >
              Lihat Proyek Saya
            </Link>

          </div>
        )}

        {/* DAFTAR SUBMISSION */}
        <div className="mt-10 space-y-6">

          {submissions.map(
            (submission) => {
              const project =
                getProject(
                  submission.project_id
                );

              const student =
                getStudent(
                  submission.student_id
                );

              const processing =
                processingId ===
                submission.id;

              return (
                <div
                  key={submission.id}
                  className="overflow-hidden rounded-3xl border border-[#E5E1D5] bg-white shadow-sm transition hover:shadow-md"
                >

                  {/* HEADER CARD */}
                  <div className="p-7 md:p-8">

                    <div className="flex flex-col justify-between gap-5 md:flex-row">

                      <div>

                        <div className="flex flex-wrap items-center gap-3">

                          <span className="rounded-full bg-[#FBEDB9] px-3 py-1 text-sm font-semibold text-[#101C36]">
                            {project?.category ??
                              "Proyek"}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-sm font-semibold ${statusClass(
                              submission.status
                            )}`}
                          >
                            {statusText(
                              submission.status
                            )}
                          </span>

                        </div>

                        <h2 className="mt-5 text-2xl font-bold text-[#101C36]">
                          {project?.title ??
                            "Proyek"}
                        </h2>

                        <p className="mt-2 text-[#303030]/65">
                          Dikerjakan oleh{" "}

                          <Link
                            href={`/students/${submission.student_id}`}
                            className="font-bold text-[#101C36] transition hover:underline"
                          >
                            {student?.nama ??
                              "Mahasiswa"}
                          </Link>
                        </p>

                      </div>

                      <div className="text-sm text-[#303030]/50">
                        Dikirim{" "}
                        {new Date(
                          submission.updated_at ??
                            submission.created_at
                        ).toLocaleString(
                          "id-ID",
                          {
                            dateStyle:
                              "medium",
                            timeStyle:
                              "short",
                          }
                        )}
                      </div>

                    </div>

                    {/* HASIL KERJA */}
                    <div className="mt-7 border-t border-[#E5E1D5] pt-6">

                      <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#101C36]/50">
                        File Pekerjaan
                      </p>

                      <h3 className="mt-1 font-bold text-[#101C36]">
                        Hasil Pekerjaan
                      </h3>

                      <div className="mt-4 rounded-2xl bg-[#F6F6F4] p-5">

                        <p className="text-sm text-[#303030]/50">
                          Link hasil
                        </p>

                        <a
                          href={
                            submission.submission_url
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 block break-all font-semibold text-[#101C36] transition hover:underline"
                        >
                          {
                            submission.submission_url
                          }
                        </a>

                      </div>

                    </div>

                    {/* CATATAN MAHASISWA */}
                    <div className="mt-6">

                      <h3 className="font-bold text-[#101C36]">
                        Catatan Mahasiswa
                      </h3>

                      <div className="mt-3 rounded-2xl bg-[#F6F6F4] p-5 leading-7 text-[#303030]/70">
                        {submission.note ||
                          "Mahasiswa tidak memberikan catatan tambahan."}
                      </div>

                    </div>

                    {/* CATATAN REVISI */}
                    {submission.revision_note && (
                      <div className="mt-6">

                        <h3 className="font-bold text-[#101C36]">
                          Catatan Revisi
                        </h3>

                        <div className="mt-3 rounded-2xl border border-[#E6D99D] bg-[#FBEDB9] p-5 leading-7 text-[#303030]/70">
                          {
                            submission.revision_note
                          }
                        </div>

                      </div>
                    )}

                  </div>

                  {/* MENUNGGU REVIEW */}
                  {submission.status ===
                    "submitted" && (
                    <div className="border-t border-[#E5E1D5] bg-[#FBEDB9] px-7 py-6 md:px-8">

                      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

                        <div>

                          <p className="font-bold text-[#101C36]">
                            Hasil siap direview
                          </p>

                          <p className="mt-1 text-sm text-[#303030]/65">
                            Periksa hasil mahasiswa.
                            Anda dapat meminta revisi
                            atau menyetujui hasil.
                          </p>

                        </div>

                        <div className="flex flex-wrap gap-3">

                          <button
                            type="button"
                            onClick={() =>
                              handleRevision(
                                submission
                              )
                            }
                            disabled={
                              processing
                            }
                            className="rounded-xl border border-[#101C36] bg-white px-5 py-3 font-semibold text-[#101C36] transition hover:bg-[#FFD85E] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Minta Revisi
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleApprove(
                                submission
                              )
                            }
                            disabled={
                              processing
                            }
                            className="rounded-xl bg-[#101C36] px-5 py-3 font-semibold text-white transition hover:bg-[#303030] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {processing
                              ? "Memproses..."
                              : "Setujui Hasil"}
                          </button>

                        </div>

                      </div>

                    </div>
                  )}

                  {/* SEDANG DIREVISI */}
                  {submission.status ===
                    "revision" && (
                    <div className="border-t border-[#E6D99D] bg-[#FBEDB9] px-7 py-6 md:px-8">

                      <div className="flex items-start gap-4">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFD85E] text-xl">
                          ✎
                        </div>

                        <div>

                          <p className="font-bold text-[#101C36]">
                            Menunggu revisi mahasiswa
                          </p>

                          <p className="mt-2 text-sm leading-6 text-[#303030]/65">
                            Mahasiswa perlu
                            memperbaiki hasil
                            pekerjaan dan
                            mengirimkannya kembali.
                          </p>

                        </div>

                      </div>

                    </div>
                  )}

                  {/* SUDAH DISETUJUI */}
                  {submission.status ===
                    "approved" && (
                    <div className="border-t border-green-200 bg-green-50 px-7 py-6 md:px-8">

                      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

                        <div>

                          <p className="font-bold text-green-800">
                            ✓ Hasil pekerjaan telah disetujui
                          </p>

                          <p className="mt-2 text-sm leading-6 text-green-700">
                            Proyek telah selesai dan
                            mahasiswa dapat memperoleh
                            portofolio terverifikasi.
                          </p>

                        </div>

                        <div className="flex flex-wrap gap-3">

                          <Link
                            href={`/projects/${submission.project_id}`}
                            className="rounded-xl border border-[#101C36] bg-white px-5 py-2 font-semibold text-[#101C36] transition hover:bg-[#F6F6F4]"
                          >
                            Lihat Proyek
                          </Link>

                          <Link
                            href={`/reviews/${submission.project_id}`}
                            className="rounded-xl bg-[#FFD85E] px-5 py-2 font-bold text-[#101C36] transition hover:bg-[#FBEDB9]"
                          >
                            ★ Beri Ulasan
                          </Link>

                        </div>

                      </div>

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