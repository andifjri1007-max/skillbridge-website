"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Role = "mahasiswa" | "umkm";

export default function DashboardPage() {
  const router = useRouter();

  const [nama, setNama] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [loading, setLoading] = useState(true);

  // JUMLAH NOTIFIKASI YANG BELUM DIBACA
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function loadDashboard() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // AMBIL PROFIL USER
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("nama,role")
        .eq("id", user.id)
        .single();

      if (error || !profile) {
        console.error("Profil tidak ditemukan:", error);
        setLoading(false);
        return;
      }

      setNama(
        profile.nama ||
          user.user_metadata?.nama ||
          "Pengguna"
      );

      setRole(profile.role as Role);

      // HITUNG NOTIFIKASI BELUM DIBACA
      await loadUnreadCount(
        user.id,
        profile.role as Role
      );

      setLoading(false);
    }

    loadDashboard();
  }, [router]);

  // ======================================
  // HITUNG NOTIFIKASI BELUM DIBACA
  // ======================================

  async function loadUnreadCount(
    userId: string,
    userRole: Role
  ) {
    const supabase = createClient();

    const notificationKeys: string[] = [];

    // ======================================
    // NOTIFIKASI MAHASISWA
    // ======================================

    if (userRole === "mahasiswa") {
      const { data: applications } = await supabase
        .from("applications")
        .select("id,status")
        .eq("student_id", userId);

      applications?.forEach((application) => {
        if (
          application.status === "pending" ||
          application.status === "accepted" ||
          application.status === "rejected"
        ) {
          notificationKeys.push(
            `application-${application.id}-${application.status}`
          );
        }
      });

      const { data: submissions } = await supabase
        .from("submissions")
        .select("id,status")
        .eq("student_id", userId);

      submissions?.forEach((submission) => {
        if (
          submission.status === "submitted" ||
          submission.status === "revision" ||
          submission.status === "approved"
        ) {
          notificationKeys.push(
            `submission-${submission.id}-${submission.status}`
          );
        }
      });
    }

    // ======================================
    // NOTIFIKASI UMKM
    // ======================================

    if (userRole === "umkm") {
      const { data: projects } = await supabase
        .from("projects")
        .select("id")
        .eq("owner_id", userId);

      const projectIds =
        projects?.map((project) => project.id) ?? [];

      if (projectIds.length > 0) {
        // LAMARAN MASUK
        const { data: applications } = await supabase
          .from("applications")
          .select("id,status")
          .in("project_id", projectIds);

        applications?.forEach((application) => {
          if (
            application.status === "pending" ||
            application.status === "accepted"
          ) {
            notificationKeys.push(
              `application-${application.id}-${application.status}`
            );
          }
        });

        // HASIL KERJA MASUK
        const { data: submissions } = await supabase
          .from("submissions")
          .select("id,status")
          .in("project_id", projectIds);

        submissions?.forEach((submission) => {
          if (
            submission.status === "submitted" ||
            submission.status === "revision" ||
            submission.status === "approved"
          ) {
            notificationKeys.push(
              `submission-${submission.id}-${submission.status}`
            );
          }
        });
      }
    }

    // ======================================
    // AMBIL YANG SUDAH DIBACA
    // ======================================

    const { data: readData, error: readError } =
      await supabase
        .from("notification_reads")
        .select("notification_key")
        .eq("user_id", userId);

    if (readError) {
      console.error(
        "Gagal membaca notification_reads:",
        readError
      );

      setUnreadCount(notificationKeys.length);
      return;
    }

    const readKeys = new Set(
      (readData ?? []).map(
        (item) => item.notification_key
      )
    );

    const unread = notificationKeys.filter(
      (key) => !readKeys.has(key)
    );

    setUnreadCount(unread.length);
  }

  // ======================================
  // LOGOUT
  // ======================================

  async function handleLogout() {
    const supabase = createClient();

    await supabase.auth.signOut();

    router.push("/login");
    router.refresh();
  }

  // ======================================
  // LOADING
  // ======================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F6F6F4]">
        <div className="text-center">

          <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-full bg-[#FFD85E]" />

          <p className="font-medium text-[#303030]/70">
            Memuat dashboard...
          </p>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F6F6F4] text-[#303030]">

      {/* ======================================
          NAVBAR
      ====================================== */}

      <nav className="border-b border-[#E5E1D5] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">

          <Link
            href="/"
            className="text-2xl font-bold text-[#101C36]"
          >
            SkillBridge UMKM
          </Link>

          <div className="flex flex-wrap items-center gap-3">

            {/* NAMA USER */}
            <span className="rounded-full bg-[#F6F6F4] px-4 py-2 text-sm font-semibold text-[#303030]">
              {nama}
            </span>

            {/* NOTIFIKASI */}
            <button
              onClick={() =>
                router.push("/notifications")
              }
              className="flex items-center gap-2 rounded-xl border border-[#101C36] px-4 py-2 text-sm font-semibold text-[#101C36] transition hover:bg-[#FBEDB9]"
            >
              Notifikasi

              {unreadCount > 0 && (
                <span className="flex min-w-6 items-center justify-center rounded-full bg-[#FFD85E] px-2 py-0.5 text-xs font-bold text-[#101C36]">
                  {unreadCount > 99
                    ? "99+"
                    : unreadCount}
                </span>
              )}
            </button>

            {/* PROFIL */}
            <button
              onClick={() =>
                router.push("/profile")
              }
              className="rounded-xl border border-[#101C36] px-4 py-2 text-sm font-semibold text-[#101C36] transition hover:bg-[#FBEDB9]"
            >
              Profil
            </button>

            {/* KELUAR */}
            <button
              onClick={handleLogout}
              className="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              Keluar
            </button>

          </div>
        </div>
      </nav>

      {/* ======================================
          CONTENT
      ====================================== */}

      <div className="mx-auto max-w-7xl px-6 py-12">

        {/* HERO DASHBOARD */}
        <div className="rounded-[2rem] bg-[#101C36] p-8 text-white md:p-10">

          <div className="inline-flex rounded-full bg-[#FFD85E] px-4 py-2 text-sm font-bold text-[#101C36]">
            {role === "mahasiswa"
              ? "Dashboard Mahasiswa"
              : "Dashboard UMKM"}
          </div>

          <h1 className="mt-5 text-4xl font-bold">
            Selamat datang, {nama}
          </h1>

          <p className="mt-4 max-w-3xl leading-7 text-white/70">
            {role === "mahasiswa"
              ? "Temukan proyek, bangun pengalaman, dan kembangkan portofoliomu."
              : "Kelola proyek dan temukan mahasiswa yang tepat untuk membantu kebutuhan digital UMKM Anda."}
          </p>

          <div className="mt-6">
            <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-[#FBEDB9]">
              {role === "mahasiswa"
                ? "Mahasiswa"
                : "UMKM"}
            </span>
          </div>

        </div>

        {/* ======================================
            DASHBOARD MAHASISWA
        ====================================== */}

        {role === "mahasiswa" && (
          <section className="mt-12">

            <div>
              <p className="font-semibold text-[#101C36]">
                Menu Utama
              </p>

              <h2 className="mt-1 text-2xl font-bold text-[#101C36]">
                Menu Mahasiswa
              </h2>

              <p className="mt-2 text-[#303030]/60">
                Kelola proyek, lamaran, dan portofoliomu.
              </p>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

              {/* CARI PROYEK */}
              <button
                onClick={() =>
                  router.push("/projects")
                }
                className="group rounded-3xl border border-[#E5E1D5] bg-white p-7 text-left shadow-sm transition hover:-translate-y-1 hover:border-[#FFD85E] hover:shadow-md"
              >

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFD85E] text-2xl">
                  🔎
                </div>

                <h3 className="mt-5 text-xl font-bold text-[#101C36]">
                  Cari Proyek
                </h3>

                <p className="mt-2 leading-7 text-[#303030]/65">
                  Temukan micro-project UMKM yang sesuai
                  dengan skill kamu.
                </p>

                <p className="mt-6 font-bold text-[#101C36] transition group-hover:translate-x-1">
                  Lihat proyek →
                </p>

              </button>

              {/* LAMARAN SAYA */}
              <button
                onClick={() =>
                  router.push("/applications")
                }
                className="group rounded-3xl border border-[#E5E1D5] bg-white p-7 text-left shadow-sm transition hover:-translate-y-1 hover:border-[#FFD85E] hover:shadow-md"
              >

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FBEDB9] text-2xl">
                  📄
                </div>

                <h3 className="mt-5 text-xl font-bold text-[#101C36]">
                  Lamaran Saya
                </h3>

                <p className="mt-2 leading-7 text-[#303030]/65">
                  Pantau status proyek yang sudah
                  kamu lamar.
                </p>

                <p className="mt-6 font-bold text-[#101C36] transition group-hover:translate-x-1">
                  Lihat lamaran →
                </p>

              </button>

              {/* PORTOFOLIO */}
              <button
                onClick={() =>
                  router.push("/portfolio")
                }
                className="group rounded-3xl border border-[#E5E1D5] bg-[#101C36] p-7 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFD85E] text-2xl">
                  🏆
                </div>

                <h3 className="mt-5 text-xl font-bold text-white">
                  Portofolio
                </h3>

                <p className="mt-2 leading-7 text-white/65">
                  Lihat proyek selesai, rating,
                  dan ulasan dari UMKM.
                </p>

                <p className="mt-6 font-bold text-[#FFD85E] transition group-hover:translate-x-1">
                  Lihat portofolio →
                </p>

              </button>

            </div>
          </section>
        )}

        {/* ======================================
            DASHBOARD UMKM
        ====================================== */}

        {role === "umkm" && (
          <section className="mt-12">

            <div>
              <p className="font-semibold text-[#101C36]">
                Menu Utama
              </p>

              <h2 className="mt-1 text-2xl font-bold text-[#101C36]">
                Menu UMKM
              </h2>

              <p className="mt-2 text-[#303030]/60">
                Kelola proyek, mahasiswa, dan hasil pekerjaan.
              </p>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">

              {/* BUAT PROYEK */}
              <button
                onClick={() =>
                  router.push("/projects/create")
                }
                className="group rounded-3xl border border-[#E5E1D5] bg-white p-7 text-left shadow-sm transition hover:-translate-y-1 hover:border-[#FFD85E] hover:shadow-md"
              >

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFD85E] text-2xl">
                  ➕
                </div>

                <h3 className="mt-5 text-xl font-bold text-[#101C36]">
                  Buat Proyek
                </h3>

                <p className="mt-2 leading-7 text-[#303030]/65">
                  Posting kebutuhan digital UMKM
                  sebagai micro-project.
                </p>

                <p className="mt-6 font-bold text-[#101C36] transition group-hover:translate-x-1">
                  Buat proyek →
                </p>

              </button>

              {/* PROYEK SAYA */}
              <button
                onClick={() =>
                  router.push("/projects/mine")
                }
                className="group rounded-3xl border border-[#E5E1D5] bg-white p-7 text-left shadow-sm transition hover:-translate-y-1 hover:border-[#FFD85E] hover:shadow-md"
              >

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FBEDB9] text-2xl">
                  📁
                </div>

                <h3 className="mt-5 text-xl font-bold text-[#101C36]">
                  Proyek Saya
                </h3>

                <p className="mt-2 leading-7 text-[#303030]/65">
                  Kelola proyek yang telah Anda posting.
                </p>

                <p className="mt-6 font-bold text-[#101C36] transition group-hover:translate-x-1">
                  Kelola proyek →
                </p>

              </button>

              {/* LAMARAN MASUK */}
              <button
                onClick={() =>
                  router.push(
                    "/applications/incoming"
                  )
                }
                className="group rounded-3xl border border-[#E5E1D5] bg-white p-7 text-left shadow-sm transition hover:-translate-y-1 hover:border-[#FFD85E] hover:shadow-md"
              >

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFD85E] text-2xl">
                  👥
                </div>

                <h3 className="mt-5 text-xl font-bold text-[#101C36]">
                  Lamaran Masuk
                </h3>

                <p className="mt-2 leading-7 text-[#303030]/65">
                  Tinjau mahasiswa yang
                  melamar proyek Anda.
                </p>

                <p className="mt-6 font-bold text-[#101C36] transition group-hover:translate-x-1">
                  Lihat lamaran →
                </p>

              </button>

              {/* REVIEW HASIL */}
              <button
                onClick={() =>
                  router.push("/submissions")
                }
                className="group rounded-3xl bg-[#101C36] p-7 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFD85E] text-2xl">
                  ✅
                </div>

                <h3 className="mt-5 text-xl font-bold text-white">
                  Review Hasil
                </h3>

                <p className="mt-2 leading-7 text-white/65">
                  Periksa hasil pekerjaan mahasiswa
                  dan minta revisi jika diperlukan.
                </p>

                <p className="mt-6 font-bold text-[#FFD85E] transition group-hover:translate-x-1">
                  Review hasil →
                </p>

              </button>

            </div>
          </section>
        )}

        {/* ======================================
            INFO NOTIFIKASI
        ====================================== */}

        {unreadCount > 0 && (
          <div className="mt-10 flex flex-col justify-between gap-5 rounded-3xl border border-[#E6D99D] bg-[#FBEDB9] p-6 md:flex-row md:items-center">

            <div className="flex items-start gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFD85E] text-xl">
                🔔
              </div>

              <div>

                <h2 className="font-bold text-[#101C36]">
                  Ada aktivitas baru
                </h2>

                <p className="mt-1 text-[#303030]/70">
                  Kamu memiliki{" "}
                  <span className="font-bold text-[#101C36]">
                    {unreadCount}
                  </span>{" "}
                  notifikasi yang belum dibaca.
                </p>

              </div>

            </div>

            <button
              onClick={() =>
                router.push("/notifications")
              }
              className="rounded-xl bg-[#101C36] px-5 py-3 font-semibold text-white transition hover:bg-[#303030]"
            >
              Lihat Notifikasi
            </button>

          </div>
        )}

      </div>
    </main>
  );
}