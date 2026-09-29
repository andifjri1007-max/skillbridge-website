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

export default function ProjectsPage() {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");

  useEffect(() => {
    async function loadProjects() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("status", "open")
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      setProjects(data ?? []);
      setLoading(false);
    }

    loadProjects();
  }, [router]);

  function formatRupiah(value: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  const categories = [
    "Semua",
    ...Array.from(
      new Set(
        projects.map(
          (project) => project.category
        )
      )
    ),
  ];

  const filteredProjects = projects.filter(
    (project) => {
      const keyword = search.toLowerCase();

      const cocokPencarian =
        project.title
          .toLowerCase()
          .includes(keyword) ||
        project.description
          .toLowerCase()
          .includes(keyword);

      const cocokKategori =
        category === "Semua" ||
        project.category === category;

      return (
        cocokPencarian && cocokKategori
      );
    }
  );

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
        <div className="rounded-[2rem] bg-[#101C36] p-8 text-white md:p-10">

          <div className="inline-flex rounded-full bg-[#FFD85E] px-4 py-2 text-sm font-bold text-[#101C36]">
            Micro-Project
          </div>

          <h1 className="mt-5 text-4xl font-bold">
            Cari Proyek
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-white/70">
            Temukan proyek UMKM yang sesuai
            dengan kemampuan dan minatmu.
          </p>

        </div>

        {/* SEARCH & FILTER */}
        <div className="mt-8 rounded-3xl border border-[#E5E1D5] bg-white p-6 shadow-sm">

          <div className="grid gap-4 md:grid-cols-3">

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Cari judul atau deskripsi proyek..."
              className="rounded-xl border border-[#D8D5CB] bg-[#F6F6F4] px-4 py-3 text-[#303030] outline-none transition placeholder:text-[#303030]/40 focus:border-[#101C36] focus:bg-white focus:ring-2 focus:ring-[#101C36]/10 md:col-span-2"
            />

            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
              className="rounded-xl border border-[#D8D5CB] bg-[#F6F6F4] px-4 py-3 font-medium text-[#303030] outline-none transition focus:border-[#101C36] focus:bg-white focus:ring-2 focus:ring-[#101C36]/10"
            >
              {categories.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item === "Semua"
                    ? "Semua Kategori"
                    : item}
                </option>
              ))}
            </select>

          </div>

          {/* JUMLAH HASIL */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">

            <p className="text-sm text-[#303030]/60">
              <span className="font-bold text-[#101C36]">
                {filteredProjects.length}
              </span>{" "}
              proyek ditemukan
            </p>

            {(search || category !== "Semua") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategory("Semua");
                }}
                className="text-sm font-bold text-[#101C36] transition hover:underline"
              >
                Reset Filter
              </button>
            )}

          </div>

        </div>

        {/* JIKA TIDAK ADA HASIL */}
        {filteredProjects.length === 0 && (
          <div className="mt-8 rounded-3xl border border-[#E5E1D5] bg-white p-10 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FBEDB9] text-2xl">
              🔎
            </div>

            <h2 className="mt-5 text-xl font-bold text-[#101C36]">
              Proyek tidak ditemukan
            </h2>

            <p className="mt-2 text-[#303030]/65">
              Coba gunakan kata kunci atau
              kategori lain.
            </p>

            <button
              onClick={() => {
                setSearch("");
                setCategory("Semua");
              }}
              className="mt-6 rounded-xl bg-[#101C36] px-6 py-3 font-semibold text-white transition hover:bg-[#303030]"
            >
              Reset Filter
            </button>

          </div>
        )}

        {/* DAFTAR PROYEK */}
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {filteredProjects.map(
            (project, index) => (
              <div
                key={project.id}
                className={`flex flex-col rounded-3xl border p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md ${
                  index % 4 === 3
                    ? "border-[#101C36] bg-[#101C36]"
                    : "border-[#E5E1D5] bg-white"
                }`}
              >

                <div className="flex-1">

                  <span
                    className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${
                      index % 4 === 3
                        ? "bg-[#FFD85E] text-[#101C36]"
                        : "bg-[#FBEDB9] text-[#101C36]"
                    }`}
                  >
                    {project.category}
                  </span>

                  <h2
                    className={`mt-5 text-xl font-bold ${
                      index % 4 === 3
                        ? "text-white"
                        : "text-[#101C36]"
                    }`}
                  >
                    {project.title}
                  </h2>

                  <p
                    className={`mt-3 line-clamp-3 leading-7 ${
                      index % 4 === 3
                        ? "text-white/65"
                        : "text-[#303030]/65"
                    }`}
                  >
                    {project.description}
                  </p>

                </div>

                <div
                  className={`mt-6 border-t pt-5 ${
                    index % 4 === 3
                      ? "border-white/15"
                      : "border-[#E5E1D5]"
                  }`}
                >

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <p
                        className={`text-sm ${
                          index % 4 === 3
                            ? "text-white/50"
                            : "text-[#303030]/50"
                        }`}
                      >
                        Budget
                      </p>

                      <p
                        className={`mt-1 font-bold ${
                          index % 4 === 3
                            ? "text-[#FFD85E]"
                            : "text-[#101C36]"
                        }`}
                      >
                        {formatRupiah(
                          project.budget
                        )}
                      </p>

                    </div>

                    <div className="text-right">

                      <p
                        className={`text-sm ${
                          index % 4 === 3
                            ? "text-white/50"
                            : "text-[#303030]/50"
                        }`}
                      >
                        Deadline
                      </p>

                      <p
                        className={`mt-1 font-semibold ${
                          index % 4 === 3
                            ? "text-white"
                            : "text-[#303030]"
                        }`}
                      >
                        {new Date(
                          project.deadline
                        ).toLocaleDateString(
                          "id-ID"
                        )}
                      </p>

                    </div>

                  </div>

                  <Link
                    href={`/projects/${project.id}`}
                    className={`mt-6 block rounded-xl py-3 text-center font-semibold transition ${
                      index % 4 === 3
                        ? "bg-[#FFD85E] text-[#101C36] hover:bg-[#FBEDB9]"
                        : "bg-[#101C36] text-white hover:bg-[#303030]"
                    }`}
                  >
                    Lihat Detail
                  </Link>

                </div>

              </div>
            )
          )}

        </div>

      </div>

    </main>
  );
}