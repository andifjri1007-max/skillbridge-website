"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Project = {
  id: number;
  title: string;
  owner_id: string;
};

type Application = {
  id: number;
  project_id: number;
  student_id: string;
  message: string | null;
  status: string;
  created_at: string;
};

type Student = {
  id: string;
  nama: string;
};

export default function IncomingApplicationsPage() {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [applications, setApplications] =
    useState<Application[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

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
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "umkm") {
      router.push("/dashboard");
      return;
    }

    const { data: projectData } = await supabase
      .from("projects")
      .select("id,title,owner_id")
      .eq("owner_id", user.id);

    const ownedProjects = projectData ?? [];

    setProjects(ownedProjects);

    const projectIds = ownedProjects.map(
      (project) => project.id
    );

    if (projectIds.length === 0) {
      setLoading(false);
      return;
    }

    const { data: applicationData } =
      await supabase
        .from("applications")
        .select("*")
        .in("project_id", projectIds)
        .order("created_at", {
          ascending: false,
        });

    const appList = applicationData ?? [];

    setApplications(appList);

    const studentIds = [
      ...new Set(
        appList.map(
          (item) => item.student_id
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
    }

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

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

  async function handleStatus(
    application: Application,
    status: "accepted" | "rejected"
  ) {
    const supabase = createClient();

    const { error } = await supabase
      .from("applications")
      .update({ status })
      .eq("id", application.id);

    if (error) {
      alert(
        "Gagal memperbarui lamaran: " +
          error.message
      );
      return;
    }

    if (status === "accepted") {
      await supabase
        .from("projects")
        .update({
          status: "in_progress",
        })
        .eq(
          "id",
          application.project_id
        );

      await supabase
        .from("applications")
        .update({
          status: "rejected",
        })
        .eq(
          "project_id",
          application.project_id
        )
        .neq(
          "id",
          application.id
        )
        .eq(
          "status",
          "pending"
        );
    }

    await loadData();
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
            UMKM
          </div>

          <h1 className="mt-5 text-4xl font-bold">
            Lamaran Masuk
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-white/70">
            Tinjau profil mahasiswa,
            baca pesan lamaran, lalu pilih
            mahasiswa yang sesuai untuk
            mengerjakan proyek Anda.
          </p>

        </div>

        {/* BELUM ADA LAMARAN */}
        {applications.length === 0 && (
          <div className="mt-10 rounded-3xl border border-[#E5E1D5] bg-white p-10 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FBEDB9] text-2xl">
              👥
            </div>

            <h2 className="mt-5 text-xl font-bold text-[#101C36]">
              Belum ada lamaran
            </h2>

            <p className="mt-2 text-[#303030]/65">
              Lamaran mahasiswa akan muncul
              di halaman ini setelah mereka
              melamar proyek Anda.
            </p>

            <Link
              href="/projects/mine"
              className="mt-6 inline-block rounded-xl bg-[#101C36] px-6 py-3 font-semibold text-white transition hover:bg-[#303030]"
            >
              Lihat Proyek Saya
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

              const student =
                getStudent(
                  application.student_id
                );

              return (
                <div
                  key={application.id}
                  className="overflow-hidden rounded-3xl border border-[#E5E1D5] bg-white shadow-sm transition hover:shadow-md"
                >

                  <div className="p-7 md:p-8">

                    <div className="flex flex-col justify-between gap-6 md:flex-row">

                      {/* INFORMASI */}
                      <div className="flex-1">

                        <span className="inline-block rounded-full bg-[#FBEDB9] px-3 py-1 text-sm font-semibold text-[#101C36]">
                          {project?.title ??
                            "Proyek"}
                        </span>

                        {/* NAMA MAHASISWA */}
                        <Link
                          href={`/students/${application.student_id}`}
                          className="mt-4 block text-2xl font-bold text-[#101C36] transition hover:text-[#303030] hover:underline"
                        >
                          {student?.nama ??
                            "Mahasiswa"}
                        </Link>

                        <p className="mt-1 text-sm text-[#303030]/50">
                          Klik nama untuk melihat
                          profil, skill, rating, dan
                          portofolio mahasiswa.
                        </p>

                        {/* PESAN */}
                        <div className="mt-6 rounded-2xl bg-[#F6F6F4] p-5">

                          <p className="text-sm font-semibold text-[#101C36]">
                            Pesan Lamaran
                          </p>

                          <p className="mt-2 whitespace-pre-line leading-7 text-[#303030]/70">
                            {application.message ||
                              "Mahasiswa tidak memberikan pesan tambahan."}
                          </p>

                        </div>

                      </div>

                      {/* STATUS */}
                      <div className="md:text-right">

                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#303030]/40">
                          Status
                        </p>

                        <span
                          className={`inline-block rounded-full px-4 py-2 text-sm font-semibold ${statusClass(
                            application.status
                          )}`}
                        >
                          {statusText(
                            application.status
                          )}
                        </span>

                      </div>

                    </div>

                  </div>

                  {/* PENDING */}
                  {application.status ===
                    "pending" && (
                    <div className="border-t border-[#E5E1D5] bg-[#FBEDB9] px-7 py-6 md:px-8">

                      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

                        <div>

                          <p className="font-bold text-[#101C36]">
                            Tinjau lamaran mahasiswa
                          </p>

                          <p className="mt-1 text-sm text-[#303030]/65">
                            Periksa profil mahasiswa
                            terlebih dahulu sebelum
                            menerima atau menolak
                            lamaran.
                          </p>

                        </div>

                        <div className="flex flex-wrap gap-3">

                          <button
                            onClick={() =>
                              handleStatus(
                                application,
                                "accepted"
                              )
                            }
                            className="rounded-xl bg-[#101C36] px-5 py-3 font-semibold text-white transition hover:bg-[#303030]"
                          >
                            Terima
                          </button>

                          <button
                            onClick={() =>
                              handleStatus(
                                application,
                                "rejected"
                              )
                            }
                            className="rounded-xl border border-red-300 bg-white px-5 py-3 font-semibold text-red-600 transition hover:bg-red-50"
                          >
                            Tolak
                          </button>

                        </div>

                      </div>

                    </div>
                  )}

                  {/* ACCEPTED */}
                  {application.status ===
                    "accepted" && (
                    <div className="border-t border-green-200 bg-green-50 px-7 py-5 md:px-8">

                      <p className="font-semibold text-green-700">
                        ✓ Mahasiswa diterima
                      </p>

                      <p className="mt-1 text-sm text-green-700/80">
                        Mahasiswa ini sudah dipilih
                        untuk mengerjakan proyek.
                      </p>

                    </div>
                  )}

                  {/* REJECTED */}
                  {application.status ===
                    "rejected" && (
                    <div className="border-t border-red-100 bg-red-50 px-7 py-5 md:px-8">

                      <p className="font-semibold text-red-700">
                        Lamaran ditolak
                      </p>

                      <p className="mt-1 text-sm text-red-700/75">
                        Lamaran mahasiswa ini tidak
                        dipilih untuk proyek tersebut.
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