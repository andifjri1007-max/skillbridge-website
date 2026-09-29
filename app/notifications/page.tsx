"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Project = {
  id: number;
  owner_id: string;
  title: string;
};

type Student = {
  id: string;
  nama: string;
};

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  date: string;
  type:
    | "info"
    | "success"
    | "warning"
    | "danger";
  isRead: boolean;
};

export default function NotificationsPage() {
  const router = useRouter();

  const [role, setRole] = useState("");
  const [notifications, setNotifications] =
    useState<NotificationItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadNotifications() {
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

      if (!profile) {
        setLoading(false);
        return;
      }

      setRole(profile.role);

      let items: Omit<
        NotificationItem,
        "isRead"
      >[] = [];

      if (profile.role === "mahasiswa") {
        items =
          await loadStudentNotifications(
            supabase,
            user.id
          );
      }

      if (profile.role === "umkm") {
        items =
          await loadUmkmNotifications(
            supabase,
            user.id
          );
      }

      // URUTKAN NOTIFIKASI TERBARU
      items.sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
      );

      // AMBIL NOTIFIKASI YANG SUDAH DIBACA
      const { data: readData } =
        await supabase
          .from("notification_reads")
          .select("notification_key")
          .eq("user_id", user.id);

      const readKeys = new Set(
        (readData ?? []).map(
          (item) =>
            item.notification_key
        )
      );

      const notificationsWithStatus =
        items.map((item) => ({
          ...item,
          isRead: readKeys.has(item.id),
        }));

      setNotifications(
        notificationsWithStatus
      );

      // CARI NOTIFIKASI YANG BELUM DIBACA
      const unreadNotifications =
        notificationsWithStatus.filter(
          (item) => !item.isRead
        );

      // SETELAH HALAMAN DIBUKA,
      // TANDAI SEMUA SEBAGAI SUDAH DIBACA
      if (
        unreadNotifications.length > 0
      ) {
        const rows =
          unreadNotifications.map(
            (item) => ({
              user_id: user.id,
              notification_key: item.id,
            })
          );

        const { error } = await supabase
          .from("notification_reads")
          .insert(rows);

        if (error) {
          console.error(
            "Gagal menandai notifikasi:",
            error
          );
        }
      }

      setLoading(false);
    }

    loadNotifications();
  }, [router]);

  async function loadStudentNotifications(
    supabase: ReturnType<
      typeof createClient
    >,
    userId: string
  ) {
    const items: Omit<
      NotificationItem,
      "isRead"
    >[] = [];

    // =========================
    // LAMARAN MAHASISWA
    // =========================

    const { data: applications } =
      await supabase
        .from("applications")
        .select(
          "id,project_id,status,created_at"
        )
        .eq("student_id", userId);

    const projectIds =
      applications?.map(
        (application) =>
          application.project_id
      ) ?? [];

    let projects: Project[] = [];

    if (projectIds.length > 0) {
      const { data: projectData } =
        await supabase
          .from("projects")
          .select(
            "id,owner_id,title"
          )
          .in("id", projectIds);

      projects = projectData ?? [];
    }

    function getProjectName(
      projectId: number
    ) {
      return (
        projects.find(
          (project) =>
            project.id === projectId
        )?.title ?? "Proyek"
      );
    }

    applications?.forEach(
      (application) => {
        const projectName =
          getProjectName(
            application.project_id
          );

        if (
          application.status ===
          "pending"
        ) {
          items.push({
            id: `application-${application.id}-pending`,
            title: "Lamaran terkirim",
            description: `Lamaran untuk proyek "${projectName}" sedang menunggu keputusan UMKM.`,
            href: "/applications",
            date: application.created_at,
            type: "info",
          });
        }

        if (
          application.status ===
          "accepted"
        ) {
          items.push({
            id: `application-${application.id}-accepted`,
            title: "Lamaran diterima",
            description: `Lamaran kamu untuk proyek "${projectName}" telah diterima oleh UMKM.`,
            href: "/applications",
            date: application.created_at,
            type: "success",
          });
        }

        if (
          application.status ===
          "rejected"
        ) {
          items.push({
            id: `application-${application.id}-rejected`,
            title: "Lamaran ditolak",
            description: `Lamaran kamu untuk proyek "${projectName}" belum berhasil diterima.`,
            href: "/applications",
            date: application.created_at,
            type: "danger",
          });
        }
      }
    );

    // =========================
    // HASIL KERJA
    // =========================

    const { data: submissions } =
      await supabase
        .from("submissions")
        .select(
          "id,project_id,status,revision_note,created_at,updated_at"
        )
        .eq("student_id", userId);

    submissions?.forEach(
      (submission) => {
        const projectName =
          getProjectName(
            submission.project_id
          );

        if (
          submission.status ===
          "submitted"
        ) {
          items.push({
            id: `submission-${submission.id}-submitted`,
            title:
              "Hasil kerja terkirim",
            description: `Hasil pekerjaan proyek "${projectName}" sedang menunggu review UMKM.`,
            href: `/work/${submission.project_id}`,
            date:
              submission.updated_at ??
              submission.created_at,
            type: "info",
          });
        }

        if (
          submission.status ===
          "revision"
        ) {
          items.push({
            id: `submission-${submission.id}-revision`,
            title: "Revisi diminta",
            description:
              submission.revision_note
                ? `${projectName}: ${submission.revision_note}`
                : `UMKM meminta revisi untuk proyek "${projectName}".`,
            href: `/work/${submission.project_id}`,
            date:
              submission.updated_at ??
              submission.created_at,
            type: "warning",
          });
        }

        if (
          submission.status ===
          "approved"
        ) {
          items.push({
            id: `submission-${submission.id}-approved`,
            title:
              "Hasil kerja disetujui",
            description: `Hasil pekerjaan proyek "${projectName}" telah disetujui oleh UMKM.`,
            href: "/portfolio",
            date:
              submission.updated_at ??
              submission.created_at,
            type: "success",
          });
        }
      }
    );

    return items;
  }

  async function loadUmkmNotifications(
    supabase: ReturnType<
      typeof createClient
    >,
    userId: string
  ) {
    const items: Omit<
      NotificationItem,
      "isRead"
    >[] = [];

    // =========================
    // PROYEK MILIK UMKM
    // =========================

    const { data: projectData } =
      await supabase
        .from("projects")
        .select("id,owner_id,title")
        .eq("owner_id", userId);

    const projects: Project[] =
      projectData ?? [];

    const projectIds =
      projects.map(
        (project) => project.id
      );

    if (projectIds.length === 0) {
      return items;
    }

    function getProjectName(
      projectId: number
    ) {
      return (
        projects.find(
          (project) =>
            project.id === projectId
        )?.title ?? "Proyek"
      );
    }

    // =========================
    // LAMARAN MASUK
    // =========================

    const { data: applications } =
      await supabase
        .from("applications")
        .select(
          "id,project_id,student_id,status,created_at"
        )
        .in("project_id", projectIds);

    const studentIds = [
      ...new Set(
        applications?.map(
          (application) =>
            application.student_id
        ) ?? []
      ),
    ];

    let students: Student[] = [];

    if (studentIds.length > 0) {
      const { data: studentData } =
        await supabase
          .from("profiles")
          .select("id,nama")
          .in("id", studentIds);

      students = studentData ?? [];
    }

    function getStudentName(
      studentId: string
    ) {
      return (
        students.find(
          (student) =>
            student.id === studentId
        )?.nama ?? "Mahasiswa"
      );
    }

    applications?.forEach(
      (application) => {
        const studentName =
          getStudentName(
            application.student_id
          );

        const projectName =
          getProjectName(
            application.project_id
          );

        if (
          application.status ===
          "pending"
        ) {
          items.push({
            id: `application-${application.id}-pending`,
            title: "Lamaran baru",
            description: `${studentName} melamar proyek "${projectName}".`,
            href:
              "/applications/incoming",
            date:
              application.created_at,
            type: "info",
          });
        }

        if (
          application.status ===
          "accepted"
        ) {
          items.push({
            id: `application-${application.id}-accepted`,
            title:
              "Mahasiswa diterima",
            description: `${studentName} telah diterima untuk mengerjakan proyek "${projectName}".`,
            href:
              "/applications/incoming",
            date:
              application.created_at,
            type: "success",
          });
        }
      }
    );

    // =========================
    // HASIL KERJA MASUK
    // =========================

    const { data: submissions } =
      await supabase
        .from("submissions")
        .select(
          "id,project_id,student_id,status,created_at,updated_at"
        )
        .in("project_id", projectIds);

    submissions?.forEach(
      (submission) => {
        const projectName =
          getProjectName(
            submission.project_id
          );

        const studentName =
          getStudentName(
            submission.student_id
          );

        if (
          submission.status ===
          "submitted"
        ) {
          items.push({
            id: `submission-${submission.id}-submitted`,
            title:
              "Hasil kerja masuk",
            description: `${studentName} telah mengirim hasil pekerjaan untuk proyek "${projectName}".`,
            href: "/submissions",
            date:
              submission.updated_at ??
              submission.created_at,
            type: "warning",
          });
        }

        if (
          submission.status ===
          "revision"
        ) {
          items.push({
            id: `submission-${submission.id}-revision`,
            title:
              "Revisi diminta",
            description: `Anda meminta ${studentName} melakukan revisi untuk proyek "${projectName}".`,
            href: "/submissions",
            date:
              submission.updated_at ??
              submission.created_at,
            type: "warning",
          });
        }

        if (
          submission.status ===
          "approved"
        ) {
          items.push({
            id: `submission-${submission.id}-approved`,
            title:
              "Hasil kerja disetujui",
            description: `Hasil pekerjaan ${studentName} untuk proyek "${projectName}" telah disetujui.`,
            href: "/submissions",
            date:
              submission.updated_at ??
              submission.created_at,
            type: "success",
          });
        }
      }
    );

    return items;
  }

  function badgeClass(
    type: NotificationItem["type"]
  ) {
    if (type === "success") {
      return "bg-green-100 text-green-700";
    }

    if (type === "warning") {
      return "bg-[#FFD85E] text-[#101C36]";
    }

    if (type === "danger") {
      return "bg-red-100 text-red-700";
    }

    return "bg-[#FBEDB9] text-[#101C36]";
  }

  function badgeText(
    type: NotificationItem["type"]
  ) {
    if (type === "success") {
      return "Berhasil";
    }

    if (type === "warning") {
      return "Perhatian";
    }

    if (type === "danger") {
      return "Info";
    }

    return "Aktivitas";
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F6F6F4]">

        <div className="text-center">

          <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-full bg-[#FFD85E]" />

          <p className="font-medium text-[#303030]/70">
            Memuat notifikasi...
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
            {role === "mahasiswa"
              ? "Mahasiswa"
              : "UMKM"}
          </div>

          <h1 className="mt-5 text-4xl font-bold">
            Notifikasi
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-white/70">
            Pantau aktivitas terbaru akun
            SkillBridge kamu.
          </p>

        </div>

        {/* TIDAK ADA NOTIFIKASI */}
        {notifications.length === 0 && (
          <div className="mt-10 rounded-3xl border border-[#E5E1D5] bg-white p-10 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FBEDB9] text-2xl">
              🔔
            </div>

            <h2 className="mt-5 text-xl font-bold text-[#101C36]">
              Belum ada notifikasi
            </h2>

            <p className="mt-2 text-[#303030]/65">
              Aktivitas akun akan muncul
              di halaman ini.
            </p>

          </div>
        )}

        {/* DAFTAR NOTIFIKASI */}
        <div className="mt-8 space-y-4">

          {notifications.map(
            (notification) => (
              <Link
                key={notification.id}
                href={notification.href}
                className={`group block overflow-hidden rounded-3xl border shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                  notification.isRead
                    ? "border-[#E5E1D5] bg-white"
                    : "border-[#E6D99D] bg-[#FBEDB9]"
                }`}
              >

                <div className="p-6">

                  <div className="flex flex-col justify-between gap-5 sm:flex-row">

                    <div className="flex-1">

                      {/* STATUS BELUM DIBACA */}
                      {!notification.isRead && (
                        <div className="mb-3 flex items-center gap-2">

                          <span className="h-2.5 w-2.5 rounded-full bg-[#FFD85E]" />

                          <p className="text-sm font-bold text-[#101C36]">
                            Baru
                          </p>

                        </div>
                      )}

                      {/* BADGE */}
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${badgeClass(
                          notification.type
                        )}`}
                      >
                        {badgeText(
                          notification.type
                        )}
                      </span>

                      {/* JUDUL */}
                      <h2 className="mt-4 text-lg font-bold text-[#101C36] transition group-hover:underline">
                        {notification.title}
                      </h2>

                      {/* DESKRIPSI */}
                      <p className="mt-2 max-w-2xl leading-7 text-[#303030]/65">
                        {
                          notification.description
                        }
                      </p>

                    </div>

                    {/* TANGGAL */}
                    <div className="sm:text-right">

                      <p className="whitespace-nowrap text-sm text-[#303030]/45">
                        {new Date(
                          notification.date
                        ).toLocaleString(
                          "id-ID",
                          {
                            dateStyle:
                              "medium",
                            timeStyle:
                              "short",
                          }
                        )}
                      </p>

                      <p className="mt-3 text-sm font-semibold text-[#101C36] opacity-0 transition group-hover:opacity-100">
                        Buka →
                      </p>

                    </div>

                  </div>

                </div>

              </Link>
            )
          )}

        </div>

      </div>

    </main>
  );
}