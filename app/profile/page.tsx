"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("");

  const [nama, setNama] = useState("");
  const [bio, setBio] = useState("");

  const [skills, setSkills] = useState("");
  const [institution, setInstitution] = useState("");

  const [businessName, setBusinessName] = useState("");
  const [businessCategory, setBusinessCategory] = useState("");
  const [location, setLocation] = useState("");

  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error || !profile) {
        setMessage("Profil tidak ditemukan.");
        setLoading(false);
        return;
      }

      setRole(profile.role ?? "");
      setNama(profile.nama ?? "");
      setBio(profile.bio ?? "");

      setSkills(profile.skills ?? "");
      setInstitution(profile.institution ?? "");

      setBusinessName(profile.business_name ?? "");
      setBusinessCategory(profile.business_category ?? "");
      setLocation(profile.location ?? "");

      if (profile.role === "mahasiswa") {
        const { data: reviews } = await supabase
          .from("reviews")
          .select("rating")
          .eq("student_id", user.id);

        if (reviews && reviews.length > 0) {
          const total = reviews.reduce(
            (sum, review) => sum + review.rating,
            0
          );

          setAverageRating(total / reviews.length);
          setReviewCount(reviews.length);
        }
      }

      setLoading(false);
    }

    loadProfile();
  }, [router]);

  async function handleSave(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setSaving(true);
    setMessage("");

    const supabase = createClient();

    const commonData = {
      nama,
      bio,
    };

    const roleData =
      role === "mahasiswa"
        ? {
            skills,
            institution,
          }
        : {
            business_name: businessName,
            business_category: businessCategory,
            location,
          };

    const { error } = await supabase
      .from("profiles")
      .update({
        ...commonData,
        ...roleData,
      })
      .eq("id", userId);

    if (error) {
      setMessage(
        "Gagal menyimpan profil: " + error.message
      );

      setSaving(false);
      return;
    }

    setMessage("Profil berhasil diperbarui.");
    setSaving(false);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F6F6F4]">
        <div className="text-center">

          <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-full bg-[#FFD85E]" />

          <p className="font-medium text-[#303030]/70">
            Memuat profil...
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

      <div className="mx-auto max-w-4xl px-6 py-12">

        {/* HEADER */}
        <div className="rounded-[2rem] bg-[#101C36] p-8 text-white md:p-10">

          <div className="inline-flex rounded-full bg-[#FFD85E] px-4 py-2 text-sm font-bold text-[#101C36]">
            Profil
          </div>

          <h1 className="mt-5 text-4xl font-bold">
            {role === "mahasiswa"
              ? "Profil Mahasiswa"
              : "Profil UMKM"}
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-white/70">
            {role === "mahasiswa"
              ? "Lengkapi profil, skill, dan informasi pendidikan agar UMKM lebih mudah mengenal kemampuanmu."
              : "Lengkapi informasi usaha agar profil UMKM Anda lebih jelas di SkillBridge."}
          </p>

        </div>

        {/* RATING MAHASISWA */}
        {role === "mahasiswa" && (
          <div className="mt-8 rounded-3xl border border-[#E5E1D5] bg-white p-6 shadow-sm">

            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

              <div>

                <p className="text-sm font-semibold text-[#303030]/50">
                  Rating Mahasiswa
                </p>

                {reviewCount > 0 ? (
                  <>
                    <div className="mt-2 flex items-center gap-3">

                      <span className="text-3xl text-[#FFD85E]">
                        ★
                      </span>

                      <span className="text-3xl font-bold text-[#101C36]">
                        {averageRating.toFixed(1)}
                      </span>

                    </div>

                    <p className="mt-2 text-sm text-[#303030]/60">
                      Berdasarkan {reviewCount} ulasan UMKM
                    </p>
                  </>
                ) : (
                  <p className="mt-2 text-[#303030]/65">
                    Belum memiliki rating.
                  </p>
                )}

              </div>

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FBEDB9] text-2xl">
                ⭐
              </div>

            </div>

          </div>
        )}

        {/* FORM */}
        <form
          onSubmit={handleSave}
          className="mt-8 overflow-hidden rounded-[2rem] border border-[#E5E1D5] bg-white shadow-sm"
        >

          {/* FORM HEADER */}
          <div className="border-b border-[#E5E1D5] bg-[#FBEDB9] p-7 md:p-8">

            <p className="font-bold text-[#101C36]">
              Informasi Profil
            </p>

            <p className="mt-1 text-sm text-[#303030]/65">
              Pastikan informasi yang ditampilkan sudah sesuai.
            </p>

          </div>

          <div className="space-y-6 p-7 md:p-8">

            {/* NAMA */}
            <div>

              <label className="mb-2 block font-semibold text-[#303030]">
                Nama
              </label>

              <input
                value={nama}
                onChange={(e) =>
                  setNama(e.target.value)
                }
                required
                className="w-full rounded-xl border border-[#D8D5CB] bg-[#F6F6F4] px-4 py-3 text-[#303030] outline-none transition focus:border-[#101C36] focus:bg-white focus:ring-2 focus:ring-[#101C36]/10"
              />

            </div>

            {/* MAHASISWA */}
            {role === "mahasiswa" && (
              <>
                <div>

                  <label className="mb-2 block font-semibold text-[#303030]">
                    Kampus / Institusi
                  </label>

                  <input
                    value={institution}
                    onChange={(e) =>
                      setInstitution(e.target.value)
                    }
                    placeholder="Contoh: Politeknik Negeri Ujung Pandang"
                    className="w-full rounded-xl border border-[#D8D5CB] bg-[#F6F6F4] px-4 py-3 text-[#303030] outline-none transition placeholder:text-[#303030]/40 focus:border-[#101C36] focus:bg-white focus:ring-2 focus:ring-[#101C36]/10"
                  />

                </div>

                <div>

                  <label className="mb-2 block font-semibold text-[#303030]">
                    Skill
                  </label>

                  <input
                    value={skills}
                    onChange={(e) =>
                      setSkills(e.target.value)
                    }
                    placeholder="Contoh: Desain Grafis, Canva, Web Development"
                    className="w-full rounded-xl border border-[#D8D5CB] bg-[#F6F6F4] px-4 py-3 text-[#303030] outline-none transition placeholder:text-[#303030]/40 focus:border-[#101C36] focus:bg-white focus:ring-2 focus:ring-[#101C36]/10"
                  />

                  <p className="mt-2 text-sm text-[#303030]/50">
                    Pisahkan skill menggunakan koma.
                  </p>

                </div>
              </>
            )}

            {/* UMKM */}
            {role === "umkm" && (
              <>
                <div>

                  <label className="mb-2 block font-semibold text-[#303030]">
                    Nama Usaha
                  </label>

                  <input
                    value={businessName}
                    onChange={(e) =>
                      setBusinessName(e.target.value)
                    }
                    placeholder="Contoh: Kedai Kopi Nusantara"
                    className="w-full rounded-xl border border-[#D8D5CB] bg-[#F6F6F4] px-4 py-3 text-[#303030] outline-none transition placeholder:text-[#303030]/40 focus:border-[#101C36] focus:bg-white focus:ring-2 focus:ring-[#101C36]/10"
                  />

                </div>

                <div>

                  <label className="mb-2 block font-semibold text-[#303030]">
                    Kategori Usaha
                  </label>

                  <input
                    value={businessCategory}
                    onChange={(e) =>
                      setBusinessCategory(e.target.value)
                    }
                    placeholder="Contoh: Kuliner"
                    className="w-full rounded-xl border border-[#D8D5CB] bg-[#F6F6F4] px-4 py-3 text-[#303030] outline-none transition placeholder:text-[#303030]/40 focus:border-[#101C36] focus:bg-white focus:ring-2 focus:ring-[#101C36]/10"
                  />

                </div>

                <div>

                  <label className="mb-2 block font-semibold text-[#303030]">
                    Lokasi
                  </label>

                  <input
                    value={location}
                    onChange={(e) =>
                      setLocation(e.target.value)
                    }
                    placeholder="Contoh: Makassar"
                    className="w-full rounded-xl border border-[#D8D5CB] bg-[#F6F6F4] px-4 py-3 text-[#303030] outline-none transition placeholder:text-[#303030]/40 focus:border-[#101C36] focus:bg-white focus:ring-2 focus:ring-[#101C36]/10"
                  />

                </div>
              </>
            )}

            {/* BIO */}
            <div>

              <label className="mb-2 block font-semibold text-[#303030]">
                {role === "mahasiswa"
                  ? "Tentang Saya"
                  : "Tentang Usaha"}
              </label>

              <textarea
                value={bio}
                onChange={(e) =>
                  setBio(e.target.value)
                }
                rows={5}
                placeholder={
                  role === "mahasiswa"
                    ? "Ceritakan tentang diri, kemampuan, dan minatmu..."
                    : "Ceritakan secara singkat tentang usaha Anda..."
                }
                className="w-full rounded-xl border border-[#D8D5CB] bg-[#F6F6F4] px-4 py-3 text-[#303030] outline-none transition placeholder:text-[#303030]/40 focus:border-[#101C36] focus:bg-white focus:ring-2 focus:ring-[#101C36]/10"
              />

            </div>

            {/* MESSAGE */}
            {message && (
              <div className="rounded-xl border border-[#E6D99D] bg-[#FBEDB9] p-4 text-sm font-medium text-[#101C36]">
                {message}
              </div>
            )}

            {/* BUTTON */}
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-[#101C36] py-3 font-semibold text-white transition hover:bg-[#303030] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Menyimpan..."
                : "Simpan Profil"}
            </button>

          </div>

        </form>

      </div>

    </main>
  );
}