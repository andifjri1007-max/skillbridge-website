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
  deadline: string;
  status: string;
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

export default function WorkPage() {
  const params = useParams();
  const router = useRouter();

  const projectId = Number(params.id);

  const [project, setProject] = useState<Project | null>(null);
  const [submission, setSubmission] =
    useState<Submission | null>(null);

  const [userId, setUserId] = useState("");

  const [submissionUrl, setSubmissionUrl] =
    useState("");

  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [allowed, setAllowed] = useState(false);
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

      setUserId(user.id);

      // CEK ROLE USER
      const { data: profile } = await supabase
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

      // AMBIL DATA PROYEK
      const {
        data: projectData,
        error: projectError,
      } = await supabase
        .from("projects")
        .select(
          "id,owner_id,title,category,description,deadline,status"
        )
        .eq("id", projectId)
        .single();

      if (projectError || !projectData) {
        setMessage("Proyek tidak ditemukan.");
        setLoading(false);
        return;
      }

      setProject(projectData);

      // CEK APAKAH MAHASISWA DITERIMA
      const { data: application } =
        await supabase
          .from("applications")
          .select("id,status")
          .eq("project_id", projectId)
          .eq("student_id", user.id)
          .eq("status", "accepted")
          .maybeSingle();

      if (!application) {
        setAllowed(false);

        setMessage(
          "Kamu belum diterima untuk mengerjakan proyek ini."
        );

        setLoading(false);
        return;
      }

      setAllowed(true);

      // CEK HASIL KERJA YANG SUDAH ADA
      const { data: submissionData } =
        await supabase
          .from("submissions")
          .select("*")
          .eq("project_id", projectId)
          .eq("student_id", user.id)
          .maybeSingle();

      if (submissionData) {
        setSubmission(submissionData);

        setSubmissionUrl(
          submissionData.submission_url ?? ""
        );

        setNote(
          submissionData.note ?? ""
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

    if (!project || !userId) {
      return;
    }

    if (!submissionUrl.trim()) {
      setMessage(
        "Link hasil pekerjaan wajib diisi."
      );

      return;
    }

    setSaving(true);
    setMessage("");

    const supabase = createClient();

    // JIKA BELUM PERNAH MENGIRIM
    if (!submission) {
      const { data, error } =
        await supabase
          .from("submissions")
          .insert({
            project_id: project.id,
            student_id: userId,
            submission_url:
              submissionUrl.trim(),
            note: note.trim() || null,
            status: "submitted",
          })
          .select()
          .single();

      if (error) {
        setMessage(
          "Gagal mengirim hasil: " +
            error.message
        );

        setSaving(false);
        return;
      }

      setSubmission(data);

      setMessage(
        "Hasil pekerjaan berhasil dikirim ke UMKM."
      );

      setSaving(false);
      return;
    }

    // JIKA MENGIRIM ULANG REVISI
    const { data, error } =
      await supabase
        .from("submissions")
        .update({
          submission_url:
            submissionUrl.trim(),

          note:
            note.trim() || null,

          status: "submitted",

          revision_note: null,

          updated_at:
            new Date().toISOString(),
        })
        .eq("id", submission.id)
        .select()
        .single();

    if (error) {
      setMessage(
        "Gagal mengirim ulang hasil: " +
          error.message
      );

      setSaving(false);
      return;
    }

    setSubmission(data);

    setMessage(
      "Hasil revisi berhasil dikirim kembali ke UMKM."
    );

    setSaving(false);
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

  if (!project) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F6F6F4] px-6">

        <div className="w-full max-w-lg rounded-3xl border border-[#E5E1D5] bg-white p-8 text-center shadow-sm">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FBEDB9] text-2xl font-bold text-[#101C36]">
            !
          </div>

          <h1 className="mt-5 text-2xl font-bold text-[#101C36]">
            Proyek tidak ditemukan
          </h1>

          <p className="mt-3 text-[#303030]/65">
            {message}
          </p>

          <Link
            href="/applications"
            className="mt-6 inline-block rounded-xl bg-[#101C36] px-6 py-3 font-semibold text-white transition hover:bg-[#303030]"
          >
            ← Kembali ke Lamaran Saya
          </Link>

        </div>

      </main>
    );
  }

  if (!allowed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F6F6F4] px-6">

        <div className="w-full max-w-lg rounded-3xl border border-[#E5E1D5] bg-white p-8 text-center shadow-sm">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FBEDB9] text-2xl">
            🔒
          </div>

          <h1 className="mt-5 text-2xl font-bold text-[#101C36]">
            Akses tidak tersedia
          </h1>

          <p className="mt-3 leading-7 text-[#303030]/65">
            {message}
          </p>

          <Link
            href="/applications"
            className="mt-6 inline-block rounded-xl bg-[#101C36] px-6 py-3 font-semibold text-white transition hover:bg-[#303030]"
          >
            Kembali ke Lamaran Saya
          </Link>

        </div>

      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F6F6F4] text-[#303030]">

      {/* NAVBAR */}
      <nav className="border-b border-[#E5E1D5] bg-white">

        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">

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

      <div className="mx-auto max-w-4xl px-6 py-12">

        <Link
          href="/applications"
          className="font-semibold text-[#101C36] transition hover:underline"
        >
          ← Kembali ke Lamaran Saya
        </Link>

        {/* DATA PROYEK */}
        <div className="mt-6 overflow-hidden rounded-[2rem] border border-[#E5E1D5] bg-white shadow-sm">

          <div className="bg-[#101C36] p-8 text-white md:p-10">

            <span className="inline-block rounded-full bg-[#FFD85E] px-4 py-2 text-sm font-bold text-[#101C36]">
              {project.category}
            </span>

            <h1 className="mt-5 text-3xl font-bold">
              {project.title}
            </h1>

            <p className="mt-4 whitespace-pre-line leading-7 text-white/70">
              {project.description}
            </p>

          </div>

          <div className="p-7 md:p-8">

            <div className="rounded-2xl bg-[#FBEDB9] p-5">

              <p className="text-sm font-medium text-[#303030]/55">
                Deadline Proyek
              </p>

              <p className="mt-1 text-lg font-bold text-[#101C36]">
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

        {/* ==================================
            APPROVED
        ================================== */}

        {submission?.status ===
          "approved" && (
          <div className="mt-8 rounded-3xl border border-green-200 bg-green-50 p-7">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-xl">
              ✓
            </div>

            <h2 className="mt-5 text-xl font-bold text-green-800">
              Hasil pekerjaan disetujui
            </h2>

            <p className="mt-2 leading-7 text-green-700">
              UMKM telah menyetujui hasil
              pekerjaanmu. Proyek ini sudah
              selesai.
            </p>

            <Link
              href="/portfolio"
              className="mt-5 inline-block rounded-xl bg-[#101C36] px-5 py-3 font-semibold text-white transition hover:bg-[#303030]"
            >
              Lihat Portofolio
            </Link>

          </div>
        )}

        {/* ==================================
            MENUNGGU REVIEW
        ================================== */}

        {submission?.status ===
          "submitted" && (
          <div className="mt-8 rounded-3xl border border-[#E5E1D5] bg-white p-7 shadow-sm">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FBEDB9] text-xl">
              ⏳
            </div>

            <h2 className="mt-5 text-xl font-bold text-[#101C36]">
              Hasil sudah dikirim
            </h2>

            <p className="mt-2 leading-7 text-[#303030]/65">
              Hasil pekerjaan sedang menunggu
              review dari UMKM.
            </p>

            <div className="mt-5 rounded-2xl bg-[#F6F6F4] p-5">

              <p className="text-sm font-medium text-[#303030]/50">
                Link hasil
              </p>

              <a
                href={
                  submission.submission_url
                }
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block break-all font-semibold text-[#101C36] hover:underline"
              >
                {
                  submission.submission_url
                }
              </a>

            </div>

          </div>
        )}

        {/* ==================================
            REVISI
        ================================== */}

        {submission?.status ===
          "revision" && (
          <div className="mt-8 rounded-3xl border border-[#E6D99D] bg-[#FBEDB9] p-7">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFD85E] text-xl">
              ✎
            </div>

            <h2 className="mt-5 text-xl font-bold text-[#101C36]">
              Revisi diperlukan
            </h2>

            <p className="mt-2 leading-7 text-[#303030]/70">
              UMKM meminta kamu memperbaiki
              hasil pekerjaan.
            </p>

            {submission.revision_note && (
              <div className="mt-5 rounded-2xl bg-white p-5">

                <p className="text-sm font-semibold text-[#101C36]">
                  Catatan dari UMKM
                </p>

                <p className="mt-2 whitespace-pre-line leading-7 text-[#303030]/70">
                  {
                    submission.revision_note
                  }
                </p>

              </div>
            )}

          </div>
        )}

        {/* ==================================
            FORM KIRIM HASIL
        ================================== */}

        {submission?.status !==
          "approved" &&
          submission?.status !==
            "submitted" && (
            <div className="mt-8 overflow-hidden rounded-[2rem] border border-[#E5E1D5] bg-white shadow-sm">

              <div className="bg-[#FBEDB9] p-7">

                <p className="text-sm font-semibold text-[#101C36]">
                  Pengiriman Hasil
                </p>

                <h2 className="mt-1 text-2xl font-bold text-[#101C36]">
                  {submission?.status ===
                  "revision"
                    ? "Kirim Ulang Revisi"
                    : "Kirim Hasil Pekerjaan"}
                </h2>

                <p className="mt-2 text-[#303030]/65">
                  Masukkan link hasil pekerjaan
                  yang dapat diakses oleh UMKM.
                </p>

              </div>

              <div className="p-7 md:p-8">

                <form
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >

                  <div>

                    <label className="mb-2 block font-semibold text-[#303030]">
                      Link Hasil Pekerjaan
                    </label>

                    <input
                      type="url"
                      value={submissionUrl}
                      onChange={(e) =>
                        setSubmissionUrl(
                          e.target.value
                        )
                      }
                      placeholder="https://drive.google.com/... atau https://..."
                      required
                      className="w-full rounded-xl border border-[#D8D5CB] bg-[#F6F6F4] px-4 py-3 text-[#303030] outline-none transition placeholder:text-[#303030]/40 focus:border-[#101C36] focus:bg-white focus:ring-2 focus:ring-[#101C36]/10"
                    />

                    <p className="mt-2 text-sm text-[#303030]/50">
                      Pastikan link dapat dibuka
                      oleh UMKM.
                    </p>

                  </div>

                  <div>

                    <label className="mb-2 block font-semibold text-[#303030]">
                      Catatan
                    </label>

                    <textarea
                      value={note}
                      onChange={(e) =>
                        setNote(
                          e.target.value
                        )
                      }
                      rows={5}
                      placeholder="Contoh: Desain sudah selesai. File PNG, JPG, dan source file tersedia pada link."
                      className="w-full rounded-xl border border-[#D8D5CB] bg-[#F6F6F4] px-4 py-3 text-[#303030] outline-none transition placeholder:text-[#303030]/40 focus:border-[#101C36] focus:bg-white focus:ring-2 focus:ring-[#101C36]/10"
                    />

                  </div>

                  {message && (
                    <div className="rounded-xl border border-[#E6D99D] bg-[#FBEDB9] p-4 text-[#101C36]">
                      {message}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full rounded-xl bg-[#101C36] py-3 font-semibold text-white transition hover:bg-[#303030] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving
                      ? "Mengirim..."
                      : submission?.status ===
                          "revision"
                        ? "Kirim Ulang Revisi"
                        : "Kirim Hasil"}
                  </button>

                </form>

              </div>

            </div>
          )}

        {/* JIKA BELUM ADA SUBMISSION SAMA SEKALI */}
        {!submission && (
          <div className="mt-8 overflow-hidden rounded-[2rem] border border-[#E5E1D5] bg-white shadow-sm">

            <div className="bg-[#FBEDB9] p-7">

              <p className="text-sm font-semibold text-[#101C36]">
                Pengiriman Hasil
              </p>

              <h2 className="mt-1 text-2xl font-bold text-[#101C36]">
                Kirim Hasil Pekerjaan
              </h2>

              <p className="mt-2 text-[#303030]/65">
                Setelah pekerjaan selesai,
                kirim link hasil kepada UMKM.
              </p>

            </div>

            <div className="p-7 md:p-8">

              <form
                onSubmit={handleSubmit}
                className="space-y-6"
              >

                <div>

                  <label className="mb-2 block font-semibold text-[#303030]">
                    Link Hasil Pekerjaan
                  </label>

                  <input
                    type="url"
                    value={submissionUrl}
                    onChange={(e) =>
                      setSubmissionUrl(
                        e.target.value
                      )
                    }
                    placeholder="https://drive.google.com/... atau https://..."
                    required
                    className="w-full rounded-xl border border-[#D8D5CB] bg-[#F6F6F4] px-4 py-3 text-[#303030] outline-none transition placeholder:text-[#303030]/40 focus:border-[#101C36] focus:bg-white focus:ring-2 focus:ring-[#101C36]/10"
                  />

                  <p className="mt-2 text-sm text-[#303030]/50">
                    Bisa menggunakan Google
                    Drive, Figma, GitHub, Canva,
                    atau link lainnya.
                  </p>

                </div>

                <div>

                  <label className="mb-2 block font-semibold text-[#303030]">
                    Catatan
                  </label>

                  <textarea
                    value={note}
                    onChange={(e) =>
                      setNote(
                        e.target.value
                      )
                    }
                    rows={5}
                    placeholder="Jelaskan hasil pekerjaan yang telah kamu selesaikan..."
                    className="w-full rounded-xl border border-[#D8D5CB] bg-[#F6F6F4] px-4 py-3 text-[#303030] outline-none transition placeholder:text-[#303030]/40 focus:border-[#101C36] focus:bg-white focus:ring-2 focus:ring-[#101C36]/10"
                  />

                </div>

                {message && (
                  <div className="rounded-xl border border-[#E6D99D] bg-[#FBEDB9] p-4 text-[#101C36]">
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-xl bg-[#101C36] py-3 font-semibold text-white transition hover:bg-[#303030] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Mengirim..."
                    : "Kirim Hasil"}
                </button>

              </form>

            </div>

          </div>
        )}

      </div>

    </main>
  );
}